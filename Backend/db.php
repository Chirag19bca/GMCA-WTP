<?php
// db.php - Database connection

$host = "localhost";
$user = "root";        // default in XAMPP
$pass = "";            // default is empty
$dbname = "test";      // your database

$conn = mysqli_connect($host, $user, $pass, $dbname);

if (!$conn) {
    die("Connection failed: " . mysqli_connect_error());
}
?>
