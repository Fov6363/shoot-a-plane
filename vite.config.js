import { defineConfig } from 'vite';
import { execSync } from 'child_process';

let commitHash = 'unknown';
try {
  commitHash = execSync('git rev-parse --short HEAD').toString().trim();
} catch {
  // Vercel 等 CI 环境可能没有 .git，使用环境变量
  commitHash = process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || 'unknown';
}

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
