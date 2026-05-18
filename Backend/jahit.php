<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type");

include "koneksi.php";

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {

    // Ambil semua data jahit
    case 'GET':
        $result = mysqli_query($koneksi, "
            SELECT id, batch_id, nama_penjahit, jumlah_jahit, 
                   jumlah_selesai, status, tanggal, keterangan 
            FROM jahit 
            ORDER BY tanggal DESC
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

    // Tambah data jahit
    case 'POST':
        $input = json_decode(file_get_contents("php://input"), true);

        $batch_id      = isset($input['batch_id']) ? $input['batch_id'] : '';
        $nama_penjahit = isset($input['nama_penjahit']) ? trim($input['nama_penjahit']) : '';
        $jumlah_jahit  = isset($input['jumlah_jahit']) ? $input['jumlah_jahit'] : '';
        $jumlah_selesai = isset($input['jumlah_selesai']) ? $input['jumlah_selesai'] : 0;
        $status        = isset($input['status']) ? trim($input['status']) : 'proses';
        $keterangan    = isset($input['keterangan']) ? trim($input['keterangan']) : '';

        // Validasi
        if (empty($batch_id) || empty($nama_penjahit) || empty($jumlah_jahit)) {
            echo json_encode([
                "status"  => "error",
                "message" => "Batch, nama penjahit, dan jumlah jahit wajib diisi."
            ]);
            exit;
        }

        $stmt = mysqli_prepare($koneksi, "
            INSERT INTO jahit (batch_id, nama_penjahit, jumlah_jahit, jumlah_selesai, status, keterangan, tanggal) 
            VALUES (?, ?, ?, ?, ?, ?, NOW())
        ");
        mysqli_stmt_bind_param($stmt, "isiiss", $batch_id, $nama_penjahit, $jumlah_jahit, $jumlah_selesai, $status, $keterangan);

        if (mysqli_stmt_execute($stmt)) {
            echo json_encode([
                "status"  => "success",
                "message" => "Data jahit berhasil ditambahkan."
            ]);
        } else {
            echo json_encode([
                "status"  => "error",
                "message" => "Gagal menambahkan data jahit."
            ]);
        }
        break;

    // Update data jahit
    case 'PUT':
        $input = json_decode(file_get_contents("php://input"), true);

        $id             = isset($input['id']) ? $input['id'] : '';
        $nama_penjahit  = isset($input['nama_penjahit']) ? trim($input['nama_penjahit']) : '';
        $jumlah_jahit   = isset($input['jumlah_jahit']) ? $input['jumlah_jahit'] : '';
        $jumlah_selesai = isset($input['jumlah_selesai']) ? $input['jumlah_selesai'] : '';
        $status         = isset($input['status']) ? trim($input['status']) : '';
        $keterangan     = isset($input['keterangan']) ? trim($input['keterangan']) : '';

        if (empty($id) || empty($nama_penjahit) || empty($jumlah_jahit) || empty($status)) {
            echo json_encode([
                "status"  => "error",
                "message" => "Data tidak lengkap."
            ]);
            exit;
        }

        $stmt = mysqli_prepare($koneksi, "
            UPDATE jahit 
            SET nama_penjahit = ?, jumlah_jahit = ?, jumlah_selesai = ?, status = ?, keterangan = ? 
            WHERE id = ?
        ");
        mysqli_stmt_bind_param($stmt, "siissi", $nama_penjahit, $jumlah_jahit, $jumlah_selesai, $status, $keterangan, $id);

        if (mysqli_stmt_execute($stmt)) {
            echo json_encode([
                "status"  => "success",
                "message" => "Data jahit berhasil diupdate."
            ]);
        } else {
            echo json_encode([
                "status"  => "error",
                "message" => "Gagal mengupdate data jahit."
            ]);
        }
        break;

    // Hapus data jahit
    case 'DELETE':
        $input = json_decode(file_get_contents("php://input"), true);
        $id = isset($input['id']) ? $input['id'] : '';

        if (empty($id)) {
            echo json_encode([
                "status"  => "error",
                "message" => "ID tidak ditemukan."
            ]);
            exit;
        }

        $stmt = mysqli_prepare($koneksi, "DELETE FROM jahit WHERE id = ?");
        mysqli_stmt_bind_param($stmt, "i", $id);

        if (mysqli_stmt_execute($stmt)) {
            echo json_encode([
                "status"  => "success",
                "message" => "Data jahit berhasil dihapus."
            ]);
        } else {
            echo json_encode([
                "status"  => "error",
                "message" => "Gagal menghapus data jahit."
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