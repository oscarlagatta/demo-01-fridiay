"use client"

import { useAuth } from "../contexts/auth-context"

// Role hierarchy with inheritance (higher roles inherit lower role permissions)
export const ROLE_HIERARCHY = {
  SUPER_ADMIN: 100,
  ADMIN: 90,
  SERVICE_RESILIENCY: 70,
  E2E_PAYMENT_EDITOR: 60,
  E2E_PAYMENT_VIEWER: 50,
  GENERAL_USER: 30,
  GUEST: 10,
} as const

export type RoleName = keyof typeof ROLE_HIERARCHY
export type Permission = "VIEW" | "EDIT" | "DELETE" | "ADD" | "ADMIN"
export type ApplicationName = string

// Centralized permission configuration
interface ApplicationConfig {
  name: string
  permissions: {
    [key in Permission]?: {
      requiredRoles: RoleName[]
      minHierarchyLevel?: number
      customLogic?: (userRoles: RoleName[]) => boolean
    }
  }
  features?: {
    [featureName: string]: {
      requiredRoles: RoleName[]
      minHierarchyLevel?: number
    }
  }
}

// Configuration-driven application definitions
export const APPLICATION_CONFIG: Record<ApplicationName, ApplicationConfig> = {
  SCORECARD: {
    name: "Scorecard",
    permissions: {
      VIEW: {
        requiredRoles: ["ADMIN", "SERVICE_RESILIENCY", "GENERAL_USER"],
        minHierarchyLevel: 30,
      },
      EDIT: {
        requiredRoles: ["ADMIN", "SERVICE_RESILIENCY"],
        minHierarchyLevel: 70,
      },
      DELETE: {
        requiredRoles: ["ADMIN", "SERVICE_RESILIENCY"],
        minHierarchyLevel: 70,
      },
      ADD: {
        requiredRoles: ["ADMIN", "SERVICE_RESILIENCY"],
        minHierarchyLevel: 70,
      },
    },
    features: {
      ADVANCED_ANALYTICS: {
        requiredRoles: ["ADMIN", "SERVICE_RESILIENCY"],
        minHierarchyLevel: 70,
      },
    },
  },
  E2E_PAYMENT: {
    name: "E2E Payment Dashboard",
    permissions: {
      VIEW: {
        requiredRoles: ["ADMIN", "E2E_PAYMENT_EDITOR", "E2E_PAYMENT_VIEWER"],
        minHierarchyLevel: 50,
      },
      EDIT: {
        requiredRoles: ["ADMIN", "E2E_PAYMENT_EDITOR"],
        minHierarchyLevel: 60,
      },
      DELETE: {
        requiredRoles: ["ADMIN", "E2E_PAYMENT_EDITOR"],
        minHierarchyLevel: 60,
      },
      ADD: {
        requiredRoles: ["ADMIN", "E2E_PAYMENT_EDITOR"],
        minHierarchyLevel: 60,
      },
    },
    features: {
      REAL_TIME_MONITORING: {
        requiredRoles: ["ADMIN", "E2E_PAYMENT_EDITOR"],
        minHierarchyLevel: 60,
      },
    },
  },
  REPORTING: {
    name: "Reporting Module",
    permissions: {
      VIEW: {
        requiredRoles: ["ADMIN", "SERVICE_RESILIENCY", "E2E_PAYMENT_VIEWER", "GENERAL_USER"],
        minHierarchyLevel: 30,
      },
      EDIT: {
        requiredRoles: ["ADMIN", "SERVICE_RESILIENCY"],
        minHierarchyLevel: 70,
      },
      ADD: {
        requiredRoles: ["ADMIN", "SERVICE_RESILIENCY"],
        minHierarchyLevel: 70,
      },
    },
  },
} as const

// Menu configuration with dynamic generation
export const generateMenuConfig = () => {
  const menuConfig: Record<string, { name: string; allowedRoles: RoleName[] }> = {}

  Object.entries(APPLICATION_CONFIG).forEach(([appKey, appConfig]) => {
    const viewPermission = appConfig.permissions.VIEW
    if (viewPermission) {
      menuConfig[`${appKey}_MENU`] = {
        name: `${appConfig.name} Menu`,
        allowedRoles: viewPermission.requiredRoles,
      }
    }
  })

  return menuConfig
}

// Enhanced authorization hook with scalable architecture
export function useAuthzRulesEnhanced() {
  const { userDetails } = useAuth()

  const getUserRoles = (): RoleName[] => {
    if (!userDetails || !userDetails.roleNames) {
      return ["GUEST"]
    }
    return userDetails.roleNames.split(",").map((role) => role.trim()) as RoleName[]
  }

  const getHighestRoleLevel = (): number => {
    const userRoles = getUserRoles()
    return Math.max(...userRoles.map((role) => ROLE_HIERARCHY[role] || 0))
  }

  const hasRoleHierarchy = (minLevel: number): boolean => {
    return getHighestRoleLevel() >= minLevel
  }

  const hasPermission = (application: ApplicationName, permission: Permission, resourceId?: string): boolean => {
    const userRoles = getUserRoles()
    const appConfig = APPLICATION_CONFIG[application]

    if (!appConfig) {
      console.warn(`[v0] Application ${application} not found in configuration`)
      return false
    }

    const permissionConfig = appConfig.permissions[permission]
    if (!permissionConfig) {
      return false
    }

    // Check role-based access
    const hasRequiredRole = permissionConfig.requiredRoles.some((role) => userRoles.includes(role))

    // Check hierarchy-based access
    const hasHierarchyAccess = permissionConfig.minHierarchyLevel
      ? hasRoleHierarchy(permissionConfig.minHierarchyLevel)
      : true

    // Apply custom logic if defined
    const customLogicResult = permissionConfig.customLogic ? permissionConfig.customLogic(userRoles) : true

    return hasRequiredRole && hasHierarchyAccess && customLogicResult
  }

  const hasFeatureAccess = (application: ApplicationName, featureName: string): boolean => {
    const userRoles = getUserRoles()
    const appConfig = APPLICATION_CONFIG[application]

    if (!appConfig?.features?.[featureName]) {
      return false
    }

    const featureConfig = appConfig.features[featureName]
    const hasRequiredRole = featureConfig.requiredRoles.some((role) => userRoles.includes(role))

    const hasHierarchyAccess = featureConfig.minHierarchyLevel
      ? hasRoleHierarchy(featureConfig.minHierarchyLevel)
      : true

    return hasRequiredRole && hasHierarchyAccess
  }

  const canAccessApplication = (application: ApplicationName): boolean => {
    return hasPermission(application, "VIEW")
  }

  const getAccessibleApplications = (): ApplicationName[] => {
    return Object.keys(APPLICATION_CONFIG).filter((app) => canAccessApplication(app))
  }

  const getUserPermissions = (application: ApplicationName) => {
    const permissions: Record<Permission, boolean> = {} as any
    const appConfig = APPLICATION_CONFIG[application]

    if (appConfig) {
      Object.keys(appConfig.permissions).forEach((permission) => {
        permissions[permission as Permission] = hasPermission(application, permission as Permission)
      })
    }

    return permissions
  }

  // Validation and testing utilities
  const validateConfiguration = (): { isValid: boolean; errors: string[] } => {
    const errors: string[] = []

    Object.entries(APPLICATION_CONFIG).forEach(([appKey, appConfig]) => {
      if (!appConfig.name) {
        errors.push(`Application ${appKey} missing name`)
      }

      Object.entries(appConfig.permissions).forEach(([permission, config]) => {
        if (!config.requiredRoles || config.requiredRoles.length === 0) {
          errors.push(`${appKey}.${permission} has no required roles`)
        }
      })
    })

    return { isValid: errors.length === 0, errors }
  }

  // Legacy compatibility functions
  const canDisplayFeature = () => hasRoleHierarchy(60)
  const canEditFeature = () => hasRoleHierarchy(70)
  const hasRequiredRole = () => hasRoleHierarchy(60)

  return {
    // Core enhanced functions
    hasPermission,
    hasFeatureAccess,
    canAccessApplication,
    getAccessibleApplications,
    getUserPermissions,
    getUserRoles,
    getHighestRoleLevel,
    hasRoleHierarchy,

    // Utility functions
    validateConfiguration,

    // Legacy compatibility
    canDisplayFeature,
    canEditFeature,
    hasRequiredRole,

    // Role checking
    isAdmin: () => getUserRoles().includes("ADMIN"),
    isSuperAdmin: () => getUserRoles().includes("SUPER_ADMIN"),

    // Application-specific shortcuts (dynamically generated)
    ...Object.keys(APPLICATION_CONFIG).reduce((acc, app) => {
      const camelCaseApp = app.toLowerCase().replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
      return {
        ...acc,
        [`canView${camelCaseApp}`]: () => hasPermission(app, "VIEW"),
        [`canEdit${camelCaseApp}`]: () => hasPermission(app, "EDIT"),
        [`canDelete${camelCaseApp}`]: () => hasPermission(app, "DELETE"),
        [`canAdd${camelCaseApp}`]: () => hasPermission(app, "ADD"),
      }
    }, {}),
  }
}

// Type-safe permission checker for components
export const createPermissionChecker = <T extends ApplicationName>(application: T) => {
  return (permission: Permission) => {
    const { hasPermission } = useAuthzRulesEnhanced()
    return hasPermission(application, permission)
  }
}

// Testing utilities
export const createMockAuthzRules = (mockRoles: RoleName[]) => {
  // Mock implementation for testing
  return {
    getUserRoles: () => mockRoles,
    hasPermission: (app: ApplicationName, permission: Permission) => {
      const config = APPLICATION_CONFIG[app]?.permissions[permission]
      return config?.requiredRoles.some((role) => mockRoles.includes(role)) || false
    },
  }
}
