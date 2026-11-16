CREATE TABLE `users` (
  `id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(150) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('ADMIN', 'CUSTOMER') NOT NULL DEFAULT 'CUSTOMER',
  `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
  `updated_at` DATETIME(0) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `users_email_key` (`email`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ENGINE=InnoDB;

CREATE TABLE `electricity_services` (
  `id` VARCHAR(36) NOT NULL,
  `code` VARCHAR(20) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `power_va` INTEGER NOT NULL,
  `price_per_kwh` DECIMAL(12, 2) NOT NULL,
  `is_active` BOOLEAN NOT NULL DEFAULT true,
  `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
  `updated_at` DATETIME(0) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `electricity_services_code_key` (`code`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ENGINE=InnoDB;

CREATE TABLE `electricity_accounts` (
  `id` VARCHAR(36) NOT NULL,
  `user_id` VARCHAR(36) NOT NULL,
  `electricity_service_id` VARCHAR(36) NOT NULL,
  `customer_number` VARCHAR(30) NOT NULL,
  `customer_name` VARCHAR(100) NOT NULL,
  `address` TEXT NOT NULL,
  `status` ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
  `updated_at` DATETIME(0) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `electricity_accounts_customer_number_key` (`customer_number`),
  INDEX `electricity_accounts_user_id_idx` (`user_id`),
  INDEX `electricity_accounts_electricity_service_id_idx` (`electricity_service_id`),
  CONSTRAINT `electricity_accounts_user_id_fkey`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `electricity_accounts_electricity_service_id_fkey`
    FOREIGN KEY (`electricity_service_id`) REFERENCES `electricity_services` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ENGINE=InnoDB;

CREATE TABLE `billings` (
  `id` VARCHAR(36) NOT NULL,
  `electricity_account_id` VARCHAR(36) NOT NULL,
  `period_month` INTEGER NOT NULL,
  `period_year` INTEGER NOT NULL,
  `previous_meter` DECIMAL(12, 2) NOT NULL,
  `current_meter` DECIMAL(12, 2) NOT NULL,
  `consumption` DECIMAL(12, 2) NOT NULL,
  `tariff_per_kwh` DECIMAL(12, 2) NOT NULL,
  `amount` DECIMAL(12, 2) NOT NULL,
  `due_date` DATE NOT NULL,
  `status` ENUM('UNPAID', 'PAID', 'OVERDUE') NOT NULL DEFAULT 'UNPAID',
  `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
  `updated_at` DATETIME(0) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `billings_electricity_account_id_period_month_period_year_key` (`electricity_account_id`, `period_month`, `period_year`),
  INDEX `billings_status_due_date_idx` (`status`, `due_date`),
  CONSTRAINT `billings_electricity_account_id_fkey`
    FOREIGN KEY (`electricity_account_id`) REFERENCES `electricity_accounts` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ENGINE=InnoDB;

CREATE TABLE `payments` (
  `id` VARCHAR(36) NOT NULL,
  `billing_id` VARCHAR(36) NOT NULL,
  `payment_proof` VARCHAR(255) NOT NULL,
  `status` ENUM('PENDING', 'VERIFIED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
  `verified_by` VARCHAR(36) NULL,
  `verified_at` DATETIME(0) NULL,
  `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
  `updated_at` DATETIME(0) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `payments_billing_id_key` (`billing_id`),
  INDEX `payments_status_idx` (`status`),
  INDEX `payments_verified_by_idx` (`verified_by`),
  CONSTRAINT `payments_billing_id_fkey`
    FOREIGN KEY (`billing_id`) REFERENCES `billings` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `payments_verified_by_fkey`
    FOREIGN KEY (`verified_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ENGINE=InnoDB;
