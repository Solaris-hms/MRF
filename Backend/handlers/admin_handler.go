package handlers

import (
	"net/http"
	"strconv"

	"github.com/solaris-hms/mrf-backend/models"

	"github.com/gin-gonic/gin"
)

func (h *Handlers) GetPendingUsers(c *gin.Context) {
	users, err := h.DB.GetPendingUsers()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve pending users"})
		return
	}
	if users == nil {
		c.JSON(http.StatusOK, []models.User{})
		return
	}
	c.JSON(http.StatusOK, users)
}

func (h *Handlers) GetAllRoles(c *gin.Context) {
	roles, err := h.DB.GetAllRoles()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve roles"})
		return
	}
	if roles == nil {
		c.JSON(http.StatusOK, []models.Role{})
		return
	}
	c.JSON(http.StatusOK, roles)
}

func (h *Handlers) GetAllUsers(c *gin.Context) {
	users, err := h.DB.GetAllUsers()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve users"})
		return
	}
	if users == nil {
		c.JSON(http.StatusOK, []models.User{})
		return
	}
	c.JSON(http.StatusOK, users)
}

func (h *Handlers) UpdateUser(c *gin.Context) {
	userIDStr := c.Param("userId")
	userID, err := strconv.Atoi(userIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	var req models.UpdateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body: " + err.Error()})
		return
	}

	err = h.DB.UpdateUser(userID, &req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update user"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "User updated successfully"})
}

func (h *Handlers) ApproveUser(c *gin.Context) {
	userIDStr := c.Param("userId")
	userID, err := strconv.Atoi(userIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	var req models.ApprovalRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body, role_id is required"})
		return
	}

	err = h.DB.ApproveUserInDB(userID, req.RoleID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to approve user: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "User approved successfully"})
}

func (h *Handlers) RejectUser(c *gin.Context) {
	userIDStr := c.Param("userId")
	userID, err := strconv.Atoi(userIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	err = h.DB.DeleteUser(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to reject user"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "User request rejected successfully"})
}

func (h *Handlers) GetAllPermissions(c *gin.Context) {
	permissions, err := h.DB.GetAllPermissions()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve permissions"})
		return
	}
	c.JSON(http.StatusOK, permissions)
}

func (h *Handlers) GetPermissionsForRole(c *gin.Context) {
	roleIDStr := c.Param("roleId")
	roleID, err := strconv.Atoi(roleIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid role ID"})
		return
	}

	permissionIDs, err := h.DB.GetPermissionsForRole(roleID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve role permissions"})
		return
	}
	c.JSON(http.StatusOK, permissionIDs)
}

func (h *Handlers) UpdatePermissionsForRole(c *gin.Context) {
	roleIDStr := c.Param("roleId")
	roleID, err := strconv.Atoi(roleIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid role ID"})
		return
	}

	var req models.UpdatePermissionsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body: " + err.Error()})
		return
	}

	err = h.DB.UpdatePermissionsForRole(roleID, req.PermissionIDs)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update role permissions"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Permissions updated successfully"})
}
