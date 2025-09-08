# Enhanced Authorization Architecture Guide

## Overview
The enhanced authorization system provides a scalable, configuration-driven approach to managing roles and permissions across multiple applications.

## Key Features

### 1. **Scalability**
- **Configuration-driven**: Add new applications by updating `APPLICATION_CONFIG`
- **Dynamic menu generation**: Menus are automatically generated from application configurations
- **Type-safe interfaces**: Full TypeScript support with compile-time validation

### 2. **Complexity Management**
- **Centralized configuration**: All permissions defined in one place
- **Rule engine**: Consistent permission evaluation across all applications
- **Hierarchical roles**: Higher roles automatically inherit lower role permissions

### 3. **Role Hierarchies**
\`\`\`typescript
SUPER_ADMIN (100) > ADMIN (90) > SERVICE_RESILIENCY (70) > E2E_PAYMENT_EDITOR (60) > ...
\`\`\`

### 4. **Centralized Configuration**
\`\`\`typescript
const APPLICATION_CONFIG = {
  NEW_APP: {
    name: "New Application",
    permissions: {
      VIEW: { requiredRoles: ["ADMIN", "GENERAL_USER"], minHierarchyLevel: 30 },
      EDIT: { requiredRoles: ["ADMIN"], minHierarchyLevel: 90 }
    }
  }
}
\`\`\`

### 5. **Testing and Validation**
- **Configuration validation**: `validateConfiguration()` checks for errors
- **Mock utilities**: `createMockAuthzRules()` for unit testing
- **Type safety**: Compile-time checks prevent configuration errors

## Usage Examples

### Basic Permission Checking
\`\`\`typescript
const { hasPermission } = useAuthzRulesEnhanced()
const canEdit = hasPermission("SCORECARD", "EDIT")
\`\`\`

### Feature Access Control
\`\`\`typescript
const { hasFeatureAccess } = useAuthzRulesEnhanced()
const canUseAdvancedAnalytics = hasFeatureAccess("SCORECARD", "ADVANCED_ANALYTICS")
\`\`\`

### Application-Specific Shortcuts
\`\`\`typescript
const { canViewScorecard, canEditE2ePayment } = useAuthzRulesEnhanced()
\`\`\`

## Migration Strategy
1. **Phase 1**: Deploy enhanced system alongside existing system
2. **Phase 2**: Gradually migrate components to use enhanced functions
3. **Phase 3**: Remove legacy functions once migration is complete

## Best Practices
- Always validate configuration in development
- Use type-safe permission checkers in components
- Implement comprehensive unit tests for all role combinations
- Monitor permission checks in production for performance
