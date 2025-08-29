# Transaction Details AG Grid Component Usage Guide

## Overview

The `TransactionDetailsTableAgGrid` component is a flexible, context-aware data table that can seamlessly integrate with different regional contexts while maintaining backward compatibility with the existing architecture.

## Key Features

- **Context Flexibility**: Accepts context as prop or uses hook-based context
- **Adapter Pattern**: Handles region-specific logic through adapters
- **Backward Compatibility**: Existing code continues to work without changes
- **Error Handling**: Graceful fallbacks and error reporting
- **Type Safety**: Full TypeScript support with proper interfaces

## Usage Patterns

### 1. Default Usage (Backward Compatible)
\`\`\`tsx
// Uses existing hook-based context - no changes needed
<TransactionDetailsTableAgGrid />
\`\`\`

### 2. Context Injection
\`\`\`tsx
// Inject specific context data
<TransactionDetailsTableAgGrid 
  contextData={myCustomContext}
  contextType="us-wires"
/>
\`\`\`

### 3. Region-Specific Components
\`\`\`tsx
// Use pre-configured regional components
<UsWiresTransactionDetailsTable />
<IndiaTransactionDetailsTable />
<GenericTransactionDetailsTable />
\`\`\`

### 4. Custom Adapter
\`\`\`tsx
// Use custom adapter for specialized logic
const customAdapter = new MyCustomAdapter(contextData)
<TransactionDetailsTableAgGrid adapter={customAdapter} />
\`\`\`

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `contextData` | `any` | `undefined` | Optional context data to override hook-based context |
| `contextType` | `"us-wires" \| "india" \| "generic"` | `"us-wires"` | Context type for automatic adapter selection |
| `adapter` | `TransactionTableAdapter` | `undefined` | Custom adapter instance |
| `className` | `string` | `""` | Additional CSS classes |
| `onError` | `(error: Error) => void` | `undefined` | Error callback |

## Architecture Benefits

### Separation of Concerns
- **Component**: Handles UI rendering and user interactions
- **Adapter**: Manages region-specific data formatting and business logic
- **Context**: Provides data and state management

### Flexibility
- Switch between contexts without component changes
- Add new regions by creating new adapters
- Maintain existing functionality while adding new features

### Maintainability
- Clear interfaces and type definitions
- Comprehensive error handling
- Extensive documentation and examples

## Migration Path

### Phase 1: No Changes Required
Existing components continue to work exactly as before.

### Phase 2: Gradual Enhancement
Components can be enhanced to use specific contexts:
\`\`\`tsx
// Before
<TransactionDetailsTableAgGrid />

// After (optional enhancement)
<UsWiresTransactionDetailsTable />
\`\`\`

### Phase 3: Advanced Usage
New components can leverage full flexibility:
\`\`\`tsx
<TransactionDetailsTableAgGrid 
  contextData={dynamicContext}
  contextType={selectedRegion}
  onError={handleError}
/>
\`\`\`

## Error Handling

The component includes comprehensive error handling:
- Missing context data detection
- Adapter creation failures
- Graceful fallbacks to base functionality
- Optional error callbacks for custom handling

## Performance Considerations

- Adapters are created only when needed
- Context data is efficiently passed through
- No unnecessary re-renders
- Optimized for large datasets
