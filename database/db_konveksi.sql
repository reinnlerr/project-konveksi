-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 18, 2026 at 07:58 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `db_konveksi`
--

-- --------------------------------------------------------

--
-- Table structure for table `bahan_masuk`
--

CREATE TABLE `bahan_masuk` (
  `id_bahan` int(11) NOT NULL,
  `id_batch` int(11) DEFAULT NULL,
  `nama_bahan` varchar(100) DEFAULT NULL,
  `jumlah` int(11) DEFAULT NULL,
  `tanggal` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `bahan_masuk`
--

INSERT INTO `bahan_masuk` (`id_bahan`, `id_batch`, `nama_bahan`, `jumlah`, `tanggal`) VALUES
(1, 1, 'Kain Katun Combed 30s', 150, '2026-05-12');

-- --------------------------------------------------------

--
-- Table structure for table `batch`
--

CREATE TABLE `batch` (
  `id_batch` int(11) NOT NULL,
  `nama_batch` varchar(100) NOT NULL,
  `tanggal_mulai` date DEFAULT NULL,
  `status` enum('proses','selesai') DEFAULT 'proses',
  `created_by` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `batch`
--

INSERT INTO `batch` (`id_batch`, `nama_batch`, `tanggal_mulai`, `status`, `created_by`) VALUES
(1, 'Order Kemeja Polos 100pcs', '2026-05-12', 'proses', 1);

-- --------------------------------------------------------

--
-- Table structure for table `cutting`
--

CREATE TABLE `cutting` (
  `id_cutting` int(11) NOT NULL,
  `id_batch` int(11) DEFAULT NULL,
  `jumlah_hasil` int(11) DEFAULT NULL,
  `tanggal` date DEFAULT NULL,
  `id_user` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `cutting`
--

INSERT INTO `cutting` (`id_cutting`, `id_batch`, `jumlah_hasil`, `tanggal`, `id_user`) VALUES
(1, 1, 105, '2026-05-13', 1);

-- --------------------------------------------------------

--
-- Table structure for table `finishing`
--

CREATE TABLE `finishing` (
  `id_finishing` int(11) NOT NULL,
  `id_batch` int(11) DEFAULT NULL,
  `jumlah_hasil` int(11) DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL,
  `tanggal` date DEFAULT NULL,
  `id_user` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `finishing`
--

INSERT INTO `finishing` (`id_finishing`, `id_batch`, `jumlah_hasil`, `status`, `tanggal`, `id_user`) VALUES
(1, 1, 100, 'selesai', '2026-05-16', 1);

-- --------------------------------------------------------

--
-- Table structure for table `jahit`
--

CREATE TABLE `jahit` (
  `id_jahit` int(11) NOT NULL,
  `id_batch` int(11) DEFAULT NULL,
  `jumlah_hasil` int(11) DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL,
  `tanggal` date DEFAULT NULL,
  `id_user` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `jahit`
--

INSERT INTO `jahit` (`id_jahit`, `id_batch`, `jumlah_hasil`, `status`, `tanggal`, `id_user`) VALUES
(1, 1, 102, 'selesai', '2026-05-15', 1);

-- --------------------------------------------------------

--
-- Table structure for table `payment`
--

CREATE TABLE `payment` (
  `id_payment` int(11) NOT NULL,
  `id_batch` int(11) DEFAULT NULL,
  `total_bayar` decimal(12,2) DEFAULT NULL,
  `metode_bayar` varchar(50) DEFAULT NULL,
  `tanggal_bayar` date DEFAULT NULL,
  `status_bayar` enum('belum','lunas') DEFAULT 'belum'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `payment`
--

INSERT INTO `payment` (`id_payment`, `id_batch`, `total_bayar`, `metode_bayar`, `tanggal_bayar`, `status_bayar`) VALUES
(1, 1, 5000000.00, 'Transfer BCA', '2026-05-12', 'lunas');

-- --------------------------------------------------------

--
-- Table structure for table `pengiriman`
--

CREATE TABLE `pengiriman` (
  `id_pengiriman` int(11) NOT NULL,
  `id_batch` int(11) DEFAULT NULL,
  `jumlah_kirim` int(11) DEFAULT NULL,
  `tanggal_kirim` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `pengiriman`
--

INSERT INTO `pengiriman` (`id_pengiriman`, `id_batch`, `jumlah_kirim`, `tanggal_kirim`) VALUES
(1, 1, 100, '2026-05-17');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id_user` int(11) NOT NULL,
  `Email` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','pegawai','owner') NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id_user`, `Email`, `password`, `role`, `created_at`) VALUES
(1, 'bayu@gmail.com', '123456', 'admin', '2026-05-12 10:18:02');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `bahan_masuk`
--
ALTER TABLE `bahan_masuk`
  ADD PRIMARY KEY (`id_bahan`),
  ADD KEY `id_batch` (`id_batch`);

--
-- Indexes for table `batch`
--
ALTER TABLE `batch`
  ADD PRIMARY KEY (`id_batch`),
  ADD KEY `created_by` (`created_by`);

--
-- Indexes for table `cutting`
--
ALTER TABLE `cutting`
  ADD PRIMARY KEY (`id_cutting`),
  ADD KEY `id_batch` (`id_batch`),
  ADD KEY `id_user` (`id_user`);

--
-- Indexes for table `finishing`
--
ALTER TABLE `finishing`
  ADD PRIMARY KEY (`id_finishing`),
  ADD KEY `id_batch` (`id_batch`),
  ADD KEY `id_user` (`id_user`);

--
-- Indexes for table `jahit`
--
ALTER TABLE `jahit`
  ADD PRIMARY KEY (`id_jahit`),
  ADD KEY `id_batch` (`id_batch`),
  ADD KEY `id_user` (`id_user`);

--
-- Indexes for table `payment`
--
ALTER TABLE `payment`
  ADD PRIMARY KEY (`id_payment`),
  ADD KEY `id_batch` (`id_batch`);

--
-- Indexes for table `pengiriman`
--
ALTER TABLE `pengiriman`
  ADD PRIMARY KEY (`id_pengiriman`),
  ADD KEY `id_batch` (`id_batch`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id_user`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `bahan_masuk`
--
ALTER TABLE `bahan_masuk`
  MODIFY `id_bahan` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `batch`
--
ALTER TABLE `batch`
  MODIFY `id_batch` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `cutting`
--
ALTER TABLE `cutting`
  MODIFY `id_cutting` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `finishing`
--
ALTER TABLE `finishing`
  MODIFY `id_finishing` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `jahit`
--
ALTER TABLE `jahit`
  MODIFY `id_jahit` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `payment`
--
ALTER TABLE `payment`
  MODIFY `id_payment` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `pengiriman`
--
ALTER TABLE `pengiriman`
  MODIFY `id_pengiriman` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id_user` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `bahan_masuk`
--
ALTER TABLE `bahan_masuk`
  ADD CONSTRAINT `bahan_masuk_ibfk_1` FOREIGN KEY (`id_batch`) REFERENCES `batch` (`id_batch`) ON DELETE CASCADE;

--
-- Constraints for table `batch`
--
ALTER TABLE `batch`
  ADD CONSTRAINT `batch_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id_user`) ON DELETE SET NULL;

--
-- Constraints for table `cutting`
--
ALTER TABLE `cutting`
  ADD CONSTRAINT `cutting_ibfk_1` FOREIGN KEY (`id_batch`) REFERENCES `batch` (`id_batch`) ON DELETE CASCADE,
  ADD CONSTRAINT `cutting_ibfk_2` FOREIGN KEY (`id_user`) REFERENCES `users` (`id_user`);

--
-- Constraints for table `finishing`
--
ALTER TABLE `finishing`
  ADD CONSTRAINT `finishing_ibfk_1` FOREIGN KEY (`id_batch`) REFERENCES `batch` (`id_batch`) ON DELETE CASCADE,
  ADD CONSTRAINT `finishing_ibfk_2` FOREIGN KEY (`id_user`) REFERENCES `users` (`id_user`);

--
-- Constraints for table `jahit`
--
ALTER TABLE `jahit`
  ADD CONSTRAINT `jahit_ibfk_1` FOREIGN KEY (`id_batch`) REFERENCES `batch` (`id_batch`) ON DELETE CASCADE,
  ADD CONSTRAINT `jahit_ibfk_2` FOREIGN KEY (`id_user`) REFERENCES `users` (`id_user`);

--
-- Constraints for table `payment`
--
ALTER TABLE `payment`
  ADD CONSTRAINT `payment_ibfk_1` FOREIGN KEY (`id_batch`) REFERENCES `batch` (`id_batch`) ON DELETE CASCADE;

--
-- Constraints for table `pengiriman`
--
ALTER TABLE `pengiriman`
  ADD CONSTRAINT `pengiriman_ibfk_1` FOREIGN KEY (`id_batch`) REFERENCES `batch` (`id_batch`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
