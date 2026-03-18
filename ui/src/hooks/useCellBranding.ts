import { useQuery } from "@tanstack/react-query";
import { parseBrandingResponse, type CellBranding } from "../lib/cell-branding";

export function useCellBranding(): CellBranding | null {
  const { data } = useQuery({
    queryKey: ["cell-branding"],
    queryFn: async () => {
      const res = await fetch("/api/branding");
      if (!res.ok) return null;
      return parseBrandingResponse(await res.json());
    },
    staleTime: Infinity,
  });
  return data ?? null;
}
