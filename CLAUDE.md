# Alexey Pelykh Personal Website

Personal website for Alexey Pelykh (alexey-pelykh.com). Serves as the technical credibility anchor for the personal brand—demonstrates depth and breadth of experience through work examples rather than sales copy.

**Role**: Let work speak for itself. Minimal CTAs, no aggressive sales language.

## Brand Context

This website is part of a larger personal brand system. Brand strategy, voice guidelines, and messaging live in the [Personal Brand HQ repository](https://github.com/alexey-pelykh/hq).

**Key brand constraints for website work**:
- **Voice**: Core voice (candid, direct, concrete) — not the playful/Yoda relationship voice
- **Tone**: Technical credibility without self-aggrandizement
- **CTAs**: Practical and minimal ("Book a Meeting", "Get CV"), not pushy
- **Narrative framing**: "Adventures" not resume bullets

For messaging decisions, content strategy, or voice questions → consult HQ repository.

## Task Tracking

**System**: GitHub Issues on this repository

Use `gh issue list` to see open issues. When starting work on an issue, reference it in commits and PRs.

## Technical Architecture

**Framework**: Next.js 15 with App Router, configured for static export.

### Static Export Constraints

This site uses `output: "export"` which means:

| Feature | Status | Notes |
|---------|--------|-------|
| Server Components | Works | Rendered at build time |
| Client Components | Works | `"use client"` directive |
| API Routes | Disabled | No `/api/*` endpoints |
| `getServerSideProps` | Disabled | Use static generation only |
| Dynamic routes | Limited | Must use `generateStaticParams` |
| Image Optimization | Disabled | `images.unoptimized: true` |
| Middleware | Disabled | Not supported in static export |

**When adding features**: Always verify compatibility with static export. If it requires a server, it won't work.

## Build Pipeline

```
npm run fetch-data     → Retrieves open-source contributions from GitHub API
npm run build          → Next.js static export to ./out
                       → postbuild: next-sitemap generates sitemap
npm run render-pdf     → Generates resume.pdf via Puppeteer
```

**Deployment**: GitHub Actions on push to `main` → GitHub Pages

**Data flow**:
1. `retrieve-open-source-contributions.js` queries GitHub API
2. Results written to `data/open-source-contributions.json`
3. Build reads JSON, generates static pages
4. `render-pdf.js` captures homepage as PDF resume

**Note**: Data fetching requires `CONTRIBUTIONS_READER_GITHUB_TOKEN` in CI. Local dev can use committed data.

## Code Conventions

### UI Components
- **Component library**: shadcn/ui (Radix primitives + Tailwind)
- **Styling**: Tailwind CSS with `cn()` utility from `@/lib/utils`
- **Icons**: `lucide-react` and `@radix-ui/react-icons`
- **Booking**: Cal.com embed (`@calcom/embed-react`)

### File Structure
```
src/
├── app/           # Next.js App Router pages
├── components/    # React components
│   └── ui/        # shadcn/ui components
└── lib/           # Utilities
data/              # Build-time data (JSON)
```

### Patterns
- Use existing shadcn/ui components before creating new ones
- Dark mode: Use `dark:` Tailwind variants (site supports light/dark)
- Print styles: Use `print:` Tailwind variants for PDF rendering
- External links: Use `target="_blank"`
- Dynamic routes: Provide `generateStaticParams` for static generation
- **No responsive UI yet**: Currently desktop-only (limitation, not by design)

## Development

```bash
npm install          # Install dependencies
npm run dev          # Start dev server (http://localhost:3000)
npm run build        # Production build
npm run lint         # ESLint
```

### Refreshing Data
Open-source contributions data is committed. To refresh:
```bash
export GITHUB_TOKEN=your_token
npm run fetch-data
```

## Git Conventions

### Commit Messages

Format: `(type) description`

| Type | Use For |
|------|---------|
| `(feat)` | New features |
| `(imp)` | Improvements to existing features |
| `(fix)` | Bug fixes |
| `(chore)` | Maintenance, dependencies, configuration |

**Style**: Lowercase description, no trailing period.

**Examples**:
- `(feat) open-source contributions`
- `(imp) Mastodon verification`
- `(fix) conditional deploy breaks data update flow`
- `(chore) upgrade dependencies`

## Anti-patterns

| Don't | Why | Do Instead |
|-------|-----|------------|
| Add API routes | Static export doesn't support them | Use build-time data fetching |
| Use `next/image` optimization features | Disabled for static export | Images are unoptimized |
| Duplicate brand voice guidelines here | Creates drift with HQ | Reference HQ for brand decisions |
| Add aggressive CTAs or sales language | Conflicts with brand philosophy | Keep CTAs practical, minimal |
| Over-engineer for hypothetical features | Simple static site | Match solution complexity to problem |
