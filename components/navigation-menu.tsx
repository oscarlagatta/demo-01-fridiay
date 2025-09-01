import { useFeatureFlags } from "@bofa/feature-flags"
import { useAuthzRules } from "../hooks/use-authz-rules"

export const menuItems = [
  {
    id: "e2e-payment-monitor",
    title: "E2E Payment Monitor",
    feature: "e2e-payment-monitor",
    requiresRole: "e2e-payment" as const,
  },
  {
    id: "dashboard",
    title: "Scorecard",
    feature: "dashboard",
    requiresRole: "scorecard" as const,
  },
  {
    id: "capacity-exception-tracker",
    title: "Capacity Exception Tracker",
    feature: "capacity-exception-tracker",
    requiresRole: null,
  },
]

const NavItem = ({ title, href }: { title: string; href: string }) => <a href={href}>{title}</a>

export default function NavigationMenu() {
  const { isFeatureEnabled } = useFeatureFlags()
  const { canAccessScorecard, canAccessE2EPaymentMenu } = useAuthzRules()

  const canAccessMenuItem = (item: (typeof menuItems)[0]) => {
    if (item.requiresRole === "scorecard") {
      return canAccessScorecard()
    }
    if (item.requiresRole === "e2e-payment") {
      return canAccessE2EPaymentMenu()
    }
    // No role requirement - accessible to all users
    return true
  }

  return (
    <nav>
      <ul>
        {menuItems.map((item) => {
          const hasFeatureAccess = isFeatureEnabled(item.feature)
          const hasRoleAccess = canAccessMenuItem(item)

          if (hasFeatureAccess && hasRoleAccess) {
            return (
              <li key={item.id}>
                <NavItem title={item.title} href={`/${item.feature}`} />
              </li>
            )
          }
          return null
        })}
      </ul>
    </nav>
  )
}
