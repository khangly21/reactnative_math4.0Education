CREATE TABLE `admin_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`adminId` int NOT NULL,
	`action` varchar(255) NOT NULL,
	`targetId` int,
	`targetType` varchar(64),
	`details` text,
	`ipAddress` varchar(45),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `admin_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `admin_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`token` varchar(255) NOT NULL,
	`ipAddress` varchar(45),
	`userAgent` text,
	`expiresAt` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `admin_sessions_id` PRIMARY KEY(`id`),
	CONSTRAINT `admin_sessions_token_unique` UNIQUE(`token`)
);
--> statement-breakpoint
CREATE TABLE `btc_payments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`amount` varchar(64) NOT NULL,
	`amountUSD` varchar(64),
	`walletAddress` varchar(255) NOT NULL,
	`paymentAddress` varchar(255) NOT NULL,
	`txHash` varchar(255),
	`status` enum('pending','confirmed','failed','expired') NOT NULL DEFAULT 'pending',
	`confirmations` int DEFAULT 0,
	`expiresAt` timestamp,
	`confirmedAt` timestamp,
	`metadata` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `btc_payments_id` PRIMARY KEY(`id`)
);
