// Auto-generates a branded 1200x630 social share image for every page listed
// below. Blog posts that set their own `image` in frontmatter use that
// instead (see src/pages/blogs/[slug].astro) — this route exists so every
// OTHER page still gets a proper on-brand card rather than a missing image
// or a generic browser fallback when shared on social media / iMessage / Slack.
import { getCollection } from 'astro:content';
import { OGImageRoute } from 'astro-og-canvas';

const posts = await getCollection('blog');

const pages = {
  // Key = the path segment, so this generates /open-graph/home.png etc.
  home: {
    title: 'The Upbeats Duo',
    description: 'An energetic, established live party duo for hire across the UK.',
  },
  bookings: {
    title: 'Bookings',
    description: 'Weddings, corporate events, cruises, parties and Christmas — book The Upbeats Duo.',
  },
  weddings: {
    title: 'Wedding Band',
    description: 'Live wedding music from ceremony to last dance.',
  },
  'corporate-hire': {
    title: 'Corporate Party Band',
    description: 'A sure fire hit for any corporate event.',
  },
  cruises: {
    title: 'Cruise Ship Band',
    description: 'Years of experience playing aboard cruise ships worldwide.',
  },
  parties: {
    title: 'Party Band',
    description: 'Get your next birthday, anniversary or private party rocking.',
  },
  'christmas-party-band': {
    title: 'Christmas Party Band',
    description: 'Get your office or family Christmas party swinging.',
  },
  repertoire: {
    title: 'Repertoire',
    description: 'Search 600+ songs spanning the 1950s to today.',
  },
  blog: {
    title: 'Blog',
    description: 'Tips, stories and news from The Upbeats Duo.',
  },
  contact: {
    title: 'Book Us',
    description: 'Get in touch to check availability for your event.',
  },
  // One entry per blog post, so post URLs that don't set a custom `image`
  // still get a title-specific card instead of falling back to /home.
  ...Object.fromEntries(
    posts.map(({ id, data }) => [
      `blog/${id}`,
      { title: data.title, description: data.description },
    ])
  ),
};

export const { getStaticPaths, GET } = await OGImageRoute({
  pages,
  getImageOptions: (_path, page) => ({
    title: page.title,
    description: page.description,
    bgGradient: [
      [23, 15, 43],
      [34, 26, 59],
    ],
    border: { color: [244, 185, 66], width: 2, side: 'inline-start' },
    padding: 80,
    font: {
      title: {
        color: [251, 244, 230],
        size: 64,
        weight: 'Bold',
        lineHeight: 1.1,
      },
      description: {
        color: [182, 169, 214],
        size: 28,
      },
    },
  }),
});
