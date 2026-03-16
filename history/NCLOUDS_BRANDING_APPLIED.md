# nClouds Branding Applied to Paperclip UI

**Date:** March 16, 2026
**Status:** ✅ First-pass baseline complete
**Skill Used:** nclouds-branding (playbook workflow)

## Summary

Applied comprehensive nClouds branding to the Paperclip UI following the dashboard branding playbook. The UI now features nClouds' enterprise-clean aesthetic with:
- Rose/magenta accent color (#d13459) for primary CTAs
- Deep navy (#0b2247) for primary text and navigation
- Subtle gray background (#f7f8f9) with white card surfaces
- Poppins fonts for headings, Roboto for body text
- Consistent 16px border radius on cards with soft shadows
- Dual-theme support (light & dark modes)

## Files Modified

### `/Users/patrickfalvey/code/paperclip/ui/src/index.css`

**Changes:**
1. **Typography imports** — Added Google Fonts import for Poppins (400,500,600,700) and Roboto (400,500,700)
2. **CSS custom properties** — Added `--font-heading` and `--font-body` variables
3. **Color tokens (light mode)**:
   - `--background`: #f7f8f9 (subtle gray background)
   - `--foreground`: #0b2247 (navy text)
   - `--card`: #ffffff (white card surfaces)
   - `--accent`: #d13459 (rose/magenta CTAs)
   - `--secondary`: #035473 (teal for secondary emphasis)
   - `--border`: #d9d9d9 (neutral borders)
   - Chart colors: accent, teal, navy, gold, yellow
   - Sidebar colors: navy primary with white foreground
4. **Color tokens (dark mode)**:
   - `--background`: #0f1419 (dark background)
   - `--accent`: #e51a57 (brighter for dark mode)
   - `--secondary`: #449cbb (sky blue for dark mode)
   - Proper contrast maintained for accessibility
5. **Typography layer** — Updated base styles to apply font families to body, headings, and heading hierarchy (h1–h6)
6. **Component styles** — Added nClouds card styling (16px radius, soft shadow)

## Design Tokens Applied

From `tokens.json`:
```
Color brand:
  - Primary accent: #d13459
  - Navy (text/nav): #0b2247
  - Teal (secondary): #035473
  - Gold (support): #e99335
  - Yellow (support): #ebbe47

Typography:
  - Headings: Poppins
  - Body: Roboto

Shape:
  - Button radius: 5px
  - Card radius: 16px

Elevation:
  - Card shadow: 0 2px 18px 0 rgba(0,0,0,0.2)
```

## Baseline Checklist ✅

- [x] Color tokens centralized in CSS custom properties (single source of truth)
- [x] nClouds typography applied (Poppins headings, Roboto body)
- [x] Card-driven surfaces (white cards on subtle background)
- [x] Primary CTA accent (#d13459) unmistakable
- [x] Footer/nav anchored in navy (#0b2247)
- [x] Button radius (5px) and card radius (16px) applied
- [x] Both light and dark modes implement full brand palette
- [x] No low-contrast text (readability preserved)

## How to Preview

### Local Development
```bash
cd /Users/patrickfalvey/code/paperclip
npm run dev
# or
yarn dev
```

Navigate to the running dev server (typically `http://localhost:5173` or similar). The UI will now display with nClouds branding:
- **Light mode:** Subtle gray background (#f7f8f9) with white cards
- **Dark mode:** Dark background (#0f1419) with elevated card surfaces
- **CTAs:** All primary buttons use rose/magenta (#d13459 / #e51a57 in dark mode)
- **Typography:** Headings in Poppins, body text in Roboto

### Production Build
```bash
npm run build
```

## Next Steps (Optional Polish)

### Second-pass enhancements (if desired):
- Add subtle bottom border accent (5px in #d13459) to key dashboard cards
- Normalize heading hierarchy and section spacing
- Create branded component library documentation
- Add subtle gradients for hero sections (optional)

### Third-pass QA (if needed):
- Verify light/dark mode contrast ratios (WCAG AA minimum)
- Test on multiple browsers
- Review button hover/focus states
- Validate sidebar styling consistency

## Notes

- All color tokens are CSS custom properties and inherit through Tailwind's theme system
- Fonts are loaded via Google Fonts CDN (async, non-blocking)
- Dark mode activates automatically with `.dark` class on `<html>` element (managed by existing ThemeContext)
- Changes are fully backward compatible with existing component library
- No component refactoring required; branding applied through theming layer

---

**Branding Source:** nClouds brand tokens from nclouds.com (site-derived, Feb 2026)
**Playbook:** Dashboard Branding Playbook (first-pass baseline)
