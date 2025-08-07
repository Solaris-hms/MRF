package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/solaris-hms/mrf-backend/models"
)

// --- Employee Handlers ---

func (h *Handlers) CreateEmployee(c *gin.Context) {
	var req models.Employee
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	employee, err := h.DB.CreateEmployee(&req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create employee"})
		return
	}

	c.JSON(http.StatusCreated, employee)
}

func (h *Handlers) GetEmployees(c *gin.Context) {
	employees, err := h.DB.GetAllActiveEmployees()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch employees"})
		return
	}
	if employees == nil {
		c.JSON(http.StatusOK, []models.Employee{})
		return
	}
	c.JSON(http.StatusOK, employees)
}

func (h *Handlers) UpdateEmployee(c *gin.Context) {
	employeeID, _ := strconv.Atoi(c.Param("id"))
	var req models.Employee
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	err := h.DB.UpdateEmployee(employeeID, &req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update employee"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Employee updated successfully"})
}

func (h *Handlers) DeleteEmployee(c *gin.Context) {
	employeeID, _ := strconv.Atoi(c.Param("id"))
	err := h.DB.DeactivateEmployee(employeeID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete employee"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Employee deactivated successfully"})
}

// --- Attendance Handlers ---

func (h *Handlers) GetAttendance(c *gin.Context) {
	month := c.Query("month") // YYYY-MM format
	if month == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Month query parameter is required"})
		return
	}

	records, err := h.DB.GetMonthlyAttendance(month)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch attendance records"})
		return
	}
	if records == nil {
		c.JSON(http.StatusOK, make(map[string]map[int]string))
		return
	}

	c.JSON(http.StatusOK, records)
}

func (h *Handlers) SaveAttendance(c *gin.Context) {
	var req models.SaveAttendanceRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	userID, _ := c.Get("userID")

	err := h.DB.SaveMonthlyAttendance(req.Date, req.Records, userID.(int))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save attendance"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Attendance saved successfully"})
}
