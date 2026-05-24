<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include "koneksi.php";

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {

    case 'GET':
        $result = mysqli_query($koneksi, "
            SELECT p.id_pengiriman, p.id_batch, ba.nama_batch,
                   p.jumlah_kirim, p.tanggal_kirim
            FROM pengiriman p
            LEFT JOIN batch ba ON p.id_batch = ba.id_batch
            ORDER BY p.tanggal_kirim DESC
        ");

        $data = [];
        while ($row = mysqli_fetch_assoc($result)) {
            $data[] = $row;
        }

        echo json_encode([
            "status" => "success",
            "data"   => $data
        ]);
        break;

    case 'POST':
        $input = json_decode(file_get_contents("php://input"), true);

        $id_batch     = isset($input['id_batch']) ? $input['id_batch'] : '';
        $jumlah_kirim = isset($input['jumlah_kirim']) ? $input['jumlah_kirim'] : '';
        $tanggal_kirim = isset($input['tanggal_kirim']) ? $input['tanggal_kirim'] : date('Y-m-d');

        if (empty($id_batch) || empty($jumlah_kirim)) {
            echo json_encode([
                "status"  => "error",
                "message" => "Batch dan jumlah kirim wajib diisi."
            ]);
            exit;
        }

        if ($jumlah_kirim <= 0) {
            echo json_encode([
                "status"  => "error",
                "message" => "Jumlah kirim harus lebih dari 0."
            ]);
            exit;
        }

        $stmt = mysqli_prepare($koneksi, "
            INSERT INTO pengiriman (id_batch, jumlah_kirim, tanggal_kirim) 
            VALUES (?, ?, ?)
        ");
        mysqli_stmt_bind_param($stmt, "iis", $id_batch, $jumlah_kirim, $tanggal_kirim);

        if (mysqli_stmt_execute($stmt)) {
            echo json_encode([
                "status"  => "success",
                "message" => "Data pengiriman berhasil ditambahkan."
            ]);
        } else {
            echo json_encode([
                "status"  => "error",
                "message" => "Gagal menambahkan data pengiriman."
            ]);
        }
        break;

    case 'PUT':
        $input = json_decode(file_get_contents("php://input"), true);

        $id_pengiriman = isset($input['id_pengiriman']) ? $input['id_pengiriman'] : '';
        $jumlah_kirim  = isset($input['jumlah_kirim']) ? $input['jumlah_kirim'] : '';
        $tanggal_kirim = isset($input['tanggal_kirim']) ? $input['tanggal_kirim'] : '';

        if (empty($id_pengiriman) || empty($jumlah_kirim)) {
            echo json_encode([
                "status"  => "error",
                "message" => "Data tidak lengkap."
            ]);
            exit;
        }

        if ($jumlah_kirim <= 0) {
            echo json_encode([
                "status"  => "error",
                "message" => "Jumlah kirim harus lebih dari 0."
            ]);
            exit;
        }

        $stmt = mysqli_prepare($koneksi, "
            UPDATE pengiriman 
            SET jumlah_kirim = ?, tanggal_kirim = ? 
            WHERE id_pengiriman = ?
        ");
        mysqli_stmt_bind_param($stmt, "isi", $jumlah_kirim, $tanggal_kirim, $id_pengiriman);

        if (mysqli_stmt_execute($stmt)) {
            echo json_encode([
                "status"  => "success",
                "message" => "Data pengiriman berhasil diupdate."
            ]);
        } else {
            echo json_encode([
                "status"  => "error",
                "message" => "Gagal mengupdate data pengiriman."
            ]);
        }
        break;

    case 'DELETE':
        $input = json_decode(file_get_contents("php://input"), true);
        $id_pengiriman = isset($input['id_pengiriman']) ? $input['id_pengiriman'] : '';

        if (empty($id_pengiriman)) {
            echo json_encode([
                "status"  => "error",
                "message" => "ID tidak ditemukan."
            ]);
            exit;
        }

        $stmt = mysqli_prepare($koneksi, "DELETE FROM pengiriman WHERE id_pengiriman = ?");
        mysqli_stmt_bind_param($stmt, "i", $id_pengiriman);

        if (mysqli_stmt_execute($stmt)) {
            echo json_encode([
                "status"  => "success",
                "message" => "Data pengiriman berhasil dihapus."
            ]);
        } else {
            echo json_encode([
                "status"  => "error",
                "message" => "Gagal menghapus data pengiriman."
            ]);
        }
        break;

    default:
        echo json_encode([
            "status"  => "error",
            "message" => "Method tidak diizinkan."
        ]);
        break;
}
?>