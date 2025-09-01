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
    allowedRoles: [ROLES.E2E_PAYMENT_EDITOR, ROLES.E2E_PAYMENT_VIEWER],
  },
} as const

export type MenuOption = keyof typeof MENU_OPTIONS

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

  return {
    canDisplayFeature,
    canEditFeature,
    hasRequiredRole,
    canAccessMenu,
    canAccessScorecard,
    canAccessE2EPaymentMenu,
    getUserRoles,
  }
}
