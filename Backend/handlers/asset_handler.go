package handlers

import (
	"bytes"
	"fmt"
	"image"
	"image/jpeg"
	_ "image/png" // --- THIS IS THE FIX ---
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/nfnt/resize"
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

func (h *Handlers) UploadAssetImage(c *gin.Context) {
	const MAX_UPLOAD_SIZE = 100 * 1024 * 1024 // 100 MB

	fileHeader, err := c.FormFile("image")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Image upload failed: " + err.Error()})
		return
	}

	// 1. Validate file size
	if fileHeader.Size > MAX_UPLOAD_SIZE {
		c.JSON(http.StatusRequestEntityTooLarge, gin.H{"error": "File is too large. Maximum size is 100MB."})
		return
	}

	// 2. Open the uploaded file
	file, err := fileHeader.Open()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not open uploaded file."})
		return
	}
	defer file.Close()

	// 3. Decode the image
	img, _, err := image.Decode(file)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid image format. Only JPEG and PNG are supported."})
		return
	}

	// 4. Resize and compress the image
	resizedImg := resize.Thumbnail(1920, 1080, img, resize.Lanczos3)

	buf := new(bytes.Buffer)

	err = jpeg.Encode(buf, resizedImg, &jpeg.Options{Quality: 75})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to compress image."})
		return
	}

	// 5. Save the new, compressed image
	originalFilename := strings.TrimSuffix(fileHeader.Filename, filepath.Ext(fileHeader.Filename))
	newFilename := fmt.Sprintf("asset_%s_%s.jpg", c.Param("id"), originalFilename)
	dst := filepath.Join("uploads", newFilename)

	outFile, err := os.Create(dst)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create image file on server."})
		return
	}
	defer outFile.Close()

	_, err = outFile.Write(buf.Bytes())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save compressed image."})
		return
	}

	// 6. Return the URL to the frontend
	imageURL := "/uploads/" + newFilename
	c.JSON(http.StatusOK, gin.H{"imageUrl": imageURL})
}
