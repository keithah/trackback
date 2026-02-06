import { defineConfig } from "vitest/config";
import { fileURLToPath } from "url";

const rootDir = fileURLToPath(new URL(".", import.meta.url));

process.env.DATABASE_URL = process.env.DATABASE_URL || "file:./test.db";
process.env.NEXTAUTH_SECRET =
  process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || "test-secret";

export default defineConfig({
  test: {
    environment: "node",
    setupFiles: ["./tests/setup.ts"],
    globals: true,
    include: ["tests/api/**/*.test.ts"],
    sequence: {
      concurrent: false
    },
    pool: "threads",
    poolOptions: {
      threads: {
        singleThread: true
      }
    }
  },
  resolve: {
    alias: {
      "@": rootDir + "src"
    }
  }
});
