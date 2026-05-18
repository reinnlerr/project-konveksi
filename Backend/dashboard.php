<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");

include "koneksi.php";

// Ambil total batch
$total_batch = mysqli_fetch_assoc(mysqli_query($koneksi, "SELECT COUNT(*) as total FROM batch"));
$total = $total_batch['total'];

// Ambil batch aktif (yang belum selesai)
$batch_aktif = mysqli_fetch_assoc(mysqli_query($koneksi, "SELECT COUNT(*) as total FROM batch WHERE status != 'selesai'"));
$aktif = $batch_aktif['total'];

// Ambil batch selesai
$batch_selesai = mysqli_fetch_assoc(mysqli_query($koneksi, "SELECT COUNT(*) as total FROM batch WHERE status = 'selesai'"));
$selesai = $batch_selesai['total'];

// Ambil data chart produksi mingguan
$chart = mysqli_query($koneksi, "
    SELECT DAYNAME(created_at) as hari, COUNT(*) as total 
    FROM batch 
    WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
    GROUP BY DAYNAME(created_at)
    ORDER BY created_at ASC
");
$chart_data = [];
while ($row = mysqli_fetch_assoc($chart)) {
    $chart_data[] = $row;
}

// Ambil recent activity (5 terbaru)
$activity = mysqli_query($koneksi, "
    SELECT aktivitas, deskripsi, created_at 
    FROM aktivitas 
    ORDER BY created_at DESC 
    LIMIT 5
");
$activity_data = [];
while ($row = mysqli_fetch_assoc($activity)) {
    $activity_data[] = $row;
}

// Ambil progress batch
$progress = mysqli_query($koneksi, "
    SELECT nama_batch, progress, tahap 
    FROM batch 
    WHERE status != 'selesai' 
    ORDER BY created_at DESC 
    LIMIT 3
");
$progress_data = [];
while ($row = mysqli_fetch_assoc($progress)) {
    $progress_data[] = $row;
}

// Ambil notifikasi/alert
$notif = mysqli_query($koneksi, "
    SELECT judul, level 
    FROM notifikasi 
    ORDER BY created_at DESC 
    LIMIT 5
");
$notif_data = [];
while ($row = mysqli_fetch_assoc($notif)) {
    $notif_data[] = $row;
}

echo json_encode([
    "status" => "success",
    "data"   => [
        "stats" => [
            ["label" => "Total Batch",   "value" => $total],
            ["label" => "Batch Aktif",   "value" => $aktif],
            ["label" => "Batch Selesai", "value" => $selesai]
        ],
        "chart_mingguan" => $chart_data,
        "recent_activity" => $activity_data,
        "progress_batch"  => $progress_data,
        "notifikasi"      => $notif_data
    ]
]);
?>