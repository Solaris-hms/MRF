package handlers

import (
	"net/http"
	"strconv"

	"github.com/solaris-hms/mrf-backend/models"

	"github.com/gin-gonic/gin"
)

// Inward Entry Handlers
func (h *Handlers) CreateInwardEntry(c *gin.Context) {
	var req models.CreateInwardEntryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body: " + err.Error()})
		return
	}
	userID, _ := c.Get("userID")
	entry, err := h.DB.CreateInwardEntry(&req, userID.(int))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create entry"})
		return
	}
	c.JSON(http.StatusCreated, entry)
}

func (h *Handlers) GetPendingInwardEntries(c *gin.Context) {
	entries, err := h.DB.GetPendingInwardEntries()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch pending entries"})
		return
	}
	if entries == nil {
		c.JSON(http.StatusOK, []models.InwardEntry{})
		return
	}
	c.JSON(http.StatusOK, entries)
}

func (h *Handlers) GetCompletedInwardEntries(c *gin.Context) {
	entries, err := h.DB.GetCompletedInwardEntries()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch completed entries"})
		return
	}
	if entries == nil {
		c.JSON(http.StatusOK, []models.InwardEntry{})
		return
	}
	c.JSON(http.StatusOK, entries)
}

func (h *Handlers) CompleteInwardEntry(c *gin.Context) {
	entryIDStr := c.Param("entryId")
	entryID, _ := strconv.Atoi(entryIDStr)
	var req models.CompleteInwardEntryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}
	_, err := h.DB.CompleteInwardEntry(entryID, &req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to complete entry"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Entry completed successfully"})
}

// Partner Handlers
func (h *Handlers) GetAllPartners(c *gin.Context) {
	partners, err := h.DB.GetAllPartners()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch partners"})
		return
	}
	if partners == nil {
		c.JSON(http.StatusOK, []models.Partner{})
		return
	}
	c.JSON(http.StatusOK, partners)
}

func (h *Handlers) CreatePartner(c *gin.Context) {
	var req struct {
		Name string `json:"name" binding:"required"`
		Type string `json:"type" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}
	partner, err := h.DB.CreatePartner(req.Name, req.Type)
	if err != nil {
		c.JSON(http.StatusConflict, gin.H{"error": "Partner already exists"})
		return
	}
	c.JSON(http.StatusCreated, partner)
}

// Sorting Log Handlers
func (h *Handlers) CreateSortingLog(c *gin.Context) {
	var req models.CreateSortingLogRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body: " + err.Error()})
		return
	}
	userID, _ := c.Get("userID")
	err := h.DB.CreateSortingLog(&req, userID.(int))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save sorting log."})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Sorting log saved successfully"})
}

func (h *Handlers) GetSortingLogs(c *gin.Context) {
	logs, err := h.DB.GetSortingLogs()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch sorting logs"})
		return
	}
	if logs == nil {
		c.JSON(http.StatusOK, []models.SortingLog{})
		return
	}
	c.JSON(http.StatusOK, logs)
}

// Inventory Handler
func (h *Handlers) GetInventory(c *gin.Context) {
	items, err := h.DB.GetInventory()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch inventory"})
		return
	}
	if items == nil {
		c.JSON(http.StatusOK, []models.InventoryItem{})
		return
	}
	c.JSON(http.StatusOK, items)
}

// Cashbook Handlers
func (h *Handlers) GetCashbookData(c *gin.Context) {
	date := c.Query("date")
	if date == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Date query parameter is required"})
		return
	}
	openingBalance, err := h.DB.GetOpeningBalance(date)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get opening balance"})
		return
	}
	transactions, err := h.DB.GetTransactionsByDate(date)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get transactions"})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"openingBalance": openingBalance,
		"transactions":   transactions,
	})
}

func (h *Handlers) CreateCashbookTransaction(c *gin.Context) {
	var req models.CreateCashbookTransactionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body: " + err.Error()})
		return
	}
	userID, _ := c.Get("userID")
	_, err := h.DB.CreateCashbookTransaction(&req, userID.(int))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create transaction"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"message": "Transaction created successfully"})
}

// Material Sale Handlers
func (h *Handlers) CreateMaterialSale(c *gin.Context) {
	var req models.CreateMaterialSaleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body: " + err.Error()})
		return
	}

	userID, _ := c.Get("userID")
	req.CreatedByUserID = userID.(int)

	sale, err := h.DB.CreateMaterialSale(&req, req.CreatedByUserID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create material sale"})
		return
	}

	c.JSON(http.StatusCreated, sale)
}

func (h *Handlers) GetMaterialSales(c *gin.Context) {
	sales, err := h.DB.GetMaterialSales()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch material sales"})
		return
	}
	if sales == nil {
		c.JSON(http.StatusOK, []models.MaterialSale{})
		return
	}
	c.JSON(http.StatusOK, sales)
}
func (h *Handlers) DeleteInwardEntry(c *gin.Context) {
	entryIDStr := c.Param("entryId")
	entryID, err := strconv.Atoi(entryIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid entry ID"})
		return
	}

	err = h.DB.DeleteInwardEntry(entryID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete entry"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Entry deleted successfully"})
}
