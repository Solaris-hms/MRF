package config

// AllPermissions defines the complete list of permissions used in the application.
// This is the single source of truth.
var AllPermissions = []string{
	// User Management
	"manage:users",
	"approve:users",
	"manage:roles",

	// Dashboard
	"view:dashboard",

	// Cashbook & Sales
	"view:cashbook",

	// Inward Entries
	"create:inward_entry",
	"view:inward_entries",
	"complete:inward_entry",
	"log:inbound_material",

	// Sorting
	"create:sorting_log",
	"log:sorted_bale",

	// Assets
	"view:assets",
	"create:assets",
	"edit:assets",
	"delete:assets",

	// Vendors - NEW PERMISSIONS
	"view:vendors",
	"create:vendors",
	"edit:vendors",
	"delete:vendors",
	"manage:vendor_documents",

	// Reports
	"generate:reports",
}
