# Transaction Search Testing Strategy

## Overview
This testing strategy ensures that nodes in the flow diagram accurately reflect transaction search data and maintain proper state transitions.

## Testing Components

### 1. SearchTestingPanel
- **Location**: `components/search-testing-panel.tsx`
- **Access**: Toggle via "Show Testing" button in navigation
- **Purpose**: Real-time validation of search functionality

### 2. Test Categories

#### A. Search Context State Validation
- Verifies search context availability
- Checks active state, results presence, and matched AIT IDs
- **Expected**: Context should be available and reflect current search state

#### B. API Response Structure Validation
- Validates presence of required fields (aitNumber, aitName, source, sourceType)
- Checks data integrity after transformation
- **Expected**: All required fields should be populated from API response

#### C. Node AIT ID Extraction
- Tests extraction of AIT numbers from node subtext
- Validates regex pattern matching
- **Expected**: All nodes should have extractable AIT numbers

#### D. AIT ID Matching Logic
- Compares extracted node AIT IDs with search results
- Validates matchedAitIds population
- **Expected**: Matching nodes should be identified correctly

#### E. Button State Consistency
- Validates button states across different search phases
- Checks for proper state transitions
- **Expected States**:
  - Default: Flow, Trend, Balanced
  - Loading: Summary (loading), Details (loading)
  - Results: Summary, Details (only on matched nodes)

#### F. Search Flow State Validation
- Ensures consistent state transitions during search
- Validates active/inactive states
- **Expected**: Smooth transitions between default → loading → results

## Manual Testing Checklist

### Pre-Search State
- [ ] All nodes show Flow/Trend/Balanced buttons
- [ ] No nodes are highlighted
- [ ] Search context shows active: false

### During Search (Loading)
- [ ] All nodes show loading Summary/Details buttons
- [ ] Search context shows active: true, isFetching: true
- [ ] No console errors

### Post-Search (Results)
- [ ] Only matched nodes show Summary/Details buttons
- [ ] Non-matched nodes show no buttons
- [ ] Search context shows active: true, hasResults: true
- [ ] matchedAitIds contains expected AIT numbers

### Error Handling
- [ ] API errors are handled gracefully
- [ ] Nodes return to default state on error
- [ ] Error messages are displayed appropriately

## Debugging Tools

### Console Logging
- Node state logging: `[v0] Node {id} search state`
- Provider state logging: `[v0] Provider search state`
- API response logging: `[v0] API Response`

### Test Data Validation
- Use testing panel to inspect real-time data
- Compare expected vs actual button states
- Verify AIT ID extraction accuracy

## Common Issues & Solutions

### Issue: Nodes not showing buttons after search
- **Check**: matchedAitIds population
- **Solution**: Verify API response transformation
- **Debug**: Use testing panel to inspect matched IDs

### Issue: All fields showing as undefined
- **Check**: API response structure
- **Solution**: Fix transformApiResponse function
- **Debug**: Log raw API response before transformation

### Issue: Nodes stuck in loading state
- **Check**: Search state transitions
- **Solution**: Verify active state calculation
- **Debug**: Monitor txActive and txFetching states

## Performance Considerations
- Test with large datasets (100+ nodes)
- Verify search response times
- Check for memory leaks during repeated searches
- Monitor React re-render frequency
