<?php
// Backend/get_profile.php
header('Content-Type: application/json');
session_start();

require_once 'db.php';   // must define $conn or $con

// support both $conn and $con
if (!isset($conn)) {
    if (isset($con)) {
        $conn = $con;
    } else {
        echo json_encode("NOT_LOGGED_IN");
        exit;
    }
}

if (!isset($_SESSION['user_id'])) {
    echo json_encode("NOT_LOGGED_IN");
    exit;
}

$user_id = $_SESSION['user_id'];

// Join users + student_profile + education_details
$sql = "SELECT 
            u.id,
            u.enrollment_no,
            sp.fname,
            sp.lname,
            sp.dob,
            sp.gender,
            sp.contact,
            sp.address,
            sp.email,
            ed.ssc_school,
            ed.ssc_board,
            ed.ssc_percentage,
            ed.hsc_school,
            ed.hsc_board,
            ed.hsc_percentage
        FROM users u
        LEFT JOIN student_profile sp ON sp.user_id = u.id
        LEFT JOIN education_details ed ON ed.user_id = u.id
        WHERE u.id = ?
        LIMIT 1";

$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode("NOT_LOGGED_IN");
    exit;
}

$profile = $result->fetch_assoc();
echo json_encode($profile);
