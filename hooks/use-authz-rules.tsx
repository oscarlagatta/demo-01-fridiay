"use client"

import { useAuth } from "../contexts/auth-context"

export const ROLES = {
  ADMIN: "Admin",
  SERVICE_RESILIENCY: "ServiceResiliency",
  E2E_PAYMENT_VIEWER: "E2EPaymentViewer",
  E2E_PAYMENT_EDITOR: "E2EPaymentEditor",
  GENERAL_USER: "GeneralUser",
} as const

export const AUTHORIZED_ROLES = [ROLES.ADMIN, ROLES.SERVICE_RESILIENCY, ROLES.E2E_PAYMENT_EDITOR]

export const MENU_OPTIONS = {
  SCORECARD: [ROLES.ADMIN, ROLES.SERVICE_RESILIENCY, ROLES.GENERAL_USER],
  E2E_PAYMENT_MENU: [ROLES.ADMIN, ROLES.E2E_PAYMENT_EDITOR, ROLES.E2E_PAYMENT_VIEWER],
} as const

export type MenuOption = keyof typeof MENU_OPTIONS
export type Application = "SCORECARD" | "E2E_PAYMENT"
export type Permission = "VIEW" | "EDIT" | "DELETE" | "ADD"

export function useAuthzRules() {
  const { userDetails } = useAuth()

  const getUserRoles = () => {
    if (!userDetails?.roleNames) return []
    return userDetails.roleNames.split(",").map((role) => role.trim())
  }

  const hasRequiredRole = () => {
    const roles = getUserRoles()
    return AUTHORIZED_ROLES.some((role) => roles.includes(role))
  }

  const hasPermission = (application: Application, permission: Permission): boolean => {
    const userRoles = getUserRoles()

    // Admin has full access to everything
    if (userRoles.includes(ROLES.ADMIN)) return true

    if (application === "SCORECARD") {
      if (permission === "VIEW") {
        return userRoles.some((role) => [ROLES.SERVICE_RESILIENCY, ROLES.GENERAL_USER].includes(role))
      }
      // Edit, Delete, Add permissions for Scorecard
      return userRoles.includes(ROLES.SERVICE_RESILIENCY)
    }

    if (application === "E2E_PAYMENT") {
      if (permission === "VIEW") {
        return userRoles.some((role) => [ROLES.E2E_PAYMENT_EDITOR, ROLES.E2E_PAYMENT_VIEWER].includes(role))
      }
      // Edit, Delete, Add permissions for E2E Payment
      return userRoles.includes(ROLES.E2E_PAYMENT_EDITOR)
    }

    return false
  }

  const canAccessMenu = (menuOption: MenuOption) => {
    const userRoles = getUserRoles()
    return MENU_OPTIONS[menuOption].some((role) => userRoles.includes(role))
  }

  // Convenience functions for specific permissions
  const canViewScorecard = () => hasPermission("SCORECARD", "VIEW")
  const canEditScorecard = () => hasPermission("SCORECARD", "EDIT")
  const canViewE2EPayment = () => hasPermission("E2E_PAYMENT", "VIEW")
  const canEditE2EPayment = () => hasPermission("E2E_PAYMENT", "EDIT")

  // Menu access shortcuts
  const canAccessScorecard = () => canAccessMenu("SCORECARD")
  const canAccessE2EPaymentMenu = () => canAccessMenu("E2E_PAYMENT_MENU")

  // Role checking shortcuts
  const isAdmin = () => getUserRoles().includes(ROLES.ADMIN)
  const isServiceResiliency = () => getUserRoles().includes(ROLES.SERVICE_RESILIENCY)
  const isGeneralUser = () => getUserRoles().includes(ROLES.GENERAL_USER)
  const isE2EPaymentEditor = () => getUserRoles().includes(ROLES.E2E_PAYMENT_EDITOR)
  const isE2EPaymentViewer = () => getUserRoles().includes(ROLES.E2E_PAYMENT_VIEWER)

  return {
    // Core functions
    hasPermission,
    hasRequiredRole,
    getUserRoles,
    canAccessMenu,

    // Application permissions
    canViewScorecard,
    canEditScorecard,
    canViewE2EPayment,
    canEditE2EPayment,

    // Menu access
    canAccessScorecard,
    canAccessE2EPaymentMenu,

    // Role checks
    isAdmin,
    isServiceResiliency,
    isGeneralUser,
    isE2EPaymentEditor,
    isE2EPaymentViewer,

    // Legacy compatibility
    canDisplayFeature: hasRequiredRole,
    canEditFeature: hasRequiredRole,
  }
}
