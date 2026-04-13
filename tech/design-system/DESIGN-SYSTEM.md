# Pawtal — Design System Reference

> Full spec: see `design-system.docx` in this folder.

## Quick Token Reference

### Colours
| Token | Hex | Usage |
|-------|-----|-------|
| Primary Blue | #1A3C5E | CTAs, headings, primary buttons |
| Teal Accent | #0D7377 | Section headings, active states, links |
| Brand Light | #E8F0F7 | Page backgrounds, info callouts |
| Success | #16A34A | Verified badges, confirmations |
| Warning | #D97706 | Pending status, open questions |
| Error | #DC2626 | Form errors, critical alerts |
| Neutral 900 | #1A1A2E | Body text |
| Neutral 500 | #6B7280 | Placeholder text |
| Neutral 300 | #D1D5DB | Borders, dividers |

### Typography
| Token | Size | Weight | Usage |
|-------|------|--------|-------|
| text-display | 40px | 700 | Hero headlines |
| text-h1 | 32px | 700 | Page titles |
| text-h2 | 24px | 700 | Section headings |
| text-h3 | 20px | 600 | Card titles, sub-sections |
| text-body | 16px | 400 | Default body copy |
| text-body-sm | 14px | 400/500 | Labels, captions |
| text-caption | 12px | 400 | Helper text, footnotes |

**Fonts:** Noto Sans Thai (Thai) + Inter (Latin)

### Spacing
Base: 4px grid. Unit: 8px.
`space-2=8px` | `space-4=16px` | `space-6=24px` | `space-8=32px` | `space-12=48px` | `space-16=64px`

### Breakpoints
`default=375px` | `sm=640px` | `md=768px` | `lg=1024px` | `xl=1280px`

### Components (Key Rules)
- **Buttons**: 48px height; 24px pill radius (primary); 8px radius (secondary); 44px min touch target
- **Inputs**: 48px height; always visible label above field; error shown on blur
- **Cards**: 12px border radius; 1px Neutral 300 border; shadow on hover
- **Badges**: 24px height; pill shape; 12px horizontal padding
- **Icons**: Lucide Icons library; sizes 14/16/20/24/32/48px

### Accessibility
- WCAG 2.1 AA minimum
- 4.5:1 contrast ratio for text
- 44×44px minimum touch targets
- All interactive elements keyboard navigable
