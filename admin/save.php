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
