# Testing Guidelines for AG Grid HOC

## Testing Philosophy

The AG Grid HOC testing strategy follows a pyramid approach:
- **Unit Tests (70%)**: Test individual components and utilities
- **Integration Tests (20%)**: Test component interactions and data flow
- **E2E Tests (10%)**: Test complete user workflows

## Test Structure

### 1. Unit Testing

#### Testing Adapters
\`\`\`typescript
describe('TransactionSearchAdapter', () => {
  let mockContext: jest.Mocked<TransactionSearchContextType>;
  let adapter: TransactionSearchAdapter;
  
  beforeEach(() => {
    mockContext = {
      searchResults: mockTransactionData,
      isFetching: false,
      error: null,
      refetch: jest.fn(),
      clear: jest.fn(),
    };
    adapter = new TransactionSearchAdapter(mockContext);
  });
  
  it('should return transformed data', () => {
    const data = adapter.getData();
    expect(data).toHaveLength(mockTransactionData.length);
    expect(data[0]).toHaveProperty('id');
    expect(data[0]).toHaveProperty('amount');
  });
  
  it('should handle loading state', () => {
    mockContext.isFetching = true;
    expect(adapter.getLoading()).toBe(true);
  });
});
\`\`\`

#### Testing HOC
\`\`\`typescript
describe('withAGGridTable', () => {
  const TestComponent = () => <div>Test Component</div>;
  const EnhancedComponent = withAGGridTable(TestComponent);
  
  it('should render wrapped component with AG Grid', () => {
    const mockAdapter = new MockAdapter();
    const mockConfig = createMockConfiguration();
    
    render(
      <EnhancedComponent
        adapter={mockAdapter}
        configuration={mockConfig}
      />
    );
    
    expect(screen.getByRole('grid')).toBeInTheDocument();
  });
  
  it('should handle prop changes efficiently', () => {
    const { rerender } = render(
      <EnhancedComponent
        adapter={mockAdapter1}
        configuration={mockConfig1}
      />
    );
    
    rerender(
      <EnhancedComponent
        adapter={mockAdapter2}
        configuration={mockConfig2}
      />
    );
    
    // Verify memoization and performance
  });
});
\`\`\`

### 2. Integration Testing

\`\`\`typescript
describe('Table Context Integration', () => {
  it('should switch contexts without losing state', async () => {
    const { user } = setup(
      <MultiContextProvider>
        <MultiContextTable />
      </MultiContextProvider>
    );
    
    // Initial state
    expect(screen.getByText('US Wires')).toBeInTheDocument();
    
    // Switch context
    await user.click(screen.getByText('India Payments'));
    
    // Verify context switch
    expect(screen.getByText('India Payments')).toBeInTheDocument();
    expect(screen.getByRole('grid')).toBeInTheDocument();
  });
});
\`\`\`

### 3. Performance Testing

\`\`\`typescript
describe('Performance Tests', () => {
  it('should render large datasets efficiently', () => {
    const largeDataset = generateMockData(10000);
    const adapter = new MockAdapter(largeDataset);
    
    const startTime = performance.now();
    
    render(
      <EnhancedTransactionTable
        adapter={adapter}
        configuration={optimizedConfig}
      />
    );
    
    const endTime = performance.now();
    expect(endTime - startTime).toBeLessThan(100); // 100ms threshold
  });
});
\`\`\`

## Mock Utilities

\`\`\`typescript
// __mocks__/mock-adapter.ts
export class MockAdapter extends BaseContextAdapter {
  constructor(private mockData: any[] = []) {
    super(null);
  }
  
  getData() { return this.mockData; }
  getLoading() { return false; }
  getError() { return null; }
  refresh() { /* mock implementation */ }
  clear() { /* mock implementation */ }
}

// __mocks__/mock-data.ts
export const generateMockTransactionData = (count: number) => {
  return Array.from({ length: count }, (_, index) => ({
    trN_REF: `TXN${index.toString().padStart(6, '0')}`,
    amount: Math.random() * 10000,
    currency: 'USD',
    date: new Date().toISOString(),
    status: ['completed', 'pending', 'failed'][index % 3],
  }));
};
