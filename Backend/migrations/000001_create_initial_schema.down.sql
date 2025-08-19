-- This file is for reverting the initial schema.

DROP TABLE IF EXISTS cashbook_transactions;
DROP TABLE IF EXISTS material_sales;
DROP TABLE IF EXISTS inventory;
DROP TABLE IF EXISTS sorted_materials;
DROP TABLE IF EXISTS sorting_logs;
DROP TABLE IF EXISTS inward_entries;
DROP TABLE IF EXISTS partners;
DROP TABLE IF EXISTS attendance_records;
DROP TABLE IF EXISTS employees;
DROP TABLE IF EXISTS role_permissions;
DROP TABLE IF EXISTS user_roles;
DROP TABLE IF EXISTS permissions;
DROP TABLE IF EXISTS roles;
DROP TABLE IF EXISTS users;