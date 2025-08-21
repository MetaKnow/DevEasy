/*
 Navicat Premium Data Transfer

 Source Server         : ms
 Source Server Type    : MySQL
 Source Server Version : 80021
 Source Host           : localhost:3306
 Source Schema         : developmentdashboard

 Target Server Type    : MySQL
 Target Server Version : 80021
 File Encoding         : 65001

 Date: 21/08/2025 21:47:04
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for dashboard
-- ----------------------------
DROP TABLE IF EXISTS `dashboard`;
CREATE TABLE `dashboard`  (
  `id` int(0) NOT NULL AUTO_INCREMENT,
  `task_circle_id` int(0) NOT NULL,
  `task_step` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL,
  `startdate` date NULL DEFAULT NULL,
  `enddate` date NULL DEFAULT NULL,
  `responsibility` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `taskstate` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `iscomplete` enum('是','否') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `islate` enum('是','否') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `priority` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `remark` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL,
  `createdAt` datetime(0) NULL DEFAULT NULL,
  `updatedAt` datetime(0) NULL DEFAULT NULL,
  `task_id` int(0) NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `task_circle_id`(`task_circle_id`) USING BTREE,
  INDEX `dashboard_task_id_foreign_idx`(`task_id`) USING BTREE,
  CONSTRAINT `dashboard_ibfk_1` FOREIGN KEY (`task_circle_id`) REFERENCES `task_circle` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `dashboard_task_id_foreign_idx` FOREIGN KEY (`task_id`) REFERENCES `task` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 106 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for sequelizemeta
-- ----------------------------
DROP TABLE IF EXISTS `sequelizemeta`;
CREATE TABLE `sequelizemeta`  (
  `name` varchar(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  PRIMARY KEY (`name`) USING BTREE,
  UNIQUE INDEX `name`(`name`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8 COLLATE = utf8_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for staged_dashboard
-- ----------------------------
DROP TABLE IF EXISTS `staged_dashboard`;
CREATE TABLE `staged_dashboard`  (
  `id` int(0) NOT NULL AUTO_INCREMENT,
  `original_step_id` int(0) NOT NULL COMMENT '原始步骤ID',
  `staged_task_id` int(0) NOT NULL,
  `task_circle_id` int(0) NULL DEFAULT NULL COMMENT '原始所属阶段ID',
  `task_step` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `startdate` date NULL DEFAULT NULL,
  `enddate` date NULL DEFAULT NULL,
  `responsibility` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `taskstate` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `iscomplete` enum('是','否') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `islate` enum('是','否') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `priority` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `remark` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL,
  `staged_at` datetime(0) NOT NULL COMMENT '暂存时间',
  `createdAt` datetime(0) NOT NULL,
  `updatedAt` datetime(0) NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `staged_task_id`(`staged_task_id`) USING BTREE,
  CONSTRAINT `staged_dashboard_ibfk_1` FOREIGN KEY (`staged_task_id`) REFERENCES `staged_task` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for staged_task
-- ----------------------------
DROP TABLE IF EXISTS `staged_task`;
CREATE TABLE `staged_task`  (
  `id` int(0) NOT NULL AUTO_INCREMENT,
  `original_task_id` int(0) NOT NULL COMMENT '原始任务ID',
  `task_circle_id` int(0) NULL DEFAULT NULL COMMENT '原始所属阶段ID',
  `task_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `startdate` date NULL DEFAULT NULL,
  `enddate` date NULL DEFAULT NULL,
  `remark` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL,
  `iscomplete` enum('是','否') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `islate` enum('是','否') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `staged_at` datetime(0) NOT NULL COMMENT '暂存时间',
  `createdAt` datetime(0) NOT NULL,
  `updatedAt` datetime(0) NOT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for task
-- ----------------------------
DROP TABLE IF EXISTS `task`;
CREATE TABLE `task`  (
  `id` int(0) NOT NULL AUTO_INCREMENT,
  `task_circle_id` int(0) NOT NULL,
  `task_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `startdate` date NULL DEFAULT NULL,
  `enddate` date NULL DEFAULT NULL,
  `remark` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL,
  `createdAt` datetime(0) NOT NULL,
  `updatedAt` datetime(0) NOT NULL,
  `iscomplete` enum('是','否') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `islate` enum('是','否') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `task_circle_id`(`task_circle_id`) USING BTREE,
  CONSTRAINT `task_ibfk_1` FOREIGN KEY (`task_circle_id`) REFERENCES `task_circle` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 55 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for task_circle
-- ----------------------------
DROP TABLE IF EXISTS `task_circle`;
CREATE TABLE `task_circle`  (
  `id` int(0) NOT NULL AUTO_INCREMENT,
  `year` int(0) NOT NULL,
  `month` int(0) NOT NULL,
  `phase` int(0) NOT NULL,
  `start_date` date NULL DEFAULT NULL,
  `end_date` date NULL DEFAULT NULL,
  `remark` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL,
  `createdAt` datetime(0) NOT NULL,
  `updatedAt` datetime(0) NOT NULL,
  `total_task` int(0) NULL DEFAULT 0,
  `total_step` int(0) NULL DEFAULT 0,
  `late_task` int(0) NULL DEFAULT 0,
  `late_step` int(0) NULL DEFAULT 0,
  `complete_percent` float NULL DEFAULT 0,
  `late_percent` float NULL DEFAULT 0,
  `not_start_step` int(0) NULL DEFAULT 0,
  `going_step` int(0) NULL DEFAULT 0,
  `complete_task` int(0) NULL DEFAULT 0,
  `complete_step` int(0) NULL DEFAULT 0,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 45 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

SET FOREIGN_KEY_CHECKS = 1;
