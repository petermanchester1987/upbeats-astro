import { defineConfig, fontProviders } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://www.theupbeatsduo.com',
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
