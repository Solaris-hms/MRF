package config

// AllPermissions defines the complete list of permissions used in the application.
// This is the single source of truth.
var AllPermissions = []string{
	// User Management
	"manage:users",

	// Dashboard
	"view:dashboard",

	// Cashbook & Sales
	"view:cashbook",

	// Inward Entries
	"create:inward_entry",
	"view:inward_entries",
	"complete:inward_entry",

	// Sorting
	"create:sorting_log",

	// Assets
	"view:assets",
	"create:assets",
	"edit:assets",
	"delete:assets",

	// Add any new permissions here in the future
}
