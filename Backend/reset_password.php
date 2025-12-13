<?php
header("Content-Type: application/json");
session_start();
require_once "db.php";

/* SAFETY CHECK */
if (!isset($_SESSION['reset_user_id'])) {
    echo json_encode([
        "success" => false,
        "message" => "Invalid request"
    ]);
    exit;
}

$input = json_decode(file_get_contents("php://input"), true);

if (!$input || empty($input['password'])) {
    echo json_encode([
        "success" => false,
        "message" => "Password required"
    ]);
    exit;
}

$user_id = $_SESSION['reset_user_id'];
$newPass = $input['password'];

/* 🔐 HASH PASSWORD */
$hash = password_hash($newPass, PASSWORD_DEFAULT);

/* 🔁 UPDATE PASSWORD */
$sql = "UPDATE users SET password = ? WHERE id = ?";
$stmt = mysqli_prepare($conn, $sql);
mysqli_stmt_bind_param($stmt, "si", $hash, $user_id);

if (mysqli_stmt_execute($stmt)) {
    //  destroy reset session after success
    unset($_SESSION['reset_user_id']);

    echo json_encode(["success" => true]);
} else {
    echo json_encode([
        "success" => false,
        "message" => "Database error"
    ]);
}
