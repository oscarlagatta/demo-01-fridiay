# Context Architecture Implementation Strategy

## 1. Context Strategy Overview

### Current State Analysis
- **Hard Dependencies**: Components directly import `useTransactionSearchContext`
- **Tight Coupling**: Context-specific logic embedded in components
- **Limited Flexibility**: Cannot switch between different regional contexts
- **Maintenance Issues**: Changes require modifying multiple files

### New Architecture Goals
- **Loose Coupling**: Components accept contexts as props
- **Dynamic Switching**: Runtime context selection based on region/user preferences
- **Extensibility**: Easy addition of new regional contexts
- **Backward Compatibility**: Existing components continue to work unchanged

### Core Architectural Patterns

#### 1. Base Context Pattern
\`\`\`typescript
interface BaseSearchContext {
  // Generic search operations
  searchParams: SearchParams
  isLoading: boolean
  results: any[]
  search: (params: SearchParams) => void
  clear: () => void
}

interface BaseUIContext {
  // Generic UI state
  showTable: boolean
  selectedId: string | null
  setShowTable: (show: boolean) => void
  setSelectedId: (id: string | null) => void
}
\`\`\`

#### 2. Context Extension Pattern
\`\`\`typescript
interface UsWiresContext extends BaseSearchContext, BaseUIContext {
  // US-specific extensions
  formatCurrency: (amount: number) => string
  validateRoutingNumber: (routing: string) => boolean
  getComplianceRules: () => ComplianceRule[]
}

interface IndiaContext extends BaseSearchContext, BaseUIContext {
  // India-specific extensions
  formatCurrency: (amount: number) => string
  validateIFSC: (ifsc: string) => boolean
  getRBIRules: () => RBIRule[]
}
\`\`\`

#### 3. Adapter Pattern
\`\`\`typescript
interface ITableAdapter<T = any> {
  formatCurrency: (amount: number) => string
  getColumnDefinitions: () => ColDef[]
  transformData: (data: any[]) => T[]
  getRowId: (data: T) => string
}
\`\`\`

## 2. Component Modifications

### AG Grid Component Refactoring

#### Current Issues
- Direct dependency on `useTransactionSearchContext`
- Hard-coded US Wires formatting logic
- Mixed responsibilities (UI + data transformation)
- Cannot be reused with different contexts

#### Proposed Solution
\`\`\`typescript
interface FlexibleAGGridProps<T = any> {
  contextHook: () => any  // Any context hook
  adapter: ITableAdapter<T>  // Data transformation adapter
  config?: TableConfig  // Optional configuration
  className?: string
}

function FlexibleAGGrid<T>({ 
  contextHook, 
  adapter, 
  config,
  ...props 
}: FlexibleAGGridProps<T>) {
  const context = contextHook()
  const transformedData = adapter.transformData(context.results)
  const columns = adapter.getColumnDefinitions()
  
  // Generic AG Grid implementation
}
\`\`\`

#### Migration Strategy
1. **Phase 1**: Create flexible component alongside existing one
2. **Phase 2**: Update existing component to use flexible version internally
3. **Phase 3**: Gradually migrate consumers to new API
4. **Phase 4**: Remove legacy implementation

### Context-Specific Logic Handling

#### Separation of Concerns
\`\`\`typescript
// Business Logic Layer
class UsWiresBusinessLogic {
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }
  
  validateTransaction(transaction: Transaction): ValidationResult {
    // US-specific validation rules
  }
}

// Adapter Layer
class UsWiresTableAdapter implements ITableAdapter {
  constructor(private businessLogic: UsWiresBusinessLogic) {}
  
  formatCurrency = this.businessLogic.formatCurrency
  
  getColumnDefinitions(): ColDef[] {
    return [
      { field: 'amount', valueFormatter: this.formatCurrency },
      { field: 'routingNumber', cellRenderer: 'routingRenderer' }
      // US-specific columns
    ]
  }
}
\`\`\`

## 3. File Changes Required

### New Files to Create
\`\`\`
contexts/
├── base-search-context.tsx          # Generic search operations
├── base-ui-context.tsx              # Generic UI state management
├── transaction-search-contexts.tsx  # Specific context implementations
├── context-switcher.tsx             # Dynamic context switching
└── context-types.ts                 # TypeScript interfaces

adapters/
├── table-adapter-interface.ts       # ITableAdapter definition
├── us-wires-table-adapter.ts        # US Wires specific adapter
├── india-table-adapter.ts           # India specific adapter
└── generic-table-adapter.ts         # Fallback generic adapter

components/
├── flexible-ag-grid.tsx             # New context-agnostic component
└── context-aware-wrapper.tsx        # HOC for context injection

business-logic/
├── us-wires-business-logic.ts       # US-specific business rules
├── india-business-logic.ts          # India-specific business rules
└── base-business-logic.ts           # Shared business logic

types/
├── transaction-types.ts             # Shared transaction interfaces
├── context-types.ts                 # Context-related types
└── adapter-types.ts                 # Adapter-related types

utils/
├── context-factory.ts               # Context creation utilities
└── adapter-factory.ts               # Adapter creation utilities
\`\`\`

### Files to Modify
\`\`\`
components/
├── transaction-details-table-ag-grid.tsx  # Refactor to use flexible component
├── flow-diagram.tsx                        # Update context usage
├── custom-node.tsx                         # Update context usage
├── payment-search-box.tsx                  # Update context usage
├── transaction-details-table.tsx           # Update context usage
└── search-testing-panel.tsx                # Update context usage

hooks/
└── use-transaction-search.tsx              # Add context selection logic

app/
└── page.tsx                                # Update provider usage
\`\`\`

### Migration Timeline
\`\`\`
Week 1: Create base contexts and interfaces
Week 2: Implement US Wires and India specific contexts
Week 3: Create adapter pattern and implementations
Week 4: Refactor AG Grid component
Week 5: Update remaining components
Week 6: Testing and optimization
Week 7: Documentation and training
Week 8: Production deployment
\`\`\`

## 4. Benefits of New Architecture

### Immediate Benefits
- **Flexibility**: Components can work with any context
- **Maintainability**: Clear separation of concerns
- **Testability**: Easy to mock contexts and adapters
- **Reusability**: Components can be used across different regions

### Long-term Benefits
- **Scalability**: Easy to add new regions/contexts
- **Performance**: Optimized context switching
- **Developer Experience**: Clear APIs and patterns
- **Code Quality**: Reduced duplication and coupling

### Risk Mitigation
- **Backward Compatibility**: Existing code continues to work
- **Gradual Migration**: Can be implemented incrementally
- **Rollback Strategy**: Easy to revert if issues arise
- **Testing Strategy**: Comprehensive test coverage for all scenarios
