<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type");

include "koneksi.php";

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {

    case 'GET':
        // ── FITUR BARU: Jika React minta data untuk dropdown Pilih Batch ──
        if (isset($_GET['get_batches'])) {
            // Ambil id_batch dan nama_batch dari tabel batch
            $result = mysqli_query($koneksi, "SELECT id_batch, nama_batch FROM batch ORDER BY id_batch DESC");
            
            $batches = [];
            while ($row = mysqli_fetch_assoc($result)) {
                $batches[] = $row;
            }

            echo json_encode([
                "status" => "success",
                "data"   => $batches
            ]);
            break; // Stop di sini, gak usah lanjut ke bawah
        }

        // ── DEFAULT: Ambil semua data bahan masuk untuk tabel/list ──
        $result = mysqli_query($koneksi, "
            SELECT b.id_bahan, b.id_batch, ba.nama_batch, 
                   b.nama_bahan, b.jumlah, b.tanggal 
            FROM bahan_masuk b
            LEFT JOIN batch ba ON b.id_batch = ba.id_batch
            ORDER BY b.tanggal DESC
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

        $id_batch   = isset($input['id_batch']) ? $input['id_batch'] : '';
        $nama_bahan = isset($input['nama_bahan']) ? trim($input['nama_bahan']) : '';
        $jumlah     = isset($input['jumlah']) ? $input['jumlah'] : '';
        $tanggal    = isset($input['tanggal']) ? $input['tanggal'] : date('Y-m-d');

        if (empty($id_batch) || empty($nama_bahan) || empty($jumlah)) {
            echo json_encode([
                "status"  => "error",
                "message" => "Batch, nama bahan, dan jumlah wajib diisi."
            ]);
            exit;
        }

        $stmt = mysqli_prepare($koneksi, "
            INSERT INTO bahan_masuk (id_batch, nama_bahan, jumlah, tanggal) 
            VALUES (?, ?, ?, ?)
        ");
        mysqli_stmt_bind_param($stmt, "isis", $id_batch, $nama_bahan, $jumlah, $tanggal);

        if (mysqli_stmt_execute($stmt)) {
            echo json_encode([
                "status"  => "success",
                "message" => "Bahan masuk berhasil ditambahkan."
            ]);
        } else {
            echo json_encode([
                "status"  => "error",
                "message" => "Gagal menambahkan bahan masuk."
            ]);
        }
        break;

    case 'PUT':
        $input = json_decode(file_get_contents("php://input"), true);

        $id_bahan   = isset($input['id_bahan']) ? $input['id_bahan'] : '';
        $nama_bahan = isset($input['nama_bahan']) ? trim($input['nama_bahan']) : '';
        $jumlah     = isset($input['jumlah']) ? $input['jumlah'] : '';
        $tanggal    = isset($input['tanggal']) ? $input['tanggal'] : '';

        if (empty($id_bahan) || empty($nama_bahan) || empty($jumlah)) {
            echo json_encode([
                "status"  => "error",
                "message" => "Data tidak lengkap."
            ]);
            exit;
        }

        $stmt = mysqli_prepare($koneksi, "
            UPDATE bahan_masuk 
            SET nama_bahan = ?, jumlah = ?, tanggal = ? 
            WHERE id_bahan = ?
        ");
        mysqli_stmt_bind_param($stmt, "sisi", $nama_bahan, $jumlah, $tanggal, $id_bahan);

        if (mysqli_stmt_execute($stmt)) {
            echo json_encode([
                "status"  => "success",
                "message" => "Data bahan masuk berhasil diupdate."
            ]);
        } else {
            echo json_encode([
                "status"  => "error",
                "message" => "Gagal mengupdate data."
            ]);
        }
        break;

    case 'DELETE':
        $input = json_decode(file_get_contents("php://input"), true);
        $id_bahan = isset($input['id_bahan']) ? $input['id_bahan'] : '';

        if (empty($id_bahan)) {
            echo json_encode([
                "status"  => "error",
                "message" => "ID tidak ditemukan."
            ]);
            exit;
        }

        $stmt = mysqli_prepare($koneksi, "DELETE FROM bahan_masuk WHERE id_bahan = ?");
        mysqli_stmt_bind_param($stmt, "i", $id_bahan);

        if (mysqli_stmt_execute($stmt)) {
            echo json_encode([
                "status"  => "success",
                "message" => "Data bahan masuk berhasil dihapus."
            ]);
        } else {
            echo json_encode([
                "status"  => "error",
                "message" => "Gagal menghapus data."
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