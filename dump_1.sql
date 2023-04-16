CREATE DATABASE  IF NOT EXISTS `js_final_assignment` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `js_final_assignment`;
-- MySQL dump 10.13  Distrib 8.0.31, for macos12 (x86_64)
--
-- Host: localhost    Database: js_final_assignment
-- ------------------------------------------------------
-- Server version	8.0.31

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `custom_sessions`
--

DROP TABLE IF EXISTS `custom_sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `custom_sessions` (
  `custom_session_id` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `custom_expires_column_name` int unsigned NOT NULL,
  `custom_data_column_name` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  PRIMARY KEY (`custom_session_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `custom_sessions`
--

LOCK TABLES `custom_sessions` WRITE;
/*!40000 ALTER TABLE `custom_sessions` DISABLE KEYS */;
INSERT INTO `custom_sessions` VALUES ('KrO53mJOU_mHlcryodXJUrcY7rd7B2Jv',1681126534,'{\"cookie\":{\"originalMaxAge\":null,\"expires\":null,\"httpOnly\":true,\"path\":\"/\"},\"name\":\"dumb zing\"}');
/*!40000 ALTER TABLE `custom_sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `post`
--

DROP TABLE IF EXISTS `post`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `post` (
  `post_id` int NOT NULL AUTO_INCREMENT,
  `post_title` varchar(50) DEFAULT NULL,
  `post_text` varchar(200) DEFAULT NULL,
  `user_id` int NOT NULL,
  `post_date` date DEFAULT NULL,
  `image_name` varchar(80) NOT NULL,
  PRIMARY KEY (`post_id`),
  UNIQUE KEY `image_name_UNIQUE` (`image_name`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `post_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user_credential` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=38 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `post`
--

LOCK TABLES `post` WRITE;
/*!40000 ALTER TABLE `post` DISABLE KEYS */;
INSERT INTO `post` VALUES (21,'doggie','heeheh',4,'2023-04-08','4-8-4-2023-22_58_31.png'),(23,'kimono woman','ahha',4,'2023-04-09','4-9-4-2023-0_24_11.png'),(34,'Cakeeee','This is the very cake that comes to my dream every night!!! 3333',2,'2023-04-16','2-16-4-2023-17_16_19.png'),(35,'Time to fight! Sougo!!','Feeling nostalgic :/',24,'2023-04-16','24-16-4-2023-19_37_5.png'),(36,'my first drawing','My first drawing, what do you think?',6,'2023-04-16','6-16-4-2023-19_48_9.jpg'),(37,'girl','new drawing',4,'2023-04-16','4-16-4-2023-21_13_46.png');
/*!40000 ALTER TABLE `post` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sessions` (
  `session_id` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `expires` int unsigned NOT NULL,
  `data` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  PRIMARY KEY (`session_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sessions`
--

LOCK TABLES `sessions` WRITE;
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;
/*!40000 ALTER TABLE `sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_comment`
--

DROP TABLE IF EXISTS `user_comment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_comment` (
  `comment_id` int NOT NULL AUTO_INCREMENT,
  `comment_text` varchar(100) DEFAULT NULL,
  `reply_to_comment_id` int DEFAULT NULL,
  `comment_date` date DEFAULT NULL,
  `post_id` int NOT NULL,
  `user_id` int NOT NULL,
  PRIMARY KEY (`comment_id`),
  KEY `reply_to_comment_id` (`reply_to_comment_id`),
  KEY `post_id` (`post_id`),
  KEY `comment_from_user_idx` (`user_id`),
  CONSTRAINT `comment_from_user` FOREIGN KEY (`user_id`) REFERENCES `user_credential` (`user_id`),
  CONSTRAINT `user_comment_ibfk_1` FOREIGN KEY (`reply_to_comment_id`) REFERENCES `user_comment` (`comment_id`),
  CONSTRAINT `user_comment_ibfk_2` FOREIGN KEY (`post_id`) REFERENCES `post` (`post_id`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_comment`
--

LOCK TABLES `user_comment` WRITE;
/*!40000 ALTER TABLE `user_comment` DISABLE KEYS */;
INSERT INTO `user_comment` VALUES (6,'Cute doggies! Dumbledore :))',NULL,'2023-04-13',21,2),(7,'OMG!! Gorgeous ',NULL,'2023-04-13',23,2),(8,'The texture is amazing!',NULL,'2023-04-13',23,2),(10,'Give it to meeeeeee!!',NULL,'2023-04-16',34,24),(11,'Kagura, don\'t rob other people! Come home I bought strawberry cake',NULL,'2023-04-16',34,18),(12,'Don\'t fight!',NULL,'2023-04-16',35,19),(13,'Gintoki! Where is my mayo cake?',NULL,'2023-04-16',34,19),(14,'Mayo cake????? Cut me some slacks!! No one sells it!!!',NULL,'2023-04-16',34,18),(15,'Hehe',NULL,'2023-04-16',34,12),(16,'Lovely!',NULL,'2023-04-16',21,12),(17,'Love it',NULL,'2023-04-16',35,6),(18,'Gorgeous indeed, professor Dumbledore! ',NULL,'2023-04-16',23,6),(19,'took me 9 hrs',NULL,'2023-04-16',37,4);
/*!40000 ALTER TABLE `user_comment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_credential`
--

DROP TABLE IF EXISTS `user_credential`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_credential` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `user_name` varchar(100) DEFAULT NULL,
  `user_password` varchar(100) DEFAULT NULL,
  `user_email` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `user_name_UNIQUE` (`user_name`)
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_credential`
--

LOCK TABLES `user_credential` WRITE;
/*!40000 ALTER TABLE `user_credential` DISABLE KEYS */;
INSERT INTO `user_credential` VALUES (2,'SeverusSnape','123Snape_','Snape@hogwarts.ie'),(4,'Dumbledore','1234567','dumbledore@hogwarts.ie'),(6,'RonWeasley','ron123@#M','ronWeasley@hogwarts.ie'),(11,'SiriusBlack','godFatherOfHP!_','aoisjdffj'),(12,'voldemort324','IllDestroyHP.!','tomRiddle'),(13,'ryanreynolds','hey@IamaStar','ryanreynolds'),(18,'Gintokidesu','Yorozuya&05_','gintoki@gintama.com'),(19,'Hijikata','Ginhiji1005!!','hijikata_Toshi@shinsegumi.ie'),(21,'test123','Test123$','test@qq.com'),(23,'test1234','tesT123$55','test1234@qq.com'),(24,'Kagura','kaguraQueen!!666','kagura@gintama.com'),(25,'test654','Rest6543$$%%&^','test654@test.com');
/*!40000 ALTER TABLE `user_credential` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_like`
--

DROP TABLE IF EXISTS `user_like`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_like` (
  `user_id` int NOT NULL,
  `post_id` int DEFAULT NULL,
  `comment_id` int DEFAULT NULL,
  UNIQUE KEY `unique_league` (`user_id`,`post_id`),
  UNIQUE KEY `unique_comments` (`user_id`,`comment_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_like`
--

LOCK TABLES `user_like` WRITE;
/*!40000 ALTER TABLE `user_like` DISABLE KEYS */;
INSERT INTO `user_like` VALUES (2,21,NULL),(2,NULL,0),(4,NULL,0),(2,NULL,6),(24,34,NULL),(24,NULL,8),(18,NULL,10),(18,35,NULL),(18,34,NULL),(19,NULL,11),(19,NULL,10),(19,NULL,13),(12,NULL,6),(12,34,NULL),(12,35,NULL),(6,35,NULL),(6,34,NULL),(6,NULL,7),(6,NULL,8),(4,NULL,19),(4,37,NULL),(25,34,NULL);
/*!40000 ALTER TABLE `user_like` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database 'js_final_assignment'
--

--
-- Dumping routines for database 'js_final_assignment'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2023-04-16 21:21:54
