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

$payload = json_decode(file_get_contents('php://input'), true);
if (!is_array($payload)) {
  http_response_code(400);
  echo json_encode(['ok' => false, 'message' => 'Invalid request body.']);
  exit;
}

$url = trim((string) ($payload['url'] ?? ''));
$title = trim((string) ($payload['title'] ?? ''));

if (!preg_match('/^https?:\/\//i', $url)) {
  http_response_code(400);
  echo json_encode(['ok' => false, 'message' => 'A valid remote image URL is required.']);
  exit;
}

$response = fetchRemoteImage($url);
if (!$response) {
  http_response_code(400);
  echo json_encode(['ok' => false, 'message' => 'Could not download that image from the remote server.']);
  exit;
}

$root = dirname(__DIR__);
$targetDirectory = $root . DIRECTORY_SEPARATOR . 'images' . DIRECTORY_SEPARATOR . 'uploads';
if (!is_dir($targetDirectory) && !mkdir($targetDirectory, 0755, true) && !is_dir($targetDirectory)) {
  http_response_code(500);
  echo json_encode(['ok' => false, 'message' => 'Could not create upload directory.']);
  exit;
}

$safeBase = preg_replace('/[^a-z0-9]+/i', '-', $title);
$safeBase = trim((string) $safeBase, '-');
$safeBase = $safeBase ?: 'remote-image';
$filename = $safeBase . '-remote-' . date('Ymd-His') . '-' . substr(sha1($url), 0, 8) . '.' . $response['extension'];
$targetPath = $targetDirectory . DIRECTORY_SEPARATOR . $filename;

if (file_put_contents($targetPath, $response['body']) === false) {
  http_response_code(500);
  echo json_encode(['ok' => false, 'message' => 'Could not store the remote image locally.']);
  exit;
}

echo json_encode([
  'ok' => true,
  'path' => 'images/uploads/' . $filename
]);

function fetchRemoteImage(string $url): array
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
      CURLOPT_USERAGENT => 'Mozilla/5.0 (compatible; PortfolioImageBot/1.0)'
    ]);

    $body = curl_exec($ch);
    $status = (int) curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
    $contentType = (string) curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
    curl_close($ch);

    if ($body === false || $status < 200 || $status >= 400) {
      return [];
    }

    return validateImageResponse($body, $contentType);
  }

  $body = @file_get_contents($url);
  if ($body === false) {
    return [];
  }

  return validateImageResponse($body, 'image/jpeg');
}

function validateImageResponse(string $body, string $contentType): array
{
  $normalizedType = strtolower(trim(explode(';', $contentType)[0] ?? ''));
  $extension = contentTypeToExtension($normalizedType);
  if ($extension === '') {
    return [];
  }

  $imageInfo = @getimagesizefromstring($body);
  if (!$imageInfo || empty($imageInfo[0]) || empty($imageInfo[1])) {
    return [];
  }

  return [
    'body' => $body,
    'extension' => $extension
  ];
}

function contentTypeToExtension(string $contentType): string
{
  $map = [
    'image/jpeg' => 'jpg',
    'image/png' => 'png',
    'image/webp' => 'webp',
    'image/gif' => 'gif'
  ];

  return $map[$contentType] ?? '';
}
