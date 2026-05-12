import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const guides = defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/content/guides' }),
    schema: z.object({
        title: z.string(),
        description: z.string(),
        category: z.enum(['getting-started', 'features', 'install']),
        order: z.number(),
    }),
});

export const collections = { guides };
