CREATE DATABASE IF NOT EXISTS kens_entreprise;
USE kens_entreprise;

CREATE TABLE IF NOT EXISTS admins (
    admin_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO admins (username, password, full_name)
SELECT 'admin', 'admin123', 'Ken Admin'
WHERE NOT EXISTS (SELECT 1 FROM admins WHERE username = 'admin');

CREATE TABLE IF NOT EXISTS customers (
    customer_id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS services (
    service_id INT AUTO_INCREMENT PRIMARY KEY,
    service_name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS service_requests (
    request_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    service_id INT NOT NULL,
    request_details TEXT,
    status VARCHAR(30) DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id),
    FOREIGN KEY (service_id) REFERENCES services(service_id)
);

CREATE TABLE IF NOT EXISTS messages (
    message_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT,
    subject VARCHAR(150),
    message TEXT NOT NULL,
    status VARCHAR(30) DEFAULT 'Unread',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
);

INSERT INTO services (service_name, description)
SELECT 'Agent Banking', 'Banking and financial services through our agent banking facility.'
WHERE NOT EXISTS (SELECT 1 FROM services WHERE service_name='Agent Banking');

INSERT INTO services (service_name, description)
SELECT 'Mobile Money Services', 'Mobile money deposits, withdrawals, transfers and related services.'
WHERE NOT EXISTS (SELECT 1 FROM services WHERE service_name='Mobile Money Services');

INSERT INTO services (service_name, description)
SELECT 'Video Games', 'Video gaming and entertainment services.'
WHERE NOT EXISTS (SELECT 1 FROM services WHERE service_name='Video Games');
