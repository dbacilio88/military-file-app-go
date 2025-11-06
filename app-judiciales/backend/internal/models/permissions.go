package models

// Permission represents a specific permission in the system
type Permission string

// System permissions
const (
	// User management permissions
	PermissionUserCreate Permission = "user:create"
	PermissionUserRead   Permission = "user:read"
	PermissionUserUpdate Permission = "user:update"
	PermissionUserDelete Permission = "user:delete"
	PermissionUserManage Permission = "user:manage" // Full user management

	// Profile permissions
	PermissionProfileRead   Permission = "profile:read"
	PermissionProfileCreate Permission = "profile:create"
	PermissionProfileUpdate Permission = "profile:update"
	PermissionProfileDelete Permission = "profile:delete"
	PermissionProfileWrite  Permission = "profile:write" // Backward compatibility

	// Expediente permissions
	PermissionExpedienteCreate Permission = "expediente:create"
	PermissionExpedienteRead   Permission = "expediente:read"
	PermissionExpedienteUpdate Permission = "expediente:update"
	PermissionExpedienteDelete Permission = "expediente:delete"
	PermissionExpedienteManage Permission = "expediente:manage" // Full expediente management

	// System permissions
	PermissionSystemAdmin Permission = "system:admin"
	PermissionSystemRead  Permission = "system:read"

	// Dashboard permissions
	PermissionDashboardView   Permission = "dashboard:view"
	PermissionDashboardStats  Permission = "dashboard:stats"
	PermissionDashboardExport Permission = "dashboard:export"
)

// RolePermissions maps roles to their permissions
var RolePermissions = map[string][]Permission{
	"administrador": {
		PermissionUserManage,
		PermissionProfileRead,
		PermissionProfileCreate,
		PermissionProfileUpdate,
		PermissionProfileDelete,
		PermissionProfileWrite, // Backward compatibility
		PermissionExpedienteManage,
		PermissionSystemAdmin,
		PermissionSystemRead,
		PermissionDashboardView,
		PermissionDashboardStats,
		PermissionDashboardExport,
	},
	"juez": {
		PermissionUserRead,
		PermissionProfileRead,
		PermissionExpedienteRead,
		PermissionExpedienteUpdate,
		PermissionSystemRead,
		PermissionDashboardView,
		PermissionDashboardStats,
	},
	"secretario": {
		PermissionUserRead,
		PermissionProfileRead,
		PermissionExpedienteCreate,
		PermissionExpedienteRead,
		PermissionExpedienteUpdate,
		PermissionSystemRead,
		PermissionDashboardView,
		PermissionDashboardStats,
	},
	"abogado": {
		PermissionProfileRead,
		PermissionExpedienteRead,
		PermissionSystemRead,
		PermissionDashboardView,
	},
}

// HasPermission checks if a user with given roles has a specific permission
func HasPermission(userRoles []string, requiredPermission Permission) bool {
	for _, role := range userRoles {
		if hasRolePermission(role, requiredPermission) {
			return true
		}
	}
	return false
}

// hasRolePermission checks if a specific role has the required permission
func hasRolePermission(role string, requiredPermission Permission) bool {
	permissions, exists := RolePermissions[role]
	if !exists {
		return false
	}

	for _, permission := range permissions {
		if permission == requiredPermission {
			return true
		}
		if hasWildcardPermission(permission, requiredPermission) {
			return true
		}
	}
	return false
}

// hasWildcardPermission checks for wildcard permissions (manage includes all operations)
func hasWildcardPermission(permission, requiredPermission Permission) bool {
	if permission == PermissionUserManage {
		return isUserPermission(requiredPermission)
	}
	if permission == PermissionExpedienteManage {
		return isExpedientePermission(requiredPermission)
	}
	return false
}

// isUserPermission checks if permission is a user-related permission
func isUserPermission(permission Permission) bool {
	return permission == PermissionUserCreate ||
		permission == PermissionUserRead ||
		permission == PermissionUserUpdate ||
		permission == PermissionUserDelete
}

// isExpedientePermission checks if permission is an expediente-related permission
func isExpedientePermission(permission Permission) bool {
	return permission == PermissionExpedienteCreate ||
		permission == PermissionExpedienteRead ||
		permission == PermissionExpedienteUpdate ||
		permission == PermissionExpedienteDelete
}

// HasAnyRole checks if a user has any of the required roles
func HasAnyRole(userRoles []string, requiredRoles []string) bool {
	for _, userRole := range userRoles {
		for _, requiredRole := range requiredRoles {
			if userRole == requiredRole {
				return true
			}
		}
	}
	return false
}

// GetUserPermissions returns all permissions for the given roles
func GetUserPermissions(userRoles []string) []Permission {
	permissionSet := make(map[Permission]bool)

	for _, role := range userRoles {
		if permissions, exists := RolePermissions[role]; exists {
			for _, permission := range permissions {
				permissionSet[permission] = true
			}
		}
	}

	var result []Permission
	for permission := range permissionSet {
		result = append(result, permission)
	}

	return result
}

// AddRolePermissions allows adding a new role with permissions dynamically
func AddRolePermissions(role string, permissions []Permission) {
	RolePermissions[role] = permissions
}

// ValidRoles returns all currently valid roles
func ValidRoles() []string {
	var roles []string
	for role := range RolePermissions {
		roles = append(roles, role)
	}
	return roles
}

// IsValidRole checks if a role is valid
func IsValidRole(role string) bool {
	_, exists := RolePermissions[role]
	return exists
}

// ValidPermissions returns all valid permissions
func ValidPermissions() []Permission {
	return []Permission{
		// User permissions
		PermissionUserCreate,
		PermissionUserRead,
		PermissionUserUpdate,
		PermissionUserDelete,
		PermissionUserManage,

		// Profile permissions
		PermissionProfileRead,
		PermissionProfileCreate,
		PermissionProfileUpdate,
		PermissionProfileDelete,
		PermissionProfileWrite,

		// Expediente permissions
		PermissionExpedienteCreate,
		PermissionExpedienteRead,
		PermissionExpedienteUpdate,
		PermissionExpedienteDelete,
		PermissionExpedienteManage,

		// System permissions
		PermissionSystemAdmin,
		PermissionSystemRead,

		// Dashboard permissions
		PermissionDashboardView,
		PermissionDashboardStats,
		PermissionDashboardExport,
	}
}

// IsValidPermission checks if a permission is valid
func IsValidPermission(permission Permission) bool {
	validPerms := ValidPermissions()
	for _, validPerm := range validPerms {
		if permission == validPerm {
			return true
		}
	}
	return false
}

// ValidatePermissions validates a list of permissions
func ValidatePermissions(permissions []Permission) ([]Permission, []Permission) {
	var valid []Permission
	var invalid []Permission

	for _, perm := range permissions {
		if IsValidPermission(perm) {
			valid = append(valid, perm)
		} else {
			invalid = append(invalid, perm)
		}
	}

	return valid, invalid
}

// FilterValidPermissions returns only valid permissions from a list
func FilterValidPermissions(permissions []Permission) []Permission {
	valid, _ := ValidatePermissions(permissions)
	return valid
}
