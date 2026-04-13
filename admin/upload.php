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

if (!isset($_FILES['file']) || !is_uploaded_file($_FILES['file']['tmp_name'])) {
  http_response_code(400);
  echo json_encode(['ok' => false, 'message' => 'No upload received.']);
  exit;
}

$file = $_FILES['file'];

if (!empty($file['error'])) {
  http_response_code(400);
  echo json_encode(['ok' => false, 'message' => 'Upload error code: ' . $file['error']]);
  exit;
}

$allowed = [
  'jpg' => 'image/jpeg',
  'jpeg' => 'image/jpeg',
  'png' => 'image/png',
  'webp' => 'image/webp',
  'gif' => 'image/gif'
];

$extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
$mimeType = mime_content_type($file['tmp_name']);

if (!isset($allowed[$extension]) || $allowed[$extension] !== $mimeType) {
  http_response_code(400);
  echo json_encode(['ok' => false, 'message' => 'Unsupported image type.']);
  exit;
}

$root = dirname(__DIR__);
$relativeDirectory = 'images/uploads';
$targetDirectory = $root . DIRECTORY_SEPARATOR . 'images' . DIRECTORY_SEPARATOR . 'uploads';

if (!is_dir($targetDirectory) && !mkdir($targetDirectory, 0755, true) && !is_dir($targetDirectory)) {
  http_response_code(500);
  echo json_encode(['ok' => false, 'message' => 'Could not create upload directory.']);
  exit;
}

$safeBase = preg_replace('/[^a-z0-9]+/i', '-', pathinfo($file['name'], PATHINFO_FILENAME));
$safeBase = trim($safeBase, '-');
$safeBase = $safeBase ?: 'image';
$filename = $safeBase . '-' . date('Ymd-His') . '-' . substr(bin2hex(random_bytes(4)), 0, 8) . '.' . $extension;
$targetPath = $targetDirectory . DIRECTORY_SEPARATOR . $filename;

if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
  http_response_code(500);
  echo json_encode(['ok' => false, 'message' => 'Could not store uploaded file.']);
  exit;
}

echo json_encode([
  'ok' => true,
  'path' => $relativeDirectory . '/' . $filename
]);
