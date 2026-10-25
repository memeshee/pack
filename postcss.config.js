import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';

/**
 * Tailwind runs on our own CSS only. Prebuilt library stylesheets in node_modules
 * (e.g. @dogeos/dogeos-sdk/style.css) ship native `@layer base { … }` blocks, which
 * Tailwind's directive check rejects ("@layer base is used but no matching @tailwind base").
 * Those files are already compiled, so they pass through untouched.
 */
const isLibraryCss = (root, result) => {
  const file = root?.source?.input?.file ?? result?.opts?.from ?? '';
  return file.replace(/\\/g, '/').includes('/node_modules/');
};

const tw = tailwindcss();
const appOnlyTailwind = {
  postcssPlugin: 'tailwindcss-app-only',
  plugins: tw.plugins.map((step) => (root, result) => (isLibraryCss(root, result) ? undefined : step(root, result))),
};

export default {
  plugins: [appOnlyTailwind, autoprefixer],
};
