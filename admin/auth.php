<?php

function loadAdminPasswordHash(): ?string
{
    $configPath = __DIR__ . DIRECTORY_SEPARATOR . '.admin-auth.php';
    if (is_file($configPath)) {
        $config = require $configPath;
        if (is_array($config) && !empty($config['password_hash'])) {
            return $config['password_hash'];
        }
    }

    $envHash = getenv('PORTFOLIO_ADMIN_PASSWORD_HASH');
    return $envHash ?: null;
}

function requireAdminPassword(): void
{
    $passwordHash = loadAdminPasswordHash();
    if (!$passwordHash) {
        http_response_code(500);
        echo json_encode(['ok' => false, 'message' => 'Admin password is not configured on this server.']);
        exit;
    }

    $password = $_SERVER['HTTP_X_ADMIN_PASSWORD'] ?? '';
    if (!$password || !password_verify($password, $passwordHash)) {
        http_response_code(403);
        echo json_encode(['ok' => false, 'message' => 'Invalid admin password.']);
        exit;
    }
}
