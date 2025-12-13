<?php
header("Content-Type: application/json");
session_start();
require_once "db.php";

if (!isset($_SESSION['user_id'])) {
    echo "NOT_LOGGED_IN";
    exit;
}

$user_id = $_SESSION['user_id'];

$sql = "
SELECT 
    u.enrollment_no,

    sp.fname,
    sp.lname,
    sp.email,
    sp.dob,
    sp.gender,
    sp.contact,
    sp.address,

    ed.ssc_school,
    ed.ssc_board,
    ed.ssc_percentage,

    ed.hsc_school,
    ed.hsc_board,
    ed.hsc_percentage

FROM users u
JOIN student_profile sp 
    ON u.id = sp.user_id

LEFT JOIN education_details ed 
    ON sp.user_id = ed.user_id

WHERE u.id = ?
";


$stmt = mysqli_prepare($conn, $sql);
mysqli_stmt_bind_param($stmt, "i", $user_id);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);

echo json_encode(mysqli_fetch_assoc($result) ?: []);
