package models

import "time"

// User represents the users table in the database.
type User struct {
	ID           int       `json:"id"`
	FullName     string    `json:"full_name"`
	Username     *string   `json:"username,omitempty"`
	Designation  *string   `json:"designation,omitempty"`
	Email        string    `json:"email"`
	PasswordHash string    `json:"-"`
	IsApproved   bool      `json:"is_approved"`
	CreatedAt    time.Time `json:"created_at"`
	RoleName     *string   `json:"role_name,omitempty"`
}

// Role represents a single role from the database.
type Role struct {
	ID   int    `json:"id"`
	Name string `json:"name"`
}

// Permission represents a single permission from the database.
type Permission struct {
	ID     int    `json:"id"`
	Action string `json:"action"`
}

// Partner represents a source, destination, or party from the database.
type Partner struct {
	ID   int    `json:"id"`
	Name string `json:"name"`
	Type string `json:"type"`
}

// InventoryItem represents a single material's stock from the inventory table.
type InventoryItem struct {
	ID               int     `json:"id"`
	MaterialName     string  `json:"material_name"`
	CurrentStockTons float64 `json:"current_stock_tons"`
}

// UpdatePermissionsRequest defines the shape for updating a role's permissions.
type UpdatePermissionsRequest struct {
	PermissionIDs []int `json:"permission_ids"`
}

// UpdateUserRequest defines the shape for the user update request body.
type UpdateUserRequest struct {
	FullName    string `json:"full_name" binding:"required"`
	Username    string `json:"username"`
	Designation string `json:"designation"`
	Email       string `json:"email" binding:"required,email"`
	RoleID      int    `json:"role_id" binding:"required"`
}

// RegisterRequest defines the shape of the registration request body.
type RegisterRequest struct {
	FullName    string `json:"full_name" binding:"required"`
	Username    string `json:"username" binding:"required"`
	Designation string `json:"designation" binding:"required"`
	Email       string `json:"email" binding:"required,email"`
	Password    string `json:"password" binding:"required,min=8"`
}

// LoginRequest defines the shape of the login request body.
type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

// ApprovalRequest defines the shape for the approval request body.
type ApprovalRequest struct {
	RoleID int `json:"role_id" binding:"required"`
}

// InwardEntry represents the inward_entries table in the database.
type InwardEntry struct {
	ID              int        `json:"id"`
	VehicleNumber   string     `json:"vehicle_number"`
	SourceID        *int       `json:"source_id"`
	DestinationID   *int       `json:"destination_id"`
	PartyID         *int       `json:"party_id"`
	PartyName       *string    `json:"party_name,omitempty"`
	Material        *string    `json:"material"`
	EntryType       string     `json:"entry_type"`
	GrossWeightTons float64    `json:"gross_weight_tons"`
	TareWeightTons  *float64   `json:"tare_weight_tons"`
	NetWeightTons   *float64   `json:"net_weight_tons"`
	Status          string     `json:"status"`
	CreatedByUserID int        `json:"created_by_user_id"`
	CreatedAt       time.Time  `json:"created_at"`
	CompletedAt     *time.Time `json:"completed_at"`
	SourceName      *string    `json:"source_name,omitempty"`
}

// CreateInwardEntryRequest defines the shape for creating a new entry.
type CreateInwardEntryRequest struct {
	VehicleNumber   string  `json:"vehicle_number" binding:"required"`
	SourceID        *int    `json:"source_id"`
	DestinationID   *int    `json:"destination_id"`
	PartyID         *int    `json:"party_id"`
	Material        string  `json:"material"`
	EntryType       string  `json:"entry_type" binding:"required"`
	GrossWeightTons float64 `json:"gross_weight_tons" binding:"required"`
}

// CompleteInwardEntryRequest defines the shape for completing an entry.
type CompleteInwardEntryRequest struct {
	TareWeightTons float64 `json:"tare_weight_tons" binding:"required"`
	Material       *string `json:"material"`
}

// Structs for Sorting Log
type SortedMaterial struct {
	Material     string  `json:"material" binding:"required"`
	QuantityTons float64 `json:"quantity_tons" binding:"required"`
}

type CreateSortingLogRequest struct {
	LogDate string           `json:"log_date" binding:"required"`
	Entries []SortedMaterial `json:"entries" binding:"required"`
}

// SortingLog represents a full log entry with its materials, fetched from the DB.
type SortingLog struct {
	ID        int              `json:"id"`
	LogDate   time.Time        `json:"log_date"`
	CreatedAt time.Time        `json:"created_at"`
	Entries   []SortedMaterial `json:"entries"`
}

type CashbookTransaction struct {
	ID          int       `json:"id"`
	Date        time.Time `json:"date"`
	Time        time.Time `json:"time"`
	Description string    `json:"description"`
	CashIn      float64   `json:"cash_in"`
	CashOut     float64   `json:"cash_out"`
}

type CreateCashbookTransactionRequest struct {
	Date        string  `json:"date" binding:"required"`
	Description string  `json:"description" binding:"required"`
	Type        string  `json:"type" binding:"required"`
	Amount      float64 `json:"amount" binding:"required"`
}
type CreateMaterialSaleRequest struct {
	InwardEntryID int `json:"inward_entry_id" binding:"required"`
	PartyID       int `json:"party_id" binding:"required"`
	// --- THIS IS NEW ---
	TransporterID         *int    `json:"transporter_id"`
	SaleDate              string  `json:"sale_date" binding:"required"`
	DriverName            string  `json:"driver_name"`
	DriverMobile          string  `json:"driver_mobile"`
	Rate                  float64 `json:"rate" binding:"required"`
	GSTPercentage         float64 `json:"gst_percentage"`
	Amount                float64 `json:"amount"`
	GSTAmount             float64 `json:"gst_amount"`
	TotalAmount           float64 `json:"total_amount"`
	ModeOfPayment         string  `json:"mode_of_payment"`
	Remark                string  `json:"remark"`
	TransportationExpense float64 `json:"transportation_expense"`
	CreatedByUserID       int     `json:"created_by_user_id"`
}

type MaterialSale struct {
	ID            int     `json:"id"`
	InwardEntryID int     `json:"inward_entry_id,omitempty"`
	PartyID       int     `json:"party_id,omitempty"`
	PartyName     *string `json:"party_name,omitempty"`
	// --- THESE ARE NEW ---
	TransporterID         *int      `json:"transporter_id,omitempty"`
	TransporterName       *string   `json:"transporter_name,omitempty"`
	SaleDate              time.Time `json:"sale_date"`
	VehicleNumber         *string   `json:"vehicle_number,omitempty"`
	DriverName            *string   `json:"driver_name,omitempty"`
	DriverMobile          *string   `json:"driver_mobile,omitempty"`
	Rate                  float64   `json:"rate"`
	GSTPercentage         float64   `json:"gst_percentage,omitempty"`
	Amount                float64   `json:"amount,omitempty"`
	GSTAmount             float64   `json:"gst_amount,omitempty"`
	TotalAmount           float64   `json:"total_amount"`
	ModeOfPayment         *string   `json:"mode_of_payment,omitempty"`
	Remark                *string   `json:"remark,omitempty"`
	TransportationExpense float64   `json:"transportation_expense,omitempty"`
	CreatedByUserID       int       `json:"created_by_user_id,omitempty"`
	CreatedAt             time.Time `json:"created_at"`
	MaterialName          *string   `json:"material_name,omitempty"`
	NetWeightTons         float64   `json:"net_weight_tons,omitempty"`
}
type Employee struct {
	ID          int       `json:"id"`
	Name        string    `json:"name" binding:"required"`
	Designation string    `json:"designation" binding:"required"`
	Department  string    `json:"department,omitempty"` // New field
	IsActive    bool      `json:"is_active"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type AttendanceRecord struct {
	EmployeeID int    `json:"employee_id"`
	Status     string `json:"status"`
}

type SaveAttendanceRequest struct {
	Date    string             `json:"date" binding:"required"` // YYYY-MM-DD
	Records []AttendanceRecord `json:"records" binding:"required"`
}
type Asset struct {
	ID            string    `json:"id"`
	Name          string    `json:"name"`
	Category      *string   `json:"category"`       // Must be pointer
	PurchaseDate  *string   `json:"purchase_date"`  // Must be pointer
	Value         *float64  `json:"value"`          // Must be pointer
	Status        *string   `json:"status"`         // Must be pointer
	Location      *string   `json:"location"`       // Must be pointer
	InvoiceNumber *string   `json:"invoice_number"` // Changed from serial_number
	Supplier      *string   `json:"supplier"`       // Must be pointer
	ImageURL      *string   `json:"image_url"`      // Must be pointer
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}
