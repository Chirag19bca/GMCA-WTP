<?php
// Backend/register.php

header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 1);

session_start();

// adjust to your DB file
require_once 'db.php';   // must define $conn (mysqli)

if (!isset($conn)) {
    // if your connection variable is $con instead, map it:
    if (isset($con)) {
        $conn = $con;
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'DB connection variable $conn not found.'
        ]);
        exit;
    }
}

// ---------- 1. Read POST data ----------
$enrollment_no = isset($_POST['enrollment_no']) ? trim($_POST['enrollment_no']) : '';
$fname         = isset($_POST['fname'])         ? trim($_POST['fname'])         : '';
$lname         = isset($_POST['lname'])         ? trim($_POST['lname'])         : '';
$email         = isset($_POST['email'])         ? trim($_POST['email'])         : '';
$password      = isset($_POST['password'])      ? trim($_POST['password'])      : '';

// ---------- 2. Validate ----------
if ($enrollment_no === '' || $fname === '' || $lname === '' || $email === '' || $password === '') {
    echo json_encode([
        'success' => false,
        'message' => 'All fields are required.'
    ]);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode([
        'success' => false,
        'message' => 'Invalid email format.'
    ]);
    exit;
}

// ---------- 3. Check if user already exists ----------
$checkSql  = "SELECT id FROM users WHERE enrollment_no = ? OR email = ? LIMIT 1";
$checkStmt = mysqli_prepare($conn, $checkSql);
if (!$checkStmt) {
    echo json_encode([
        'success' => false,
        'message' => 'Prepare failed (check): ' . mysqli_error($conn)
    ]);
    exit;
}

mysqli_stmt_bind_param($checkStmt, "ss", $enrollment_no, $email);
mysqli_stmt_execute($checkStmt);
mysqli_stmt_store_result($checkStmt);

if (mysqli_stmt_num_rows($checkStmt) > 0) {
    mysqli_stmt_close($checkStmt);
    echo json_encode([
        'success' => false,
        'message' => 'User with this enrollment no or email already exists.'
    ]);
    exit;
}
mysqli_stmt_close($checkStmt);

// ---------- 4. Insert into users ----------
$hashedPassword = password_hash($password, PASSWORD_DEFAULT);

$userSql  = "INSERT INTO users (enrollment_no, email, password) VALUES (?, ?, ?)";
$userStmt = mysqli_prepare($conn, $userSql);
if (!$userStmt) {
    echo json_encode([
        'success' => false,
        'message' => 'Prepare failed (users): ' . mysqli_error($conn)
    ]);
    exit;
}

mysqli_stmt_bind_param($userStmt, "sss", $enrollment_no, $email, $hashedPassword);

if (!mysqli_stmt_execute($userStmt)) {
    echo json_encode([
        'success' => false,
        'message' => 'Insert failed (users): ' . mysqli_error($conn)
    ]);
    mysqli_stmt_close($userStmt);
    exit;
}

$user_id = mysqli_insert_id($conn);
mysqli_stmt_close($userStmt);

// ---------- 5. Insert into student_profile ----------
$profileSql = "
    INSERT INTO student_profile (user_id, fname, lname, dob, gender, contact, address, email)
    VALUES (?, ?, ?, NULL, NULL, NULL, NULL, ?)
";

$profileStmt = mysqli_prepare($conn, $profileSql);
if (!$profileStmt) {
    echo json_encode([
        'success' => false,
        'message' => 'Prepare failed (student_profile): ' . mysqli_error($conn)
    ]);
    exit;
}

mysqli_stmt_bind_param($profileStmt, "isss", $user_id, $fname, $lname, $email);

if (!mysqli_stmt_execute($profileStmt)) {
    echo json_encode([
        'success' => false,
        'message' => 'Insert failed (student_profile): ' . mysqli_error($conn)
    ]);
    mysqli_stmt_close($profileStmt);
    exit;
}

mysqli_stmt_close($profileStmt);

// ---------- 6. Set session (optional) ----------
$_SESSION['user_id']       = $user_id;
$_SESSION['enrollment_no'] = $enrollment_no;
$_SESSION['email']         = $email;

// ---------- 7. Success ----------
echo json_encode([
    'success' => true,
    'message' => 'Registration successful.'
]);

$conn->close();
