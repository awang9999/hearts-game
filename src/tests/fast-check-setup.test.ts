import { describe, it } from 'vitest';
import * as fc from 'fast-check';

describe('Fast-check Setup', () => {
  it('should run property-based tests successfully', () => {
    fc.assert(
      fc.property(fc.integer(), (n) => {
        return n + 0 === n;
      }),
      { numRuns: 100 }
    );
  });
});
