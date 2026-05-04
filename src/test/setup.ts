import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

class MemoryStorage implements Storage {
  private readonly data = new Map<string, string>()

  get length() {
    return this.data.size
  }

  clear() {
    this.data.clear()
  }

  getItem(key: string) {
    return this.data.get(key) ?? null
  }

  key(index: number) {
    return Array.from(this.data.keys())[index] ?? null
  }

  removeItem(key: string) {
    this.data.delete(key)
  }

  setItem(key: string, value: string) {
    this.data.set(key, value)
  }
}

Object.defineProperty(window, 'localStorage', {
  configurable: true,
  value: new MemoryStorage(),
})

afterEach(() => {
  cleanup()
})
