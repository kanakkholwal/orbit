import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'wxt';

export default defineConfig({
  modules: ['@wxt-dev/module-svelte'],
  manifest: {
    name: 'Orbit PDF',
    description: 'PDF tools in your browser side panel - auto-opens when you view a PDF.',
    version: '0.1.0',
    permissions: ['sidePanel', 'tabs','notifications'],
    side_panel: {
      default_path: 'side-panel.html',
    },
    action: {
      default_title: 'Open Orbit PDF Tools',
      default_icon: {
        '16': 'icons/icon16.png',
        '32': 'icons/icon32.png',
        '48': 'icons/icon48.png',
        '128': 'icons/icon128.png',
      },
    },
    icons: {
      '16': 'icons/icon16.png',
      '32': 'icons/icon32.png',
      '48': 'icons/icon48.png',
      '128': 'icons/icon128.png',
    },
  },
  vite: () => ({
    plugins: [tailwindcss()],
  }),
});
