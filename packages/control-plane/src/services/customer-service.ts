import { z } from "zod";

const RESERVED_SUBDOMAINS = ["api", "app", "www", "admin", "mail", "ftp", "status", "docs", "help"];

const customerInputSchema = z.object({
  name: z.string().min(1).max(100),
  subdomain: z
    .string()
    .min(3)
    .max(30)
    .regex(/^[a-z0-9-]+$/, "Subdomain must be lowercase alphanumeric with hyphens only")
    .refine((s) => !RESERVED_SUBDOMAINS.includes(s), "Subdomain is reserved"),
  contactEmail: z.string().email(),
  brandLogoUrl: z.string().url().optional(),
  brandAccentColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .optional(),
});

export type CustomerInput = z.infer<typeof customerInputSchema>;

export function validateCustomerInput(input: unknown) {
  return customerInputSchema.safeParse(input);
}
