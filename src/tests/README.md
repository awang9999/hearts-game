# Tests Directory

This directory contains test utilities, setup files, and shared testing infrastructure for the Hearts game project.

## Files

**setup.ts** - Test environment configuration
- Configures Vitest testing environment
- Provides `LocalStorageMock` for testing localStorage functionality
- Sets up global test utilities and mocks
- Automatically used by Vitest for all tests
- **Edit this for**: Global test configuration, adding new mocks, test utilities

**setup.test.ts** - Test setup validation
- Validates that the testing environment is working correctly
- Smoke tests for test infrastructure
- Ensures mocks are properly configured
- **Edit this for**: Adding validation tests for new test utilities

**fast-check-setup.test.ts** - Property-based testing setup
- Configures fast-check library for property-based tests
- Validates that fast-check is working correctly
- Example property-based test for reference
- **Edit this for**: Custom generators, property-based test configuration

## Testing Strategy

The project uses multiple testing approaches:

### Unit Tests
- **Logic Functions**: Every function in `src/logic/` has unit tests
- **Components**: All React components have rendering and interaction tests
- **Hooks**: Custom hooks tested with React Testing Library
- **Models**: Type utilities and helper functions tested

### Integration Tests
- **Game Flow**: Complete game scenarios from start to finish
- **Component Integration**: How components work together
- **State Management**: Hook and component integration

### Property-Based Tests
- **Card Operations**: Tests with randomly generated valid cards
- **Game State**: Tests with random valid game states
- **Edge Cases**: Discovers edge cases through random testing

## Test Organization

### File Naming Convention
- `*.test.ts` - Unit tests for TypeScript files
- `*.test.tsx` - Component tests for React components
- Test files are co-located with source files (not in this directory)
- This directory only contains shared test infrastructure

### Test Structure
```typescript
describe('ComponentName', () => {
  describe('functionName', () => {
    it('should do something specific', () => {
      // Arrange - Set up test data
      // Act - Execute the code being tested
      // Assert - Verify the results
    });
  });
});
```

## Running Tests

### All Tests
```bash
npm test
```

### Specific Test File
```bash
npm test -- filename.test.ts
```

### Watch Mode (auto-rerun on changes)
```bash
npm run test:watch
```

### Coverage Report
```bash
npm run test:coverage
```

## Test Utilities

### LocalStorageMock
Provided in `setup.ts` for testing code that uses localStorage:
```typescript
// Automatically available in all tests
localStorage.setItem('key', 'value');
localStorage.getItem('key'); // 'value'
localStorage.clear();
```

### Common Testing Patterns

**Component Testing:**
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { ComponentName } from './ComponentName';

it('should render correctly', () => {
  render(<ComponentName prop="value" />);
  expect(screen.getByText('Expected Text')).toBeDefined();
});

it('should handle user interaction', () => {
  const mockFn = vi.fn();
  render(<ComponentName onAction={mockFn} />);
  
  fireEvent.click(screen.getByRole('button'));
  expect(mockFn).toHaveBeenCalled();
});
```

**Logic Testing:**
```typescript
import { functionName } from './module';

it('should return expected result', () => {
  const input = createTestInput();
  const result = functionName(input);
  expect(result).toEqual(expectedOutput);
});
```

**Property-Based Testing:**
```typescript
import fc from 'fast-check';

it('should maintain invariant', () => {
  fc.assert(fc.property(
    fc.array(fc.integer(), { minLength: 1, maxLength: 13 }),
    (numbers) => {
      const result = processNumbers(numbers);
      expect(result.length).toBeLessThanOrEqual(numbers.length);
    }
  ));
});
```

## Adding New Test Utilities

When adding shared test utilities:
1. Add them to `setup.ts` for global availability
2. Export them if they need to be imported explicitly
3. Add validation tests in `setup.test.ts`
4. Document usage in this README

## Debugging Tests

### Failed Tests
1. Check test output for specific assertion failures
2. Add `console.log` or `screen.debug()` for component tests
3. Run single test file to isolate issues: `npm test -- filename.test.ts`

### Flaky Tests
1. Check for timing issues with async operations
2. Verify test isolation (no shared state between tests)
3. Ensure mocks are properly reset between tests
4. Use `waitFor` for async assertions

## Test Coverage Goals

- **Logic Functions**: 100% coverage (pure functions, easy to test)
- **Components**: 90%+ coverage (focus on user interactions)
- **Hooks**: 95%+ coverage (critical state management)
- **Integration**: Key user flows covered

## Dependencies

This directory provides infrastructure for:
- All component tests in `src/components/*.test.tsx`
- All logic tests in `src/logic/*.test.ts`
- All model tests in `src/models/*.test.ts`
- All hook tests in `src/hooks/*.test.ts`
