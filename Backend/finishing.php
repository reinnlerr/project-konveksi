<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type");

include "koneksi.php";

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {

    // Ambil semua data finishing
    case 'GET':
        $result = mysqli_query($koneksi, "
            SELECT id, batch_id, jumlah_masuk, jumlah_lolos, 
                   jumlah_revisi, status, tanggal, keterangan 
            FROM finishing 
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

    // Tambah data finishing
    case 'POST':
        $input = json_decode(file_get_contents("php://input"), true);

        $batch_id      = isset($input['batch_id']) ? $input['batch_id'] : '';
        $jumlah_masuk  = isset($input['jumlah_masuk']) ? $input['jumlah_masuk'] : '';
        $jumlah_lolos  = isset($input['jumlah_lolos']) ? $input['jumlah_lolos'] : 0;
        $jumlah_revisi = isset($input['jumlah_revisi']) ? $input['jumlah_revisi'] : 0;
        $status        = isset($input['status']) ? trim($input['status']) : 'proses';
        $keterangan    = isset($input['keterangan']) ? trim($input['keterangan']) : '';

        // Validasi
        if (empty($batch_id) || empty($jumlah_masuk)) {
            echo json_encode([
                "status"  => "error",
                "message" => "Batch dan jumlah masuk wajib diisi."
            ]);
            exit;
        }

        // Validasi jumlah lolos + revisi tidak melebihi jumlah masuk
        if (($jumlah_lolos + $jumlah_revisi) > $jumlah_masuk) {
            echo json_encode([
                "status"  => "error",
                "message" => "Jumlah lolos dan revisi tidak boleh melebihi jumlah masuk."
            ]);
            exit;
        }

        $stmt = mysqli_prepare($koneksi, "
            INSERT INTO finishing (batch_id, jumlah_masuk, jumlah_lolos, jumlah_revisi, status, keterangan, tanggal) 
            VALUES (?, ?, ?, ?, ?, ?, NOW())
        ");
        mysqli_stmt_bind_param($stmt, "iiiiss", $batch_id, $jumlah_masuk, $jumlah_lolos, $jumlah_revisi, $status, $keterangan);

        if (mysqli_stmt_execute($stmt)) {
            echo json_encode([
                "status"  => "success",
                "message" => "Data finishing berhasil ditambahkan."
            ]);
        } else {
            echo json_encode([
                "status"  => "error",
                "message" => "Gagal menambahkan data finishing."
            ]);
        }
        break;

    // Update data finishing
    case 'PUT':
        $input = json_decode(file_get_contents("php://input"), true);

        $id            = isset($input['id']) ? $input['id'] : '';
        $jumlah_masuk  = isset($input['jumlah_masuk']) ? $input['jumlah_masuk'] : '';
        $jumlah_lolos  = isset($input['jumlah_lolos']) ? $input['jumlah_lolos'] : '';
        $jumlah_revisi = isset($input['jumlah_revisi']) ? $input['jumlah_revisi'] : '';
        $status        = isset($input['status']) ? trim($input['status']) : '';
        $keterangan    = isset($input['keterangan']) ? trim($input['keterangan']) : '';

        if (empty($id) || empty($jumlah_masuk) || empty($status)) {
            echo json_encode([
                "status"  => "error",
                "message" => "Data tidak lengkap."
            ]);
            exit;
        }

        // Validasi jumlah lolos + revisi tidak melebihi jumlah masuk
        if (($jumlah_lolos + $jumlah_revisi) > $jumlah_masuk) {
            echo json_encode([
                "status"  => "error",
                "message" => "Jumlah lolos dan revisi tidak boleh melebihi jumlah masuk."
            ]);
            exit;
        }

        $stmt = mysqli_prepare($koneksi, "
            UPDATE finishing 
            SET jumlah_masuk = ?, jumlah_lolos = ?, jumlah_revisi = ?, status = ?, keterangan = ? 
            WHERE id = ?
        ");
        mysqli_stmt_bind_param($stmt, "iiissi", $jumlah_masuk, $jumlah_lolos, $jumlah_revisi, $status, $keterangan, $id);

        if (mysqli_stmt_execute($stmt)) {
            echo json_encode([
                "status"  => "success",
                "message" => "Data finishing berhasil diupdate."
            ]);
        } else {
            echo json_encode([
                "status"  => "error",
                "message" => "Gagal mengupdate data finishing."
            ]);
        }
        break;

    // Hapus data finishing
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

        $stmt = mysqli_prepare($koneksi, "DELETE FROM finishing WHERE id = ?");
        mysqli_stmt_bind_param($stmt, "i", $id);

        if (mysqli_stmt_execute($stmt)) {
            echo json_encode([
                "status"  => "success",
                "message" => "Data finishing berhasil dihapus."
            ]);
        } else {
            echo json_encode([
                "status"  => "error",
                "message" => "Gagal menghapus data finishing."
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