[X] deploy
[X] render.com
[X] ENV
[X] gitignore
[X] MVC
[x] Middleware
[X] Router
[X] Models
[X] Controllers
[?] Database

// SCRIPTS

CREATE DATABASE productsdb;
USE productsdb;

CREATE TABLE products (
id BINARY(16) NOT NULL PRIMARY KEY
DEFAULT (UUID_TO_BIN(UUID())),
title VARCHAR(200) NOT NULL,
year INT NOT NULL,
brand VARCHAR(120) NOT NULL,
price DECIMAL(10,2) NOT NULL,
poster VARCHAR(2048),
rate DECIMAL(2,1),
created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE category (
id INT NOT NULL AUTO_INCREMENT,
name VARCHAR(255) NOT NULL UNIQUE,
PRIMARY KEY (id)
) ENGINE=InnoDB;

CREATE TABLE product_categories (
product_id BINARY(16) NOT NULL,
category_id INT NOT NULL,
PRIMARY KEY (product_id, category_id),
CONSTRAINT fk_pc_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
CONSTRAINT fk_pc_category FOREIGN KEY (category_id) REFERENCES category(id) ON DELETE CASCADE
) ENGINE=InnoDB;

INSERT INTO category (name) VALUES
('Hogar'), ('Cocina'),
('Moda'), ('Calzado')
ON CONFLICT (name) DO NOTHING;

INSERT INTO products (title, year, brand, price, poster, rate)
VALUES ('Cafetera Italiana', 2023, 'Bialetti', 45.99, 'https://example.com/images/cafetera

INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id
FROM products p
JOIN category c ON c.name IN ('Hogar','Cocina')
WHERE p.title='Cafetera Italiana' AND p.year=2023 AND p.brand='Bialetti'
ORDER BY p.created_at DESC
LIMIT 2;

INSERT INTO products (title, year, brand, price, poster, rate)
VALUES ('Zapatillas Deportivas', 2024, 'Adidas', 89.50,
'https://example.com/images/zapatillas.jpg', 4.5);

INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id
FROM products p
JOIN category c ON c.name IN ('Moda','Calzado')
WHERE p.title = 'Zapatillas Deportivas'
AND p.year = 2024
AND p.brand = 'Adidas'
ORDER BY p.created_at DESC
LIMIT 2;
