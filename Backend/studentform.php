<?php
header("Content-Type: application/json");
session_start();
require_once "db.php";

/* ================= AUTH CHECK ================= */
if (!isset($_SESSION['user_id'])) {
    echo json_encode([
        "success" => false,
        "message" => "SESSION_EXPIRED"
    ]);
    exit;
}

$user_id = $_SESSION['user_id']; // ALWAYS from session

/* ================= READ JSON BODY ================= */
$input = json_decode(file_get_contents("php://input"), true);

if (!$input) {
    echo json_encode([
        "success" => false,
        "message" => "INVALID_INPUT"
    ]);
    exit;
}

/* ================= PERSONAL DETAILS ================= */
$dob     = $input['dob'] ?? null;
$gender  = $input['gender'] ?? null;
$contact = $input['contact_no'] ?? null;
$address = $input['address'] ?? null;

/* Convert ISO date → MySQL date */
if ($dob) {
    $dob = date("Y-m-d", strtotime($dob));
}

/* ================= EDUCATION DETAILS ================= */
$ssc_school     = $input['ssc_school'] ?? null;
$ssc_board      = $input['ssc_board'] ?? null;
$ssc_percentage = $input['ssc_percentage'] ?? null;

$hsc_school     = $input['hsc_school'] ?? null;
$hsc_board      = $input['hsc_board'] ?? null;
$hsc_percentage = $input['hsc_percentage'] ?? null;

/* ================= UPDATE student_profile ================= */
$profileSql = "
    UPDATE student_profile SET
        dob = ?,
        gender = ?,
        contact = ?,
        address = ?
    WHERE user_id = ?
";

$stmt = mysqli_prepare($conn, $profileSql);
mysqli_stmt_bind_param(
    $stmt,
    "ssssi",
    $dob,
    $gender,
    $contact,
    $address,
    $user_id
);
mysqli_stmt_execute($stmt);

/* ================= CHECK education_details ================= */
$checkSql = "SELECT id FROM education_details WHERE user_id = ?";
$stmt = mysqli_prepare($conn, $checkSql);
mysqli_stmt_bind_param($stmt, "i", $user_id);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);

$exists = mysqli_num_rows($result) > 0;

/* ================= INSERT / UPDATE education_details ================= */
if ($exists) {
    $eduSql = "
        UPDATE education_details SET
            ssc_school = ?,
            ssc_board = ?,
            ssc_percentage = ?,
            hsc_school = ?,
            hsc_board = ?,
            hsc_percentage = ?
        WHERE user_id = ?
    ";
} else {
    $eduSql = "
        INSERT INTO education_details
            (ssc_school, ssc_board, ssc_percentage,
             hsc_school, hsc_board, hsc_percentage, user_id)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ";
}

$stmt = mysqli_prepare($conn, $eduSql);
mysqli_stmt_bind_param(
    $stmt,
    "ssssssi",
    $ssc_school,
    $ssc_board,
    $ssc_percentage,
    $hsc_school,
    $hsc_board,
    $hsc_percentage,
    $user_id
);

$ok = mysqli_stmt_execute($stmt);

/* ================= RESPONSE ================= */
if ($ok) {
    echo json_encode([
        "success" => true
    ]);
} else {
    echo json_encode([
        "success" => false,
        "message" => "DATABASE_ERROR"
    ]);
}
