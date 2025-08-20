// Backend/handlers/asset_handler.go

package handlers

import (
	"fmt"
	_ "image/png"
	"io" // Import the 'io' package
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/solaris-hms/mrf-backend/models"
)

// --- Asset Handlers ---

func (h *Handlers) CreateAsset(c *gin.Context) {
	var req models.Asset
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body: " + err.Error()})
		return
	}

	asset, err := h.DB.CreateAsset(&req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create asset"})
		return
	}

	c.JSON(http.StatusCreated, asset)
}

func (h *Handlers) GetAssets(c *gin.Context) {
	assets, err := h.DB.GetAllAssets()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch assets"})
		return
	}
	if assets == nil {
		c.JSON(http.StatusOK, []models.Asset{})
		return
	}
	c.JSON(http.StatusOK, assets)
}

func (h *Handlers) UpdateAsset(c *gin.Context) {
	assetID := c.Param("id")
	var req models.Asset
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}
	req.ID = assetID

	err := h.DB.UpdateAsset(&req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update asset"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Asset updated successfully"})
}

func (h *Handlers) DeleteAsset(c *gin.Context) {
	assetID := c.Param("id")
	err := h.DB.DeleteAsset(assetID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete asset"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Asset deleted successfully"})
}

// --- THIS FUNCTION IS NOW FIXED TO PREVENT CRASHES ---
func (h *Handlers) UploadAssetImage(c *gin.Context) {
	const MAX_UPLOAD_SIZE = 100 * 1024 * 1024 // 100 MB

	fileHeader, err := c.FormFile("image")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Image upload failed: " + err.Error()})
		return
	}

	if fileHeader.Size > MAX_UPLOAD_SIZE {
		c.JSON(http.StatusRequestEntityTooLarge, gin.H{"error": "File is too large. Maximum size is 100MB."})
		return
	}

	// Open the uploaded file
	file, err := fileHeader.Open()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not open uploaded file."})
		return
	}
	defer file.Close()

	// --- SIMPLIFIED SAVE LOGIC ---
	// We no longer decode, resize, and re-encode. We just save the file directly.

	// 1. Create a unique filename
	extension := filepath.Ext(fileHeader.Filename)
	originalFilename := strings.TrimSuffix(fileHeader.Filename, extension)
	newFilename := fmt.Sprintf("asset_%s_%s%s", c.Param("id"), originalFilename, extension)
	dst := filepath.Join("uploads", newFilename)

	// 2. Create a new file on the server
	outFile, err := os.Create(dst)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create image file on server."})
		return
	}
	defer outFile.Close()

	// 3. Copy the uploaded file's content to the new file
	_, err = io.Copy(outFile, file)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save image."})
		return
	}

	// 4. Return the URL
	imageURL := "/uploads/" + newFilename
	c.JSON(http.StatusOK, gin.H{"imageUrl": imageURL})
}
