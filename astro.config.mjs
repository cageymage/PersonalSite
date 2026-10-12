import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

import sitemap from '@astrojs/sitemap';
import mermaid from 'astro-mermaid';

// https://astro.build/config
export default defineConfig({
	site: 'https://dave-schulze.dev',
	integrations: [
		mermaid({
			theme: 'forest',
			autoTheme: true,
			mermaidConfig: {
				themeVariables: {
					fontSize: '20px',
				},
				flowchart: {
					padding: 20,
					nodeSpacing: 40,
					rankSpacing: 50,
				},
			},
		}),
		mdx(),
		sitemap(),
	],
});
