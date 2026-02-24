import { defineConfig } from 'vite';
import { execSync } from 'child_process';

const commitHash = execSync('git rev-parse --short HEAD').toString().trim();

function injectCommitMeta() {
  return {
    name: 'inject-commit-meta',
    transformIndexHtml(html) {
      return html.replace('</head>', `  <meta name="commit" content="${commitHash}">\n</head>`);
    },
  };
}

export default defineConfig({
  base: './',
  plugins: [injectCommitMeta()],
  build: {
    outDir: 'dist',
    assetsInlineLimit: 0,
  },
  server: {
    port: 3000,
    open: true
  }
});
