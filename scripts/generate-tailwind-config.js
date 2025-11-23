const fs = require('fs');
const path = require('path');

// Read extraction results
const extractionPath = path.join(__dirname, '../analysis/class-extraction.json');
const extraction = JSON.parse(fs.readFileSync(extractionPath, 'utf-8'));

// Generate the complete Tailwind config
const config = `const warpColors = {
  'g-8': 'var(--warp-color-g8)',
  'g-12': 'var(--warp-color-g12)',
  'g-16': 'var(--warp-color-g16)',
  'g-24': 'var(--warp-color-g24)',
  'g-32': 'var(--warp-color-g32)',
  'g-48': 'var(--warp-color-g48)',
  'g-64': 'var(--warp-color-g64)',
  'g-88': 'var(--warp-color-g88)',
  'g-92': 'var(--warp-color-g92)',
  'g-94': 'var(--warp-color-g94)',
  'g-96': 'var(--warp-color-g96)',
  'g-98': 'var(--warp-color-g98)',
  'blue-50': 'var(--warp-color-blue-50)',
  'blue-500': 'var(--warp-color-blue-500)',
  'blue-600': 'var(--warp-color-blue-600)',
  'green-50': 'var(--warp-color-green-50)',
  'green-100': 'var(--warp-color-green-100)',
  'green-400': 'var(--warp-color-green-400)',
  'green-500': 'var(--warp-color-green-500)',
  'green-600': 'var(--warp-color-green-600)',
  'green-700': 'var(--warp-color-green-700)',
  'orange-50': 'var(--warp-color-orange-50)',
  'orange-400': 'var(--warp-color-orange-400)',
  'orange-500': 'var(--warp-color-orange-500)',
  'orange-600': 'var(--warp-color-orange-600)',
  'purple-50': 'var(--warp-color-purple-50)',
  'purple-100': 'var(--warp-color-purple-100)',
  'purple-600': 'var(--warp-color-purple-600)',
  'purple-700': 'var(--warp-color-purple-700)',
  'red-50': 'var(--warp-color-red-50)',
  'red-400': 'var(--warp-color-red-400)',
  'red-500': 'var(--warp-color-red-500)',
  'red-600': 'var(--warp-color-red-600)',
  'sky-50': 'var(--warp-color-sky-50)',
  'sky-400': 'var(--warp-color-sky-400)',
  'sky-500': 'var(--warp-color-sky-500)',
  'sky-600': 'var(--warp-color-sky-600)',
  'yellow-500': 'var(--warp-color-yellow-500)',
  'yellow-600': 'var(--warp-color-yellow-600)',
};

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        brand: [
          'brandFont',
          'brandFont Fallback',
          'Macan',
          'Arial',
          'sans-serif',
        ],
        // Font weight utilities
        book: ['var(--warp-text-body-weight)'],
      },
      fontWeight: {
        book: 'var(--font-weight-book, 450)',
      },
      colors: {
        warp: warpColors,
        // Semantic color tokens from extracted classes
        fg: 'var(--fg)',
        fg2: 'var(--fg2)',
        fg3: 'var(--fg3)',
        fg4: 'var(--fg4)',
        bg: 'var(--bg)',
        bg2: 'var(--bg2)',
        bg3: 'var(--color-white)',
        divider: 'var(--divider)',
        ring: 'var(--ring)',
        destructive: 'var(--color-red-600)',
      },
      textColor: {
        // Text semantic tokens
        'fg-error': 'var(--fg-error)',
        'fg-btn-main': 'var(--fg-btn-main)',
        'fg-btn-secondary': 'var(--fg-btn-secondary)',
        'fg-btn-active': 'var(--fg-btn-active)',
      },
      backgroundColor: {
        // Background semantic tokens
        'bg-disabled': 'var(--bg-disabled)',
        'bg-btn-main': 'var(--bg-btn-main)',
        'bg-btn-main-hover': 'var(--bg-btn-main-hover)',
        'bg-btn-secondary': 'var(--bg-btn-secondary)',
        'bg-btn-secondary-hover': 'var(--bg-btn-secondary-hover)',
        'bg-btn-active': 'var(--bg-btn-active)',
        'bg-btn-active-hover': 'var(--bg-btn-active-hover)',
        'bg-hover': 'var(--bg-hover)',
        'background-alt': 'var(--bg-hover)',
      },
      borderColor: {
        // Border semantic tokens
        input: 'var(--border)',
        border: 'var(--border)',
        ring: 'var(--ring)',
        destructive: 'var(--color-red-600)',
        'btn-secondary': 'var(--border-btn-secondary)',
      },
      ringColor: {
        ring: 'var(--ring)',
        destructive: 'var(--color-red-600)',
      },
      fontSize: {
        // Typography scale from Warp tokens
        'display': 'var(--warp-text-display)',
        'title': 'var(--warp-text-title)',
        'h1': 'var(--warp-text-h1)',
        'h2': 'var(--warp-text-h2)',
        'h3': 'var(--warp-text-h3)',
        'h4': 'var(--warp-text-h4)',
        'subhead': 'var(--warp-text-subhead)',
        'nav-item': 'var(--warp-text-nav-item)',
        'body-1': 'var(--warp-text-body-1)',
        'body-2': 'var(--warp-text-body-2)',
        'button-1': 'var(--warp-text-button-1)',
        'button-2': 'var(--warp-text-button-2)',
        'input-1': 'var(--warp-text-field-1)',
        'input-2': 'var(--warp-text-field-2)',
        'caption': 'var(--warp-text-caption)',
        'tag': 'var(--warp-text-tag)',
      },
      boxShadow: {
        'warp-card': '0 30px 80px rgba(0,0,0,0.04)',
      },
      borderRadius: {
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      screens: {
        // Custom responsive breakpoints
        'tablet': '768px',
        'laptop': '1024px',
        'desktop': '1280px',
        'max-tablet': { max: '767px' },
        'max-mobile-h': { max: '600px' },
      },
      transitionProperty: {
        'default': 'all',
      },
      transitionDuration: {
        'default': '150ms',
      },
    },
  },
  plugins: [],
};
`;

// Write the new config
const configPath = path.join(__dirname, '../tailwind.config.new.js');
fs.writeFileSync(configPath, config);

console.log('✅ Tailwind config generated!');
console.log(`📝 New config written to: ${configPath}`);
console.log('\n🎯 This config includes:');
console.log('  ✓ All semantic color tokens (fg, bg, divider, etc.)');
console.log('  ✓ Complete typography scale (h1-h4, body-1/2, button-1/2, etc.)');
console.log('  ✓ Border/ring semantic tokens (border-input, ring, etc.)');
console.log('  ✓ Custom responsive breakpoints (max-tablet, max-mobile-h)');
console.log('  ✓ Button state colors (bg-btn-main, bg-btn-secondary, etc.)');
console.log('\n📖 Next steps:');
console.log('  1. Review tailwind.config.new.js');
console.log('  2. Backup your current tailwind.config.js');
console.log('  3. Replace it with the new one:');
console.log('     mv tailwind.config.js tailwind.config.old.js');
console.log('     mv tailwind.config.new.js tailwind.config.js');
