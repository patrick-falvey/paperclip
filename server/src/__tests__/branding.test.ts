import { describe, expect, it } from "vitest";
import {
  buildBrandingResponse,
  type BrandingConfig,
} from "../routes/branding.js";

describe("buildBrandingResponse", () => {
  it("returns cell branding when in cell mode", () => {
    const config: BrandingConfig = {
      isCellMode: true,
      cellId: "cell-acme-001",
      brandLogoUrl: "https://cdn.example.com/acme-logo.svg",
      brandAccentColor: "#ff6600",
      brandCustomerName: "Acme Corp",
    };

    const result = buildBrandingResponse(config);

    expect(result).toEqual({
      cellMode: true,
      logoUrl: "https://cdn.example.com/acme-logo.svg",
      accentColor: "#ff6600",
      customerName: "Acme Corp",
    });
  });

  it("returns default branding when not in cell mode", () => {
    const config: BrandingConfig = {
      isCellMode: false,
    };

    const result = buildBrandingResponse(config);

    expect(result).toEqual({ cellMode: false });
    expect(result.logoUrl).toBeUndefined();
    expect(result.accentColor).toBeUndefined();
    expect(result.customerName).toBeUndefined();
  });

  it("handles partial branding (only accentColor set)", () => {
    const config: BrandingConfig = {
      isCellMode: true,
      cellId: "cell-partial-001",
      brandAccentColor: "#003366",
    };

    const result = buildBrandingResponse(config);

    expect(result).toEqual({
      cellMode: true,
      logoUrl: undefined,
      accentColor: "#003366",
      customerName: undefined,
    });
  });
});
