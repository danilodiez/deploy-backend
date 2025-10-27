-- Migration: Add balance to users and create purchases table

-- Add balance column to users table (if it doesn't exist)
ALTER TABLE users 
ADD COLUMN balance DECIMAL(10,2) NOT NULL DEFAULT 0.00
AFTER password;

-- Add stock column to products table (if it doesn't exist)
ALTER TABLE products 
ADD COLUMN stock INT NOT NULL DEFAULT 0
AFTER rate;

-- Create purchases table
CREATE TABLE IF NOT EXISTS purchases (
  id BINARY(16) NOT NULL PRIMARY KEY DEFAULT (UUID_TO_BIN(UUID())),
  user_id BINARY(16) NOT NULL,
  product_id BINARY(16) NOT NULL,
  quantity INT NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  purchase_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_purchase_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_purchase_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  INDEX idx_user_purchases (user_id),
  INDEX idx_purchase_date (purchase_date)
) ENGINE=InnoDB;

-- Add some initial stock to products (if they exist)
UPDATE products SET stock = 50 WHERE stock = 0;


