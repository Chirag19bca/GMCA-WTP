<?php
header("Content-Type: application/json");
session_start();

// clear session safely
$_SESSION = [];
session_destroy();

// always respond success
echo json_encode(["success" => true]);
exit;
