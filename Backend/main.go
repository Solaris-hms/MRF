package main

import (
	"log" // --- NEW IMPORT ---
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"github.com/solaris-hms/mrf-backend/database"
	"github.com/solaris-hms/mrf-backend/handlers"
	"github.com/solaris-hms/mrf-backend/middleware"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found")
	}
	db := database.New()
	defer db.Close()
	jwtSecret := os.Getenv("JWT_SECRET_KEY")
	h := handlers.New(db, jwtSecret)
	r := gin.Default()

	// --- THIS IS THE FIX ---
	// Set the max multipart memory to 100 MB. This needs to be done before setting up routes.
	// 100 << 20 is equivalent to 100 * 1024 * 1024 (100 MB).
	r.MaxMultipartMemory = 100 << 20

	r.Static("/uploads", "./uploads")

	config := cors.DefaultConfig()
	config.AllowOrigins = []string{"http://localhost:5173"}
	config.AllowMethods = []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}
	config.AllowHeaders = []string{"Origin", "Content-Type", "Authorization"}
	r.Use(cors.New(config))

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

		ops.GET("/partners", h.GetAllPartners)
		ops.POST("/partners", h.CreatePartner)

		ops.POST("/sorting-log", middleware.PermissionMiddleware("create:sorting_log"), h.CreateSortingLog)
		ops.GET("/sorting-logs", middleware.PermissionMiddleware("create:sorting_log"), h.GetSortingLogs)

		ops.GET("/inventory", h.GetInventory)

		ops.GET("/cashbook", middleware.PermissionMiddleware("view:cashbook"), h.GetCashbookData)
		ops.POST("/cashbook", middleware.PermissionMiddleware("view:cashbook"), h.CreateCashbookTransaction)

		ops.GET("/sales", h.GetMaterialSales)
		ops.POST("/sales", h.CreateMaterialSale)

		// --- NEW EMPLOYEE AND ATTENDANCE ROUTES ---
		ops.POST("/employees", h.CreateEmployee)
		ops.GET("/employees", h.GetEmployees)
		ops.PUT("/employees/:id", h.UpdateEmployee)
		ops.DELETE("/employees/:id", h.DeleteEmployee)
		ops.GET("/attendance", h.GetAttendance)
		ops.POST("/attendance", h.SaveAttendance)
		ops.POST("/assets", h.CreateAsset)
		ops.GET("/assets", h.GetAssets)
		ops.PUT("/assets/:id", h.UpdateAsset)
		ops.DELETE("/assets/:id", h.DeleteAsset)
		ops.POST("/assets/:id/image", h.UploadAssetImage)
	}

	log.Println("Server starting on port 8080...")
	if err := r.Run(":8080"); err != nil {
		log.Fatalf("Failed to run server: %v", err)
	}
}
