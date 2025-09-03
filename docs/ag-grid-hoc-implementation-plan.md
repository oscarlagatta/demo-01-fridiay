# AG Grid Higher-Order Component Implementation Plan

## Executive Summary

This document outlines a comprehensive plan for implementing a flexible, reusable Higher-Order Component (HOC) for the `transaction-details-table-ag-grid.tsx` component. The HOC will encapsulate common AG Grid functionalities while providing flexibility for different payment flow contexts and transaction search implementations.

## Architecture Overview

### Core Design Principles

1. **Context Agnostic**: HOC should work with any transaction search context
2. **Configuration Driven**: Behavior controlled through props and configuration objects
3. **Performance Optimized**: Memoization and lazy loading for optimal responsiveness
4. **Future Proof**: Extensible architecture for easy feature additions
5. **Type Safe**: Full TypeScript support with comprehensive type definitions

### File Structure

\`\`\`
components/
├── hoc/
│   ├── with-ag-grid-table.tsx           # Main HOC implementation
│   ├── ag-grid-config-factory.ts        # Configuration factory
│   └── ag-grid-performance-optimizer.ts # Performance utilities
├── adapters/
│   ├── base-context-adapter.ts          # Base adapter interface
│   ├── transaction-search-adapter.ts    # Standard transaction adapter
│   ├── multi-context-adapter.ts         # Multi-context adapter
│   └── flow-specific-adapters/
│       ├── us-wires-adapter.ts          # US Wires specific adapter
│       ├── india-payment-adapter.ts     # India payment adapter
│       └── card-payment-adapter.ts      # Card payment adapter
├── formatters/
│   ├── base-formatter.ts               # Base formatting interface
│   ├── currency-formatter.ts           # Currency formatting
│   ├── date-formatter.ts               # Date formatting
│   └── flow-specific-formatters/
│       ├── us-wires-formatter.ts       # US Wires formatting
│       └── india-payment-formatter.ts  # India payment formatting
├── column-definitions/
│   ├── base-columns.ts                 # Common column definitions
│   ├── flow-specific-columns/
│   │   ├── us-wires-columns.ts        # US Wires columns
│   │   ├── india-payment-columns.ts   # India payment columns
│   │   └── card-payment-columns.ts    # Card payment columns
│   └── column-factory.ts              # Dynamic column generation
└── enhanced-transaction-details-table.tsx # Enhanced implementation
\`\`\`

## Implementation Phases

### Phase 1: Foundation Layer (Week 1)

#### 1.1 Type Definitions and Interfaces

**File: `types/ag-grid-hoc-types.ts`**

\`\`\`typescript
// Core interfaces for HOC architecture
export interface BaseContextAdapter<T = any> {
  getData: () => T[];
  getLoading: () => boolean;
  getError: () => string | null;
  refresh: () => void;
  clear: () => void;
}

export interface AGGridConfiguration {
  columnDefs: ColDef[];
  defaultColDef: ColDef;
  grouping: GroupingConfig;
  pagination: PaginationConfig;
  sorting: SortingConfig;
  filtering: FilteringConfig;
}

export interface FormatterConfig {
  currency: CurrencyFormatterConfig;
  date: DateFormatterConfig;
  amount: AmountFormatterConfig;
  custom: Record<string, (value: any) => string>;
}
\`\`\`

#### 1.2 Base Context Adapter

**File: `components/adapters/base-context-adapter.ts`**

\`\`\`typescript
export abstract class BaseContextAdapter<TData = any, TContext = any> {
  protected context: TContext;
  
  constructor(context: TContext) {
    this.context = context;
  }
  
  abstract getData(): TData[];
  abstract getLoading(): boolean;
  abstract getError(): string | null;
  abstract refresh(): void;
  abstract clear(): void;
  
  // Template method for data transformation
  protected transformData(rawData: any[]): TData[] {
    return rawData.map(item => this.transformItem(item));
  }
  
  protected abstract transformItem(item: any): TData;
}
\`\`\`

### Phase 2: Core HOC Implementation (Week 2)

#### 2.1 Main HOC Structure

**File: `components/hoc/with-ag-grid-table.tsx`**

\`\`\`typescript
export interface WithAGGridTableProps<TData = any> {
  adapter: BaseContextAdapter<TData>;
  configuration: AGGridConfiguration;
  formatters?: FormatterConfig;
  customRenderers?: Record<string, ICellRendererComp>;
  onRowClick?: (data: TData) => void;
  onSelectionChange?: (selectedRows: TData[]) => void;
  className?: string;
  height?: number;
}

export function withAGGridTable<TProps extends object>(
  WrappedComponent: React.ComponentType<TProps>
) {
  return React.memo(function WithAGGridTableComponent(
    props: TProps & WithAGGridTableProps
  ) {
    // HOC implementation with memoization and performance optimization
  });
}
\`\`\`

#### 2.2 Configuration Factory

**File: `components/hoc/ag-grid-config-factory.ts`**

\`\`\`typescript
export class AGGridConfigFactory {
  static createConfiguration(
    flowType: PaymentFlowType,
    customizations?: Partial<AGGridConfiguration>
  ): AGGridConfiguration {
    const baseConfig = this.getBaseConfiguration();
    const flowSpecificConfig = this.getFlowSpecificConfiguration(flowType);
    
    return deepMerge(baseConfig, flowSpecificConfig, customizations);
  }
  
  private static getBaseConfiguration(): AGGridConfiguration {
    // Base configuration common to all flows
  }
  
  private static getFlowSpecificConfiguration(
    flowType: PaymentFlowType
  ): Partial<AGGridConfiguration> {
    // Flow-specific configurations
  }
}
\`\`\`

### Phase 3: Context Adapters (Week 3)

#### 3.1 Transaction Search Adapter

**File: `components/adapters/transaction-search-adapter.ts`**

\`\`\`typescript
export class TransactionSearchAdapter extends BaseContextAdapter<
  TransactionData,
  TransactionSearchContextType
> {
  getData(): TransactionData[] {
    return this.transformData(this.context.searchResults || []);
  }
  
  getLoading(): boolean {
    return this.context.isFetching;
  }
  
  getError(): string | null {
    return this.context.error;
  }
  
  refresh(): void {
    this.context.refetch?.();
  }
  
  clear(): void {
    this.context.clear();
  }
  
  protected transformItem(item: any): TransactionData {
    // Transform raw API data to standardized format
    return {
      id: item.trN_REF,
      amount: parseFloat(item.amount),
      currency: item.currency,
      date: new Date(item.date),
      status: item.status,
      // ... other transformations
    };
  }
}
\`\`\`

#### 3.2 Multi-Context Adapter

**File: `components/adapters/multi-context-adapter.ts`**

\`\`\`typescript
export class MultiContextAdapter extends BaseContextAdapter {
  private adapters: Map<string, BaseContextAdapter>;
  private activeContext: string;
  
  constructor(contexts: Record<string, any>) {
    super(null);
    this.adapters = new Map();
    this.initializeAdapters(contexts);
  }
  
  setActiveContext(contextName: string): void {
    this.activeContext = contextName;
  }
  
  getData(): any[] {
    const adapter = this.adapters.get(this.activeContext);
    return adapter ? adapter.getData() : [];
  }
  
  // Implement other methods to delegate to active adapter
}
\`\`\`

### Phase 4: Formatters and Renderers (Week 4)

#### 4.1 Currency Formatter

**File: `components/formatters/currency-formatter.ts`**

\`\`\`typescript
export class CurrencyFormatter {
  private static formatters = new Map<string, Intl.NumberFormat>();
  
  static format(
    amount: number,
    currency: string,
    locale: string = 'en-US'
  ): string {
    const key = `${currency}-${locale}`;
    
    if (!this.formatters.has(key)) {
      this.formatters.set(key, new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }));
    }
    
    return this.formatters.get(key)!.format(amount);
  }
}
\`\`\`

#### 4.2 Custom Cell Renderers

**File: `components/renderers/status-cell-renderer.tsx`**

\`\`\`typescript
export const StatusCellRenderer: React.FC<ICellRendererParams> = ({ value }) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'failed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };
  
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(value)}`}>
      {value}
    </span>
  );
};
\`\`\`

### Phase 5: Performance Optimization (Week 5)

#### 5.1 Performance Optimizer

**File: `components/hoc/ag-grid-performance-optimizer.ts`**

\`\`\`typescript
export class AGGridPerformanceOptimizer {
  static optimizeForLargeDatasets(gridOptions: GridOptions): GridOptions {
    return {
      ...gridOptions,
      rowBuffer: 10,
      rowSelection: 'multiple',
      rowMultiSelectWithClick: true,
      suppressRowClickSelection: false,
      animateRows: false,
      enableRangeSelection: true,
      suppressColumnVirtualisation: false,
      suppressRowVirtualisation: false,
    };
  }
  
  static createMemoizedColumnDefs = memoize(
    (flowType: string, customizations: any) => {
      return AGGridConfigFactory.createColumnDefinitions(flowType, customizations);
    },
    (flowType, customizations) => `${flowType}-${JSON.stringify(customizations)}`
  );
}
\`\`\`

#### 5.2 Data Virtualization

\`\`\`typescript
export const useVirtualizedData = <T>(
  data: T[],
  pageSize: number = 100
) => {
  const [visibleData, setVisibleData] = useState<T[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  
  useEffect(() => {
    const startIndex = currentPage * pageSize;
    const endIndex = startIndex + pageSize;
    setVisibleData(data.slice(startIndex, endIndex));
  }, [data, currentPage, pageSize]);
  
  return {
    visibleData,
    currentPage,
    totalPages: Math.ceil(data.length / pageSize),
    setCurrentPage,
  };
};
\`\`\`

## Props and State Management Strategy

### 1. Props Flow Architecture

\`\`\`typescript
// Top-level component props
interface EnhancedTableProps {
  flowType: PaymentFlowType;
  contextProvider: 'single' | 'multi' | 'adaptive';
  customizations?: TableCustomizations;
  onDataChange?: (data: any[]) => void;
}

// HOC internal props
interface HOCInternalProps {
  adapter: BaseContextAdapter;
  configuration: AGGridConfiguration;
  formatters: FormatterConfig;
  eventHandlers: EventHandlerConfig;
}
\`\`\`

### 2. State Management Patterns

#### 2.1 Context State Isolation

\`\`\`typescript
// Each adapter manages its own state
class ContextStateManager {
  private state: Map<string, any> = new Map();
  
  getState<T>(contextId: string): T | undefined {
    return this.state.get(contextId);
  }
  
  setState<T>(contextId: string, newState: T): void {
    this.state.set(contextId, newState);
    this.notifySubscribers(contextId, newState);
  }
}
\`\`\`

#### 2.2 Performance State Management

\`\`\`typescript
// Memoized state selectors
const useOptimizedTableState = (adapter: BaseContextAdapter) => {
  const data = useMemo(() => adapter.getData(), [adapter]);
  const loading = useMemo(() => adapter.getLoading(), [adapter]);
  const error = useMemo(() => adapter.getError(), [adapter]);
  
  return { data, loading, error };
};
\`\`\`

## Future Adaptability Strategies

### 1. Plugin Architecture

\`\`\`typescript
interface TablePlugin {
  name: string;
  version: string;
  install: (table: AGGridTable) => void;
  uninstall: (table: AGGridTable) => void;
}

class PluginManager {
  private plugins: Map<string, TablePlugin> = new Map();
  
  register(plugin: TablePlugin): void {
    this.plugins.set(plugin.name, plugin);
  }
  
  apply(table: AGGridTable): void {
    this.plugins.forEach(plugin => plugin.install(table));
  }
}
\`\`\`

### 2. Configuration Schema Evolution

\`\`\`typescript
// Versioned configuration schema
interface ConfigurationV1 {
  version: '1.0';
  columns: ColumnDefV1[];
}

interface ConfigurationV2 {
  version: '2.0';
  columns: ColumnDefV2[];
  features: FeatureConfig[];
}

class ConfigurationMigrator {
  static migrate(config: any): AGGridConfiguration {
    switch (config.version) {
      case '1.0': return this.migrateFromV1(config);
      case '2.0': return this.migrateFromV2(config);
      default: return config;
    }
  }
}
\`\`\`

## Testing Strategy

### 1. Unit Testing Structure

\`\`\`typescript
// Test file: __tests__/with-ag-grid-table.test.tsx
describe('withAGGridTable HOC', () => {
  describe('Context Adaptation', () => {
    it('should work with TransactionSearchAdapter', () => {
      // Test implementation
    });
    
    it('should work with MultiContextAdapter', () => {
      // Test implementation
    });
  });
  
  describe('Performance', () => {
    it('should memoize expensive operations', () => {
      // Performance test implementation
    });
  });
});
\`\`\`

### 2. Integration Testing

\`\`\`typescript
// Test file: __tests__/integration/table-context-integration.test.tsx
describe('Table Context Integration', () => {
  it('should handle context switching without data loss', () => {
    // Integration test implementation
  });
  
  it('should maintain performance with large datasets', () => {
    // Performance integration test
  });
});
\`\`\`

### 3. Visual Regression Testing

\`\`\`typescript
// Test file: __tests__/visual/table-rendering.test.tsx
describe('Table Visual Regression', () => {
  it('should render consistently across different contexts', () => {
    // Visual test implementation using tools like Chromatic
  });
});
\`\`\`

## Documentation Strategy

### 1. API Documentation

\`\`\`markdown
# AG Grid HOC API Reference

## withAGGridTable

Higher-order component that enhances any component with AG Grid functionality.

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| adapter | BaseContextAdapter | Yes | Context adapter for data access |
| configuration | AGGridConfiguration | Yes | Grid configuration object |
| formatters | FormatterConfig | No | Custom formatting functions |

### Usage Examples

\`\`\`typescript
// Basic usage
const EnhancedTable = withAGGridTable(BaseTable);

// With custom configuration
<EnhancedTable
  adapter={new TransactionSearchAdapter(context)}
  configuration={AGGridConfigFactory.createConfiguration('us-wires')}
/>
\`\`\`

### 2. Migration Guide

\`\`\`markdown
# Migration Guide: From Direct AG Grid to HOC

## Step 1: Identify Current Usage
- List all components using AG Grid directly
- Document current configurations and customizations

## Step 2: Create Adapters
- Implement context adapters for each data source
- Test adapters independently

## Step 3: Gradual Migration
- Migrate one component at a time
- Maintain backward compatibility during transition
\`\`\`

## Implementation Timeline

| Week | Phase | Deliverables |
|------|-------|--------------|
| 1 | Foundation | Type definitions, base interfaces, core architecture |
| 2 | Core HOC | Main HOC implementation, configuration factory |
| 3 | Adapters | Context adapters, multi-context support |
| 4 | Formatters | Custom formatters, cell renderers |
| 5 | Optimization | Performance optimization, virtualization |
| 6 | Testing | Unit tests, integration tests, documentation |

## Success Metrics

1. **Performance**: Table rendering time < 100ms for datasets up to 1000 rows
2. **Flexibility**: Support for 5+ different payment flow contexts
3. **Maintainability**: 90%+ code coverage, comprehensive documentation
4. **Adaptability**: Plugin system supporting custom extensions
5. **Developer Experience**: Clear API, helpful error messages, TypeScript support

This comprehensive plan provides a roadmap for implementing a flexible, performant, and future-proof HOC for the AG Grid table component while maintaining the ability to work with multiple transaction search contexts.
