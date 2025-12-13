<?php
header("Content-Type: application/json");
session_start();
require_once "db.php";

$input = json_decode(file_get_contents("php://input"), true);

if (!$input) {
    echo json_encode(["success" => false, "message" => "Invalid request"]);
    exit;
}

$enrollment = $input['enrollment_no'] ?? '';
$email      = $input['email'] ?? '';

if (!$enrollment || !$email) {
    echo json_encode(["success" => false, "message" => "All fields required"]);
    exit;
}

$sql = "SELECT id FROM users WHERE enrollment_no = ? AND email = ?";
$stmt = mysqli_prepare($conn, $sql);
mysqli_stmt_bind_param($stmt, "ss", $enrollment, $email);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);

if ($row = mysqli_fetch_assoc($result)) {
    // store user id in session
    $_SESSION['reset_user_id'] = $row['id'];

    echo json_encode(["success" => true]);
} else {
    echo json_encode([
        "success" => false,
        "message" => "Enrollment number and email do not match"
    ]);
}
