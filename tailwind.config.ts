import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		colors: {
  			background: 'var(--background)',
  			foreground: 'var(--foreground)',
  			primary: 'var(--primary)',
  			secondary: 'var(--secondary)',
  			accent: 'var(--accent)',
  			error: 'var(--error)',
  			success: 'var(--success)',
  			warning: 'var(--warning)',
  			info: 'var(--info)',
        creative: 'var(--creative)',
        notice: 'var(--notice)',
  			border: 'var(--border)',
  			input: 'var(--input)',
  			ring: 'var(--ring)',
  			card: {
  				DEFAULT: 'var(--card)',
  				foreground: 'var(--card-foreground)'
  			},
  			popover: {
  				DEFAULT: 'var(--popover)',
  				foreground: 'var(--popover-foreground)'
  			},
  			muted: {
  				DEFAULT: 'var(--muted)',
  				foreground: 'var(--muted-foreground)'
  			},
  			destructive: {
  				DEFAULT: 'var(--destructive)',
  				foreground: 'var(--destructive-foreground)'
  			},
  			chart: {
  				'1': 'var(--chart-1)',
  				'2': 'var(--chart-2)',
  				'3': 'var(--chart-3)',
  				'4': 'var(--chart-4)',
  				'5': 'var(--chart-5)'
  			},
  			text: 'var(--text)',
  			textPrimary: 'var(--text-primary)',
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
      outline: {
        ring: 'var(--ring)',
      },
  	}
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
