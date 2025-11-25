export interface GenericStringStorage {
  getItem(key: string): string | Promise<string | null> | null;
  setItem(key: string, value: string): void | Promise<void>;
  removeItem(key: string): void | Promise<void>;
  // Also support synchronous methods for compatibility
  get?(key: string): string | undefined;
  set?(key: string, value: string): void;
}

export class GenericStringInMemoryStorage implements GenericStringStorage {
  #store = new Map<string, string>();

  getItem(key: string): string | null {
    return this.#store.has(key) ? this.#store.get(key)! : null;
  }

  setItem(key: string, value: string): void {
    this.#store.set(key, value);
  }

  removeItem(key: string): void {
    this.#store.delete(key);
  }

  // Compatibility methods
  get(key: string): string | undefined {
    return this.#store.get(key);
  }

  set(key: string, value: string): void {
    this.#store.set(key, value);
  }
}

