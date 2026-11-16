/** @type {import('tailwindcss').Config} */
// HEUREKA 2.0 – FHH Hamburg Design-Tokens
// Abgeleitet aus public/styles.css (:root)
// NICHT VERÄNDERN – gilt für JVP, A1 und A2 gleichermassen
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Primär-Tokens (identisch mit CSS-Variablen in styles.css)
        'jhh-primary':    '#003063',
        'jhh-secondary':  '#005CA9',
        'jhh-accent':     '#E10019',
        'jhh-bg':         '#EEF0F3',
        'jhh-text':       '#1A1A1A',
        'jhh-text-light': '#5A6472',
        'jhh-border':     '#C8CDD5',
        'jhh-success':    '#2E7D32',
        'jhh-warning':    '#E65100',
        'jhh-danger':     '#E10019',
        'jhh-info':       '#005CA9',
        // Alias (wie in styles.css)
        'jhh-white':      '#FFFFFF',
        'jhh-hover':      '#E8EEF5',
        'jhh-stripe':     '#F7F9FB',
        'jhh-inactive':   '#9EA8B3',
        'jhh-proto':      '#F6C542',  // Prototyp-Banner gelb
        // Hamburg-spezifisch (Legacy-Mapping)
        'hamburg-rot':    '#E10019',
        'hamburg-blau':   '#003063',
        'hamburg-blau-light': '#005CA9',
        'hamburg-tuerkis': '#00A5B5',
      },
      fontFamily: {
        // Open Sans wie im Prototyp (styles.css import)
        sans: ['Open Sans', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      fontSize: {
        'xs':   ['12px', { lineHeight: '1.5' }],
        'sm':   ['14px', { lineHeight: '1.5' }],
        'base': ['16px', { lineHeight: '1.6' }],
        'lg':   ['18px', { lineHeight: '1.5' }],
        'xl':   ['22px', { lineHeight: '1.4' }],
        '2xl':  ['28px', { lineHeight: '1.3' }],
      },
      spacing: {
        '1': '4px', '2': '8px', '3': '12px', '4': '16px',
        '5': '20px', '6': '24px', '8': '32px', '10': '40px',
        '12': '48px', '16': '64px',
      },
      borderRadius: {
        'sm': '4px',
        DEFAULT: '8px',
        'md': '8px',
        'lg': '12px',
      },
      boxShadow: {
        'sm':   '0 1px 3px rgba(0,0,0,0.06)',
        DEFAULT: '0 2px 8px rgba(0,0,0,0.08)',
        'md':   '0 2px 8px rgba(0,0,0,0.08)',
        'lg':   '0 4px 16px rgba(0,0,0,0.12)',
        'tile': '0 2px 10px rgba(0,48,99,0.10)',
      },
      maxWidth: {
        'content': '90rem',
        'form': '48rem',
      },
    },
  },
  plugins: [],
}
