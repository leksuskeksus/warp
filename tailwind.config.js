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
      },
      fontWeight: {
        book: 'var(--font-weight-book, 450)',
        inherit: 'inherit',
      },
      letterSpacing: {
        inherit: 'inherit',
      },
      colors: {
        // Warp grayscale colors (direct access)
        g8: 'var(--warp-color-g8)',
        g12: 'var(--warp-color-g12)',
        g16: 'var(--warp-color-g16)',
        g24: 'var(--warp-color-g24)',
        g32: 'var(--warp-color-g32)',
        g48: 'var(--warp-color-g48)',
        g64: 'var(--warp-color-g64)',
        g88: 'var(--warp-color-g88)',
        g92: 'var(--warp-color-g92)',
        g94: 'var(--warp-color-g94)',
        g96: 'var(--warp-color-g96)',
        g98: 'var(--warp-color-g98)',
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
      outlineColor: {
        border: 'var(--border)',
      },
      ringColor: {
        ring: 'var(--ring)',
        destructive: 'var(--color-red-600)',
      },
      fontSize: {
        // Typography scale straight from Warp's tokens
        h1: [
          'var(--text-h1)',
          { fontWeight: 'var(--tw-font-weight, var(--text-h1--font-weight))' },
        ],
        h2: [
          'var(--text-h2)',
          { fontWeight: 'var(--tw-font-weight, var(--text-h2--font-weight))' },
        ],
        h3: [
          'var(--text-h3)',
          { fontWeight: 'var(--tw-font-weight, var(--text-h3--font-weight))' },
        ],
        h4: [
          'var(--text-h4)',
          { fontWeight: 'var(--tw-font-weight, var(--text-h4--font-weight))' },
        ],
        h5: [
          'var(--text-h5)',
          { fontWeight: 'var(--tw-font-weight, var(--text-h5--font-weight))' },
        ],
        subhead: [
          'var(--text-subhead)',
          { fontWeight: 'var(--tw-font-weight, var(--text-subhead--font-weight))' },
        ],
        'body-1': 'var(--text-body-1)',
        'body-2': 'var(--text-body-2)',
        'button-1': [
          'var(--text-button-1)',
          { fontWeight: 'var(--tw-font-weight, var(--text-button-1--font-weight))' },
        ],
        'button-2': [
          'var(--text-button-2)',
          { fontWeight: 'var(--tw-font-weight, var(--text-button-2--font-weight))' },
        ],
        'input-1': 'var(--text-input-1)',
        'input-2': 'var(--text-input-2)',
        caption: 'var(--text-caption)',
        tag: [
          'var(--text-tag)',
          { fontWeight: 'var(--tw-font-weight, var(--text-tag--font-weight))' },
        ],
      },
      boxShadow: {
        'warp-card': '0 30px 80px rgba(0,0,0,0.04)',
      },
      borderRadius: {
        none: '0',
        xs: 'var(--radius-xs)',
        sm: 'var(--radius-sm)',
        DEFAULT: 'var(--radius-md)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      aspectRatio: {
        '3/4': '3 / 4',
      },
      screens: {
        // Custom responsive breakpoints
        'tablet': '768px',
        'laptop': '1024px',
        'desktop': '1280px',
        'max-tablet': { max: '767px' },
        'max-laptop': { max: '1023px' },
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
