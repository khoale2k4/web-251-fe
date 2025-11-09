-- MySQL dump 10.13  Distrib 9.4.0, for macos26.0 (arm64)
--
-- Host: localhost    Database: shoe_store
-- ------------------------------------------------------
-- Server version	9.4.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Current Database: `shoe_store`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `shoe_store` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `shoe_store`;

--
-- Table structure for table `cart_items`
--

DROP TABLE IF EXISTS `cart_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cart_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `cart_id` int NOT NULL,
  `product_id` int NOT NULL,
  `quantity` int DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `cart_id` (`cart_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `cart_items_ibfk_1` FOREIGN KEY (`cart_id`) REFERENCES `carts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `cart_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cart_items`
--

LOCK TABLES `cart_items` WRITE;
/*!40000 ALTER TABLE `cart_items` DISABLE KEYS */;
INSERT INTO `cart_items` VALUES (1,1,1,1),(2,1,3,2),(3,2,4,1),(4,2,5,1),(5,3,2,1),(6,3,7,1);
/*!40000 ALTER TABLE `cart_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `carts`
--

DROP TABLE IF EXISTS `carts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `carts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `carts_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `carts`
--

LOCK TABLES `carts` WRITE;
/*!40000 ALTER TABLE `carts` DISABLE KEYS */;
INSERT INTO `carts` VALUES (1,2,'2025-10-20 18:31:51','2025-10-20 18:31:51'),(2,3,'2025-10-20 18:31:51','2025-10-20 18:31:51'),(3,5,'2025-10-20 18:31:51','2025-10-20 18:31:51'),(4,1,'2025-10-21 20:37:39','2025-10-21 20:37:39'),(5,4,'2025-10-21 20:43:08','2025-10-21 20:43:08');
/*!40000 ALTER TABLE `carts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `comments`
--

DROP TABLE IF EXISTS `comments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `comments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `comment_type` enum('product','post') COLLATE utf8mb4_unicode_ci DEFAULT 'product',
  `product_id` int DEFAULT NULL,
  `post_id` int DEFAULT NULL,
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `rating` int DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `product_id` (`product_id`),
  KEY `post_id` (`post_id`),
  CONSTRAINT `comments_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `comments_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  CONSTRAINT `comments_ibfk_3` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `comments_chk_1` CHECK ((`rating` between 1 and 5))
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comments`
--

LOCK TABLES `comments` WRITE;
/*!40000 ALTER TABLE `comments` DISABLE KEYS */;
INSERT INTO `comments` VALUES (1,2,'product',1,NULL,'Giày đẹp, mang êm.',5,'2025-10-20 18:31:51'),(2,3,'product',3,NULL,'Giá hơi cao nhưng chất lượng tốt.',4,'2025-10-20 18:31:51'),(3,5,'post',NULL,1,'Bài viết rất hữu ích.',5,'2025-10-20 18:31:51'),(4,4,'product',7,NULL,'Giày bình thường.',3,'2025-10-20 18:31:51'),(5,2,'post',NULL,2,'Thông tin chính xác và rõ ràng.',5,'2025-10-20 18:31:51');
/*!40000 ALTER TABLE `comments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `contacts`
--

DROP TABLE IF EXISTS `contacts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `contacts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `subject` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('new','read','replied') COLLATE utf8mb4_unicode_ci DEFAULT 'new',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contacts`
--

LOCK TABLES `contacts` WRITE;
/*!40000 ALTER TABLE `contacts` DISABLE KEYS */;
INSERT INTO `contacts` VALUES (1,'Nguyen Van A','a@gmail.com','0900000002','Hỏi về đơn hàng #1','Khi nào giao ạ?','read','2025-10-20 18:31:51'),(2,'Tran Thi B','b@gmail.com','0900000003','Phản hồi sản phẩm','Giày rất đẹp.','replied','2025-10-20 18:31:51'),(3,'Le Van C','c@gmail.com','0900000004','Đổi hàng','Tôi muốn đổi sang size 43.','new','2025-10-20 18:31:51');
/*!40000 ALTER TABLE `contacts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `faqs`
--

DROP TABLE IF EXISTS `faqs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `faqs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `question` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `answer` text COLLATE utf8mb4_unicode_ci,
  `status` enum('pending','answered') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `faqs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `faqs`
--

LOCK TABLES `faqs` WRITE;
/*!40000 ALTER TABLE `faqs` DISABLE KEYS */;
INSERT INTO `faqs` VALUES (1,2,'Shop có giao hàng toàn quốc không?','Có, shop giao hàng toàn quốc qua GHTK và J&T.','answered','2025-10-20 18:31:51'),(2,3,'Có thể đổi size không?','Được đổi size trong vòng 7 ngày nếu chưa sử dụng.','answered','2025-10-20 18:31:51'),(3,5,'Có bảo hành không?',NULL,'pending','2025-10-20 18:31:51');
/*!40000 ALTER TABLE `faqs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_items`
--

DROP TABLE IF EXISTS `order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `product_id` int NOT NULL,
  `quantity` int DEFAULT '1',
  `price` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `order_id` (`order_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_items`
--

LOCK TABLES `order_items` WRITE;
/*!40000 ALTER TABLE `order_items` DISABLE KEYS */;
INSERT INTO `order_items` VALUES (1,1,1,1,2250000.00),(2,1,5,1,1450000.00),(3,2,4,1,3570000.00),(4,3,3,1,1800000.00),(5,3,7,1,950000.00),(6,4,8,1,4560000.00),(7,5,6,1,4400000.00);
/*!40000 ALTER TABLE `order_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `total_price` decimal(10,2) NOT NULL,
  `shipping_address` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `payment_method` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `note` text COLLATE utf8mb4_unicode_ci,
  `status` enum('pending','confirmed','shipped','completed','cancelled') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (1,2,3700000.00,'123 Lê Lợi, Q.1, TP.HCM','COD','Giao buổi sáng','shipped','2025-10-20 18:31:51'),(2,3,4200000.00,'45 Trần Phú, Q.5, TP.HCM','VNPay','','cancelled','2025-10-20 18:31:51'),(3,2,2500000.00,'12 Nguyễn Huệ, Q.1, TP.HCM','Momo','','confirmed','2025-10-20 18:31:51'),(4,5,4800000.00,'88 Hai Bà Trưng, TP.HCM','COD','Khách thân thiết','completed','2025-10-20 18:31:51'),(5,3,5500000.00,'99 Lý Thường Kiệt, TP.HCM','VNPay','Giao nhanh','cancelled','2025-10-20 18:31:51');
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `posts`
--

DROP TABLE IF EXISTS `posts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `posts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `content` text COLLATE utf8mb4_unicode_ci,
  `image` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `author_id` int DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `author_id` (`author_id`),
  CONSTRAINT `posts_ibfk_1` FOREIGN KEY (`author_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `posts`
--

LOCK TABLES `posts` WRITE;
/*!40000 ALTER TABLE `posts` DISABLE KEYS */;
INSERT INTO `posts` VALUES (1,'Top 5 đôi sneaker hot nhất 2025','top-5-sneaker-2025','Bài viết giới thiệu các mẫu sneaker được yêu thích.','sneakerhot.jpg',1,'2025-10-20 18:31:51','2025-10-20 18:31:51'),(2,'Cách chọn size giày chuẩn','chon-size-giay','Hướng dẫn chọn size phù hợp cho mọi loại chân.','sizeguide.jpg',1,'2025-10-20 18:31:51','2025-10-20 18:31:51'),(3,'Bí quyết bảo quản giày da','bao-quan-giay-da','Giữ giày luôn như mới với các mẹo đơn giản.','baogiay.jpg',1,'2025-10-20 18:31:51','2025-10-20 18:31:51'),(4,'Top giày chạy tốt nhất','giay-chay-tot-nhat','Các mẫu giày giúp bạn đạt hiệu suất cao.','running.jpg',1,'2025-10-20 18:31:51','2025-10-20 18:31:51'),(5,'Mix giày với outfit cực đẹp','mix-giay-outfit','Gợi ý phối đồ với giày thời trang.','mixgiay.jpg',1,'2025-10-20 18:31:51','2025-10-20 18:31:51');
/*!40000 ALTER TABLE `posts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_categories`
--

DROP TABLE IF EXISTS `product_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_categories`
--

LOCK TABLES `product_categories` WRITE;
/*!40000 ALTER TABLE `product_categories` DISABLE KEYS */;
INSERT INTO `product_categories` VALUES (1,'Sneakers','Giày thể thao, phong cách năng động.'),(2,'Boots','Giày cổ cao dành cho mùa đông hoặc thời trang.'),(3,'Sandals','Dép quai hậu, thoải mái cho mùa hè.'),(4,'Loafers','Giày lười da sang trọng.'),(5,'Running Shoes','Giày chuyên dụng cho chạy bộ.');
/*!40000 ALTER TABLE `product_categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `price` decimal(10,2) NOT NULL,
  `discount` decimal(5,2) DEFAULT '0.00',
  `stock` int DEFAULT '0',
  `size` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `color` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `image` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `category_id` int DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `products_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `product_categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (1,'Nike Air Force 1','Mẫu giày kinh điển của Nike.',2247750.00,0.02,22,'42','Trắng','http://localhost:8000/storage/1761061131_im.jpg',1,'2025-10-20 18:31:51','2025-10-21 22:38:51'),(2,'Adidas Ultraboost','Giày chạy bộ thoải mái.',3500000.00,5.00,15,'41','Đen','http://localhost:8000/storage/placeholder.png',5,'2025-10-20 18:31:51','2025-10-21 20:45:22'),(3,'Converse Chuck 70','Giày vải cổ điển.',1800000.00,0.00,30,'43','Trắng','http://localhost:8000/storage/placeholder.png',1,'2025-10-20 18:31:51','2025-10-21 20:45:22'),(4,'Dr. Martens 1460','Boots da cổ cao huyền thoại.',4200000.00,15.00,10,'42','Đen','http://localhost:8000/storage/1761062243_favicon.png',2,'2025-10-20 18:31:51','2025-10-21 22:57:23'),(5,'Vans Old Skool','Phong cách skate cực chất.',1900000.00,0.00,25,'41','Đen trắng','http://localhost:8000/storage/placeholder.png',1,'2025-10-20 18:31:51','2025-10-21 20:45:23'),(6,'Nike ZoomX Vaporfly','Giày chạy hiệu năng cao.',5500000.00,20.00,8,'42','Xanh','http://localhost:8000/storage/placeholder.png',5,'2025-10-20 18:31:51','2025-10-21 20:45:23'),(7,'Bitis Hunter Street','Giày nội địa Việt cực cool.',950000.00,0.00,40,'42','Xám','http://localhost:8000/storage/placeholder.png',1,'2025-10-20 18:31:51','2025-10-21 20:45:23'),(8,'Timberland Classic','Boot da lộn bền bỉ.',4800000.00,5.00,12,'43','Nâu','http://localhost:8000/storage/placeholder.png',2,'2025-10-20 18:31:51','2025-10-21 20:45:23'),(9,'Crocs Classic Sandal','Sandals siêu nhẹ.',800000.00,0.00,35,'42','Xanh lá','http://localhost:8000/storage/placeholder.png',3,'2025-10-20 18:31:51','2025-10-21 20:45:23'),(10,'Gucci Horsebit Loafer','Loafer cao cấp.',8900000.00,10.00,5,'42','Đen','http://localhost:8000/storage/placeholder.png',4,'2025-10-20 18:31:51','2025-10-21 20:45:23'),(11,'Puma Suede','Giày thời trang cổ điển.',1600000.00,0.00,18,'41','Xám','http://localhost:8000/storage/placeholder.png',1,'2025-10-20 18:31:51','2025-10-21 20:45:23'),(12,'New Balance 574','Phong cách retro.',2100000.00,5.00,22,'42','Xanh navy','http://localhost:8000/storage/placeholder.png',1,'2025-10-20 18:31:51','2025-10-21 20:45:23'),(13,'Nike Pegasus 40','Giày chạy nhẹ.',3200000.00,0.00,10,'42','Trắng xanh','http://localhost:8000/storage/placeholder.png',5,'2025-10-20 18:31:51','2025-10-21 20:45:23'),(14,'Adidas Stan Smith','Sneaker da trắng đơn giản.',2200000.00,0.00,20,'42','Trắng xanh','http://localhost:8000/storage/placeholder.png',1,'2025-10-20 18:31:51','2025-10-21 20:45:23'),(15,'MLB Chunky','Giày đế độn phong cách Hàn.',2800000.00,5.00,16,'41','Kem','http://localhost:8000/storage/placeholder.png',1,'2025-10-20 18:31:51','2025-10-21 20:45:23'),(16,'San pham moi',NULL,110700.00,10.00,118,'43','Đỏ','http://localhost:8000/storage/1761061219_theSV.jpg',NULL,'2025-10-21 22:40:19','2025-10-21 22:56:06');
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('admin','member') COLLATE utf8mb4_unicode_ci DEFAULT 'member',
  `avatar` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('active','banned') COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Admin','admin@shoestore.com','123456','admin','admin.png','0900000001','active','2025-10-20 18:31:51','2025-10-20 18:31:51'),(2,'Nguyen Van A','a@gmail.com','123456','member','a.png','0900000002','active','2025-10-20 18:31:51','2025-10-20 18:31:51'),(3,'Tran Thi B','b@gmail.com','123456','member','b.png','0900000003','active','2025-10-20 18:31:51','2025-10-20 18:31:51'),(4,'Le Van C','c@gmail.com','123456','member','c.png','0900000004','banned','2025-10-20 18:31:51','2025-10-20 18:31:51'),(5,'Pham Thi D','d@gmail.com','123456','member','d.png','0900000005','active','2025-10-20 18:31:51','2025-10-20 18:31:51');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-10-26  9:11:36
