import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    projects: ["packages/db", "packages/control-plane", "packages/cell-cdk", "packages/adapters/opencode-local", "server", "ui", "cli"],
  },
});
