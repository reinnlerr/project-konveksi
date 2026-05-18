<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type");

include "koneksi.php";

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {

    // Ambil semua data cutting
    case 'GET':
        $result = mysqli_query($koneksi, "
            SELECT id, batch_id, nama_pola, jumlah_potong, status, tanggal, keterangan 
            FROM cutting 
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

    // Tambah data cutting
    case 'POST':
        $input = json_decode(file_get_contents("php://input"), true);

        $batch_id      = isset($input['batch_id']) ? $input['batch_id'] : '';
        $nama_pola     = isset($input['nama_pola']) ? trim($input['nama_pola']) : '';
        $jumlah_potong = isset($input['jumlah_potong']) ? $input['jumlah_potong'] : '';
        $status        = isset($input['status']) ? trim($input['status']) : 'proses';
        $keterangan    = isset($input['keterangan']) ? trim($input['keterangan']) : '';

        // Validasi
        if (empty($batch_id) || empty($nama_pola) || empty($jumlah_potong)) {
            echo json_encode([
                "status"  => "error",
                "message" => "Batch, nama pola, dan jumlah potong wajib diisi."
            ]);
            exit;
        }

        $stmt = mysqli_prepare($koneksi, "
            INSERT INTO cutting (batch_id, nama_pola, jumlah_potong, status, keterangan, tanggal) 
            VALUES (?, ?, ?, ?, ?, NOW())
        ");
        mysqli_stmt_bind_param($stmt, "isiss", $batch_id, $nama_pola, $jumlah_potong, $status, $keterangan);

        if (mysqli_stmt_execute($stmt)) {
            echo json_encode([
                "status"  => "success",
                "message" => "Data cutting berhasil ditambahkan."
            ]);
        } else {
            echo json_encode([
                "status"  => "error",
                "message" => "Gagal menambahkan data cutting."
            ]);
        }
        break;

    // Update data cutting
    case 'PUT':
        $input = json_decode(file_get_contents("php://input"), true);

        $id            = isset($input['id']) ? $input['id'] : '';
        $nama_pola     = isset($input['nama_pola']) ? trim($input['nama_pola']) : '';
        $jumlah_potong = isset($input['jumlah_potong']) ? $input['jumlah_potong'] : '';
        $status        = isset($input['status']) ? trim($input['status']) : '';
        $keterangan    = isset($input['keterangan']) ? trim($input['keterangan']) : '';

        if (empty($id) || empty($nama_pola) || empty($jumlah_potong) || empty($status)) {
            echo json_encode([
                "status"  => "error",
                "message" => "Data tidak lengkap."
            ]);
            exit;
        }

        $stmt = mysqli_prepare($koneksi, "
            UPDATE cutting 
            SET nama_pola = ?, jumlah_potong = ?, status = ?, keterangan = ? 
            WHERE id = ?
        ");
        mysqli_stmt_bind_param($stmt, "sissi", $nama_pola, $jumlah_potong, $status, $keterangan, $id);

        if (mysqli_stmt_execute($stmt)) {
            echo json_encode([
                "status"  => "success",
                "message" => "Data cutting berhasil diupdate."
            ]);
        } else {
            echo json_encode([
                "status"  => "error",
                "message" => "Gagal mengupdate data cutting."
            ]);
        }
        break;

    // Hapus data cutting
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

        $stmt = mysqli_prepare($koneksi, "DELETE FROM cutting WHERE id = ?");
        mysqli_stmt_bind_param($stmt, "i", $id);

        if (mysqli_stmt_execute($stmt)) {
            echo json_encode([
                "status"  => "success",
                "message" => "Data cutting berhasil dihapus."
            ]);
        } else {
            echo json_encode([
                "status"  => "error",
                "message" => "Gagal menghapus data cutting."
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