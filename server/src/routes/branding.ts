import { Router } from "express";

export interface BrandingConfig {
  isCellMode: boolean;
  cellId?: string;
  brandLogoUrl?: string;
  brandAccentColor?: string;
  brandCustomerName?: string;
}

export interface BrandingResponse {
  cellMode: boolean;
  logoUrl?: string;
  accentColor?: string;
  customerName?: string;
}

export function buildBrandingResponse(config: BrandingConfig): BrandingResponse {
  if (!config.isCellMode) {
    return { cellMode: false };
  }
  return {
    cellMode: true,
    logoUrl: config.brandLogoUrl,
    accentColor: config.brandAccentColor,
    customerName: config.brandCustomerName,
  };
}

export function brandingRoutes(config: BrandingConfig) {
  const router = Router();

  router.get("/branding", (_req, res) => {
    res.json(buildBrandingResponse(config));
  });

  return router;
}
