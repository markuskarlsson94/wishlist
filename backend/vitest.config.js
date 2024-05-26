import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    fileParallelism: false, // Run test files sequentially.
  },
})