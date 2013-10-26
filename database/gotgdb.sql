-- phpMyAdmin SQL Dump
-- version 4.0.4
-- http://www.phpmyadmin.net
--
-- Host: localhost
-- Generation Time: Oct 26, 2013 at 12:21 AM
-- Server version: 5.6.12-log
-- PHP Version: 5.4.16

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Database: `gotgdb`
--
CREATE DATABASE IF NOT EXISTS `gotgdb` DEFAULT CHARACTER SET latin1 COLLATE latin1_swedish_ci;
USE `gotgdb`;

-- --------------------------------------------------------

--
-- Table structure for table `battleinvitations`
--

CREATE TABLE IF NOT EXISTS `battleinvitations` (
  `userid` int(11) NOT NULL,
  `posttime` datetime NOT NULL,
  PRIMARY KEY (`userid`),
  UNIQUE KEY `userid` (`userid`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `battlerecords`
--

CREATE TABLE IF NOT EXISTS `battlerecords` (
  `opponentuserid` int(11) NOT NULL,
  `opponentuseridb` int(11) NOT NULL,
  `wins` int(11) NOT NULL DEFAULT '0',
  `loses` int(11) NOT NULL DEFAULT '0',
  `quits` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`opponentuserid`),
  UNIQUE KEY `usernamea` (`opponentuserid`),
  UNIQUE KEY `usernameb` (`opponentuseridb`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `challengers`
--

CREATE TABLE IF NOT EXISTS `challengers` (
  `opponentuserid` int(11) NOT NULL,
  `challengeruserid` int(11) NOT NULL,
  `posttime` datetime NOT NULL,
  UNIQUE KEY `posttime` (`posttime`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `challengers`
--

INSERT INTO `challengers` (`opponentuserid`, `challengeruserid`, `posttime`) VALUES
(2, 1, '2013-10-25 15:06:15'),
(17, 2, '2013-10-25 15:17:17'),
(20, 2, '2013-10-25 15:17:21'),
(3, 17, '2013-10-25 15:19:01'),
(2, 17, '2013-10-25 15:19:03'),
(17, 1, '2013-10-25 15:40:00'),
(17, 3, '2013-10-25 16:12:50'),
(2, 3, '2013-10-25 16:12:57'),
(2, 19, '2013-10-25 16:16:57'),
(1, 3, '2013-10-25 16:43:01');

-- --------------------------------------------------------

--
-- Table structure for table `scores`
--

CREATE TABLE IF NOT EXISTS `scores` (
  `userid` int(11) NOT NULL,
  `score` float NOT NULL DEFAULT '0',
  PRIMARY KEY (`userid`),
  UNIQUE KEY `userid` (`userid`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `scores`
--

INSERT INTO `scores` (`userid`, `score`) VALUES
(0, 0),
(1, 0),
(2, 0),
(3, 0),
(4, 0),
(5, 0),
(6, 0),
(7, 0),
(8, 0),
(9, 0),
(10, 0),
(11, 0),
(12, 0),
(13, 0),
(14, 0),
(15, 0),
(16, 0),
(17, 0),
(19, 0),
(20, 0);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE IF NOT EXISTS `users` (
  `userid` int(11) NOT NULL AUTO_INCREMENT,
  `email` varchar(32) NOT NULL,
  `username` varchar(32) NOT NULL,
  `password` varchar(32) NOT NULL,
  `dateres` datetime NOT NULL,
  PRIMARY KEY (`userid`),
  UNIQUE KEY `userid` (`userid`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=21 ;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`userid`, `email`, `username`, `password`, `dateres`) VALUES
(1, 'roger.madjos@gmail.com', 'botmind', '9662ab91d6769d2f04af4524e9121a43', '2013-10-22 13:59:51'),
(2, 'ken@gmail.com', 'ken', '9662ab91d6769d2f04af4524e9121a43', '2013-10-23 17:50:15'),
(3, 'zeus@gmail.com', 'zeus', '9662ab91d6769d2f04af4524e9121a43', '2013-10-24 13:06:11'),
(4, 'kardel@gmail.com', 'kardel', '9662ab91d6769d2f04af4524e9121a43', '2013-10-24 14:17:34'),
(5, 'linainverse@gmail.com', 'linainverse', '9662ab91d6769d2f04af4524e9121a43', '2013-10-24 14:18:14'),
(6, 'fuzzywuzzy@gmail.com', 'fuzzywuzzy', '9662ab91d6769d2f04af4524e9121a43', '2013-10-24 14:19:27'),
(7, 'raylaicrestfall@gmail.com', 'raylaicrestfall', '9662ab91d6769d2f04af4524e9121a43', '2013-10-24 14:20:26'),
(8, 'magina@gmail.com', 'magina', '9662ab91d6769d2f04af4524e9121a43', '2013-10-24 14:23:20'),
(9, 'razor@gmail.com', 'razor', '9662ab91d6769d2f04af4524e9121a43', '2013-10-24 14:23:37'),
(10, 'rikimaru@gmail.com', 'rikimaru', '9662ab91d6769d2f04af4524e9121a43', '2013-10-24 14:27:44'),
(11, 'lunamoonfang@gmail.com', 'lunamoonfang', '9662ab91d6769d2f04af4524e9121a43', '2013-10-24 14:28:17'),
(12, 'nevermore@gmail.com', 'nevermore', '9662ab91d6769d2f04af4524e9121a43', '2013-10-24 14:32:46'),
(13, 'tiny@gmail.com', 'tiny', '9662ab91d6769d2f04af4524e9121a43', '2013-10-24 14:33:20'),
(14, 'slardar@gmail.com', 'slardar', '9662ab91d6769d2f04af4524e9121a43', '2013-10-24 14:35:49'),
(15, 'barathrum@gmail.com', 'barathrum', '9662ab91d6769d2f04af4524e9121a43', '2013-10-24 14:36:16'),
(16, 'crixalis@gmail.com', 'crixalis', '9662ab91d6769d2f04af4524e9121a43', '2013-10-24 14:36:58'),
(17, 'magnus@gmail.com', 'magnus', '9662ab91d6769d2f04af4524e9121a43', '2013-10-24 15:12:26'),
(19, 'furion@gmail.com', 'furion', '9662ab91d6769d2f04af4524e9121a43', '2013-10-24 15:46:47'),
(20, 'traxex@gmail.com', 'traxex', '9662ab91d6769d2f04af4524e9121a43', '2013-10-24 15:50:27');

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
