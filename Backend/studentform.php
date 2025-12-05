<?php
header('Content-Type: application/json');
session_start();
require_once 'db.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode(["success" => false, "message" => "Not logged in"]);
    exit;
}

$user_id = $_SESSION['user_id'];

$data = json_decode(file_get_contents("php://input"), true);
if (!$data) {
    echo json_encode(["success" => false, "message" => "Invalid input"]);
    exit;
}

// assign values to variables (required for bind_param)
$dob            = $data['dob'] ?? "";
$gender         = $data['gender'] ?? "";
$contact_no     = $data['contact_no'] ?? "";
$address        = $data['address'] ?? "";

$ssc_school      = $data['ssc_school'] ?? "";
$ssc_board       = $data['ssc_board'] ?? "";
$ssc_percentage  = $data['ssc_percentage'] ?? null;

$hsc_school      = $data['hsc_school'] ?? "";
$hsc_board       = $data['hsc_board'] ?? "";
$hsc_percentage  = $data['hsc_percentage'] ?? null;

/* ------------------------------------------
   1) Update student_profile
-------------------------------------------*/
$profileSql = "UPDATE student_profile 
               SET dob=?, gender=?, contact=?, address=? 
               WHERE user_id=?";
$pstmt = $conn->prepare($profileSql);
$pstmt->bind_param("ssssi", $dob, $gender, $contact_no, $address, $user_id);
$pstmt->execute();
$pstmt->close();

/* ------------------------------------------
   2) Insert OR Update education_details
-------------------------------------------*/
$checkEdu = $conn->prepare("SELECT id FROM education_details WHERE user_id=?");
$checkEdu->bind_param("i", $user_id);
$checkEdu->execute();
$checkEdu->store_result();

if ($checkEdu->num_rows > 0) {
    // update
    $eduSql = "UPDATE education_details SET 
    ssc_school=?, ssc_board=?, ssc_percentage=?, 
    hsc_school=?, hsc_board=?, hsc_percentage=? 
    WHERE user_id=?";
$stmt = $conn->prepare($eduSql);
$stmt->bind_param(
    "ssdssdi",
    $ssc_school,   // s
    $ssc_board,    // s
    $ssc_percentage, // d
    $hsc_school,   // s
    $hsc_board,    // s  
    $hsc_percentage, // d
    $user_id       // i
);

} else {
    // insert
    $eduSql = "INSERT INTO education_details 
        (user_id, ssc_school, ssc_board, ssc_percentage, hsc_school, hsc_board, hsc_percentage)
        VALUES (?, ?, ?, ?, ?, ?, ?)";
    $stmt = $conn->prepare($eduSql);
    $stmt->bind_param(
    "issdssd",
    $user_id,         // i
    $ssc_school,      // s
    $ssc_board,       // s
    $ssc_percentage,  // d
    $hsc_school,      // s
    $hsc_board,       // s  
    $hsc_percentage   // d
);

}

$stmt->execute();
$stmt->close();

echo json_encode(["success" => true, "message" => "Application submitted successfully"]);
