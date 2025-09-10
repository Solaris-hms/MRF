package main

import (
	"log"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"github.com/solaris-hms/mrf-backend/config"
	"github.com/solaris-hms/mrf-backend/database"
	"github.com/solaris-hms/mrf-backend/handlers"
	"github.com/solaris-hms/mrf-backend/middleware"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found.")
	}
	db := database.New()
	defer db.Close()

	if err := db.SyncPermissions(config.AllPermissions); err != nil {
		log.Fatalf("Failed to sync permissions: %v", err)
	}

	jwtSecret := os.Getenv("JWT_SECRET_KEY")
	h := handlers.New(db, jwtSecret)
	r := gin.Default()

	r.MaxMultipartMemory = 100 << 20 // 100 MB

	r.Static("/uploads", "./uploads")

	// --- THIS IS THE CORS FIX ---
	// This more permissive CORS policy will work for development and production.
	corsConfig := cors.DefaultConfig()
	corsConfig.AllowOrigins = []string{"http://localhost:5173", "http://13.234.119.98", "http://mrf-management.duckdns.org", "https://mrf-management.duckdns.org"}
	corsConfig.AllowMethods = []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}
	corsConfig.AllowHeaders = []string{"Origin", "Content-Type", "Authorization"}
	r.Use(cors.New(corsConfig))

	public := r.Group("/api/auth")
	{
		public.POST("/register", h.RegisterUser)
		public.POST("/login", h.LoginUser)
	}

	admin := r.Group("/api/admin")
	admin.Use(middleware.AuthMiddleware(db), middleware.PermissionMiddleware("manage:users"))
	{
		admin.GET("/pending-users", h.GetPendingUsers)
		admin.POST("/approve/:userId", h.ApproveUser)
		admin.DELETE("/reject/:userId", h.RejectUser)
		admin.GET("/roles", h.GetAllRoles)
		admin.GET("/users", h.GetAllUsers)
		admin.PUT("/users/:userId", h.UpdateUser)
		admin.GET("/permissions", h.GetAllPermissions)
		admin.GET("/roles/:roleId/permissions", h.GetPermissionsForRole)
		admin.PUT("/roles/:roleId/permissions", h.UpdatePermissionsForRole)
	}

	ops := r.Group("/api/operations")
	ops.Use(middleware.AuthMiddleware(db))
	{
		ops.POST("/inward-entries", middleware.PermissionMiddleware("create:inward_entry"), h.CreateInwardEntry)
		ops.GET("/inward-entries/pending", middleware.PermissionMiddleware("view:inward_entries"), h.GetPendingInwardEntries)
		ops.GET("/inward-entries/completed", middleware.PermissionMiddleware("view:inward_entries"), h.GetCompletedInwardEntries)
		ops.PUT("/inward-entries/:entryId/complete", middleware.PermissionMiddleware("complete:inward_entry"), h.CompleteInwardEntry)
		ops.DELETE("/inward-entries/:entryId", middleware.PermissionMiddleware("delete:inward_entry"), h.DeleteInwardEntry)

		ops.GET("/partners", h.GetAllPartners)
		ops.POST("/partners", h.CreatePartner)

		ops.POST("/sorting-log", middleware.PermissionMiddleware("create:sorting_log"), h.CreateSortingLog)
		ops.GET("/sorting-logs", middleware.PermissionMiddleware("create:sorting_log"), h.GetSortingLogs)

		ops.GET("/inventory", h.GetInventory)
		ops.POST("/inventory/adjust", h.AdjustInventory)
		ops.GET("/inventory/audits", h.GetInventoryAudits)

		ops.GET("/cashbook", middleware.PermissionMiddleware("view:cashbook"), h.GetCashbookData)
		ops.POST("/cashbook", middleware.PermissionMiddleware("view:cashbook"), h.CreateCashbookTransaction)

		ops.GET("/sales", h.GetMaterialSales)
		ops.POST("/sales", h.CreateMaterialSale)

		ops.POST("/employees", h.CreateEmployee)
		ops.GET("/employees", h.GetEmployees)
		ops.PUT("/employees/:id", h.UpdateEmployee)
		ops.DELETE("/employees/:id", h.DeleteEmployee)

		ops.GET("/attendance", h.GetAttendance)
		ops.POST("/attendance", h.SaveAttendance)

		ops.POST("/assets", middleware.PermissionMiddleware("create:assets"), h.CreateAsset)
		ops.GET("/assets", middleware.PermissionMiddleware("view:assets"), h.GetAssets)
		ops.PUT("/assets/:id", middleware.PermissionMiddleware("edit:assets"), h.UpdateAsset)
		ops.DELETE("/assets/:id", middleware.PermissionMiddleware("delete:assets"), h.DeleteAsset)
		ops.POST("/assets/:id/image", middleware.PermissionMiddleware("edit:assets"), h.UploadAssetImage)

		ops.POST("/vendors", middleware.PermissionMiddleware("create:vendors"), h.CreateVendor)
		ops.GET("/vendors", middleware.PermissionMiddleware("view:vendors"), h.GetVendors)
		ops.GET("/vendors/:id", middleware.PermissionMiddleware("view:vendors"), h.GetVendor)
		ops.PUT("/vendors/:id", middleware.PermissionMiddleware("edit:vendors"), h.UpdateVendor)
		ops.DELETE("/vendors/:id", middleware.PermissionMiddleware("delete:vendors"), h.DeleteVendor)
		ops.POST("/vendors/:id/documents", middleware.PermissionMiddleware("manage:vendor_documents"), h.UploadVendorDocument)
		ops.GET("/vendor-documents/:docId/download", middleware.PermissionMiddleware("view:vendors"), h.DownloadVendorDocument)
		ops.DELETE("/vendor-documents/:docId", middleware.PermissionMiddleware("manage:vendor_documents"), h.DeleteVendorDocument)
	}

	log.Println("Server starting on port 8080...")
	if err := r.Run(":8080"); err != nil {
		log.Fatalf("Failed to run server: %v", err)
	}
}
