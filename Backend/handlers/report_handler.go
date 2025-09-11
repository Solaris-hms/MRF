package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/solaris-hms/mrf-backend/models"
)

func (h *Handlers) CreatePlantHeadReport(c *gin.Context) {
	var req models.PlantHeadReport
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body: " + err.Error()})
		return
	}
	userID, _ := c.Get("userID")
	req.CreatedByUserID = userID.(int)

	err := h.DB.CreatePlantHeadReport(&req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save report. A report for this date may already exist."})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"message": "Report submitted successfully"})
}

func (h *Handlers) CreateAsstPlantHeadReport(c *gin.Context) {
	var req models.AsstPlantHeadReport
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body: " + err.Error()})
		return
	}
	userID, _ := c.Get("userID")
	req.CreatedByUserID = userID.(int)

	err := h.DB.CreateAsstPlantHeadReport(&req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save report. A report for this date may already exist."})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"message": "Report submitted successfully"})
}

func (h *Handlers) CreateWorkforceMaterialReport(c *gin.Context) {
	var req models.WorkforceMaterialReport
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body: " + err.Error()})
		return
	}
	userID, _ := c.Get("userID")
	req.CreatedByUserID = userID.(int)

	err := h.DB.CreateWorkforceMaterialReport(&req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save report. A report for this date may already exist."})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"message": "Report submitted successfully"})
}
