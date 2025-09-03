# Multi-Context Search Integration Guide

## Architecture Overview

The multi-context search system provides efficient integration of multiple payment flow contexts without compromising performance or maintainability. Here's how it works:

### 1. Provider Hierarchy

\`\`\`
FlowContextProvider (Flow Management)
└── MultiContextSearchProvider (Context Orchestration)
    ├── USWiresProvider (US Wire Transfers)
    ├── IndiaPaymentProvider (India Payments)
    └── CardPaymentsProvider (Card Processing)
        └── ContextSelector (Dynamic Context Selection)
            └── Application Components
\`\`\`

### 2. Context Selection Strategy

**Automatic Context Switching:**
- The `ContextSelector` component monitors the current flow from `FlowContextProvider`
- Automatically selects the appropriate regional context based on flow type
- Provides a unified interface through `useMultiContextSearch()` hook

**Performance Optimizations:**
- **Memoized Context Selection**: Context switching only occurs when flow changes
- **Lazy Provider Initialization**: Regional providers only initialize when needed
- **Selective Hook Execution**: Only the active context's hooks are executed

### 3. Integration Patterns

**Component Integration:**
\`\`\`tsx
// Components use the unified hook instead of individual context hooks
const { searchByAll, clear, isFetching, currentFlowName } = useMultiContextSearch()
\`\`\`

**Provider Setup:**
\`\`\`tsx
// Single provider wraps all regional contexts
<MultiContextSearchProvider>
  <YourComponents />
</MultiContextSearchProvider>
\`\`\`

### 4. Benefits

**Maintainability:**
- Single interface for all search operations
- Consistent API across all flow types
- Easy to add new regional contexts

**Performance:**
- No unnecessary provider re-renders
- Efficient context switching
- Minimal memory footprint

**Scalability:**
- Easy to add new payment flows
- Regional contexts can be developed independently
- Supports complex multi-region scenarios

### 5. Usage Examples

**Basic Search:**
\`\`\`tsx
const { searchByAll } = useMultiContextSearch()

// Automatically uses the correct regional context
await searchByAll({
  transactionId: "ABC123DEF4567890",
  transactionAmount: "1000.00"
})
\`\`\`

**Flow-Aware Operations:**
\`\`\`tsx
const { currentFlowName, supportedCurrencies, hasResults } = useMultiContextSearch()

// Display current context information
console.log(`Searching in: ${currentFlowName}`)
console.log(`Supported currencies: ${supportedCurrencies.join(', ')}`)
\`\`\`

### 6. Adding New Contexts

To add a new regional context:

1. Create the regional provider (e.g., `EuropePaymentProvider`)
2. Add it to `MultiContextSearchProvider`
3. Update `ContextSelector` with the new flow type mapping
4. Add flow configuration to `FlowContextProvider`

The system automatically handles the integration without requiring changes to existing components.
