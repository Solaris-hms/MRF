// Backend/config/permissions.go

package config

// AllPermissions defines the complete list of permissions used in the application.
// This is the single source of truth.
var AllPermissions = []string{
	// User Management
	"manage:users",
	"approve:users", // <-- ADD THIS
	"manage:roles",  // <-- ADD THIS

	// Dashboard
	"view:dashboard",

	// Cashbook & Sales
	"view:cashbook",

	// Inward Entries
	"create:inward_entry",
	"view:inward_entries",
	"complete:inward_entry",
	"log:inbound_material", // <-- ADD THIS

	// Sorting
	"create:sorting_log",
	"log:sorted_bale", // <-- ADD THIS

	// Assets
	"view:assets",
	"create:assets",
	"edit:assets",
	"delete:assets",

	// Reports (example, add if you need it)
	"generate:reports", // <-- ADD THIS
}
