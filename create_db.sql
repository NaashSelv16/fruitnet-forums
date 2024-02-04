# Create database script for Forum app

# Create the database
CREATE DATABASE myforum;
USE myforum;

# Create the tables

CREATE TABLE `users` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(45) NOT NULL,
  `firstname` varchar(45) NOT NULL,
  `surname` varchar(45) DEFAULT NULL,
  `country` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `username_UNIQUE` (`username`);


CREATE TABLE `topics` (
  `topic_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(45) NOT NULL,
  PRIMARY KEY (`topic_id`),
  UNIQUE KEY `name_UNIQUE` (`name`); 

CREATE TABLE `Posts` (
  `post_id` int NOT NULL AUTO_INCREMENT,
  `post_date` datetime DEFAULT NULL,
  `post_title` varchar(45) DEFAULT NULL,
  `post_content` mediumtext,
  PRIMARY KEY (`post_id`);

CREATE TABLE `memberships` (
  `user_id` int NOT NULL,
  `topic_id` int NOT NULL,
  `count_membership` int NOT NULL);


# Create the app user and give it access to the database
CREATE USER IF NOT EXISTS 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'YES';
GRANT ALL PRIVILEGES ON myforum.* TO 'root'@'localhost';


