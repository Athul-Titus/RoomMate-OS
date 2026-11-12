import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#4338CA',
          hover: '#3730A3',
          active: '#312E81',
          subtle: '#EEF2FF',
          muted: '#C7D2FE',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          alt: '#F1F5F9',
        },
        border: {
          DEFAULT: '#E2E8F0',
        },
        text: {
          primary: '#0F172A',
          secondary: '#475569',
          muted: '#94A3B8',
        },
        error: '#DC2626',
        success: '#16A34A',
      },
      borderRadius: {
        sm: '4px',
        DEFAULT: '6px',
        md: '6px',
        lg: '8px',
        xl: '12px',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        '3xs': '12px',
        '2xs': '14px',
        xs: '14px',
        sm: '14px',
        base: '16px',
        lg: '18px',
        xl: '20px',
        '2xl': '24px',
        '3xl': '30px',
        '4xl': '36px',
      },
    },
  },
  plugins: [],
}

export default config
