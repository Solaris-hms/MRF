package models

import "time"

// Vendor represents the vendors table in the database
type Vendor struct {
	ID                  string    `json:"id"`
	VendorName          string    `json:"vendor_name" binding:"required"`
	VendorCode          *string   `json:"vendor_code"`
	YearOfEstablishment *string   `json:"year_of_establishment"`
	TypeOfOwnership     []string  `json:"type_of_ownership"`
	TypeOfBusiness      []string  `json:"type_of_business"`
	IsSSI_MSME          *string   `json:"is_ssi_msme"`
	RegistrationNo      *string   `json:"registration_no"`
	CPCBLicNo           *string   `json:"cpcb_lic_no"`
	SalesTaxNo          *string   `json:"sales_tax_no"`
	GSTNo               *string   `json:"gst_no"`
	PANNo               *string   `json:"pan_no"`
	PreparedBy          *string   `json:"prepared_by"`
	AuthorizedBy        *string   `json:"authorized_by"`
	ApprovedBy          *string   `json:"approved_by"`
	Status              string    `json:"status" default:"Pending"`
	CreatedAt           time.Time `json:"created_at"`
	UpdatedAt           time.Time `json:"updated_at"`
	CreatedByUserID     int       `json:"created_by_user_id"`

	// Related data
	Factories []VendorFactory  `json:"factories"`
	Documents []VendorDocument `json:"documents"`
}

// VendorFactory represents factory/office contact details
type VendorFactory struct {
	ID        int     `json:"id"`
	VendorID  string  `json:"vendor_id"`
	Address1  *string `json:"address1"`
	Address2  *string `json:"address2"`
	Address3  *string `json:"address3"`
	MobNo     *string `json:"mob_no"`
	FaxNo     *string `json:"fax_no"`
	EmailID   *string `json:"email_id"`
	FactoryNo int     `json:"factory_no"`
}

// VendorDocument represents uploaded documents for vendors
type VendorDocument struct {
	ID           int       `json:"id"`
	VendorID     string    `json:"vendor_id"`
	FileName     string    `json:"file_name"`
	OriginalName string    `json:"original_name"`
	FileSize     int64     `json:"file_size"`
	FileType     string    `json:"file_type"`
	FilePath     string    `json:"file_path"`
	UploadedAt   time.Time `json:"uploaded_at"`
}

// CreateVendorRequest defines the request structure for creating vendors
type CreateVendorRequest struct {
	VendorName          string           `json:"vendor_name" binding:"required"`
	VendorCode          *string          `json:"vendor_code"`
	YearOfEstablishment *string          `json:"year_of_establishment"`
	TypeOfOwnership     []string         `json:"type_of_ownership"`
	TypeOfBusiness      []string         `json:"type_of_business"`
	IsSSI_MSME          *string          `json:"is_ssi_msme"`
	RegistrationNo      *string          `json:"registration_no"`
	CPCBLicNo           *string          `json:"cpcb_lic_no"`
	SalesTaxNo          *string          `json:"sales_tax_no"`
	GSTNo               *string          `json:"gst_no"`
	PANNo               *string          `json:"pan_no"`
	PreparedBy          *string          `json:"prepared_by"`
	AuthorizedBy        *string          `json:"authorized_by"`
	ApprovedBy          *string          `json:"approved_by"`
	Factories           []FactoryRequest `json:"factories"`
}

// FactoryRequest represents the factory data in requests
type FactoryRequest struct {
	Address1  *string `json:"address1"`
	Address2  *string `json:"address2"`
	Address3  *string `json:"address3"`
	MobNo     *string `json:"mob_no"`
	FaxNo     *string `json:"fax_no"`
	EmailID   *string `json:"email_id"`
	FactoryNo int     `json:"factory_no"`
}

// UpdateVendorRequest for updating vendor information
type UpdateVendorRequest struct {
	VendorName          *string          `json:"vendor_name"`
	VendorCode          *string          `json:"vendor_code"`
	YearOfEstablishment *string          `json:"year_of_establishment"`
	TypeOfOwnership     []string         `json:"type_of_ownership"`
	TypeOfBusiness      []string         `json:"type_of_business"`
	IsSSI_MSME          *string          `json:"is_ssi_msme"`
	RegistrationNo      *string          `json:"registration_no"`
	CPCBLicNo           *string          `json:"cpcb_lic_no"`
	SalesTaxNo          *string          `json:"sales_tax_no"`
	GSTNo               *string          `json:"gst_no"`
	PANNo               *string          `json:"pan_no"`
	PreparedBy          *string          `json:"prepared_by"`
	AuthorizedBy        *string          `json:"authorized_by"`
	ApprovedBy          *string          `json:"approved_by"`
	Status              *string          `json:"status"`
	Factories           []FactoryRequest `json:"factories"`
}
