
export default {
	darkMode: ["class"],
	content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
	prefix: "",
	theme: {
	  container: {
		center: true,
		padding: { DEFAULT: "1.25rem", md: "2rem" },
		screens: {
		  "2xl": "1120px",
		},
	  },
	  extend: {
		fontFamily: {
		  display: ['"Instrument Serif"', "Georgia", "serif"],
		  sans: ['"Inter Tight"', "system-ui", "sans-serif"],
		  mono: ['"JetBrains Mono"', "ui-monospace", "monospace"],
		},
		colors: {
		  paper: {
			DEFAULT: "hsl(var(--paper))",
			light: "hsl(var(--paper-light))",
			deep: "hsl(var(--paper-deep))",
		  },
		  ink: {
			DEFAULT: "hsl(var(--ink))",
			soft: "hsl(var(--ink-soft))",
			faint: "hsl(var(--ink-faint))",
		  },
		  doge: {
			DEFAULT: "hsl(var(--doge))",
			deep: "hsl(var(--doge-deep))",
		  },
		  stamp: "hsl(var(--stamp))",
		  moss: "hsl(var(--moss))",
		  sky: "hsl(var(--sky))",
		  border: "hsl(var(--border))",
		  input: "hsl(var(--input))",
		  ring: "hsl(var(--ring))",
		  background: "hsl(var(--background))",
		  foreground: "hsl(var(--foreground))",
		  primary: {
			DEFAULT: "hsl(var(--primary))",
			foreground: "hsl(var(--primary-foreground))",
		  },
		  secondary: {
			DEFAULT: "hsl(var(--secondary))",
			foreground: "hsl(var(--secondary-foreground))",
		  },
		  destructive: {
			DEFAULT: "hsl(var(--destructive))",
			foreground: "hsl(var(--destructive-foreground))",
		  },
		  muted: {
			DEFAULT: "hsl(var(--muted))",
			foreground: "hsl(var(--muted-foreground))",
		  },
		  accent: {
			DEFAULT: "hsl(var(--accent))",
			foreground: "hsl(var(--accent-foreground))",
		  },
		  popover: {
			DEFAULT: "hsl(var(--popover))",
			foreground: "hsl(var(--popover-foreground))",
		  },
		  card: {
			DEFAULT: "hsl(var(--card))",
			foreground: "hsl(var(--card-foreground))",
		  },
		},
		borderRadius: {
		  lg: "var(--radius)",
		  md: "calc(var(--radius) - 2px)",
		  sm: "calc(var(--radius) - 4px)",
		},
		boxShadow: {
		  press: "3px 3px 0 0 hsl(var(--ink))",
		  "press-sm": "2px 2px 0 0 hsl(var(--ink))",
		  ticket: "6px 6px 0 0 hsl(var(--ink))",
		},
		transitionTimingFunction: {
		  press: "var(--ease-press)",
		  out: "var(--ease-out)",
		},
		keyframes: {
		  "accordion-down": {
			from: { height: "0" },
			to: { height: "var(--radix-accordion-content-height)" },
		  },
		  "accordion-up": {
			from: { height: "var(--radix-accordion-content-height)" },
			to: { height: "0" },
		  },
		  "print-in": {
			from: { opacity: "0", transform: "translateY(-6px)", clipPath: "inset(0 0 100% 0)" },
			to: { opacity: "1", transform: "translateY(0)", clipPath: "inset(0 0 0 0)" },
		  },
		  "rise": {
			from: { opacity: "0", transform: "translateY(14px)" },
			to: { opacity: "1", transform: "translateY(0)" },
		  },
		  "blink": {
			"0%, 100%": { opacity: "1" },
			"50%": { opacity: "0.25" },
		  },
		},
		animation: {
		  "accordion-down": "accordion-down 0.2s ease-out",
		  "accordion-up": "accordion-up 0.2s ease-out",
		  "print-in": "print-in 0.45s var(--ease-out) both",
		  rise: "rise 0.6s var(--ease-out) both",
		  blink: "blink 1.6s ease-in-out infinite",
		},
	  },
	},
	plugins: [require("tailwindcss-animate")],
  };
