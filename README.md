# The Upbeats Duo — Astro site

A rebuild of theupbeatsduo.com in [Astro](https://astro.build) 7. Static
output, no server required to run in production.

## 1. Run it locally

You'll need **[Node.js v22 or later](https://nodejs.org)** — Astro 7 raised
its minimum supported Node version to 22, so if `node -v` shows 18 or 20,
update first or `npm install` will fail.

```bash
npm install
npm run dev
```

> Using pnpm instead of npm? You'll also need `pnpm add canvaskit-wasm` —
> the OG-image package (`astro-og-canvas`) needs it as a direct dependency
> under pnpm's stricter dependency resolution. Not needed with npm/yarn.

Open the URL it prints (usually `http://localhost:4321`).

- `npm run build` — builds the static site into `dist/`
- `npm run preview` — serves that `dist/` build locally, so you can check the
  real production output before deploying

## 2. What's in here

```
src/
  layouts/Layout.astro       Base HTML shell: SEO tags, JSON-LD, header/footer
  components/
    Header.astro / Footer.astro
    JsonLd.astro              Generic structured-data <script> renderer
    Analytics.astro           GA4 + cookie-consent banner, inert until PUBLIC_GA_ID is set (see below)
    Breadcrumbs.astro         Visible breadcrumb trail + matching BreadcrumbList schema
    ReviewsCarousel.astro     Scrollable, auto-advancing reviews (see below)
    StatsCounter.astro        Count-up stats grid (see below)
    RepertoireBrowser.astro   Search-by-song-or-artist widget
  data/
    songs.json                Every song: { title, artist, tags }
    artists.json               Sorted unique artist list, used by the repertoire filter
  content/blog/*.md           Blog posts (Markdown + frontmatter)
  content.config.ts           Content collection schema (Astro's Content Layer API)
  pages/
    index.astro                Homepage
    products/                  Booking pages — kept at /products/… to match
                                the old site's URLs (see "URLs" below)
    repertoire.astro           Searchable song list
    blogs/                     Blog index + [slug].astro (dynamic post pages)
    contact.astro              Contact form (Netlify Forms — see below)
    contact/thank-you.astro    Form submission redirect target
    open-graph/[...route].ts   Auto-generates branded social share images
    404.astro
public/                        Static files served as-is (favicon, robots.txt)
astro.config.mjs               Site URL, fonts, image domains, sitemap integration
```

### Editing the song list

Everything on `/repertoire/` and the homepage's scrolling ticker comes from
`src/data/songs.json`. To update it:

1. Export your Notion song database again (`•••` menu → Export → CSV).
2. Re-run a parse pass (or just hand-edit the JSON — it's a simple array of
   `{ "title": "...", "artist": "...", "tags": [...] }` objects).
3. `artists.json` should stay in sync — it's just the sorted, de-duplicated
   `artist` values from `songs.json`.

The homepage marquee (`src/pages/index.astro`) picks a curated `featured`
list of song titles out of `songs.json` — edit that array to change which
songs scroll across the gold ticker.

### Blog header images

Blog posts (`src/content/blog/*.md`) accept two optional frontmatter fields:

```yaml
image: "/images/blog/my-post.jpg"   # or a full URL
imageAlt: "Description for screen readers"
```

If set, it's used as a header banner on the post itself, as the thumbnail on
`/blogs/`, and as the social share image for that post. Leave it out and the
post still gets a proper on-brand share image automatically — see "Social
share images" below — it just won't have a photo banner on the page itself.

### Reviews carousel

The "Recent reviews" section on the homepage (`src/pages/index.astro`) is a
`reviews` array feeding `<ReviewsCarousel>`. Add as many as you like:

```js
const reviews = [
  { name: 'Jane Doe', occasion: 'Wedding', score: '10/10', quote: '...' },
  // add more here — no limit
];
```

It scrolls horizontally with snap points, auto-advances every ~5.5s, and
pauses the moment someone hovers, focuses, or manually scrolls it — and
skips autoplay entirely if the visitor has "reduce motion" set.

### Stats counter

The stats strip counts up from 0 every time it scrolls into view (not just
once) — edit the `stats` array in `src/pages/index.astro`:

```js
const stats = [
  { value: allSongs.length, suffix: '+', label: 'Songs in the repertoire' },
  { value: 10, label: 'Years gigging professionally' },
  // ...
];
```

`prefix`/`suffix` are optional strings tacked onto the animated number.
Respects reduced-motion (jumps straight to the final number, no count-up).

### Editing text/images

Every page is a normal `.astro` file — copy lives directly in the file as
plain text/JSX-like markup, styles are in a `<style>` block at the bottom of
each file. There's no CMS wired up; this is a fully static, hand-edited site,
which fits how infrequently things like pricing or booking copy tend to
change. If you'd rather add a CMS later (for the blog especially), Astro
supports plugging in ones like Sanity or a Git-based CMS such as Decap — flag
if you want that set up.

### Images

The site currently **hotlinks images from your existing Gatsby site's hosting**
(Contentful and the site's own `/static/` folder) so that everything renders
correctly right now. **Before you decommission the old site, download these
images and move them into `public/images/` in this project**, then update the
`src="..."` / `image="..."` values to local paths (e.g. `/images/wedding-band.jpg`).
Otherwise those images will break the moment the old host goes away.

`astro.config.mjs` already allow-lists the old image hosts under `image.domains`,
so once images move to `src/` (not `public/`), you can switch to Astro's
`<Image />` component for automatic resizing/format conversion and guaranteed
no layout shift — a further performance/SEO win, not done yet in this pass.

### Social share images

Every page gets a branded 1200×630 social share image, generated automatically
at build time by `src/pages/open-graph/[...route].ts` (using the
[astro-og-canvas](https://github.com/delucis/astro-og-canvas) package) — no
manual image needed. This covers every main page and every blog post that
doesn't set its own `image` in frontmatter. To add a new page to this system
(e.g. if you add another page later), just add an entry to the `pages` object
in that file with a `title`/`description`.

### Contact form

**This is Netlify Forms**, not a third-party service — the same mechanism
your old Gatsby site likely used, since Gatsby + Netlify is a very common
pairing. Here's how it works and why the old "Formspree" version was the
wrong call:

Astro renders `/contact/` to plain static HTML at build time. Netlify's
build system scans that HTML for a `<form data-netlify="true" name="...">`
tag and registers it automatically — no signup, no API key, no third-party
service, and it's free. Submissions show up in your Netlify dashboard under
**Site → Forms**, and you can wire up email notifications there (Site
settings → Forms → Form notifications → "Email notification").

**This only works if the site is actually hosted on Netlify.** If you decide
to host on Cloudflare Pages instead (see the hosting options below),
Netlify Forms won't work at all, and you'd need either:
- [Formspree](https://formspree.io) (free tier, ~50 submissions/month) — swap
  the form's `action` to `https://formspree.io/f/YOUR_FORM_ID` and remove the
  `data-netlify`/`netlify-honeypot` attributes and the hidden `form-name` field, or
- A small Cloudflare Pages Function (a few lines of code) to handle the POST
  and send an email via a transactional email API.

Say the word once you've picked a host and this can be finalised either way.

After a successful submission, Netlify redirects to `/contact/thank-you/` —
a plain confirmation page, already built.

### Analytics

Google Analytics 4 is wired in (`src/components/Analytics.astro`, loaded
from `Layout.astro` on every page) but **inert until you set an environment
variable** — nothing renders, and zero extra bytes ship, until then.

1. Copy `.env.example` to `.env` and fill in `PUBLIC_GA_ID` with your GA4
   Measurement ID (Admin → Data Streams → your stream → "Measurement ID",
   looks like `G-XXXXXXXXXX`) if you want to test it locally with `npm run
   dev`. `.env` is gitignored — it never gets committed.
2. At go-live, set the same `PUBLIC_GA_ID` variable on your host instead
   (Netlify: Site settings → Environment variables) and deploy. That's the
   only step needed to switch analytics on for the live site.

Because Google Analytics sets cookies, it's gated behind a cookie-consent
banner (bottom of the page) that only appears once `PUBLIC_GA_ID` is set —
GA doesn't load at all until a visitor clicks "Accept". Their choice is
remembered in `localStorage`, and a "Cookie preferences" link in the footer
lets them reopen the banner to change their mind later. This keeps the site
on the right side of UK GDPR/PECR without a third-party consent platform.

### Newsletter signup

Inline signup forms (`src/components/NewsletterSignup.astro`) on the
homepage, contact page, blog index and every blog post submit to Brevo via
a **Netlify Function** (`netlify/functions/subscribe.ts`), not directly
from the browser — a Brevo API key has full account access, so it must
never reach client-side JS. The function adds the email to a Brevo list;
your existing Brevo automation is what actually sends the welcome
email/sequence from there.

**This only works when deployed on Netlify** (same caveat as Netlify Forms
above) — `npm run dev` does not run Netlify Functions at all, so
`/api/subscribe` will 404 locally unless you use the Netlify CLI instead:

1. `npm install -g netlify-cli` (one-off), then `netlify dev` instead of
   `npm run dev` — it proxies the Astro dev server *and* runs the function
   locally, reading `BREVO_API_KEY` / `BREVO_LIST_ID` from a local `.env`
   (copy `.env.example` → `.env` and fill them in — gitignored, never
   committed).
2. Get `BREVO_API_KEY` from Brevo → Settings (SMTP & API) → API Keys.
3. Get `BREVO_LIST_ID` from Brevo → Contacts → Lists → the list your
   automation is watching (the number in the URL/list details).
4. At go-live, set both as Netlify environment variables (Site settings →
   Environment variables) instead of relying on the local `.env` — that's
   what the deployed site actually reads from.

## 3. URLs — why they match the old site

The booking pages live at `/products/weddings`, `/products/cruises`, etc. —
the exact same paths as the current Gatsby site — rather than being renamed
to something like `/bookings/weddings`. That's deliberate: any existing
Google rankings, backlinks from directories like Poptop or Encore Musicians,
and bookmarks all point at the current URLs, and keeping them identical means
none of that breaks when you switch hosts. Same logic applies to `/blogs/`
and `/repertoire/`.

## 4. SEO — what's built in

- **Structured data (JSON-LD)** on every page: a sitewide `MusicGroup` schema
  (name, socials, genre) via `Layout.astro`, `Service` schema on each booking
  page (Weddings, Cruises, etc.), `BlogPosting` schema on every blog post, and
  `BreadcrumbList` schema matching the visible breadcrumb trail. Test any page
  with [Google's Rich Results Test](https://search.google.com/test/rich-results).
- **Breadcrumbs** — visible on every page below the homepage, and matched by
  the JSON-LD above.
- **Auto-generated social share images** for every page (see "Social share
  images" above) — link previews in iMessage/Slack/social media now always
  show a proper on-brand card instead of a blank or missing image.
- **Sitemap** — auto-generated at `/sitemap-index.xml` via `@astrojs/sitemap`.
- **`robots.txt`** — points crawlers at the sitemap.
- **Canonical URLs, Open Graph, and Twitter Card tags** on every page.
- **`lang="en-GB"`** — small but correct signal for a UK-based business.

Still worth doing, not covered in this pass:
- Adding a real Google Business Profile / Bing Places listing pointing at the
  new site (helps local "party band near me" style searches — this is outside
  the codebase, done via Google/Bing directly).
- Migrating hotlinked images to `src/` + Astro's `<Image />` component for
  automatic optimisation (see "Images" above) — page speed is a ranking factor.
- Internal linking from blog posts to relevant booking pages where it reads
  naturally (e.g. the wedding-band post already links to `/contact/` — could
  also link to `/products/weddings`).

## 5. Going live

### Step 1 — Push to a Git repository

If you don't already have this in Git:

```bash
git init
git add .
git commit -m "Astro rebuild of theupbeatsduo.com"
```

Push it to a new repo on GitHub (or GitLab/Bitbucket) — most static hosts
deploy straight from there.

### Step 2 — Pick a host and connect it

Astro's static output works on pretty much any static host. Two solid, free
options that both auto-deploy from Git:

**Netlify** — required if you want the contact form to work as-is (see
"Contact form" above).
1. netlify.com → "Add new site" → "Import an existing project" → pick your repo.
2. Build command: `npm run build`. Publish directory: `dist`.
3. Deploy — Netlify gives you a temporary `*.netlify.app` URL to check first.
4. Once live, go to Site settings → Forms → Form notifications, and add an
   email notification so enquiries actually reach your inbox.

**Cloudflare Pages**
1. dash.cloudflare.com → Workers & Pages → "Create application" → "Pages" → connect your repo.
2. Build command: `npm run build`. Build output directory: `dist`.
3. **Set the Node.js version to 22** in the build settings — Cloudflare
   Pages' default build image still uses an older Node version that Astro 7
   no longer supports, so the build will fail unless you override this.
4. Deploy — you get a `*.pages.dev` preview URL.
5. See "Contact form" above — you'll need an alternative to Netlify Forms.

Pick Netlify unless you have a specific reason not to — it's the simpler
option here since the form "just works" with no extra setup.

### Step 3 — Check the preview thoroughly before touching DNS

On the `*.netlify.app` / `*.pages.dev` URL, before going any further:

- Click through every page and every nav link
- Test the contact form end-to-end (submit a real test enquiry and confirm
  the email notification arrives, then check it redirects to the thank-you page)
- Check it on your phone — including the mobile nav menu
- Run it through [PageSpeed Insights](https://pagespeed.web.dev) for a quick performance/SEO sanity check
- Confirm `/sitemap-index.xml` loads (auto-generated by the sitemap integration)
- Spot check a couple of `/open-graph/*.png` URLs directly, and paste a page
  URL into [opengraph.xyz](https://www.opengraph.xyz) to preview the share card

### Step 4 — Point your domain at the new host

This is the only genuinely risky step — a DNS mistake can take the whole
site offline temporarily, so:

1. **First, find out where your DNS is currently managed** — log into
   whichever registrar or DNS provider currently hosts `theupbeatsduo.com`'s
   records (this might be your domain registrar, or wherever your current
   Gatsby host tells you to point DNS).
2. **Lower the TTL** (time-to-live) on your existing DNS records to something
   short, like 300 seconds (5 minutes), at least 24 hours before you plan to
   switch. This makes any change propagate fast, so if something's wrong you
   can fix it quickly rather than waiting hours.
3. In Netlify/Cloudflare Pages, add your custom domain (`theupbeatsduo.com`
   and `www.theupbeatsduo.com`) under the site's domain settings. It'll show
   you the exact DNS records to add — typically:
   - An `A` record (or `ALIAS`/`ANAME`) for the bare domain (`theupbeatsduo.com`)
   - A `CNAME` record for `www` pointing at the host
4. Add those records at your DNS provider.
5. **Leave your `store.theupbeatsduo.com` subdomain's DNS records completely
   untouched** — that's your Shopify (or similar) store and isn't part of
   this migration.
6. Wait for DNS to propagate (usually minutes with a low TTL, up to 24–48
   hours worst case) and for SSL to auto-provision on the new host.
7. Once `https://www.theupbeatsduo.com` is loading the new site correctly,
   you can raise the TTL back to a normal value (e.g. 3600s).

### Step 5 — After cutover

- Submit the new sitemap (`https://www.theupbeatsduo.com/sitemap-index.xml`)
  in [Google Search Console](https://search.google.com/search-console).
- Spot-check that your important old URLs (from Search Console's existing
  indexed pages) still return 200, not 404 — this should be automatic since
  the URL structure was kept identical, but worth confirming.
- Set `PUBLIC_GA_ID` on your host to switch on Google Analytics (see
  "Analytics" above) — it's already wired in, just inert until then.
- Keep the old Gatsby site/host around (even if just paused, not deleted)
  for a couple of weeks in case you need to roll back.
- Re-check the supplier badge links in the footer (Poptop, Last Minute
  Musicians, Encore, Entertainers Worldwide) still point to live profiles.

## 6. Known gaps / things to finish before launch

- [ ] Pick a host and finalise the contact form accordingly (Netlify Forms
      works as-is; Cloudflare Pages needs the Formspree/function swap — see
      "Contact form" above)
- [ ] Self-host images currently hotlinked from the old site (see "Images" above)
- [ ] Set `PUBLIC_GA_ID` on your host at go-live to switch on analytics (see "Analytics" above)
- [ ] Set `BREVO_API_KEY` / `BREVO_LIST_ID` on your host at go-live to switch on the newsletter signup (see "Newsletter signup" above)
- [ ] Point a Google Business Profile / Bing Places listing at the new site
