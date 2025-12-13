-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Dec 13, 2025 at 03:28 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `test`
--

-- --------------------------------------------------------

--
-- Table structure for table `education_details`
--

CREATE TABLE `education_details` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `ssc_school` varchar(255) DEFAULT NULL,
  `ssc_board` varchar(50) DEFAULT NULL,
  `ssc_percentage` decimal(5,2) DEFAULT NULL,
  `hsc_school` varchar(255) DEFAULT NULL,
  `hsc_board` varchar(50) DEFAULT NULL,
  `hsc_percentage` decimal(5,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `education_details`
--

INSERT INTO `education_details` (`id`, `user_id`, `ssc_school`, `ssc_board`, `ssc_percentage`, `hsc_school`, `hsc_board`, `hsc_percentage`) VALUES
(1, 7, 'fdasfda', 'CBSE', 89.00, 'fdfad', 'CBSE', 90.00),
(2, 8, 'dfadsfda', 'GSEB', 98.00, 'fddfdd', 'GSEB', 99.00);

-- --------------------------------------------------------

--
-- Table structure for table `student_profile`
--

CREATE TABLE `student_profile` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `fname` varchar(50) DEFAULT NULL,
  `lname` varchar(50) DEFAULT NULL,
  `dob` date DEFAULT NULL,
  `gender` varchar(10) DEFAULT NULL,
  `contact` varchar(15) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `student_profile`
--

INSERT INTO `student_profile` (`id`, `user_id`, `fname`, `lname`, `dob`, `gender`, `contact`, `address`, `email`) VALUES
(4, 7, 'Chirag', 'Sadhu', '2004-08-05', 'male', '9537412455', 'Khodiyar nagar na chhapra,chhaganbhai na chhapra,behrampura, ahmadabad city, Ahmedabad', 'chirag@gmail.com'),
(5, 8, 'Heet', 'Shah', '2004-08-04', 'male', '9587874124', 'dfadsfasedf', 'heet@gmail.com'),
(6, 9, 'Dhruvil', 'Lodha', NULL, NULL, NULL, NULL, 'dhruvil@gmail.com'),
(7, 10, 'Dhrumil', 'Jadav', NULL, NULL, NULL, NULL, 'dhrumil@gmail.com'),
(8, 11, 'Aryan', 'Mehtani', NULL, NULL, NULL, NULL, 'aryan@gmail.com'),
(9, 12, 'aryan', 'gadhi', NULL, NULL, NULL, NULL, 'aryangadhi@gmail.com');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `enrollment_no` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `enrollment_no`, `email`, `password`) VALUES
(7, '255690694051', 'chirag@gmail.com', '$2y$10$DTVt6UbY7A6VspjWyYtU4e4hIX.AEDenu5vlhqIFikvnDqhnlu3E6'),
(8, '255690694005', 'heet@gmail.com', '$2y$10$oL6m1URaTHjG56NWhjnpX.iPsFQn5KHddU5PIdm5CkkBspKABjR0S'),
(9, '255690694021', 'dhruvil@gmail.com', '$2y$10$glSnUH6X3a0PYlwjP0Un1uLmYxIUiHiAuHmhWFbp/i7oa9q2XKmWK'),
(10, '255690694015', 'dhrumil@gmail.com', '$2y$10$GX0EYa/XGN7cZmTpQRpP9OCP/f1QTRm2ZBX1mYTQSOIwIofhZMu5.'),
(11, '255690694028', 'aryan@gmail.com', '$2y$10$drhLVxMW2R/y5j8o0X5pTuWOYXf5mxRJwbCtRjGXJ.T1MRZV4Itbq'),
(12, '255690694001', 'aryangadhi@gmail.com', '$2y$10$3F3zAMkBXxcIpxN914RNhOnfCJXOiGn1letSmkqPk6FnDjrMAh0aC');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `education_details`
--
ALTER TABLE `education_details`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `student_profile`
--
ALTER TABLE `student_profile`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `enrollment_no` (`enrollment_no`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `education_details`
--
ALTER TABLE `education_details`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `student_profile`
--
ALTER TABLE `student_profile`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `education_details`
--
ALTER TABLE `education_details`
  ADD CONSTRAINT `education_details_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `student_profile`
--
ALTER TABLE `student_profile`
  ADD CONSTRAINT `student_profile_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
