"use client"

import { useAuth } from "../contexts/auth-context"

export const ROLES = {
  ADMIN: "Admin",
  SERVICE_RESILIENCY: "ServiceResiliency",
  E2E_PAYMENT_VIEWER: "E2EPaymentViewer",
  E2E_PAYMENT_EDITOR: "E2EPaymentEditor",
  GENERAL_USER: "GeneralUser",
}

export const AUTHORIZED_ROLES = [ROLES.ADMIN, ROLES.SERVICE_RESILIENCY, ROLES.E2E_PAYMENT_EDITOR]

export const MENU_OPTIONS = {
  SCORECARD: {
    name: "Scorecard",
    allowedRoles: [ROLES.ADMIN, ROLES.SERVICE_RESILIENCY, ROLES.GENERAL_USER],
  },
  E2E_PAYMENT_MENU: {
    name: "E2E Payment Menu",
    allowedRoles: [ROLES.ADMIN, ROLES.E2E_PAYMENT_EDITOR, ROLES.E2E_PAYMENT_VIEWER],
  },
} as const

export type MenuOption = keyof typeof MENU_OPTIONS

export type Application = "SCORECARD" | "E2E_PAYMENT"
export type Permission = "VIEW" | "EDIT" | "DELETE" | "ADD"

export function useAuthzRules() {
  const { userDetails } = useAuth()

  const getUserRoles = () => {
    if (!userDetails || !userDetails.roleNames) {
      return []
    }
    return userDetails.roleNames.split(",").map((role) => role.trim())
  }

  const hasRequiredRole = () => {
    const roles = getUserRoles()
    return AUTHORIZED_ROLES.some((role) => roles.includes(role as (typeof AUTHORIZED_ROLES)[number]))
  }

  const hasPermission = (application: Application, permission: Permission): boolean => {
    const userRoles = getUserRoles()

    // Admin has full access to everything
    if (userRoles.includes(ROLES.ADMIN)) {
      return true
    }

    switch (application) {
      case "SCORECARD":
        switch (permission) {
          case "VIEW":
            return userRoles.some((role) => [ROLES.SERVICE_RESILIENCY, ROLES.GENERAL_USER].includes(role))
          case "EDIT":
          case "DELETE":
          case "ADD":
            return userRoles.includes(ROLES.SERVICE_RESILIENCY)
          default:
            return false
        }

      case "E2E_PAYMENT":
        switch (permission) {
          case "VIEW":
            return userRoles.some((role) => [ROLES.E2E_PAYMENT_EDITOR, ROLES.E2E_PAYMENT_VIEWER].includes(role))
          case "EDIT":
          case "DELETE":
          case "ADD":
            return userRoles.includes(ROLES.E2E_PAYMENT_EDITOR)
          default:
            return false
        }

      default:
        return false
    }
  }

  const canViewScorecard = () => hasPermission("SCORECARD", "VIEW")
  const canEditScorecard = () => hasPermission("SCORECARD", "EDIT")
  const canDeleteScorecard = () => hasPermission("SCORECARD", "DELETE")
  const canAddScorecard = () => hasPermission("SCORECARD", "ADD")

  const canViewE2EPayment = () => hasPermission("E2E_PAYMENT", "VIEW")
  const canEditE2EPayment = () => hasPermission("E2E_PAYMENT", "EDIT")
  const canDeleteE2EPayment = () => hasPermission("E2E_PAYMENT", "DELETE")
  const canAddE2EPayment = () => hasPermission("E2E_PAYMENT", "ADD")

  const canAccessMenu = (menuOption: MenuOption) => {
    const userRoles = getUserRoles()
    const allowedRoles = MENU_OPTIONS[menuOption].allowedRoles
    return allowedRoles.some((role) => userRoles.includes(role))
  }

  const canAccessScorecard = () => canAccessMenu("SCORECARD")
  const canAccessE2EPaymentMenu = () => canAccessMenu("E2E_PAYMENT_MENU")

  const canDisplayFeature = () => {
    return hasRequiredRole()
  }

  const canEditFeature = () => {
    return hasRequiredRole()
  }

  const isAdmin = () => getUserRoles().includes(ROLES.ADMIN)
  const isServiceResiliency = () => getUserRoles().includes(ROLES.SERVICE_RESILIENCY)
  const isGeneralUser = () => getUserRoles().includes(ROLES.GENERAL_USER)
  const isE2EPaymentEditor = () => getUserRoles().includes(ROLES.E2E_PAYMENT_EDITOR)
  const isE2EPaymentViewer = () => getUserRoles().includes(ROLES.E2E_PAYMENT_VIEWER)

  return {
    // Legacy functions
    canDisplayFeature,
    canEditFeature,
    hasRequiredRole,
    canAccessMenu,
    canAccessScorecard,
    canAccessE2EPaymentMenu,
    getUserRoles,

    // New permission functions
    hasPermission,

    // Scorecard permissions
    canViewScorecard,
    canEditScorecard,
    canDeleteScorecard,
    canAddScorecard,

    // E2E Payment permissions
    canViewE2EPayment,
    canEditE2EPayment,
    canDeleteE2EPayment,
    canAddE2EPayment,

    // Role checking functions
    isAdmin,
    isServiceResiliency,
    isGeneralUser,
    isE2EPaymentEditor,
    isE2EPaymentViewer,
  }
}
