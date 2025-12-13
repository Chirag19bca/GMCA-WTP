<?php
// Backend/login.php
header('Content-Type: application/json');
session_start();
require_once 'db.php';   // must define $conn or $con

// support both $conn and $con
if (!isset($conn)) {
    if (isset($con)) {
        $conn = $con;
    } else {
        echo json_encode(['success' => false, 'message' => 'DB connection not found']);
        exit;
    }
}

// Read JSON from Angular or normal POST
$raw  = file_get_contents("php://input");
$data = json_decode($raw, true);
if (!is_array($data) || empty($data)) {
    $data = $_POST;
}

$enrollment_no = isset($data['enrollment_no']) ? trim($data['enrollment_no']) : '';
$email         = isset($data['email'])         ? trim($data['email'])         : '';
$password      = isset($data['password'])      ? trim($data['password'])      : '';

// Basic validation
if ($password === '' || ($email === '' && $enrollment_no === '')) {
    echo json_encode([
        'success' => false,
        'message' => 'Provide enrollment/email and password.'
    ]);
    exit;
}

// Decide query based on what user entered
if ($email !== '' && $enrollment_no !== '') {
    // First we fetch by email to check password
    $sql = "SELECT id, enrollment_no, email, password 
            FROM users 
            WHERE email = ? 
            LIMIT 1";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        echo json_encode([
            'success' => false,
            'message' => 'Email not registered.'
        ]);
        exit;
    }

    $user = $result->fetch_assoc();

    // Check password
    if (!password_verify($password, $user['password'])) {
        echo json_encode([
            'success' => false,
            'message' => 'Incorrect password.'
        ]);
        exit;
    }

    // Now check if enrollment matches
    if ($user['enrollment_no'] !== $enrollment_no) {
        echo json_encode([
            'success' => false,
            'message' => 'Enrollment number does not match email.'
        ]);
        exit;
    }

    // All good -> set session
    $_SESSION['user_id']       = $user['id'];
    $_SESSION['enrollment_no'] = $user['enrollment_no'];
    $_SESSION['email']         = $user['email'];

    echo json_encode([
        'success' => true,
        'message' => 'Login successful.'
    ]);
    exit;
}


$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode([
        'success' => false,
        'message' => 'User not found.'
    ]);
    exit;
}

$user = $result->fetch_assoc();

// Verify password (assuming you used password_hash in register.php)
if (!password_verify($password, $user['password'])) {
    echo json_encode([
        'success' => false,
        'message' => 'Incorrect password.'
    ]);
    exit;
}

// ✅ All good: set session
$_SESSION['user_id']       = $user['id'];
$_SESSION['enrollment_no'] = $user['enrollment_no'];
$_SESSION['email']         = $user['email'];

echo json_encode([
    'success' => true,
    'message' => 'Login successful.'
]);
