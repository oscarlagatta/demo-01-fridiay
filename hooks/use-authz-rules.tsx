"use client"

import { useAuth } from "../contexts/auth-context"

export const ROLES = {
  ADMIN: "Admin",
  SERVICE_RESILIENCY: "ServiceResiliency",
  E2E_PAYMENT_VIEWER: "E2EPaymentViewer",
  E2E_PAYMENT_EDITOR: "E2EPaymentEditor",
}
export const AUTHORIZED_ROLES = [ROLES.ADMIN, ROLES.SERVICE_RESILIENCY, ROLES.E2E_PAYMENT_EDITOR]

export function useAuthzRules() {
  const { userDetails } = useAuth()

  const hasRequiredRole = () => {
    if (!userDetails || !userDetails.roleNames) {
      return false
    }
    const roles = userDetails.roleNames.split(",").map((role) => role.trim())
    return AUTHORIZED_ROLES.some((role) => roles.includes(role as (typeof AUTHORIZED_ROLES)[number]))
  }

  const canDisplayFeature = () => {
    return hasRequiredRole()
  }

  const canEditFeature = () => {
    return hasRequiredRole()
  }

  return { canDisplayFeature, canEditFeature, hasRequiredRole }
}
