<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include "koneksi.php";

$type = isset($_GET['type']) ? $_GET['type'] : '';

switch ($type) {
    case 'cutting':
        $result = mysqli_query($koneksi, "
            SELECT c.id_cutting, b.nama_batch, c.jumlah_hasil, c.tanggal, u.Email as nama_user
            FROM cutting c
            LEFT JOIN batch b ON c.id_batch = b.id_batch
            LEFT JOIN users u ON c.id_user = u.id_user
            ORDER BY c.tanggal DESC LIMIT 20
        ");
        break;

    case 'jahit':
        $result = mysqli_query($koneksi, "
            SELECT j.id_jahit, b.nama_batch, j.jumlah_hasil, j.status, j.tanggal, u.Email as nama_user
            FROM jahit j
            LEFT JOIN batch b ON j.id_batch = b.id_batch
            LEFT JOIN users u ON j.id_user = u.id_user
            ORDER BY j.tanggal DESC LIMIT 20
        ");
        break;

    case 'finishing':
        $result = mysqli_query($koneksi, "
            SELECT f.id_finishing, b.nama_batch, f.jumlah_hasil, f.status, f.tanggal, u.Email as nama_user
            FROM finishing f
            LEFT JOIN batch b ON f.id_batch = b.id_batch
            LEFT JOIN users u ON f.id_user = u.id_user
            ORDER BY f.tanggal DESC LIMIT 20
        ");
        break;

    case 'pengiriman':
        $result = mysqli_query($koneksi, "
            SELECT p.id_pengiriman, b.nama_batch, p.jumlah_kirim, p.tanggal_kirim,
                   o.jenis_baju, o.catatan as deskripsi_customer
            FROM pengiriman p
            LEFT JOIN batch b ON p.id_batch = b.id_batch
            LEFT JOIN orders o ON o.id_batch = b.id_batch
            ORDER BY p.tanggal_kirim DESC LIMIT 20
        ");
        break;

    case 'bahan':
        $result = mysqli_query($koneksi, "
            SELECT bm.id_bahan, b.nama_batch, bm.nama_bahan, bm.jumlah, bm.tanggal
            FROM bahan_masuk bm
            LEFT JOIN batch b ON bm.id_batch = b.id_batch
            ORDER BY bm.tanggal DESC LIMIT 20
        ");
        break;

    default:
        echo json_encode(["status" => "error", "message" => "Tipe tidak valid."]);
        exit;
}

$data = [];
while ($row = mysqli_fetch_assoc($result)) {
    $data[] = $row;
}

echo json_encode(["status" => "success", "data" => $data]);
?>