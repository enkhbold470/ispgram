/**
 * Font Configuration
 * 
 * This file centralizes all font definitions for the application.
 * To change fonts later:
 * 1. Import your desired font from 'next/font/google' or 'next/font/local'
 * 2. Update the font configuration object below
 * 3. The changes will automatically apply throughout the app
 * 
 * Popular modern fonts (2025):
 * - Geist & Geist Mono (Vercel's fonts - modern, clean)
 * - Inter (clean, professional)
 * - Manrope (rounded, friendly)
 * - Plus Jakarta Sans (modern, geometric)
 * - Space Grotesk (tech-forward)
 */

import {DM_Mono, Plus_Jakarta_Sans } from "next/font/google";

// Main font for body text and UI
export const fontSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

// Monospace font for code snippets (if needed)
export const fontMono = DM_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  display: "swap",
});

// Export combined font variables for easy application
export const fontVariables = `${fontSans.variable} ${fontMono.variable}`;
