<?php

function loadAdminPasswordHash(): string
{
  return '$2y$10$rwTM.MdDQLoBdgwljsoNQ.2QrtmqhkyL2fp1wgBzMfQnYS0vHMCwW';
}

function requireAdminPassword(): void
{
  $password = $_SERVER['HTTP_X_ADMIN_PASSWORD'] ?? '';

  if (!$password || !password_verify($password, loadAdminPasswordHash())) {
    http_response_code(403);
    echo json_encode(['ok' => false, 'message' => 'Invalid admin password.']);
    exit;
  }
}
