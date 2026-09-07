import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  // The `image` helper (2nd schema arg) is Astro's mechanism for validating
  // + optimizing local images referenced from content frontmatter — it's
  // what lets a plain frontmatter path get resized/converted to webp at
  // build time, the same as an `import`-ed image would. That means `image`
  // paths below are resolved relative to THIS file's images living under
  // src/ (src/assets/images/...), not /public — see the field comment.
  schema: ({ image }) => z.object({
    title: z.string(),
    description: z.string(),
    date: z.date(),
    // Optional header/hero image for the post, as a path relative to this
    // content file, e.g. "../../assets/images/summer-party-band.jpg".
    // Also used as the OG/Twitter share image and as the thumbnail on
    // /blogs/ — both get their own optimized size generated from this
    // one source file (see index.astro / [slug].astro).
    image: image().optional(),
    imageAlt: z.string().optional(),
    // Controls which part of `image` stays visible when it's cropped to
    // fit the card/hero box (both use object-fit/background-size: cover).
    // Any CSS object-position/background-position value, e.g. "top",
    // "center 20%", "30% 50%". Defaults to "center" — set this when the
    // subject isn't centred in the original photo (e.g. faces near the
    // top of a landscape shot) and the default crop cuts them off.
    imagePosition: z.string().optional(),
  }),
});

export const collections = { blog };
