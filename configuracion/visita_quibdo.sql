-- MySQL dump 10.13  Distrib 8.0.46, for Win64 (x86_64)
--
-- Host: localhost    Database: visita_quibdo
-- ------------------------------------------------------
-- Server version	8.0.46

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
-- Table structure for table `categorias`
--

DROP TABLE IF EXISTS `categorias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categorias` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre_categoria` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categorias`
--

LOCK TABLES `categorias` WRITE;
/*!40000 ALTER TABLE `categorias` DISABLE KEYS */;
INSERT INTO `categorias` VALUES (1,'Gastronomía'),(2,'Artesanías'),(3,'Moda'),(4,'Servicios'),(5,'Belleza'),(6,'Tecnología'),(7,'viajes en carretera');
/*!40000 ALTER TABLE `categorias` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `emprendedores`
--

DROP TABLE IF EXISTS `emprendedores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `emprendedores` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre_emprendimiento` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `categoria` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `descripcion` text COLLATE utf8mb4_general_ci NOT NULL,
  `ubicacion` varchar(150) COLLATE utf8mb4_general_ci NOT NULL,
  `foto` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `horarios` text COLLATE utf8mb4_general_ci,
  `servicios` text COLLATE utf8mb4_general_ci,
  `servicios_extra` text COLLATE utf8mb4_general_ci,
  `rol` enum('admin','emprendedor') COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'emprendedor',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `emprendedores`
--

LOCK TABLES `emprendedores` WRITE;
/*!40000 ALTER TABLE `emprendedores` DISABLE KEYS */;
INSERT INTO `emprendedores` VALUES (2,'empanadas doña rosa','Gastronomía','vende empanadas','niño jesus','fotos/1764065578_Colombian-Empanadas.jpg','lunes a viernes 8am-8pm','Domicilios','','emprendedor'),(3,'viajes en bus','viajes en carretera','viajes puerta a puerta','Santa ana','fotos/1764067648_2020.02-Colombia-Capa-2.webp','lunes a viernes 8am-8pm','viajes a domicilios','','emprendedor'),(4,'tazas','Artesanías','se crea tazas','niño jesus','fotos/1764075321_taza_de_colombia-r17a8c10de81d46f4ab052add54627ca0_x7jg9_8byvr_492.jpg','lunes a viernes 8am-8pm','Domicilios','','emprendedor'),(6,'viajes en bus rojos','Artesanías','si','barrio bolivar','fotos/1779668820938_OIP (1).webp','lunes a viernes 8am-8pm','Atención presencial',NULL,'emprendedor');
/*!40000 ALTER TABLE `emprendedores` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `eventos_culturales`
--

DROP TABLE IF EXISTS `eventos_culturales`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `eventos_culturales` (
  `id` int NOT NULL AUTO_INCREMENT,
  `titulo` varchar(150) COLLATE utf8mb4_general_ci NOT NULL,
  `descripcion` text COLLATE utf8mb4_general_ci NOT NULL,
  `fecha` date NOT NULL,
  `hora` time NOT NULL,
  `lugar` varchar(200) COLLATE utf8mb4_general_ci NOT NULL,
  `imagen` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `eventos_culturales`
--

LOCK TABLES `eventos_culturales` WRITE;
/*!40000 ALTER TABLE `eventos_culturales` DISABLE KEYS */;
INSERT INTO `eventos_culturales` VALUES (1,'Fiestas de San Pacho (o Fiesta de San Francisco de Asís)','Se celebra en Quibdó cada año aproximadamente del 20 de septiembre al 5 de octubre. \r\nIncluye una mezcla de actos religiosos (misas en honor a San Francisco de Asís) y actividades folclóricas: comparsas, desfile de carrozas, música tradicional chocoana (como la chirimía), danza afro-chocoana. \r\nPor qué vale la pena: Es una de las expresiones culturales más auténticas de la región; para el visitante, ver los barrios engalanados, las carrozas, el ritmo y la comunidad es una experiencia muy distinta.\r\nConsejo: Si quieres participar, reserva con anticipación alojamiento, ya que en esas semanas la ciudad se llena de visitantes.','2026-09-20','11:14:00','Quibdó','https://radionacional-v3.s3.amazonaws.com/s3fs-public/styles/portadas_relaciona_4_3/public/senalradio/articulo-noticia/galeriaimagen/colp_ext_002153_1.jpg?h=b69e0e0e&itok=EswGjGKF'),(2,'Flecho – Fiesta de la Lectura y la Escritura del Chocó','Este evento literario reúne lectura, escritura, poesía, talleres de cultura y está enfocado en visibilizar el derecho a la cultura en la región del Chocó. \r\nSurge como un acto de resistencia cultural y creación comunitaria. \r\nPara el visitante, es una oportunidad de participar en talleres, charlas, convivir con autores, y conectar con la cultura afro-chocoana desde una perspectiva literaria.\r\nConsejo: Verifica la fecha del año en el que planeas viajar, ya que puede variar — y confirma la programación actualizada.','2026-03-16','11:21:00','Quibdó','https://feriasdellibro.com/wp-content/uploads/2023/05/Afiche-oficial-FLECHO-2022-1024x1024-1.jpg'),(3,'Festival/Muestras culturales continuas en Quibdó','En la ciudad funciona el Centro Cultural del Banco de la República – Quibdó, que organiza exposiciones y actividades culturales permanentes. \r\nLa página de la alcaldía de Quibdó publica un calendario de eventos culturales. \r\nIdeal si tu visita no coincide con los grandes festivales: siempre hay música, exposiciones, danza local.\r\nConsejo: Consulta con anticipación la programación cultural del mes de tu visita para ver qué habrá durante esos días.','2026-03-16','11:21:00','Quibdó','https://www.quibdo-choco.gov.co/NuestraAlcaldia/SaladePrensa/PublishingImages/Paginas/Conmemoramos-el-D%C3%ADa-de-la-Afrocolombianidad-con-homenajes-a-la-cultura-y-tradiciones-ancestrales/10.jpg');
/*!40000 ALTER TABLE `eventos_culturales` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hoteles`
--

DROP TABLE IF EXISTS `hoteles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hoteles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(200) COLLATE utf8mb4_general_ci NOT NULL,
  `descripcion` text COLLATE utf8mb4_general_ci NOT NULL,
  `direccion` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `latitud` decimal(10,8) NOT NULL,
  `longitud` decimal(11,8) NOT NULL,
  `imagen` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hoteles`
--

LOCK TABLES `hoteles` WRITE;
/*!40000 ALTER TABLE `hoteles` DISABLE KEYS */;
INSERT INTO `hoteles` VALUES (1,'Mia Hotel Chocó','Ideal para: viajeros que buscan un hotel moderno, relativamente nuevo, y que estén llegando o saliendo por el aeropuerto.\r\nConsejo: si llegas tarde o sales temprano, este hotel podría ser muy práctico por su cercanía al aeropuerto.','Barrios Los Ángeles, diagonal al Aeropuerto El Caraño, Quibdó.',5.69004989,-76.64427373,'fotos/1764080514_getlstd-property-photo.jpg'),(2,'Hotel Kamaleb Farallones','Buenas habitaciones, aire acondicionado, desayuno decente. \r\nIdeal para: estar bien ubicado en la ciudad, cerca al centro.','Calle 28 #1-70, Quibdó.',5.69259762,-76.66059096,'fotos/1764080955_288192595.jpg'),(3,'Hotel El Imperio','Deal para: una opción un poco más económica sin alejarse demasiado del centro.','Carrera 5ta #21-13 B, Quibdó.',5.68617820,-76.66038205,'fotos/1764081670_2c5e0c09992a1b61fb2ab83874218b216d3c947a.jpg');
/*!40000 ALTER TABLE `hoteles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lugares_turisticos`
--

DROP TABLE IF EXISTS `lugares_turisticos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lugares_turisticos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(200) COLLATE utf8mb4_general_ci NOT NULL,
  `descripcion` text COLLATE utf8mb4_general_ci NOT NULL,
  `direccion` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `latitud` decimal(10,8) NOT NULL,
  `longitud` decimal(11,8) NOT NULL,
  `imagen` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lugares_turisticos`
--

LOCK TABLES `lugares_turisticos` WRITE;
/*!40000 ALTER TABLE `lugares_turisticos` DISABLE KEYS */;
INSERT INTO `lugares_turisticos` VALUES (2,'Malecón de Quibdó','Uno de los sitios más visitados.\r\nIdeal para caminar, ver el río Atrato, tomar fotos y disfrutar del ambiente de la ciudad.\r\nSuele tener vendedores, música y una vista hermosa al atardecer.','Carrera 1-75, Quibdó 270002',5.69642300,-76.66109600,'fotos/1764020739_foto-1.jpg'),(3,'Garces Mosquera Saturnino','Conocido como el parque principal.\r\nRodeado de comercios, sitios para sentarse y observar la vida diaria.\r\nCerca están varios restaurantes y tiendas.','Carrera 7 30 27, Quibdó, Choco',5.69369700,-76.65705900,'fotos/1764076066_img-20170121-wa0040-largejpg.jpg'),(4,'Catedral San Francisco de Asís','Es el símbolo más reconocido de Quibdó.\r\nEn el centro de la ciudad.\r\nMucha gente la visita por su arquitectura y por las fiestas patronales.','Calle 26-26a, Quibdó 270002',5.69081100,-76.66146100,'fotos/1764076493_photo0jpg.jpg'),(5,'Serranía del Baudó (excursiones cercanas)','Lugar cercano a Quibdó.\r\nPlaya de río tranquila, muy visitada por locales.\r\nPerfecta para pasar el día.','',6.20000700,-77.19999700,'fotos/1764077218_R.jpg');
/*!40000 ALTER TABLE `lugares_turisticos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `resenas`
--

DROP TABLE IF EXISTS `resenas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `resenas` (
  `id` int NOT NULL,
  `tipo` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `item_id` int NOT NULL,
  `nombre` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `calificacion` int NOT NULL,
  `comentario` text COLLATE utf8mb4_general_ci NOT NULL,
  `creado_en` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `resenas`
--

LOCK TABLES `resenas` WRITE;
/*!40000 ALTER TABLE `resenas` DISABLE KEYS */;
/*!40000 ALTER TABLE `resenas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `restaurantes`
--

DROP TABLE IF EXISTS `restaurantes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `restaurantes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(200) COLLATE utf8mb4_general_ci NOT NULL,
  `descripcion` text COLLATE utf8mb4_general_ci NOT NULL,
  `direccion` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `latitud` decimal(10,8) NOT NULL,
  `longitud` decimal(11,8) NOT NULL,
  `imagen` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `restaurantes`
--

LOCK TABLES `restaurantes` WRITE;
/*!40000 ALTER TABLE `restaurantes` DISABLE KEYS */;
INSERT INTO `restaurantes` VALUES (1,'Restaurante Maria Mulata','Especialidad: cocina de fusión / sudamericana, combinando sabores locales del Chocó con propuestas más modernas.\r\nConsejo: pregunta por platos típicos del Pacífico / Chocó para tener una experiencia auténtica.','Dirección: Calle 25 # 7-1, Quibdó, Chocó.',5.68929689,-76.65859314,'fotos/1764084499_almuerza-con-estilo.jpg'),(2,'La Paila de Mi Abuela','Estilo: comida local / sudamericana — auténtica para disfrutar de sabores del Chocó. \r\nIdeal para: almuerzo o cena de estilo regional, con ambiente relajado.\r\nConsejo: pide que te recomienden platos de la casa; a veces los sitios regionales tienen “plato del día” o especialidades menos visibles en el menú.','Quibdó, Chocó.',5.69138391,-76.66105766,'fotos/1764084751_vista-general-del-local.jpg'),(3,'Brisas del Atrato Restaurante Bar','Característica especial: se menciona como “comida típica a la orilla del río”. \r\nIdeal para: una experiencia tranquila, disfrutar de paisaje, posiblemente vista al río, algo más relajado.\r\nConsejo: si el clima lo permite, pide mesa al aire libre o con vista al río; lleva repelente de mosquitos por si te sientas al exterior.','Carrera 2n #34-1, Quibdó, Chocó.',5.69675481,-76.66178674,'fotos/1764084976_mesas-frente-al-rio.jpg');
/*!40000 ALTER TABLE `restaurantes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `servicios`
--

DROP TABLE IF EXISTS `servicios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `servicios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre_servicio` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre_servicio` (`nombre_servicio`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `servicios`
--

LOCK TABLES `servicios` WRITE;
/*!40000 ALTER TABLE `servicios` DISABLE KEYS */;
INSERT INTO `servicios` VALUES (3,'Atención presencial'),(1,'Domicilios'),(4,'Envíos nacionales'),(2,'Pedidos'),(5,'viajes a domicilios');
/*!40000 ALTER TABLE `servicios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `correo` varchar(150) COLLATE utf8mb4_general_ci NOT NULL,
  `telefono` varchar(20) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `contrasena` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `foto` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `rol` enum('usuario','emprendedor','admin','superadmin') COLLATE utf8mb4_general_ci DEFAULT 'usuario',
  `fecha_registro` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `correo` (`correo`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (1,'Rivera','rivera@gmail.com','3123456788','$2y$10$JK6Yd0aeRYQXP1P5lgfQCeO8PH6AiknE40Qr5M.TCdmhrXN9Ts/6e','fotos/1764058377_Captura de pantalla 2025-11-24 144828.png','usuario','2025-11-25 08:12:57'),(3,'Mario','mario@gmail.com','3123456786','$2y$10$w4vSJdQwTb02YwjcWxCixuFlORmrgdWSkRioy2rkBn8neoST4fh4O','','usuario','2025-11-25 10:46:29'),(4,'Andres','andres@gmail.com','3123456781','$2y$10$Pfhi6cE4jqTe2Uq8/txHX..pSfwuhrEPLxmrucyvH3oHgCASWOtIi','','usuario','2025-11-25 10:50:17'),(5,'rivera','rivera12@gmail.com','3115633543','$2b$10$Fr1x5i7wOEGhaY/Xq0aNpOILY4UMpr/To6xKTk5WJhWes0i.nkjCy','fotos/1779658379321_1169015.jpg','usuario','2026-05-24 21:32:59'),(6,'rivera','rivera17@gmail.com','3115633543','$2b$10$Pxlgnyq.0dyMcTp5Mfd4t.Or59CPMapW1bv2tN64.R3c93gv/sAyy','fotos/1779658737334_1664166822_Lucatiel-of-Mirrah-DSII-Ð¿ÐµÑÑÐ¾Ð½Ð°Ð¶Ð¸-Dark-Souls-2-Dark-Souls-7488339.jpg','usuario','2026-05-24 21:38:57'),(7,'carlos andres','carr20000111@gmail.com','3115633543','$2b$10$NYzCehwdRZJKdQNMxuOqSO4577.5kADgLzEHSUdLTegXxwjHWB1LK','fotos/1779672394896_1764013804_Captura de pantalla 2025-11-24 144828.png','superadmin','2026-05-25 01:26:34');
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-24 23:40:27
