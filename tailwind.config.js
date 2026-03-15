/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                base: {
                    DEFAULT: '#0f1117',
                    50: '#1a1d2e',
                    100: '#141726',
                    200: '#0f1117',
                    300: '#0a0c10',
                },
                surface: {
                    DEFAULT: '#1a1d2e',
                    light: '#222640',
                    lighter: '#2a2f4a',
                },
                emerald: {
                    DEFAULT: '#10b981',
                    light: '#34d399',
                    dark: '#059669',
                },
                rose: {
                    DEFAULT: '#f43f5e',
                    light: '#fb7185',
                    dark: '#e11d48',
                },
                accent: {
                    blue: '#3b82f6',
                    purple: '#8b5cf6',
                    amber: '#f59e0b',
                    cyan: '#06b6d4',
                }
            },
            fontFamily: {
                sans: ['DM Sans', 'system-ui', 'sans-serif'],
                mono: ['DM Mono', 'monospace'],
            },
        },
    },
    plugins: [],
}
