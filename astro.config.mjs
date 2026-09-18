import { defineConfig, fontProviders } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  // Must match the domain that actually serves the site without redirecting
  // — www.theupbeatsduo.com 301s to this apex domain, so canonical tags,
  // the sitemap and og:image URLs all need to point here, not at www. When
  // they pointed at www, every canonical tag and every sitemap URL was
  // sending Google straight into that redirect — a page fetched at
  // theupbeatsduo.com/x claiming its own canonical URL was
  // www.theupbeatsduo.com/x, which then 301s right back to
  // theupbeatsduo.com/x. That self-defeating signal is a classic cause of
  // inconsistent/partial indexing in Search Console.
  site: 'https://theupbeatsduo.com',
  integrations: [sitemap()],

  // Allow-lists the old Gatsby site's image hosts so astro:assets can
  // optimize them if/when images are migrated to the <Image /> component.
  // Safe to leave in even before that migration happens.
  image: {
    domains: ['images.ctfassets.net', 'theupbeatsduo.com'],
  },

  // Astro's built-in Fonts API: self-hosts the fonts, preloads them, and
  // generates a metric-matched fallback font automatically (optimizedFallbacks
  // defaults to true) — this removes the visible "flash of fallback font"
  // swap that plain @font-face + font-display: swap causes.
  fonts: [
    {
      provider: fontProviders.fontsource(),
      name: 'Anton',
      cssVariable: '--font-anton',
      weights: [400],
      fallbacks: ['Arial Narrow', 'sans-serif'],
    },
    {
      provider: fontProviders.fontsource(),
      name: 'Work Sans',
      cssVariable: '--font-work-sans',
      weights: [400, 500, 600, 700],
      fallbacks: ['system-ui', 'sans-serif'],
    },
    {
      provider: fontProviders.fontsource(),
      name: 'Caveat',
      cssVariable: '--font-caveat',
      weights: [600],
      fallbacks: ['cursive'],
    },
  ],
});
