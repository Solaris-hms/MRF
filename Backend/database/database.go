package database

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"math"
	"os"
	"strings"
	"time"

	"github.com/solaris-hms/mrf-backend/models"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type DB struct {
	pool *pgxpool.Pool
}

func New() *DB {
	dbUrl := os.Getenv("DB_SOURCE")
	if dbUrl == "" {
		log.Fatal("DB_SOURCE environment variable is not set")
	}
	pool, err := pgxpool.New(context.Background(), dbUrl)
	if err != nil {
		log.Fatalf("Unable to connect to database: %v\n", err)
	}
	return &DB{pool: pool}
}

func (db *DB) Close() {
	db.pool.Close()
}

// --- User Functions ---
func (db *DB) RegisterUserInDB(req *models.RegisterRequest, passwordHash string) error {
	query := `
        INSERT INTO users (full_name, username, email, designation, password_hash)
        VALUES ($1, $2, $3, $4, $5)`
	_, err := db.pool.Exec(context.Background(), query, req.FullName, req.Username, req.Email, req.Designation, passwordHash)
	return err
}

func (db *DB) GetUserByEmail(email string) (*models.User, error) {
	var user models.User
	query := `SELECT id, full_name, email, password_hash, is_approved, created_at FROM users WHERE email = $1`
	err := db.pool.QueryRow(context.Background(), query, email).Scan(&user.ID, &user.FullName, &user.Email, &user.PasswordHash, &user.IsApproved, &user.CreatedAt)

	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, err
		}
		log.Printf("Unexpected error getting user by email: %v", err)
		return nil, err
	}
	return &user, nil
}

func (db *DB) GetPendingUsers() ([]models.User, error) {
	query := `SELECT id, full_name, username, email, designation, created_at FROM users WHERE is_approved = false ORDER BY created_at ASC`
	rows, err := db.pool.Query(context.Background(), query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var users []models.User
	for rows.Next() {
		var user models.User
		if err := rows.Scan(&user.ID, &user.FullName, &user.Username, &user.Email, &user.Designation, &user.CreatedAt); err != nil {
			return nil, err
		}
		users = append(users, user)
	}
	return users, nil
}

func (db *DB) GetAllUsers() ([]models.User, error) {
	query := `
		SELECT 
			u.id, u.full_name, u.username, u.email, u.designation, u.is_approved, u.created_at, r.name 
		FROM 
			users u
		LEFT JOIN 
			user_roles ur ON u.id = ur.user_id
		LEFT JOIN 
			roles r ON ur.role_id = r.id
		ORDER BY 
			u.full_name ASC`
	rows, err := db.pool.Query(context.Background(), query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var users []models.User
	for rows.Next() {
		var user models.User
		if err := rows.Scan(&user.ID, &user.FullName, &user.Username, &user.Email, &user.Designation, &user.IsApproved, &user.CreatedAt, &user.RoleName); err != nil {
			return nil, err
		}
		users = append(users, user)
	}
	return users, nil
}

func (db *DB) UpdateUser(userID int, req *models.UpdateUserRequest) error {
	tx, err := db.pool.Begin(context.Background())
	if err != nil {
		return err
	}
	defer tx.Rollback(context.Background())
	userQuery := `
        UPDATE users 
        SET full_name = $1, username = $2, email = $3, designation = $4 
        WHERE id = $5`
	_, err = tx.Exec(context.Background(), userQuery, req.FullName, req.Username, req.Email, req.Designation, userID)
	if err != nil {
		return err
	}
	roleQuery := `
        INSERT INTO user_roles (user_id, role_id) 
        VALUES ($1, $2)
        ON CONFLICT (user_id) 
        DO UPDATE SET role_id = EXCLUDED.role_id`
	_, err = tx.Exec(context.Background(), roleQuery, userID, req.RoleID)
	if err != nil {
		return err
	}
	return tx.Commit(context.Background())
}

func (db *DB) ApproveUserInDB(userID int, roleID int) error {
	tx, err := db.pool.Begin(context.Background())
	if err != nil {
		return err
	}
	defer tx.Rollback(context.Background())
	_, err = tx.Exec(context.Background(), "UPDATE users SET is_approved = true WHERE id = $1", userID)
	if err != nil {
		return err
	}
	_, err = tx.Exec(context.Background(), `
		INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)`,
		userID, roleID)
	if err != nil {
		return err
	}
	return tx.Commit(context.Background())
}

func (db *DB) DeleteUser(userID int) error {
	query := `DELETE FROM users WHERE id = $1`
	_, err := db.pool.Exec(context.Background(), query, userID)
	return err
}

// --- Role and Permission Functions ---
func (db *DB) GetAllRoles() ([]models.Role, error) {
	query := `SELECT id, name FROM roles ORDER BY name ASC`
	rows, err := db.pool.Query(context.Background(), query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var roles []models.Role
	for rows.Next() {
		var role models.Role
		if err := rows.Scan(&role.ID, &role.Name); err != nil {
			return nil, err
		}
		roles = append(roles, role)
	}
	return roles, nil
}

func (db *DB) GetAllPermissions() ([]models.Permission, error) {
	query := `SELECT id, action FROM permissions ORDER BY action ASC`
	rows, err := db.pool.Query(context.Background(), query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var permissions []models.Permission
	for rows.Next() {
		var p models.Permission
		if err := rows.Scan(&p.ID, &p.Action); err != nil {
			return nil, err
		}
		permissions = append(permissions, p)
	}
	return permissions, nil
}

func (db *DB) GetPermissionsForRole(roleID int) ([]int, error) {
	query := `SELECT permission_id FROM role_permissions WHERE role_id = $1`
	rows, err := db.pool.Query(context.Background(), query, roleID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var permissionIDs []int
	for rows.Next() {
		var id int
		if err := rows.Scan(&id); err != nil {
			return nil, err
		}
		permissionIDs = append(permissionIDs, id)
	}
	return permissionIDs, nil
}

func (db *DB) UpdatePermissionsForRole(roleID int, permissionIDs []int) error {
	tx, err := db.pool.Begin(context.Background())
	if err != nil {
		return err
	}
	defer tx.Rollback(context.Background())
	deleteQuery := `DELETE FROM role_permissions WHERE role_id = $1`
	_, err = tx.Exec(context.Background(), deleteQuery, roleID)
	if err != nil {
		return err
	}
	if len(permissionIDs) > 0 {
		for _, pid := range permissionIDs {
			insertQuery := `INSERT INTO role_permissions (role_id, permission_id) VALUES ($1, $2)`
			_, err = tx.Exec(context.Background(), insertQuery, roleID, pid)
			if err != nil {
				return err
			}
		}
	}
	return tx.Commit(context.Background())
}

func (db *DB) GetUserPermissions(userID int) ([]string, error) {
	query := `
		SELECT DISTINCT p.action FROM permissions p
		JOIN role_permissions rp ON p.id = rp.permission_id
		JOIN user_roles ur ON rp.role_id = ur.role_id
		WHERE ur.user_id = $1`
	rows, err := db.pool.Query(context.Background(), query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var permissions []string
	for rows.Next() {
		var permission string
		if err := rows.Scan(&permission); err != nil {
			return nil, err
		}
		permissions = append(permissions, permission)
	}
	return permissions, nil
}

func (db *DB) GetUserRoles(userID int) ([]string, error) {
	query := `
		SELECT r.name FROM roles r
		JOIN user_roles ur ON r.id = ur.role_id
		WHERE ur.user_id = $1`
	rows, err := db.pool.Query(context.Background(), query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var roles []string
	for rows.Next() {
		var role string
		if err := rows.Scan(&role); err != nil {
			return nil, err
		}
		roles = append(roles, role)
	}
	return roles, nil
}

// --- Inward Entry Functions ---
func (db *DB) CreateInwardEntry(req *models.CreateInwardEntryRequest, userID int) (*models.InwardEntry, error) {
	grossWeightKg := req.GrossWeightTons * 1000
	query := `
        INSERT INTO inward_entries (vehicle_number, source_id, destination_id, party_id, material, entry_type, gross_weight, created_by_user_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id`
	var entryID int
	err := db.pool.QueryRow(context.Background(), query,
		req.VehicleNumber, req.SourceID, req.DestinationID, req.PartyID, req.Material, req.EntryType, grossWeightKg, userID,
	).Scan(&entryID)
	if err != nil {
		return nil, err
	}
	return &models.InwardEntry{ID: entryID}, nil
}

func (db *DB) GetPendingInwardEntries() ([]models.InwardEntry, error) {
	query := `
        SELECT ie.id, ie.vehicle_number, COALESCE(p.name, d.name) AS location, ie.material, ie.entry_type, ie.gross_weight, ie.status, ie.created_at
        FROM inward_entries ie
        LEFT JOIN partners p ON ie.source_id = p.id
        LEFT JOIN partners d ON ie.destination_id = d.id
        WHERE ie.status = 'Pending' ORDER BY ie.created_at DESC`
	rows, err := db.pool.Query(context.Background(), query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var entries []models.InwardEntry
	for rows.Next() {
		var entry models.InwardEntry
		var grossWeightKg float64
		if err := rows.Scan(&entry.ID, &entry.VehicleNumber, &entry.SourceName, &entry.Material, &entry.EntryType, &grossWeightKg, &entry.Status, &entry.CreatedAt); err != nil {
			return nil, err
		}
		entry.GrossWeightTons = grossWeightKg / 1000
		entries = append(entries, entry)
	}
	return entries, nil
}

func (db *DB) GetCompletedInwardEntries() ([]models.InwardEntry, error) {
	query := `
        SELECT 
            ie.id, ie.vehicle_number, 
            COALESCE(s.name, d.name) AS location, 
            p.name AS party_name,
            ie.material, ie.entry_type, 
            ie.gross_weight, ie.tare_weight, ie.net_weight, 
            ie.status, ie.created_at, ie.completed_at,
            ie.party_id
        FROM inward_entries ie
        LEFT JOIN partners s ON ie.source_id = s.id
        LEFT JOIN partners d ON ie.destination_id = d.id
        LEFT JOIN partners p ON ie.party_id = p.id
        WHERE ie.status = 'Completed' 
        ORDER BY ie.completed_at DESC`
	rows, err := db.pool.Query(context.Background(), query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var entries []models.InwardEntry
	for rows.Next() {
		var entry models.InwardEntry
		var grossKg float64
		var tareKgPtr, netKgPtr *float64
		if err := rows.Scan(
			&entry.ID, &entry.VehicleNumber, &entry.SourceName, &entry.PartyName,
			&entry.Material, &entry.EntryType, &grossKg,
			&tareKgPtr, &netKgPtr, &entry.Status, &entry.CreatedAt,
			&entry.CompletedAt, &entry.PartyID,
		); err != nil {
			return nil, err
		}
		entry.GrossWeightTons = grossKg / 1000
		if tareKgPtr != nil {
			tareTons := *tareKgPtr / 1000
			entry.TareWeightTons = &tareTons
		}
		if netKgPtr != nil {
			netTons := *netKgPtr / 1000
			entry.NetWeightTons = &netTons
		}
		entries = append(entries, entry)
	}
	return entries, nil
}

func (db *DB) CompleteInwardEntry(entryID int, req *models.CompleteInwardEntryRequest) (*models.InwardEntry, error) {
	var grossWeightKg float64
	var entryType string
	tx, err := db.pool.Begin(context.Background())
	if err != nil {
		return nil, err
	}
	defer tx.Rollback(context.Background())
	err = tx.QueryRow(context.Background(), `SELECT gross_weight, entry_type FROM inward_entries WHERE id = $1`, entryID).Scan(&grossWeightKg, &entryType)
	if err != nil {
		return nil, err
	}

	tareWeightKg := req.TareWeightTons * 1000
	netWeightKg := math.Abs(grossWeightKg - tareWeightKg)

	if req.Material != nil && *req.Material != "" && entryType == "Empty Vehicle" {
		query := `
            UPDATE inward_entries
            SET tare_weight = $1, net_weight = $2, status = 'Completed', completed_at = CURRENT_TIMESTAMP, material = $3, entry_type = 'Item Export'
            WHERE id = $4`
		_, err = tx.Exec(context.Background(), query, tareWeightKg, netWeightKg, *req.Material, entryID)
		if err != nil {
			return nil, err
		}
		err = updateInventoryStock(tx, *req.Material, -netWeightKg)
		if err != nil {
			return nil, err
		}
	} else {
		query := `
            UPDATE inward_entries
            SET tare_weight = $1, net_weight = $2, status = 'Completed', completed_at = CURRENT_TIMESTAMP
            WHERE id = $3`
		_, err = tx.Exec(context.Background(), query, tareWeightKg, netWeightKg, entryID)
		if err != nil {
			return nil, err
		}
	}
	return &models.InwardEntry{ID: entryID}, tx.Commit(context.Background())
}

// --- Partner Functions ---
func (db *DB) GetAllPartners() ([]models.Partner, error) {
	query := `SELECT id, name, type FROM partners ORDER BY name ASC`
	rows, err := db.pool.Query(context.Background(), query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var partners []models.Partner
	for rows.Next() {
		var p models.Partner
		if err := rows.Scan(&p.ID, &p.Name, &p.Type); err != nil {
			return nil, err
		}
		partners = append(partners, p)
	}
	return partners, nil
}

func (db *DB) CreatePartner(name string, partnerType string) (*models.Partner, error) {
	query := `INSERT INTO partners (name, type) VALUES ($1, $2) RETURNING id, name, type`
	var p models.Partner
	err := db.pool.QueryRow(context.Background(), query, name, partnerType).Scan(&p.ID, &p.Name, &p.Type)
	if err != nil {
		return nil, err
	}
	return &p, nil
}

// --- Sorting and Inventory Functions ---
func updateInventoryStock(tx pgx.Tx, materialName string, quantityChangeKg float64) error {
	query := `
        INSERT INTO inventory (material_name, current_stock_kg)
        VALUES ($1, $2)
        ON CONFLICT (material_name)
        DO UPDATE SET current_stock_kg = inventory.current_stock_kg + $2;`

	_, err := tx.Exec(context.Background(), query, materialName, quantityChangeKg)
	return err
}

func (db *DB) GetInventory() ([]models.InventoryItem, error) {
	query := `SELECT id, material_name, current_stock_kg FROM inventory ORDER BY current_stock_kg DESC`
	rows, err := db.pool.Query(context.Background(), query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []models.InventoryItem
	for rows.Next() {
		var item models.InventoryItem
		var stockKg float64
		if err := rows.Scan(&item.ID, &item.MaterialName, &stockKg); err != nil {
			return nil, err
		}
		item.CurrentStockTons = stockKg / 1000
		items = append(items, item)
	}
	return items, nil
}

func (db *DB) CreateSortingLog(req *models.CreateSortingLogRequest, userID int) error {
	tx, err := db.pool.Begin(context.Background())
	if err != nil {
		return err
	}
	defer tx.Rollback(context.Background())

	var logID int
	logQuery := `
        INSERT INTO sorting_logs (log_date, created_by_user_id)
        VALUES ($1, $2)
        ON CONFLICT (log_date, created_by_user_id)
        DO UPDATE SET created_at = CURRENT_TIMESTAMP
        RETURNING id`
	err = tx.QueryRow(context.Background(), logQuery, req.LogDate, userID).Scan(&logID)
	if err != nil {
		return err
	}

	for _, entry := range req.Entries {
		quantityKg := entry.QuantityTons * 1000
		materialUpsertQuery := `
            INSERT INTO sorted_materials (sorting_log_id, material_name, quantity_kg)
            VALUES ($1, $2, $3)
            ON CONFLICT (sorting_log_id, material_name)
            DO UPDATE SET quantity_kg = sorted_materials.quantity_kg + $3`
		_, err := tx.Exec(context.Background(), materialUpsertQuery, logID, entry.Material, quantityKg)
		if err != nil {
			return err
		}
		err = updateInventoryStock(tx, entry.Material, quantityKg)
		if err != nil {
			return err
		}
	}
	return tx.Commit(context.Background())
}

func (db *DB) GetSortingLogs() ([]models.SortingLog, error) {
	query := `
        SELECT 
            sl.id, 
            sl.log_date, 
            sl.created_at,
            (SELECT json_agg(json_build_object('material', sm.material_name, 'quantity_tons', sm.quantity_kg / 1000.0))
             FROM sorted_materials sm 
             WHERE sm.sorting_log_id = sl.id) AS entries
        FROM sorting_logs sl
        ORDER BY sl.log_date DESC, sl.created_at DESC`
	rows, err := db.pool.Query(context.Background(), query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var logs []models.SortingLog
	for rows.Next() {
		var log models.SortingLog
		if err := rows.Scan(&log.ID, &log.LogDate, &log.CreatedAt, &log.Entries); err != nil {
			return nil, err
		}
		logs = append(logs, log)
	}
	return logs, nil
}

// --- Cashbook Functions ---
func (db *DB) GetOpeningBalance(date string) (float64, error) {
	var openingBalance float64
	query := `
        SELECT 0.00 + COALESCE(SUM(cash_in - cash_out), 0) 
        FROM cashbook_transactions 
        WHERE transaction_date < $1`

	err := db.pool.QueryRow(context.Background(), query, date).Scan(&openingBalance)
	if err != nil {
		return 0, err
	}
	return openingBalance, nil
}

func (db *DB) GetTransactionsByDate(date string) ([]models.CashbookTransaction, error) {
	query := `
        SELECT id, transaction_date, created_at, description, cash_in, cash_out 
        FROM cashbook_transactions 
        WHERE transaction_date = $1 
        ORDER BY created_at ASC`

	rows, err := db.pool.Query(context.Background(), query, date)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var transactions []models.CashbookTransaction
	for rows.Next() {
		var t models.CashbookTransaction
		if err := rows.Scan(&t.ID, &t.Date, &t.Time, &t.Description, &t.CashIn, &t.CashOut); err != nil {
			return nil, err
		}
		transactions = append(transactions, t)
	}
	return transactions, nil
}

func (db *DB) CreateCashbookTransaction(req *models.CreateCashbookTransactionRequest, userID int) (*models.CashbookTransaction, error) {
	var cashIn, cashOut float64
	if req.Type == "Cash In" {
		cashIn = req.Amount
	} else {
		cashOut = req.Amount
	}
	query := `
        INSERT INTO cashbook_transactions (transaction_date, description, cash_in, cash_out, created_by_user_id)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id`

	var transactionID int
	err := db.pool.QueryRow(context.Background(), query,
		req.Date, req.Description, cashIn, cashOut, userID).Scan(&transactionID)

	if err != nil {
		return nil, err
	}

	return &models.CashbookTransaction{ID: transactionID}, nil
}

// --- Material Sale Functions ---

func (db *DB) CreateMaterialSale(req *models.CreateMaterialSaleRequest, userID int) (*models.MaterialSale, error) {
	query := `
        INSERT INTO material_sales 
            (inward_entry_id, party_id, sale_date, driver_name, driver_mobile, rate, gst_percentage, 
            amount, gst_amount, total_amount, mode_of_payment, remark, transportation_expense, 
            transporter_id, created_by_user_id)
        VALUES 
            ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        RETURNING id`

	var saleID int
	err := db.pool.QueryRow(context.Background(), query,
		req.InwardEntryID, req.PartyID, req.SaleDate, req.DriverName, req.DriverMobile, req.Rate,
		req.GSTPercentage, req.Amount, req.GSTAmount, req.TotalAmount, req.ModeOfPayment, req.Remark,
		req.TransportationExpense, req.TransporterID, userID,
	).Scan(&saleID)

	if err != nil {
		return nil, err
	}

	return &models.MaterialSale{ID: saleID}, nil
}

func (db *DB) GetMaterialSales() ([]models.MaterialSale, error) {
	query := `
        SELECT
            ms.id, ms.sale_date, ie.vehicle_number, ie.material AS material_name,
            ie.net_weight AS net_weight, p.name AS party_name, t.name as transporter_name, ms.driver_name,
            ms.driver_mobile, ms.rate, ms.gst_percentage, ms.mode_of_payment,
            ms.remark, ms.amount, ms.gst_amount, ms.total_amount, ms.created_at,
            ms.transportation_expense, ms.inward_entry_id
        FROM material_sales ms
        JOIN inward_entries ie ON ms.inward_entry_id = ie.id
        JOIN partners p ON ms.party_id = p.id
        LEFT JOIN partners t ON ms.transporter_id = t.id
        ORDER BY ms.created_at DESC`

	rows, err := db.pool.Query(context.Background(), query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var sales []models.MaterialSale
	for rows.Next() {
		var sale models.MaterialSale
		var netWeightKg float64
		if err := rows.Scan(
			&sale.ID, &sale.SaleDate, &sale.VehicleNumber, &sale.MaterialName, &netWeightKg,
			&sale.PartyName, &sale.TransporterName, &sale.DriverName, &sale.DriverMobile, &sale.Rate,
			&sale.GSTPercentage, &sale.ModeOfPayment, &sale.Remark, &sale.Amount, &sale.GSTAmount,
			&sale.TotalAmount, &sale.CreatedAt, &sale.TransportationExpense, &sale.InwardEntryID,
		); err != nil {
			return nil, err
		}
		sale.NetWeightTons = netWeightKg / 1000.0
		sales = append(sales, sale)
	}
	return sales, nil
}
func (db *DB) CreateEmployee(req *models.Employee) (*models.Employee, error) {
	query := `INSERT INTO employees (id, name, designation) VALUES ($1, $2, $3) RETURNING id`
	var empID int
	err := db.pool.QueryRow(context.Background(), query, req.ID, req.Name, req.Designation).Scan(&empID)
	if err != nil {
		return nil, err
	}
	return &models.Employee{ID: empID, Name: req.Name, Designation: req.Designation}, nil
}

func (db *DB) GetAllActiveEmployees() ([]models.Employee, error) {
	query := `SELECT id, name, designation FROM employees WHERE is_active = TRUE ORDER BY name ASC`
	rows, err := db.pool.Query(context.Background(), query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var employees []models.Employee
	for rows.Next() {
		var emp models.Employee
		if err := rows.Scan(&emp.ID, &emp.Name, &emp.Designation); err != nil {
			return nil, err
		}
		employees = append(employees, emp)
	}
	return employees, nil
}

func (db *DB) UpdateEmployee(id int, req *models.Employee) error {
	query := `UPDATE employees SET name = $1, designation = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3`
	_, err := db.pool.Exec(context.Background(), query, req.Name, req.Designation, id)
	return err
}

func (db *DB) DeactivateEmployee(id int) error {
	query := `UPDATE employees SET is_active = FALSE WHERE id = $1`
	_, err := db.pool.Exec(context.Background(), query, id)
	return err
}

func (db *DB) GetMonthlyAttendance(month string) (map[string]map[int]string, error) {
	query := `
        SELECT employee_id, record_date, status 
        FROM attendance_records 
        WHERE TO_CHAR(record_date, 'YYYY-MM') = $1`

	rows, err := db.pool.Query(context.Background(), query, month)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	// { "YYYY-MM-DD": { empId: "P" } }
	records := make(map[string]map[int]string)
	for rows.Next() {
		var empID int
		var recordDate time.Time
		var status string
		if err := rows.Scan(&empID, &recordDate, &status); err != nil {
			return nil, err
		}
		dateStr := recordDate.Format("2006-01-02")
		if records[dateStr] == nil {
			records[dateStr] = make(map[int]string)
		}
		records[dateStr][empID] = status
	}
	return records, nil
}

func (db *DB) SaveMonthlyAttendance(dateStr string, records []models.AttendanceRecord, userID int) error {
	tx, err := db.pool.Begin(context.Background())
	if err != nil {
		return err
	}
	defer tx.Rollback(context.Background())

	for _, record := range records {
		query := `
            INSERT INTO attendance_records (employee_id, record_date, status, created_by_user_id)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (employee_id, record_date) 
            DO UPDATE SET status = EXCLUDED.status`
		_, err := tx.Exec(context.Background(), query, record.EmployeeID, dateStr, record.Status, userID)
		if err != nil {
			return err
		}
	}
	return tx.Commit(context.Background())
}

// Updated database functions for assets with invoice_number

func (db *DB) CreateAsset(asset *models.Asset) (*models.Asset, error) {
	query := `
        INSERT INTO assets (id, name, category, purchase_date, value, status, location, invoice_number, supplier, image_url)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING id, name, category, purchase_date::text, value, status, location, invoice_number, supplier, image_url, created_at, updated_at`

	var createdAsset models.Asset
	err := db.pool.QueryRow(context.Background(), query,
		asset.ID, asset.Name, asset.Category, asset.PurchaseDate, asset.Value, asset.Status, asset.Location, asset.InvoiceNumber, asset.Supplier, asset.ImageURL,
	).Scan(
		&createdAsset.ID, &createdAsset.Name, &createdAsset.Category, &createdAsset.PurchaseDate, &createdAsset.Value,
		&createdAsset.Status, &createdAsset.Location, &createdAsset.InvoiceNumber, &createdAsset.Supplier,
		&createdAsset.ImageURL, &createdAsset.CreatedAt, &createdAsset.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &createdAsset, nil
}

func (db *DB) GetAllAssets() ([]models.Asset, error) {
	query := `
		SELECT
			id, name, category, purchase_date::text, value, status,
			location, invoice_number, supplier, image_url,
			created_at, updated_at
		FROM assets
		ORDER BY created_at DESC`

	rows, err := db.pool.Query(context.Background(), query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var assets []models.Asset
	for rows.Next() {
		var asset models.Asset
		if err := rows.Scan(
			&asset.ID, &asset.Name, &asset.Category, &asset.PurchaseDate, &asset.Value,
			&asset.Status, &asset.Location, &asset.InvoiceNumber, &asset.Supplier,
			&asset.ImageURL, &asset.CreatedAt, &asset.UpdatedAt,
		); err != nil {
			return nil, err
		}
		assets = append(assets, asset)
	}
	return assets, nil
}

func (db *DB) UpdateAsset(asset *models.Asset) error {
	query := `
		UPDATE assets
		SET name = $1, category = $2, purchase_date = $3, value = $4, status = $5, location = $6, invoice_number = $7, supplier = $8, image_url = $9, updated_at = CURRENT_TIMESTAMP
		WHERE id = $10`
	_, err := db.pool.Exec(context.Background(), query,
		asset.Name, asset.Category, asset.PurchaseDate, asset.Value, asset.Status, asset.Location, asset.InvoiceNumber, asset.Supplier, asset.ImageURL, asset.ID)
	return err
}

func (db *DB) DeleteAsset(assetID string) error {
	query := `DELETE FROM assets WHERE id = $1`
	_, err := db.pool.Exec(context.Background(), query, assetID)
	return err
}
func (db *DB) SyncPermissions(permissions []string) error {
	// 1. Get all permissions currently in the database
	rows, err := db.pool.Query(context.Background(), "SELECT action FROM permissions")
	if err != nil {
		return err
	}
	defer rows.Close()

	existingPerms := make(map[string]bool)
	for rows.Next() {
		var action string
		if err := rows.Scan(&action); err != nil {
			return err
		}
		existingPerms[action] = true
	}

	// 2. Insert any permissions that are in our master list but not in the database
	tx, err := db.pool.Begin(context.Background())
	if err != nil {
		return err
	}
	defer tx.Rollback(context.Background())

	stmt, err := tx.Prepare(context.Background(), "insert_perm", "INSERT INTO permissions (action) VALUES ($1)")
	if err != nil {
		return err
	}

	for _, p := range permissions {
		if !existingPerms[p] {
			log.Printf("Adding new permission to database: %s\n", p)
			if _, err := tx.Exec(context.Background(), stmt.Name, p); err != nil {
				return err
			}
		}
	}

	return tx.Commit(context.Background())
}

// ADD THESE FUNCTIONS TO YOUR EXISTING database/database.go FILE

// CreateVendor creates a new vendor with factories
func (db *DB) CreateVendor(req *models.CreateVendorRequest, vendorID string, userID int) (*models.Vendor, error) {
	tx, err := db.pool.Begin(context.Background())
	if err != nil {
		return nil, err
	}
	defer tx.Rollback(context.Background())

	// Insert vendor
	query := `
		INSERT INTO vendors (id, vendor_name, vendor_code, year_of_establishment, type_of_ownership, 
			type_of_business, is_ssi_msme, registration_no, cpcb_lic_no, sales_tax_no, gst_no, pan_no, 
			prepared_by, authorized_by, approved_by, created_by_user_id)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
		RETURNING created_at, updated_at, status`

	var vendor models.Vendor
	err = tx.QueryRow(context.Background(), query,
		vendorID, req.VendorName, req.VendorCode, req.YearOfEstablishment, req.TypeOfOwnership,
		req.TypeOfBusiness, req.IsSSI_MSME, req.RegistrationNo, req.CPCBLicNo, req.SalesTaxNo,
		req.GSTNo, req.PANNo, req.PreparedBy, req.AuthorizedBy, req.ApprovedBy, userID,
	).Scan(&vendor.CreatedAt, &vendor.UpdatedAt, &vendor.Status)

	if err != nil {
		return nil, err
	}

	// Insert factories
	for i, factory := range req.Factories {
		factoryQuery := `
			INSERT INTO vendor_factories (vendor_id, factory_no, address1, address2, address3, mob_no, fax_no, email_id)
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`

		_, err = tx.Exec(context.Background(), factoryQuery,
			vendorID, i+1, factory.Address1, factory.Address2, factory.Address3,
			factory.MobNo, factory.FaxNo, factory.EmailID)

		if err != nil {
			return nil, err
		}
	}

	if err = tx.Commit(context.Background()); err != nil {
		return nil, err
	}

	// Build response
	vendor.ID = vendorID
	vendor.VendorName = req.VendorName
	vendor.VendorCode = req.VendorCode
	vendor.YearOfEstablishment = req.YearOfEstablishment
	vendor.TypeOfOwnership = req.TypeOfOwnership
	vendor.TypeOfBusiness = req.TypeOfBusiness
	vendor.IsSSI_MSME = req.IsSSI_MSME
	vendor.RegistrationNo = req.RegistrationNo
	vendor.CPCBLicNo = req.CPCBLicNo
	vendor.SalesTaxNo = req.SalesTaxNo
	vendor.GSTNo = req.GSTNo
	vendor.PANNo = req.PANNo
	vendor.PreparedBy = req.PreparedBy
	vendor.AuthorizedBy = req.AuthorizedBy
	vendor.ApprovedBy = req.ApprovedBy
	vendor.CreatedByUserID = userID

	return &vendor, nil
}

// GetAllVendors retrieves all vendors with their factories and document counts
func (db *DB) GetAllVendors() ([]models.Vendor, error) {
	query := `
		SELECT v.id, v.vendor_name, v.vendor_code, v.year_of_establishment, v.type_of_ownership,
			v.type_of_business, v.is_ssi_msme, v.registration_no, v.cpcb_lic_no, v.sales_tax_no,
			v.gst_no, v.pan_no, v.prepared_by, v.authorized_by, v.approved_by, v.status,
			v.created_at, v.updated_at, v.created_by_user_id
		FROM vendors v
		ORDER BY v.created_at DESC`

	rows, err := db.pool.Query(context.Background(), query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var vendors []models.Vendor
	for rows.Next() {
		var vendor models.Vendor
		var vendorCode, yearOfEstablishment, typeOfOwnership, typeOfBusiness, isSsiMsme, registrationNo, cpcbLicNo, salesTaxNo, gstNo, panNo, preparedBy, authorizedBy, approvedBy sql.NullString

		if err := rows.Scan(
			&vendor.ID, &vendor.VendorName, &vendorCode, &yearOfEstablishment, &typeOfOwnership,
			&typeOfBusiness, &isSsiMsme, &registrationNo, &cpcbLicNo, &salesTaxNo,
			&gstNo, &panNo, &preparedBy, &authorizedBy, &approvedBy, &vendor.Status,
			&vendor.CreatedAt, &vendor.UpdatedAt, &vendor.CreatedByUserID,
		); err != nil {
			log.Printf("Failed to scan vendor row: %v", err)
			return nil, err
		}

		if vendorCode.Valid {
			vendor.VendorCode = &vendorCode.String
		}
		if yearOfEstablishment.Valid {
			vendor.YearOfEstablishment = &yearOfEstablishment.String
		}
		if typeOfOwnership.Valid {
			vendor.TypeOfOwnership = &typeOfOwnership.String
		}
		if typeOfBusiness.Valid {
			vendor.TypeOfBusiness = &typeOfBusiness.String
		}
		if isSsiMsme.Valid {
			vendor.IsSSI_MSME = &isSsiMsme.String
		}
		if registrationNo.Valid {
			vendor.RegistrationNo = &registrationNo.String
		}
		if cpcbLicNo.Valid {
			vendor.CPCBLicNo = &cpcbLicNo.String
		}
		if salesTaxNo.Valid {
			vendor.SalesTaxNo = &salesTaxNo.String
		}
		if gstNo.Valid {
			vendor.GSTNo = &gstNo.String
		}
		if panNo.Valid {
			vendor.PANNo = &panNo.String
		}
		if preparedBy.Valid {
			vendor.PreparedBy = &preparedBy.String
		}
		if authorizedBy.Valid {
			vendor.AuthorizedBy = &authorizedBy.String
		}
		if approvedBy.Valid {
			vendor.ApprovedBy = &approvedBy.String
		}
		vendors = append(vendors, vendor)
	}
	if err = rows.Err(); err != nil {
		return nil, err
	}

	for i := range vendors {
		vendor := &vendors[i]
		factories, err := db.getVendorFactories(vendor.ID)
		if err != nil {
			return nil, fmt.Errorf("error getting factories for vendor %s: %w", vendor.ID, err)
		}
		vendor.Factories = factories

		documents, err := db.getVendorDocuments(vendor.ID)
		if err != nil {
			return nil, fmt.Errorf("error getting documents for vendor %s: %w", vendor.ID, err)
		}
		vendor.Documents = documents
	}

	return vendors, nil
}

// GetVendorByID retrieves a single vendor by ID
func (db *DB) GetVendorByID(vendorID string) (*models.Vendor, error) {
	query := `
		SELECT id, vendor_name, vendor_code, year_of_establishment, type_of_ownership,
			type_of_business, is_ssi_msme, registration_no, cpcb_lic_no, sales_tax_no,
			gst_no, pan_no, prepared_by, authorized_by, approved_by, status,
			created_at, updated_at, created_by_user_id
		FROM vendors WHERE id = $1`

	var vendor models.Vendor
	var vendorCode, yearOfEstablishment, typeOfOwnership, typeOfBusiness, isSsiMsme, registrationNo, cpcbLicNo, salesTaxNo, gstNo, panNo, preparedBy, authorizedBy, approvedBy sql.NullString

	err := db.pool.QueryRow(context.Background(), query, vendorID).Scan(
		&vendor.ID, &vendor.VendorName, &vendorCode, &yearOfEstablishment, &typeOfOwnership,
		&typeOfBusiness, &isSsiMsme, &registrationNo, &cpcbLicNo, &salesTaxNo,
		&gstNo, &panNo, &preparedBy, &authorizedBy, &approvedBy, &vendor.Status,
		&vendor.CreatedAt, &vendor.UpdatedAt, &vendor.CreatedByUserID,
	)

	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, err // Not found is a specific, expected error
		}
		// Log other, unexpected errors
		log.Printf("Failed to scan vendor by ID %s: %v", vendorID, err)
		return nil, err
	}

	if vendorCode.Valid {
		vendor.VendorCode = &vendorCode.String
	}
	if yearOfEstablishment.Valid {
		vendor.YearOfEstablishment = &yearOfEstablishment.String
	}
	if typeOfOwnership.Valid {
		vendor.TypeOfOwnership = &typeOfOwnership.String
	}
	if typeOfBusiness.Valid {
		vendor.TypeOfBusiness = &typeOfBusiness.String
	}
	if isSsiMsme.Valid {
		vendor.IsSSI_MSME = &isSsiMsme.String
	}
	if registrationNo.Valid {
		vendor.RegistrationNo = &registrationNo.String
	}
	if cpcbLicNo.Valid {
		vendor.CPCBLicNo = &cpcbLicNo.String
	}
	if salesTaxNo.Valid {
		vendor.SalesTaxNo = &salesTaxNo.String
	}
	if gstNo.Valid {
		vendor.GSTNo = &gstNo.String
	}
	if panNo.Valid {
		vendor.PANNo = &panNo.String
	}
	if preparedBy.Valid {
		vendor.PreparedBy = &preparedBy.String
	}
	if authorizedBy.Valid {
		vendor.AuthorizedBy = &authorizedBy.String
	}
	if approvedBy.Valid {
		vendor.ApprovedBy = &approvedBy.String
	}
	// Load factories
	factories, err := db.getVendorFactories(vendorID)
	if err != nil {
		return nil, err
	}
	vendor.Factories = factories

	// Load documents
	documents, err := db.getVendorDocuments(vendorID)
	if err != nil {
		return nil, err
	}
	vendor.Documents = documents

	return &vendor, nil
}

// UpdateVendor updates vendor information
func (db *DB) UpdateVendor(vendorID string, req *models.UpdateVendorRequest) error {
	tx, err := db.pool.Begin(context.Background())
	if err != nil {
		return err
	}
	defer tx.Rollback(context.Background())

	// Build dynamic update query
	setParts := []string{}
	args := []interface{}{}
	argCount := 1

	if req.VendorName != nil {
		setParts = append(setParts, fmt.Sprintf("vendor_name = $%d", argCount))
		args = append(args, *req.VendorName)
		argCount++
	}
	if req.VendorCode != nil {
		setParts = append(setParts, fmt.Sprintf("vendor_code = $%d", argCount))
		args = append(args, *req.VendorCode)
		argCount++
	}
	if req.YearOfEstablishment != nil {
		setParts = append(setParts, fmt.Sprintf("year_of_establishment = $%d", argCount))
		args = append(args, *req.YearOfEstablishment)
		argCount++
	}
	if req.TypeOfOwnership != nil {
		setParts = append(setParts, fmt.Sprintf("type_of_ownership = $%d", argCount))
		args = append(args, *req.TypeOfOwnership)
		argCount++
	}
	if req.TypeOfBusiness != nil {
		setParts = append(setParts, fmt.Sprintf("type_of_business = $%d", argCount))
		args = append(args, *req.TypeOfBusiness)
		argCount++
	}
	if req.Status != nil {
		setParts = append(setParts, fmt.Sprintf("status = $%d", argCount))
		args = append(args, *req.Status)
		argCount++
	}
	if req.IsSSI_MSME != nil {
		setParts = append(setParts, fmt.Sprintf("is_ssi_msme = $%d", argCount))
		args = append(args, *req.IsSSI_MSME)
		argCount++
	}
	if req.RegistrationNo != nil {
		setParts = append(setParts, fmt.Sprintf("registration_no = $%d", argCount))
		args = append(args, *req.RegistrationNo)
		argCount++
	}
	if req.CPCBLicNo != nil {
		setParts = append(setParts, fmt.Sprintf("cpcb_lic_no = $%d", argCount))
		args = append(args, *req.CPCBLicNo)
		argCount++
	}
	if req.SalesTaxNo != nil {
		setParts = append(setParts, fmt.Sprintf("sales_tax_no = $%d", argCount))
		args = append(args, *req.SalesTaxNo)
		argCount++
	}
	if req.GSTNo != nil {
		setParts = append(setParts, fmt.Sprintf("gst_no = $%d", argCount))
		args = append(args, *req.GSTNo)
		argCount++
	}
	if req.PANNo != nil {
		setParts = append(setParts, fmt.Sprintf("pan_no = $%d", argCount))
		args = append(args, *req.PANNo)
		argCount++
	}
	if req.PreparedBy != nil {
		setParts = append(setParts, fmt.Sprintf("prepared_by = $%d", argCount))
		args = append(args, *req.PreparedBy)
		argCount++
	}
	if req.AuthorizedBy != nil {
		setParts = append(setParts, fmt.Sprintf("authorized_by = $%d", argCount))
		args = append(args, *req.AuthorizedBy)
		argCount++
	}
	if req.ApprovedBy != nil {
		setParts = append(setParts, fmt.Sprintf("approved_by = $%d", argCount))
		args = append(args, *req.ApprovedBy)
		argCount++
	}

	setParts = append(setParts, "updated_at = NOW()")
	args = append(args, vendorID)

	if len(setParts) > 1 { // More than just updated_at
		query := fmt.Sprintf("UPDATE vendors SET %s WHERE id = $%d", strings.Join(setParts, ", "), argCount)
		_, err = tx.Exec(context.Background(), query, args...)
		if err != nil {
			return err
		}
	}

	// Update factories if provided
	if req.Factories != nil {
		// Delete existing factories
		_, err = tx.Exec(context.Background(), "DELETE FROM vendor_factories WHERE vendor_id = $1", vendorID)
		if err != nil {
			return err
		}

		// Insert new factories
		for i, factory := range req.Factories {
			factoryQuery := `
				INSERT INTO vendor_factories (vendor_id, factory_no, address1, address2, address3, mob_no, fax_no, email_id)
				VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`

			_, err = tx.Exec(context.Background(), factoryQuery,
				vendorID, i+1, factory.Address1, factory.Address2, factory.Address3,
				factory.MobNo, factory.FaxNo, factory.EmailID)

			if err != nil {
				return err
			}
		}
	}

	return tx.Commit(context.Background())
}

// DeleteVendor deletes a vendor and all related data
func (db *DB) DeleteVendor(vendorID string) error {
	tx, err := db.pool.Begin(context.Background())
	if err != nil {
		return err
	}
	defer tx.Rollback(context.Background())

	// Get document paths before deletion for cleanup
	docs, err := db.getVendorDocuments(vendorID)
	if err != nil {
		return err
	}

	// Delete vendor (cascades will handle factories and documents)
	_, err = tx.Exec(context.Background(), "DELETE FROM vendors WHERE id = $1", vendorID)
	if err != nil {
		return err
	}

	if err = tx.Commit(context.Background()); err != nil {
		return err
	}

	// Clean up files from disk
	for _, doc := range docs {
		if err := os.Remove(doc.FilePath); err != nil {
			fmt.Printf("Warning: Could not delete file %s: %v\n", doc.FilePath, err)
		}
	}

	return nil
}

// Helper functions for loading related data
func (db *DB) getVendorFactories(vendorID string) ([]models.VendorFactory, error) {
	query := `
		SELECT id, vendor_id, factory_no, address1, address2, address3, mob_no, fax_no, email_id
		FROM vendor_factories WHERE vendor_id = $1 ORDER BY factory_no`

	rows, err := db.pool.Query(context.Background(), query, vendorID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var factories []models.VendorFactory
	for rows.Next() {
		var factory models.VendorFactory
		var address1, address2, address3, mobNo, faxNo, emailID sql.NullString
		if err := rows.Scan(
			&factory.ID, &factory.VendorID, &factory.FactoryNo, &address1, &address2,
			&address3, &mobNo, &faxNo, &emailID,
		); err != nil {
			return nil, err
		}
		if address1.Valid {
			factory.Address1 = &address1.String
		}
		if address2.Valid {
			factory.Address2 = &address2.String
		}
		if address3.Valid {
			factory.Address3 = &address3.String
		}
		if mobNo.Valid {
			factory.MobNo = &mobNo.String
		}
		if faxNo.Valid {
			factory.FaxNo = &faxNo.String
		}
		if emailID.Valid {
			factory.EmailID = &emailID.String
		}
		factories = append(factories, factory)
	}
	return factories, nil
}

func (db *DB) getVendorDocuments(vendorID string) ([]models.VendorDocument, error) {
	query := `
		SELECT id, vendor_id, file_name, original_name, file_size, file_type, file_path, uploaded_at
		FROM vendor_documents WHERE vendor_id = $1 ORDER BY uploaded_at DESC`

	rows, err := db.pool.Query(context.Background(), query, vendorID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var documents []models.VendorDocument
	for rows.Next() {
		var doc models.VendorDocument
		if err := rows.Scan(
			&doc.ID, &doc.VendorID, &doc.FileName, &doc.OriginalName, &doc.FileSize,
			&doc.FileType, &doc.FilePath, &doc.UploadedAt,
		); err != nil {
			return nil, err
		}
		documents = append(documents, doc)
	}
	return documents, nil
}

// Document management functions
func (db *DB) CreateVendorDocument(doc *models.VendorDocument) (*models.VendorDocument, error) {
	query := `
		INSERT INTO vendor_documents (vendor_id, file_name, original_name, file_size, file_type, file_path)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id, uploaded_at`

	err := db.pool.QueryRow(context.Background(), query,
		doc.VendorID, doc.FileName, doc.OriginalName, doc.FileSize, doc.FileType, doc.FilePath,
	).Scan(&doc.ID, &doc.UploadedAt)

	if err != nil {
		return nil, err
	}

	return doc, nil
}

func (db *DB) GetVendorDocument(docID int) (*models.VendorDocument, error) {
	query := `
		SELECT id, vendor_id, file_name, original_name, file_size, file_type, file_path, uploaded_at
		FROM vendor_documents WHERE id = $1`

	var doc models.VendorDocument
	err := db.pool.QueryRow(context.Background(), query, docID).Scan(
		&doc.ID, &doc.VendorID, &doc.FileName, &doc.OriginalName, &doc.FileSize,
		&doc.FileType, &doc.FilePath, &doc.UploadedAt,
	)

	if err != nil {
		return nil, err
	}

	return &doc, nil
}

func (db *DB) DeleteVendorDocument(docID int) error {
	_, err := db.pool.Exec(context.Background(), "DELETE FROM vendor_documents WHERE id = $1", docID)
	return err
}
func (db *DB) DeleteInwardEntry(entryID int) error {
	query := `DELETE FROM inward_entries WHERE id = $1 AND status = 'Pending'`
	_, err := db.pool.Exec(context.Background(), query, entryID)
	return err
}
