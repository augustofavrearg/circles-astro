# Circles House — Astro + Wix Headless

Parallel migration of the Circles House frontend. The existing `../circles-web` and
`../studio-circles-house` projects remain untouched and are the visual/content baseline.

## Requirements

- Node.js 24.22.1 or newer (required by the Wix-managed Astro workflow)
- npm
- A Wix account when linking or releasing the project

## Local development

Install dependencies and create a local environment file once:

```bash
cp .env.example .env
npm install
```

Keep these values while the project is under development:

```bash
CONTENT_SOURCE=fixtures
SEO_ALLOW_INDEXING=false
SITE_URL=
```

### Offline frontend development

Use the versioned offline Astro profile and fixtures when Wix CMS is not
required:

```bash
npm run dev:local
```

Add `--host` only when another device on the same network needs to open the
site, for example a phone:

```bash
npm run dev:local -- --host
```

`--host` exposes the development server to the local network; it does not
publish or release the site in Wix.

### Local development with Wix CMS

Set `CONTENT_SOURCE=wix` in the uncommitted local environment file, then run:

```bash
npm run dev
```

This uses the Wix-managed Astro integration and the site linked in
`wix.config.json`. Switch back to `CONTENT_SOURCE=fixtures` when CMS access is
not required.

Available routes include:

- `/home` — migrated Home (`/` redirects permanently to it)
- `/rooms` — room selection before the external Cloudbeds flow
- `/design-system` — non-indexed visual reference

## Search indexing safety

The Astro project is non-indexable by default, including development, preview,
and accidental Wix releases. It emits both a `noindex,nofollow` HTML directive
and an `X-Robots-Tag: noindex, nofollow` response header.

Do not enable indexing for technical Wix hosts or staging environments. At the
final production cutover, set both variables explicitly:

```bash
SEO_ALLOW_INDEXING=true
SITE_URL=https://www.circles.house
```

`SITE_URL` is also the canonical origin. Enabling indexing without a valid HTTPS
origin causes the application to fail closed instead of publishing ambiguous
SEO signals. Keep `SEO_ALLOW_INDEXING=false` until redirects, canonical routes,
the production sitemap, and Google Search Console are ready.

Even after production indexing is enabled, a request is indexable only when its
host exactly matches `SITE_URL`. Wix preview URLs and technical hosts therefore
remain `noindex` automatically.

There is intentionally no development `robots.txt` rule that blocks all
crawling: crawlers must be able to read the `noindex` directive. The protection
is implemented in `src/layouts/SiteLayout.astro`, `src/middleware.ts`, and
`src/config/seo.ts`.

## Validation before preview or release

Run the complete local gate before creating any Wix version:

```bash
npm test
npm run check
npm run build
npm run assets:check
npm run cms:audit
git status --short
```

Do not preview or release with failing checks, unexpected Git changes, or a
failed CMS audit.

## Preview / staging workflow

Wix preview is the staging mechanism for this project. Before creating a
preview, keep the Wix-hosted environment non-indexable:

```bash
npx wix env set --key SEO_ALLOW_INDEXING --value false
npm run preview
```

Open the preview URL printed by Wix and verify at least Home, navigation,
locations, rooms, events, responsive layouts, CMS content, and Cloudbeds
redirects. Verify the SEO barriers against that URL:

```bash
curl -I https://PREVIEW_URL
curl -sS https://PREVIEW_URL | rg -i 'meta name="robots"|rel="canonical"'
```

Expected staging result:

```text
X-Robots-Tag: noindex, nofollow
<meta name="robots" content="noindex,nofollow">
no canonical tag
```

Never connect the production domain or enable indexing from a preview.

## Wix release workflow

A release uploads a version to the Wix-managed project. While the replacement
site is still being developed, every release must remain non-indexable:

```bash
npx wix env set --key SEO_ALLOW_INDEXING --value false
npm run release -- --version-type minor --comment "Describe the release"
```

Creating a release is not approval to replace the current production site.
Keep `www.circles.house` connected to the existing site until the launch
checklist below has been accepted.

## Final production cutover

Only enable indexing after all of the following are ready:

- Wix CMS content and permissions have passed the global audit.
- Every public route renders successfully without fixture content.
- Cloudbeds redirects use approved production URLs.
- Legal pages, analytics consent, accessibility, redirects, canonical paths,
  sitemap, and `robots.txt` have been accepted.
- The new site is connected to the single primary production domain.
- The old-to-new URL redirect map is ready.
- Google Search Console ownership and post-launch monitoring are available.

Keep the release non-indexable during the domain connection and smoke test.
Then configure the canonical origin and explicitly opt in:

```bash
npx wix env set --key SITE_URL --value https://www.circles.house
npx wix env set --key SEO_ALLOW_INDEXING --value true
npm run release -- --version-type minor --comment "Enable production indexing"
```

After the release, verify the public response:

```bash
curl -I https://www.circles.house/
curl -sS https://www.circles.house/ | rg -i 'meta name="robots"|rel="canonical"'
curl -I https://www.circles.house/robots.txt
curl -I https://www.circles.house/sitemap.xml
```

Expected production result:

```text
no X-Robots-Tag: noindex header
<meta name="robots" content="index,follow">
<link rel="canonical" href="https://www.circles.house/...">
```

If an SEO or deployment problem appears, immediately set
`SEO_ALLOW_INDEXING=false`, release the safe configuration, and restore the
previous production version from the Wix dashboard if necessary.

## Contributing patches

Keep one logical change per commit and generate exchange patches from that
commit. See the [patch workflow](docs/patch-workflow.md) for the shared message
template, export commands, review steps, and repository policy.

## Content architecture

Pages only use the `ContentRepository` interface in `src/domain/content.ts`.

- `src/services/content/fixtures.ts` is the offline/dev source.
- `src/services/content/wix-cms.ts` is the Wix CMS adapter.
- The Wix adapter never merges or falls back to fixtures. Missing required CMS
  content fails visibly so it can be corrected before release.
- An indexable build refuses to use `CONTENT_SOURCE=fixtures`.
- Set `CONTENT_SOURCE=wix` only after the Wix project contains the required
  canonical `CH...` collections with published data.

Required Wix singleton convention:

- `CHSiteSettings`: one item with `key = global`
- `CHPages`: one published item per page, composed through `CHPageSections` and
  `CHSectionItems`

`CHRooms` references `CHLocations` through its `location` field and requires a
published location before rooms can be rendered.

### Staging CMS data

The Wix site currently linked in `wix.config.json` is the staging CMS. It is
not Wix's native Sandbox feature: staging and the future production CMS are
separate Wix sites that share one versioned collection model.

Preview the additive staging seed without writing anything:

```bash
npm run cms:seed
```

Apply it only to the approved staging `siteId`:

```bash
npm run cms:seed:staging
```

The seed covers all 21 canonical `CH...` collections and representative
references, dates, arrays, and Rich Content. It creates missing records and
never deletes or replaces existing CMS content. The script aborts before any
write if `wix.config.json` does not point to the approved staging site. Run
`npm run cms:audit` afterwards and inspect the content in the Wix dashboard.

Do not change the approved staging ID inside the seed script to load production
content. Production will use a separate, explicitly reviewed migration and
content-import workflow.

## Cloudbeds

The website does not process availability, dates, personal data, or payments. A visitor
chooses a room and follows its CMS-managed `bookingUrl` to Cloudbeds. Set
`CLOUDBEDS_ALLOWED_ORIGIN` to reject links outside the approved Cloudbeds origin.

The fixture URLs intentionally point only to the Cloudbeds host. Replace them with the
real room-specific links before any production release.

## Wix-managed setup

This repository is already linked to its Wix-managed project through
`wix.config.json`. On a new workstation, install dependencies and authenticate:

```bash
npm install
npx wix login
npx wix whoami
```

Do not run another linking or project-creation workflow, and do not hand-write
the IDs in `wix.config.json`. Environment values and access tokens must never be
committed.

Then use the commands generated by Wix for build, preview, environment variables, and
release. The preview, release, SEO, and production-cutover procedures above are
the canonical operating runbook for this repository.
