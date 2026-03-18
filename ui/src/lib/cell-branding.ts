export interface CellBranding {
  cellMode: boolean;
  logoUrl?: string;
  accentColor?: string;
  customerName?: string;
}

export function parseBrandingResponse(data: unknown): CellBranding {
  const d = data as Record<string, unknown>;
  return {
    cellMode: Boolean(d.cellMode),
    logoUrl: d.logoUrl as string | undefined,
    accentColor: d.accentColor as string | undefined,
    customerName: d.customerName as string | undefined,
  };
}

export function applyCellBranding(branding: CellBranding): string {
  if (!branding.cellMode) return "";

  const props: string[] = [];
  if (branding.accentColor) {
    props.push(`--cell-accent-color: ${branding.accentColor}`);
  }
  return props.map((p) => `  ${p};`).join("\n");
}
