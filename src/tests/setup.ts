// Test setup and utilities
// This file contains shared test utilities and configuration

// Mock localStorage for tests
class LocalStorageMock {
  private store: Map<string, string> = new Map();

  getItem(key: string): string | null {
    return this.store.get(key) || null;
  }

  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }

  get length(): number {
    return this.store.size;
  }

  key(index: number): string | null {
    const keys = Array.from(this.store.keys());
    return keys[index] || null;
  }
}

// Only set up localStorage mock if it doesn't exist (Node environment)
if (typeof globalThis !== 'undefined' && !globalThis.localStorage) {
  globalThis.localStorage = new LocalStorageMock() as unknown as Storage;
}

export {};
