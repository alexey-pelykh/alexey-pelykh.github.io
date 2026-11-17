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
npm run fetch-data         → Retrieves open-source contributions from GitHub API
npm run build              → Next.js static export to ./out
                           → postbuild: next-sitemap generates sitemap
npm test                   → Tests of the open-source pages (tests/open-source/), over the fetched data, out/ and gen/build.log
npm run copy-assets        → Renders gen/resume.pdf and copies to out/ (must be 1 page)
npm run render-screenshots → Generates screenshots at all breakpoints in gen/screenshots/ (local only)
```

**Deployment**: GitHub Actions on push to `main` and on the weekly scheduled run (Mondays, 03:42 UTC) → GitHub Pages

**Fetch check**: the fetch fails, and so does the build, when an owner listed in `expected-contribution-owners.json` has no pull request in the data that someone other than the site's owner merged. Pull requests he merged himself do not count, although the data keeps them for the project pages. GitHub can drop an organization's contributions for a token without any error, and the check keeps such a loss from being deployed. When the log names an owner with such merged pull requests that the file does not list yet, add it. The log leaves his own organisations out, so their names never reach that committed file. In CI the log prints only how many such owners there are, so run the fetch locally to see their names. Remove an owner only after checking that the loss is real.

**CI validates**: PDF must be exactly 1 page (fails build if >1 page). CI also runs `npm test` after the build, which saves its output to `gen/build.log`.

**Tests**: `tests/open-source/` holds `node:test` suites for the open-source pages: the curated file, `partition()`, the fetch script against a local GraphQL server, the fetched data, the built pages, the build log, and source-level checks under `src/`. Locally, run them after a fetch and `mkdir -p gen && npm run build 2>&1 | tee gen/build.log`. The fetch-script suite waits through the retry delays and takes a few minutes.

**Data flow**:
1. `retrieve-open-source-contributions.js` queries GitHub API, including the state of the issues listed under `promoteToCardWhenClosed` in the curated file
2. Results written to `data/open-source-contributions.json`: pull requests with their dates and merger, no bodies
3. Build reads that file and `src/content/open-source-projects.json` through `src/lib/open-source.ts`, which splits them with `partition()` in `src/lib/open-source-partition.ts` and generates static pages
4. `render-pdf.js` captures homepage as PDF resume

**Open-source page**: `src/content/open-source-projects.json` is the one committed source of the "My open-source projects" section and of the homepage's Notable list. It is derived by hand from the owner's private project catalogue, holds public facts only, and the build never reads that catalogue. A repository is a member only when the curated file lists it. The contributions section shows a pull request only when its repository is no member repository, belongs neither to the owner's account nor to one of his organisations, is public, and someone other than him merged it or it is still open. `ownOrganisationSha256` holds SHA-256 hashes of his organisation logins, lowercased, so the list itself names none of them: add the hash of each new organisation he gets. The build prints how many pull requests the organisation check dropped.

**Note**: `data/` is gitignored, so a fresh checkout has no contributions data: run `npm run fetch-data` before `npm run build` (see § Refreshing Data). In CI, the Fetch Data step reads its token from the `CONTRIBUTIONS_READER_GITHUB_TOKEN` secret.

**CI token**: `CONTRIBUTIONS_READER_GITHUB_TOKEN` holds an OAuth app token of the owner's account, with no scopes and no expiry date. Do not replace it with a personal access token. An organization can block personal access tokens: one the owner contributed to restricts classic tokens and admits fine-grained ones only when they expire within 366 days. GitHub then leaves that organization's contributions out of `contributionsCollection` without any error, so its project silently drops off the page. GitHub revokes an OAuth token after a year without use, and the weekly scheduled build uses it.

To issue a new token:
1. Use the owner's OAuth app for this token, with Device Flow on and "Expire user access tokens" off.
2. Run the device flow with no scope: POST `https://github.com/login/device/code` with `client_id` and an empty `scope`, approve the code at https://github.com/login/device, then POST `https://github.com/login/oauth/access_token` with `client_id`, `device_code` and `grant_type=urn:ietf:params:oauth:grant-type:device_code`.
3. Before storing it, compare `viewer.contributionsCollection(from:, to:).pullRequestContributions.totalCount` for each year since 2012 against a token that sees everything, such as `gh auth token` on the owner's account. A lower count in any year means an organization hides contributions from the new token.
4. Store it without printing it: pipe it into `gh secret set CONTRIBUTIONS_READER_GITHUB_TOKEN`.

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
├── content/       # Blog posts and the curated open-source projects (open-source-projects.json)
└── lib/           # Utilities, and the open-source loader and its partition() seam
data/              # Build-time data (JSON)
gen/               # Generated artifacts (PDF, screenshots, build log) - not deployed
tests/             # node:test suites (open-source/)
out/               # Static export + deployed PDF
```

### Patterns
- Use existing shadcn/ui components before creating new ones
- Dark mode: Use `dark:` Tailwind variants (site supports light/dark)
- Print styles: Use `print:` Tailwind variants for PDF rendering
- External links: Use `target="_blank"`
- Dynamic routes: Provide `generateStaticParams` for static generation

### Responsive Design
Site is responsive with three breakpoints:
- **Mobile**: <768px (single column, photo hidden, mobile CTAs)
- **Tablet**: 768px+ (`md:` prefix)
- **Desktop**: 1024px+ (`lg:` prefix, photo sidebar visible)

**Critical constraint**: Changes must work across all three contexts:
1. **Screen (responsive)**: Mobile/tablet/desktop layouts
2. **Print (PDF)**: Must remain a **1-page PDF** — use `print:` variants to preserve compact layout

When adding responsive classes (`flex-col md:flex-row`), always add corresponding `print:` variants (`print:flex-row`) to maintain PDF layout.

### PDF Resume Constraint

**The homepage renders as a 1-page PDF resume.** This is enforced in CI.

| Requirement | Implementation |
|-------------|----------------|
| Single page | Content must fit A4 with 1cm margins |
| Print variants | Use `print:hidden`, `print:flex-row`, `print:w-*`, `print:gap-0` |
| No responsive regression | Mobile/tablet changes must not break print layout |

**Validation**: `npm run copy-assets` generates `gen/resume.pdf` and copies to `out/resume.pdf`. CI validates page count.

**Design review**: `npm run render-screenshots` generates screenshots at all breakpoints in `gen/screenshots/` directory.

## Development

```bash
npm install          # Install dependencies
npm run dev          # Start dev server (http://localhost:3000)
npm run build        # Production build
npm run lint         # ESLint
npm test             # Open-source page tests (after a fetch and a build, see § Build Pipeline)
```

### Refreshing Data
`data/` is gitignored, so generate it locally. The script lists the contributions of the token's owner, so use a token of the owner's account, such as the GitHub CLI's. A full fetch takes about 25 minutes:
```bash
GITHUB_TOKEN=$(gh auth token) npm run fetch-data   # about 25 minutes
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
