import { describe, expect, it } from "vitest";
import { validateCustomerInput } from "../services/customer-service.js";

describe("validateCustomerInput", () => {
  const validInput = {
    name: "Acme Corp",
    subdomain: "acme-corp",
    contactEmail: "admin@acme.com",
  };

  it("validates valid customer input", () => {
    const result = validateCustomerInput(validInput);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(validInput);
    }
  });

  it("validates input with optional branding fields", () => {
    const input = {
      ...validInput,
      brandLogoUrl: "https://acme.com/logo.png",
      brandAccentColor: "#FF5733",
    };
    const result = validateCustomerInput(input);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.brandLogoUrl).toBe("https://acme.com/logo.png");
      expect(result.data.brandAccentColor).toBe("#FF5733");
    }
  });

  it("rejects subdomain with special characters", () => {
    const result = validateCustomerInput({
      ...validInput,
      subdomain: "acme_corp!",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const subdomainErrors = result.error.issues.filter((i) => i.path.includes("subdomain"));
      expect(subdomainErrors.length).toBeGreaterThan(0);
    }
  });

  it("rejects subdomain with uppercase letters", () => {
    const result = validateCustomerInput({
      ...validInput,
      subdomain: "AcmeCorp",
    });
    expect(result.success).toBe(false);
  });

  it("rejects subdomain shorter than 3 characters", () => {
    const result = validateCustomerInput({
      ...validInput,
      subdomain: "ab",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const subdomainErrors = result.error.issues.filter((i) => i.path.includes("subdomain"));
      expect(subdomainErrors.length).toBeGreaterThan(0);
    }
  });

  it("rejects reserved subdomains", () => {
    for (const reserved of ["api", "app", "www", "admin", "mail", "ftp", "status", "docs", "help"]) {
      const result = validateCustomerInput({
        ...validInput,
        subdomain: reserved,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const msgs = result.error.issues.map((i) => i.message);
        expect(msgs).toContain("Subdomain is reserved");
      }
    }
  });

  it("rejects missing name", () => {
    const { name: _, ...noName } = validInput;
    const result = validateCustomerInput(noName);
    expect(result.success).toBe(false);
  });

  it("rejects invalid email", () => {
    const result = validateCustomerInput({
      ...validInput,
      contactEmail: "not-an-email",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid brandAccentColor format", () => {
    const result = validateCustomerInput({
      ...validInput,
      brandAccentColor: "red",
    });
    expect(result.success).toBe(false);
  });
});
