/**
 * ================================================================
 * REALEST MOBILE APP - TAILWIND CSS CONFIGURATION
 * ================================================================
 *
 * Brand Colors:
 * - Off-White:    #F8F9F7 (Light backgrounds)
 * - Acid Green:   #ADF434 (Primary accent - 10%)
 * - Dark Green:   #07402F (Foundation - 60%)
 * - Deep Neutral: #2E322E (Secondary - 30%)
 *
 * Usage with NativeWind in Expo:
 * 1. Install: npx expo install nativewind tailwindcss
 * 2. Copy this file to your project root as tailwind.config.js
 * 3. Create globals.css with @tailwind directives
 * 4. Configure babel.config.js with nativewind/babel preset
 *
 * @see https://www.nativewind.dev/
 * ================================================================
 */

/** @type {import('tailwindcss').Config} */
module.exports = {
  // NativeWind v4 content configuration
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./screens/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],

  // Enable dark mode with class strategy
  darkMode: "class",

  // Disable preflight for React Native
  corePlugins: {
    preflight: false,
  },

  theme: {
    extend: {
      // ============================================================
      // BRAND COLORS
      // ============================================================
      colors: {
        // Primary Brand Colors
        brand: {
          light: "#F8F9F7",    // Off-White
          accent: "#ADF434",   // Acid Green
          dark: "#07402F",     // Dark Green
          neutral: "#2E322E",  // Deep Neutral
        },

        // Accent Green Scale (Acid Green based)
        accent: {
          50: "#f7fee7",
          100: "#ecfccb",
          200: "#d9f99d",
          300: "#bef264",
          400: "#ADF434",  // Primary Accent
          500: "#84cc16",
          600: "#65a30d",
          700: "#4d7c0f",
          800: "#3f6212",
          900: "#365314",
          950: "#1a2e05",
        },

        // Dark Green Scale
        green: {
          50: "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#22c55e",
          600: "#16a34a",
          700: "#07402F",  // Primary Dark (Brand)
          800: "#052e21",
          900: "#032117",
          950: "#01140e",
        },

        // Grayscale with green tint (derived from brand)
        gray: {
          50: "#F8F9F7",   // Off-White (Brand Light)
          100: "#f1f3ef",
          200: "#e4e7e2",
          300: "#cdd2ca",
          400: "#a8b0a4",
          500: "#818981",
          600: "#5f665e",
          700: "#4a504a",
          800: "#2E322E",  // Deep Neutral (Brand)
          900: "#1a1d1a",
          950: "#0d0f0d",
        },

        // Semantic Colors
        primary: {
          DEFAULT: "#ADF434",
          foreground: "#07402F",
          50: "#f7fee7",
          100: "#ecfccb",
          200: "#d9f99d",
          300: "#bef264",
          400: "#ADF434",
          500: "#84cc16",
          600: "#65a30d",
          700: "#4d7c0f",
          800: "#3f6212",
          900: "#365314",
        },

        secondary: {
          DEFAULT: "#07402F",
          foreground: "#F8F9F7",
          50: "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#22c55e",
          600: "#16a34a",
          700: "#07402F",
          800: "#052e21",
          900: "#032117",
        },

        // Background & Foreground
        background: {
          DEFAULT: "#F8F9F7",
          dark: "#07402F",
        },
        foreground: {
          DEFAULT: "#2E322E",
          dark: "#F8F9F7",
        },

        // Surface colors (cards, modals)
        surface: {
          DEFAULT: "#FFFFFF",
          secondary: "#F8F9F7",
          dark: "#2E322E",
          "dark-secondary": "#3a3f3a",
        },

        // Muted colors
        muted: {
          DEFAULT: "#f1f3ef",
          foreground: "#5f665e",
          dark: "#3a3f3a",
          "dark-foreground": "#a8b0a4",
        },

        // Border colors
        border: {
          DEFAULT: "#e4e7e2",
          dark: "#4a504a",
        },

        // Input colors
        input: {
          DEFAULT: "#e4e7e2",
          dark: "#4a504a",
        },

        // Ring (focus) colors
        ring: {
          DEFAULT: "#ADF434",
          dark: "#ADF434",
        },

        // Status Colors
        success: {
          DEFAULT: "#22c55e",
          light: "#86efac",
          dark: "#16a34a",
          foreground: "#FFFFFF",
        },
        warning: {
          DEFAULT: "#eab308",
          light: "#fde047",
          dark: "#ca8a04",
          foreground: "#1a1d1a",
        },
        error: {
          DEFAULT: "#ef4444",
          light: "#fca5a5",
          dark: "#dc2626",
          foreground: "#FFFFFF",
        },
        info: {
          DEFAULT: "#3b82f6",
          light: "#93c5fd",
          dark: "#2563eb",
          foreground: "#FFFFFF",
        },

        // Destructive (alias for error)
        destructive: {
          DEFAULT: "#ef4444",
          foreground: "#FFFFFF",
        },

        // Card colors
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#2E322E",
          dark: "#2E322E",
          "dark-foreground": "#F8F9F7",
        },

        // Popover colors
        popover: {
          DEFAULT: "#FFFFFF",
          foreground: "#2E322E",
          dark: "#2E322E",
          "dark-foreground": "#F8F9F7",
        },

        // Chart colors for data visualization
        chart: {
          1: "#ADF434",  // Acid Green
          2: "#07402F",  // Dark Green
          3: "#3b82f6",  // Blue
          4: "#22c55e",  // Success Green
          5: "#eab308",  // Warning Yellow
          6: "#818981",  // Gray
          7: "#65a30d",  // Medium Green
          8: "#4ade80",  // Light Green
        },
      },

      // ============================================================
      // TYPOGRAPHY
      // ============================================================
      fontFamily: {
        // Primary fonts for mobile
        display: ["Lufga", "System"],
        heading: ["Neulis-Neue", "SpaceGrotesk", "System"],
        body: ["SpaceGrotesk", "System"],
        mono: ["JetBrainsMono", "Courier"],

        // Fallback system fonts
        sans: ["SpaceGrotesk", "System"],
        serif: ["Lufga", "Georgia"],
      },

      fontSize: {
        // Mobile-optimized type scale
        "2xs": ["10px", { lineHeight: "14px" }],
        xs: ["12px", { lineHeight: "16px" }],
        sm: ["14px", { lineHeight: "20px" }],
        base: ["16px", { lineHeight: "24px" }],
        lg: ["18px", { lineHeight: "28px" }],
        xl: ["20px", { lineHeight: "28px" }],
        "2xl": ["24px", { lineHeight: "32px" }],
        "3xl": ["30px", { lineHeight: "36px" }],
        "4xl": ["36px", { lineHeight: "40px" }],
        "5xl": ["48px", { lineHeight: "52px" }],
      },

      fontWeight: {
        thin: "100",
        extralight: "200",
        light: "300",
        normal: "400",
        medium: "500",
        semibold: "600",
        bold: "700",
        extrabold: "800",
        black: "900",
      },

      // ============================================================
      // SPACING (4px base unit)
      // ============================================================
      spacing: {
        px: "1px",
        0: "0px",
        0.5: "2px",
        1: "4px",
        1.5: "6px",
        2: "8px",
        2.5: "10px",
        3: "12px",
        3.5: "14px",
        4: "16px",
        5: "20px",
        6: "24px",
        7: "28px",
        8: "32px",
        9: "36px",
        10: "40px",
        11: "44px",
        12: "48px",
        14: "56px",
        16: "64px",
        20: "80px",
        24: "96px",
        28: "112px",
        32: "128px",
        36: "144px",
        40: "160px",
        44: "176px",
        48: "192px",
        52: "208px",
        56: "224px",
        60: "240px",
        64: "256px",
        72: "288px",
        80: "320px",
        96: "384px",
      },

      // ============================================================
      // BORDER RADIUS
      // ============================================================
      borderRadius: {
        none: "0px",
        sm: "4px",
        DEFAULT: "8px",
        md: "10px",
        lg: "16px",
        xl: "20px",
        "2xl": "24px",
        "3xl": "32px",
        full: "9999px",
      },

      // ============================================================
      // BOX SHADOWS (Optimized for mobile)
      // ============================================================
      boxShadow: {
        none: "none",
        sm: "0 1px 2px rgba(46, 50, 46, 0.05)",
        DEFAULT: "0 2px 4px rgba(46, 50, 46, 0.1)",
        md: "0 4px 6px rgba(46, 50, 46, 0.1)",
        lg: "0 10px 15px rgba(46, 50, 46, 0.1)",
        xl: "0 20px 25px rgba(46, 50, 46, 0.15)",
        "2xl": "0 25px 50px rgba(46, 50, 46, 0.2)",

        // Brand glow shadows
        "accent-sm": "0 2px 8px rgba(173, 244, 52, 0.2)",
        accent: "0 4px 14px rgba(173, 244, 52, 0.25)",
        "accent-lg": "0 8px 24px rgba(173, 244, 52, 0.3)",
        "dark-sm": "0 2px 8px rgba(7, 64, 47, 0.2)",
        dark: "0 4px 14px rgba(7, 64, 47, 0.25)",
        "dark-lg": "0 8px 24px rgba(7, 64, 47, 0.3)",

        // Inner shadows
        inner: "inset 0 2px 4px rgba(46, 50, 46, 0.05)",
        "inner-lg": "inset 0 4px 8px rgba(46, 50, 46, 0.1)",
      },

      // ============================================================
      // OPACITY
      // ============================================================
      opacity: {
        0: "0",
        5: "0.05",
        10: "0.1",
        15: "0.15",
        20: "0.2",
        25: "0.25",
        30: "0.3",
        40: "0.4",
        50: "0.5",
        60: "0.6",
        70: "0.7",
        75: "0.75",
        80: "0.8",
        90: "0.9",
        95: "0.95",
        100: "1",
      },

      // ============================================================
      // ANIMATION (for React Native Reanimated)
      // ============================================================
      animation: {
        none: "none",
        spin: "spin 1s linear infinite",
        ping: "ping 1s cubic-bezier(0, 0, 0.2, 1) infinite",
        pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        bounce: "bounce 1s infinite",
        "fade-in": "fadeIn 300ms ease-out",
        "fade-out": "fadeOut 300ms ease-out",
        "slide-up": "slideUp 300ms ease-out",
        "slide-down": "slideDown 300ms ease-out",
        "scale-in": "scaleIn 200ms ease-out",
        "scale-out": "scaleOut 200ms ease-out",
      },

      keyframes: {
        spin: {
          to: { transform: "rotate(360deg)" },
        },
        ping: {
          "75%, 100%": { transform: "scale(2)", opacity: "0" },
        },
        pulse: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        bounce: {
          "0%, 100%": {
            transform: "translateY(-25%)",
            animationTimingFunction: "cubic-bezier(0.8, 0, 1, 1)",
          },
          "50%": {
            transform: "translateY(0)",
            animationTimingFunction: "cubic-bezier(0, 0, 0.2, 1)",
          },
        },
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        fadeOut: {
          from: { opacity: "1" },
          to: { opacity: "0" },
        },
        slideUp: {
          from: { transform: "translateY(10px)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
        slideDown: {
          from: { transform: "translateY(-10px)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
        scaleIn: {
          from: { transform: "scale(0.95)", opacity: "0" },
          to: { transform: "scale(1)", opacity: "1" },
        },
        scaleOut: {
          from: { transform: "scale(1)", opacity: "1" },
          to: { transform: "scale(0.95)", opacity: "0" },
        },
      },

      // ============================================================
      // TRANSITION
      // ============================================================
      transitionDuration: {
        fast: "150ms",
        DEFAULT: "300ms",
        slow: "500ms",
      },

      transitionTimingFunction: {
        DEFAULT: "cubic-bezier(0.4, 0, 0.2, 1)",
        linear: "linear",
        in: "cubic-bezier(0.4, 0, 1, 1)",
        out: "cubic-bezier(0, 0, 0.2, 1)",
        "in-out": "cubic-bezier(0.4, 0, 0.2, 1)",
        bounce: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
      },

      // ============================================================
      // Z-INDEX
      // ============================================================
      zIndex: {
        0: "0",
        10: "10",
        20: "20",
        30: "30",
        40: "40",
        50: "50",
        modal: "100",
        popover: "200",
        tooltip: "300",
        toast: "400",
        overlay: "500",
      },

      // ============================================================
      // MIN/MAX WIDTH (Mobile-first)
      // ============================================================
      minWidth: {
        0: "0px",
        full: "100%",
        screen: "100vw",
        button: "120px",
        input: "200px",
      },

      maxWidth: {
        none: "none",
        xs: "320px",
        sm: "384px",
        md: "448px",
        lg: "512px",
        xl: "576px",
        "2xl": "672px",
        full: "100%",
        screen: "100vw",
      },
    },
  },

  plugins: [],
};

/**
 * ================================================================
 * USAGE EXAMPLES FOR EXPO/NATIVEWIND
 * ================================================================
 *
 * Basic component styling:
 * ```tsx
 * import { View, Text, Pressable } from 'react-native';
 *
 * // Light mode card
 * <View className="bg-surface p-4 rounded-xl shadow-md border border-border">
 *   <Text className="text-foreground font-heading text-xl">Title</Text>
 *   <Text className="text-muted-foreground font-body">Description</Text>
 * </View>
 *
 * // Primary button (Acid Green)
 * <Pressable className="bg-primary py-3 px-6 rounded-lg shadow-accent active:opacity-90">
 *   <Text className="text-primary-foreground font-semibold text-center">
 *     Get Started
 *   </Text>
 * </Pressable>
 *
 * // Secondary button (Dark Green)
 * <Pressable className="bg-secondary py-3 px-6 rounded-lg shadow-dark active:opacity-90">
 *   <Text className="text-secondary-foreground font-semibold text-center">
 *     Learn More
 *   </Text>
 * </Pressable>
 *
 * // Dark mode support (wrap your app in a dark class provider)
 * <View className="bg-background dark:bg-background-dark">
 *   <Text className="text-foreground dark:text-foreground-dark">
 *     Adaptive text
 *   </Text>
 * </View>
 *
 * // Status badges
 * <View className="bg-success/10 px-3 py-1 rounded-full">
 *   <Text className="text-success-dark text-sm font-medium">Verified</Text>
 * </View>
 *
 * // Brand gradients (use expo-linear-gradient)
 * <LinearGradient
 *   colors={['#07402F', '#ADF434']}
 *   start={{ x: 0, y: 0 }}
 *   end={{ x: 1, y: 1 }}
 *   className="flex-1 p-6 rounded-2xl"
 * >
 *   <Text className="text-brand-light font-bold text-2xl">
 *     Welcome to RealEST
 *   </Text>
 * </LinearGradient>
 * ```
 *
 * ================================================================
 * NATIVEWIND SETUP INSTRUCTIONS
 * ================================================================
 *
 * 1. Install dependencies:
 *    npx expo install nativewind tailwindcss
 *    npm install --save-dev tailwindcss
 *
 * 2. Create global.css in your project root:
 *    @tailwind base;
 *    @tailwind components;
 *    @tailwind utilities;
 *
 * 3. Update babel.config.js:
 *    module.exports = function (api) {
 *      api.cache(true);
 *      return {
 *        presets: [
 *          ["babel-preset-expo", { jsxImportSource: "nativewind" }],
 *          "nativewind/babel",
 *        ],
 *      };
 *    };
 *
 * 4. Update metro.config.js:
 *    const { getDefaultConfig } = require("expo/metro-config");
 *    const { withNativeWind } = require("nativewind/metro");
 *
 *    const config = getDefaultConfig(__dirname);
 *    module.exports = withNativeWind(config, { input: "./global.css" });
 *
 * 5. Import global.css in your app entry:
 *    import "./global.css";
 *
 * ================================================================
 */
