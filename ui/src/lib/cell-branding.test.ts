import { describe, expect, it } from "vitest";
import { applyCellBranding, parseBrandingResponse } from "./cell-branding";

describe("cell branding", () => {
  it("parses valid branding response", () => {
    const result = parseBrandingResponse({
      cellMode: true,
      logoUrl: "https://cdn.example.com/logo.svg",
      accentColor: "#E53E3E",
      customerName: "Acme Corp",
    });
    expect(result.cellMode).toBe(true);
    expect(result.logoUrl).toBe("https://cdn.example.com/logo.svg");
    expect(result.accentColor).toBe("#E53E3E");
    expect(result.customerName).toBe("Acme Corp");
  });

  it("coerces cellMode to boolean", () => {
    expect(parseBrandingResponse({ cellMode: 1 }).cellMode).toBe(true);
    expect(parseBrandingResponse({ cellMode: 0 }).cellMode).toBe(false);
    expect(parseBrandingResponse({ cellMode: null }).cellMode).toBe(false);
    expect(parseBrandingResponse({}).cellMode).toBe(false);
  });

  it("handles missing optional fields gracefully", () => {
    const result = parseBrandingResponse({ cellMode: true });
    expect(result.cellMode).toBe(true);
    expect(result.logoUrl).toBeUndefined();
    expect(result.accentColor).toBeUndefined();
    expect(result.customerName).toBeUndefined();
  });

  it("generates CSS custom properties from branding", () => {
    const css = applyCellBranding({
      cellMode: true,
      accentColor: "#E53E3E",
      customerName: "Acme",
    });
    expect(css).toContain("--cell-accent-color: #E53E3E");
  });

  it("returns empty string when not in cell mode", () => {
    const css = applyCellBranding({ cellMode: false });
    expect(css).toBe("");
  });

  it("returns empty string when in cell mode but no properties set", () => {
    const css = applyCellBranding({ cellMode: true });
    expect(css).toBe("");
  });
});
