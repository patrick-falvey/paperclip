import { describe, expect, it } from "vitest";
import { validateCellRequest } from "../middleware/cell-validation.js";

describe("validateCellRequest", () => {
  it("extracts cell subdomain from host header", () => {
    const result = validateCellRequest("acme.paperclip.app", "acme");
    expect(result).toEqual({ valid: true });
  });

  it("rejects mismatched subdomain", () => {
    const result = validateCellRequest("globex.paperclip.app", "acme");
    expect(result.valid).toBe(false);
    expect(result.reason).toContain("mismatch");
  });

  it("allows requests when not in cell mode", () => {
    const result = validateCellRequest("localhost:3100", undefined);
    expect(result).toEqual({ valid: true });
  });

  it("extracts subdomain correctly from host with port", () => {
    const result = validateCellRequest("acme.paperclip.app:443", "acme");
    expect(result).toEqual({ valid: true });
  });

  it("allows requests with fewer than 3 host parts (no subdomain)", () => {
    const result = validateCellRequest("paperclip.app", "acme");
    expect(result).toEqual({ valid: true });
  });

  it("allows localhost without port when in cell mode", () => {
    const result = validateCellRequest("localhost", "acme");
    expect(result).toEqual({ valid: true });
  });
});
