<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");

include "koneksi.php";

$result = mysqli_query($koneksi, "SELECT id_user, Email, role, created_at FROM users");

$data = [];
while ($row = mysqli_fetch_assoc($result)) {
    $data[] = $row;
}

echo json_encode([
    "status" => "success",
    "data"   => $data
]);
?>