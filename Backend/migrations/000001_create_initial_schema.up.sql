-- This file contains the complete initial schema for your application.

-- Core User and Authentication Tables
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    username VARCHAR(50) UNIQUE,
    email VARCHAR(100) UNIQUE NOT NULL,
    designation VARCHAR(100),
    password_hash VARCHAR(255) NOT NULL,
    is_approved BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS permissions (
    id SERIAL PRIMARY KEY,
    action VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS user_roles (
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

CREATE TABLE IF NOT EXISTS role_permissions (
    role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id INTEGER NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

-- Employee and Attendance Tables
CREATE TABLE IF NOT EXISTS employees (
    id INTEGER PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    designation VARCHAR(255) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS attendance_records (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER NOT NULL REFERENCES employees(id),
    record_date DATE NOT NULL,
    status CHAR(1) NOT NULL,
    created_by_user_id INTEGER NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (employee_id, record_date)
);

-- Operations Tables
CREATE TABLE IF NOT EXISTS partners (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    UNIQUE (name, type)
);

CREATE TABLE IF NOT EXISTS inward_entries (
    id SERIAL PRIMARY KEY,
    vehicle_number VARCHAR(50) NOT NULL,
    source_id INTEGER REFERENCES partners(id),
    destination_id INTEGER REFERENCES partners(id),
    party_id INTEGER REFERENCES partners(id),
    material VARCHAR(255),
    entry_type VARCHAR(50) NOT NULL,
    gross_weight NUMERIC(10, 2) NOT NULL,
    tare_weight NUMERIC(10, 2),
    net_weight NUMERIC(10, 2),
    status VARCHAR(50) NOT NULL DEFAULT 'Pending',
    created_by_user_id INTEGER REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS sorting_logs (
    id SERIAL PRIMARY KEY,
    log_date DATE NOT NULL,
    created_by_user_id INTEGER REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (log_date, created_by_user_id)
);

CREATE TABLE IF NOT EXISTS sorted_materials (
    id SERIAL PRIMARY KEY,
    sorting_log_id INTEGER NOT NULL REFERENCES sorting_logs(id) ON DELETE CASCADE,
    material_name VARCHAR(100) NOT NULL,
    quantity_kg NUMERIC(10, 2) NOT NULL,
    UNIQUE (sorting_log_id, material_name)
);

CREATE TABLE IF NOT EXISTS inventory (
    id SERIAL PRIMARY KEY,
    material_name VARCHAR(255) UNIQUE NOT NULL,
    current_stock_kg NUMERIC(12, 2) NOT NULL DEFAULT 0.00
);

-- Financial Tables
CREATE TABLE IF NOT EXISTS material_sales (
    id SERIAL PRIMARY KEY,
    inward_entry_id INTEGER NOT NULL REFERENCES inward_entries(id),
    party_id INTEGER NOT NULL REFERENCES partners(id),
    transporter_id INTEGER REFERENCES partners(id),
    sale_date DATE NOT NULL,
    driver_name VARCHAR(255),
    driver_mobile VARCHAR(20),
    rate NUMERIC(10, 2) NOT NULL,
    gst_percentage NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    amount NUMERIC(10, 2) NOT NULL,
    gst_amount NUMERIC(10, 2) NOT NULL,
    total_amount NUMERIC(10, 2) NOT NULL,
    transportation_expense NUMERIC(10, 2) DEFAULT 0.00,
    mode_of_payment VARCHAR(50),
    remark TEXT,
    created_by_user_id INTEGER NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cashbook_transactions (
    id SERIAL PRIMARY KEY,
    transaction_date DATE NOT NULL,
    description VARCHAR(255) NOT NULL,
    cash_in NUMERIC(12, 2) DEFAULT 0.00,
    cash_out NUMERIC(12, 2) DEFAULT 0.00,
    created_by_user_id INTEGER REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);