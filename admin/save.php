<?php
header('Content-Type: application/json');
header('X-Robots-Tag: noindex, nofollow', true);

require_once __DIR__ . DIRECTORY_SEPARATOR . 'auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(['ok' => false, 'message' => 'Method not allowed.']);
  exit;
}

requireAdminPassword();

$rawInput = file_get_contents('php://input');
$payload = json_decode($rawInput, true);

if (!is_array($payload) || !isset($payload['content']) || !isset($payload['projects'])) {
  http_response_code(400);
  echo json_encode(['ok' => false, 'message' => 'Invalid payload.']);
  exit;
}

$contentJson = json_encode($payload['content'], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
$projectsJson = json_encode($payload['projects'], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);

if ($contentJson === false || $projectsJson === false) {
  http_response_code(400);
  echo json_encode(['ok' => false, 'message' => 'Could not encode JSON payload.']);
  exit;
}

$root = dirname(__DIR__);
$preparedProjects = prepareProjectsForSave($payload['projects'], $root);
$projectsJson = json_encode($preparedProjects, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);

if ($projectsJson === false) {
  http_response_code(400);
  echo json_encode(['ok' => false, 'message' => 'Could not encode project payload.']);
  exit;
}

$writes = [
  [$root . DIRECTORY_SEPARATOR . 'data' . DIRECTORY_SEPARATOR . 'portfolio-content.json', $contentJson . PHP_EOL],
  [$root . DIRECTORY_SEPARATOR . 'data' . DIRECTORY_SEPARATOR . 'projects.json', $projectsJson . PHP_EOL],
  [$root . DIRECTORY_SEPARATOR . 'portfolio-data.js', "window.PORTFOLIO_CONTENT = " . $contentJson . ";" . PHP_EOL],
  [$root . DIRECTORY_SEPARATOR . 'projects.js', "// Admin-synced project data" . PHP_EOL . "window.PORTFOLIO_PROJECTS = " . $projectsJson . ";" . PHP_EOL]
];

foreach ($writes as [$path, $contents]) {
  if (file_put_contents($path, $contents) === false) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'message' => 'Failed writing ' . basename($path)]);
    exit;
  }
}

echo json_encode(['ok' => true]);

function prepareProjectsForSave(array $projects, string $root): array
{
  $prepared = [];

  foreach ($projects as $project) {
    if (!is_array($project)) {
      continue;
    }

    $prepared[] = prepareProjectForSave($project, $root);
  }

  return $prepared;
}

function prepareProjectForSave(array $project, string $root): array
{
  $project['imageUrl'] = trim((string) ($project['imageUrl'] ?? ''));
  $project['image'] = trim((string) ($project['image'] ?? ''));
  $project['savedPreviewImage'] = trim((string) ($project['savedPreviewImage'] ?? ''));
  $project['imageMode'] = trim((string) ($project['imageMode'] ?? 'default')) ?: 'default';
  $project['url'] = trim((string) ($project['url'] ?? ''));

  if ($project['imageMode'] !== 'saved_preview') {
    $project['savedPreviewImage'] = '';
    return $project;
  }

  if ($project['imageUrl'] !== '' || $project['image'] !== '' || $project['url'] === '') {
    return $project;
  }

  if (shouldSkipSavedPreview($project['url']) || !isReachableWebsiteUrl($project['url'])) {
    return $project;
  }

  $savedPath = saveWebsitePreviewImage($project['url'], $project['title'] ?? '', $root);
  if ($savedPath !== '') {
    $project['savedPreviewImage'] = $savedPath;
    return $project;
  }

  if ($project['savedPreviewImage'] !== '' && is_file($root . DIRECTORY_SEPARATOR . str_replace(['/', '\\'], DIRECTORY_SEPARATOR, $project['savedPreviewImage']))) {
    return $project;
  }

  return $project;
}

function shouldSkipSavedPreview(string $url): bool
{
  $host = strtolower((string) parse_url($url, PHP_URL_HOST));
  if ($host === '') {
    return true;
  }

  $blockedHosts = [
    'upwork.com',
    'www.upwork.com',
    'freelancers.upwork.com',
    'app.upwork.com'
  ];

  return in_array($host, $blockedHosts, true);
}

function isReachableWebsiteUrl(string $url): bool
{
  if (function_exists('curl_init')) {
    $ch = curl_init($url);
    if ($ch === false) {
      return false;
    }

    curl_setopt_array($ch, [
      CURLOPT_NOBODY => true,
      CURLOPT_FOLLOWLOCATION => true,
      CURLOPT_RETURNTRANSFER => true,
      CURLOPT_TIMEOUT => 10,
      CURLOPT_CONNECTTIMEOUT => 5,
      CURLOPT_USERAGENT => 'Mozilla/5.0 (compatible; PortfolioPreviewBot/1.0)'
    ]);

    curl_exec($ch);
    $status = (int) curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
    curl_close($ch);

    return $status >= 200 && $status < 400;
  }

  $headers = @get_headers($url);
  if (!is_array($headers) || !$headers) {
    return false;
  }

  $statusLine = (string) $headers[0];
  return preg_match('/\s([23]\d{2})\s/', $statusLine) === 1;
}

function saveWebsitePreviewImage(string $url, string $title, string $root): string
{
  $screenshotUrl = 'https://s.wordpress.com/mshots/v1/' . rawurlencode($url) . '?w=1200';
  $response = fetchBinaryResource($screenshotUrl);

  if (!$response || empty($response['body']) || empty($response['contentType'])) {
    return '';
  }

  if (strpos($response['contentType'], 'image/') !== 0) {
    return '';
  }

  $imageInfo = @getimagesizefromstring($response['body']);
  if (!$imageInfo || empty($imageInfo[0]) || empty($imageInfo[1]) || $imageInfo[0] < 800 || $imageInfo[1] < 400) {
    return '';
  }

  $extension = contentTypeToExtension($response['contentType']);
  if ($extension === '') {
    return '';
  }

  $uploadDirectory = $root . DIRECTORY_SEPARATOR . 'images' . DIRECTORY_SEPARATOR . 'uploads';
  if (!is_dir($uploadDirectory) && !mkdir($uploadDirectory, 0755, true) && !is_dir($uploadDirectory)) {
    return '';
  }

  $base = preg_replace('/[^a-z0-9]+/i', '-', trim($title)) ?: 'project-preview';
  $base = trim($base, '-');
  $filename = $base . '-preview-' . date('Ymd-His') . '-' . substr(sha1($url), 0, 8) . '.' . $extension;
  $path = $uploadDirectory . DIRECTORY_SEPARATOR . $filename;

  if (file_put_contents($path, $response['body']) === false) {
    return '';
  }

  return 'images/uploads/' . $filename;
}

function fetchBinaryResource(string $url): array
{
  if (function_exists('curl_init')) {
    $ch = curl_init($url);
    if ($ch === false) {
      return [];
    }

    curl_setopt_array($ch, [
      CURLOPT_FOLLOWLOCATION => true,
      CURLOPT_RETURNTRANSFER => true,
      CURLOPT_TIMEOUT => 20,
      CURLOPT_CONNECTTIMEOUT => 8,
      CURLOPT_USERAGENT => 'Mozilla/5.0 (compatible; PortfolioPreviewBot/1.0)'
    ]);

    $body = curl_exec($ch);
    $status = (int) curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
    $contentType = (string) curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
    curl_close($ch);

    if ($body === false || $status < 200 || $status >= 400) {
      return [];
    }

    return [
      'body' => $body,
      'contentType' => strtolower(trim(explode(';', $contentType)[0]))
    ];
  }

  $body = @file_get_contents($url);
  if ($body === false) {
    return [];
  }

  return [
    'body' => $body,
    'contentType' => 'image/jpeg'
  ];
}

function contentTypeToExtension(string $contentType): string
{
  $map = [
    'image/jpeg' => 'jpg',
    'image/png' => 'png',
    'image/webp' => 'webp'
  ];

  return $map[$contentType] ?? '';
}
