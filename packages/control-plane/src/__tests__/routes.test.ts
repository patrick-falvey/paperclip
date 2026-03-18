import { describe, expect, it } from "vitest";
import { controlPlaneRoutes } from "../routes.js";

describe("control plane routes", () => {
  it("exports a router factory function", () => {
    expect(typeof controlPlaneRoutes).toBe("function");
  });
});
