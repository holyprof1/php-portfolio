<?php
$allowedOrigins = [
  'https://holyprofweb.com',
  'https://www.holyprofweb.com',
  'https://tobi.holyprofweb.com',
  'https://dev.holyprofweb.com',
  'https://work.holyprofweb.com',
  'https://marketing.holyprofweb.com'
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin !== '' && in_array($origin, $allowedOrigins, true)) {
  header('Access-Control-Allow-Origin: ' . $origin);
  header('Vary: Origin');
  header('Access-Control-Allow-Methods: POST, OPTIONS');
  header('Access-Control-Allow-Headers: Content-Type');
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(204);
  exit;
}

header('Content-Type: application/json');
header('X-Robots-Tag: noindex, nofollow', true);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(['ok' => false, 'message' => 'Method not allowed.']);
  exit;
}

$name = trim($_POST['name'] ?? '');
$email = trim($_POST['email'] ?? '');
$projectType = trim($_POST['project_type'] ?? '');
$message = trim($_POST['message'] ?? '');
$website = trim($_POST['website'] ?? '');

if ($website !== '') {
  echo json_encode(['ok' => true, 'message' => 'Thanks. Your enquiry has been received.']);
  exit;
}

if ($name === '' || $email === '' || $message === '') {
  http_response_code(400);
  echo json_encode(['ok' => false, 'message' => 'Name, email, and project details are required.']);
  exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
  http_response_code(400);
  echo json_encode(['ok' => false, 'message' => 'Please enter a valid email address.']);
  exit;
}

$to = 'admin@holyprofweb.com';
$subject = 'Portfolio enquiry from holyprofweb.com';
$body = "Name: {$name}\n";
$body .= "Email: {$email}\n";
$body .= "Project Type: " . ($projectType ?: 'Not provided') . "\n\n";
$body .= "Project Details:\n{$message}\n";

$headers = [
  'From: holyprofweb.com <admin@holyprofweb.com>',
  'Reply-To: ' . $email,
  'Content-Type: text/plain; charset=UTF-8'
];

$sent = @mail($to, $subject, $body, implode("\r\n", $headers));

if (!$sent) {
  http_response_code(500);
  echo json_encode(['ok' => false, 'message' => 'Message could not be sent right now. Please email admin@holyprofweb.com directly.']);
  exit;
}

echo json_encode(['ok' => true, 'message' => 'Thanks. Your message has been sent to admin@holyprofweb.com.']);
