package handlers

import (
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/solaris-hms/mrf-backend/models"
)

// CreateVendor handles creating a new vendor
func (h *Handlers) CreateVendor(c *gin.Context) {
	var req models.CreateVendorRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body: " + err.Error()})
		return
	}

	userID, _ := c.Get("userID")

	// Generate vendor ID
	vendorID := fmt.Sprintf("VEN-%s-%d", time.Now().Format("2006"), time.Now().Unix()%10000)

	vendor, err := h.DB.CreateVendor(&req, vendorID, userID.(int))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create vendor: " + err.Error()})
		return
	}

	c.JSON(http.StatusCreated, vendor)
}

// GetVendors retrieves all vendors
func (h *Handlers) GetVendors(c *gin.Context) {
	vendors, err := h.DB.GetAllVendors()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch vendors"})
		return
	}

	if vendors == nil {
		c.JSON(http.StatusOK, []models.Vendor{})
		return
	}

	c.JSON(http.StatusOK, vendors)
}

// GetVendor retrieves a single vendor by ID
func (h *Handlers) GetVendor(c *gin.Context) {
	vendorID := c.Param("id")

	vendor, err := h.DB.GetVendorByID(vendorID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Vendor not found"})
		return
	}

	c.JSON(http.StatusOK, vendor)
}

// UpdateVendor handles updating vendor information
func (h *Handlers) UpdateVendor(c *gin.Context) {
	vendorID := c.Param("id")

	var req models.UpdateVendorRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body: " + err.Error()})
		return
	}

	err := h.DB.UpdateVendor(vendorID, &req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update vendor"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Vendor updated successfully"})
}

// DeleteVendor handles vendor deletion
func (h *Handlers) DeleteVendor(c *gin.Context) {
	vendorID := c.Param("id")

	err := h.DB.DeleteVendor(vendorID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete vendor"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Vendor deleted successfully"})
}

// UploadVendorDocument handles document uploads for vendors
func (h *Handlers) UploadVendorDocument(c *gin.Context) {
	vendorID := c.Param("id")

	// Parse multipart form
	err := c.Request.ParseMultipartForm(100 << 20) // 100 MB limit
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to parse multipart form"})
		return
	}

	// Get files from form
	files := c.Request.MultipartForm.File["documents"]
	if len(files) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No files uploaded"})
		return
	}

	var uploadedDocs []models.VendorDocument

	for _, fileHeader := range files {
		// Open uploaded file
		file, err := fileHeader.Open()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not open uploaded file"})
			return
		}
		defer file.Close()

		// Generate unique filename
		ext := filepath.Ext(fileHeader.Filename)
		filename := fmt.Sprintf("vendor_%s_%d_%s%s",
			vendorID,
			time.Now().Unix(),
			strings.ReplaceAll(fileHeader.Filename[:len(fileHeader.Filename)-len(ext)], " ", "_"),
			ext)

		// Create uploads directory if it doesn't exist
		uploadsDir := "uploads/vendors"
		if err := os.MkdirAll(uploadsDir, 0755); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not create upload directory"})
			return
		}

		// Save file to disk
		dst := filepath.Join(uploadsDir, filename)
		outFile, err := os.Create(dst)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not create file on server"})
			return
		}
		defer outFile.Close()

		// Copy file content
		_, err = io.Copy(outFile, file)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not save file"})
			return
		}

		// Save document info to database
		doc := models.VendorDocument{
			VendorID:     vendorID,
			FileName:     filename,
			OriginalName: fileHeader.Filename,
			FileSize:     fileHeader.Size,
			FileType:     fileHeader.Header.Get("Content-Type"),
			FilePath:     dst,
		}

		savedDoc, err := h.DB.CreateVendorDocument(&doc)
		if err != nil {
			// Clean up file if database save fails
			os.Remove(dst)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not save document info to database"})
			return
		}

		uploadedDocs = append(uploadedDocs, *savedDoc)
	}

	c.JSON(http.StatusOK, gin.H{
		"message":   "Documents uploaded successfully",
		"documents": uploadedDocs,
	})
}

// DownloadVendorDocument handles document downloads
func (h *Handlers) DownloadVendorDocument(c *gin.Context) {
	docIDStr := c.Param("docId")
	docID, err := strconv.Atoi(docIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid document ID"})
		return
	}

	doc, err := h.DB.GetVendorDocument(docID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Document not found"})
		return
	}

	// Check if file exists
	if _, err := os.Stat(doc.FilePath); os.IsNotExist(err) {
		c.JSON(http.StatusNotFound, gin.H{"error": "File not found on server"})
		return
	}

	c.Header("Content-Disposition", fmt.Sprintf("attachment; filename=\"%s\"", doc.OriginalName))
	c.Header("Content-Type", doc.FileType)
	c.File(doc.FilePath)
}

// DeleteVendorDocument handles document deletion
func (h *Handlers) DeleteVendorDocument(c *gin.Context) {
	docIDStr := c.Param("docId")
	docID, err := strconv.Atoi(docIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid document ID"})
		return
	}

	doc, err := h.DB.GetVendorDocument(docID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Document not found"})
		return
	}

	// Delete from database
	err = h.DB.DeleteVendorDocument(docID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not delete document from database"})
		return
	}

	// Delete file from disk
	if err := os.Remove(doc.FilePath); err != nil {
		// Log the error but don't fail the request since DB deletion succeeded
		fmt.Printf("Warning: Could not delete file %s: %v\n", doc.FilePath, err)
	}

	c.JSON(http.StatusOK, gin.H{"message": "Document deleted successfully"})
}
