/**
 * QUICK FONT SWAP REFERENCE
 * 
 * Want to change fonts? Just update this file!
 * Uncomment the font you want and comment out the current one.
 */

// ============================================
// CURRENTLY ACTIVE (Geist - Modern 2025)
// ============================================
import { Geist, Geist_Mono } from "next/font/google";

export const fontSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const fontMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

// ============================================
// ALTERNATIVE OPTIONS (Uncomment to use)
// ============================================

/*
// OPTION 1: Inter (Clean & Professional)
import { Inter, JetBrains_Mono } from "next/font/google";

export const fontSans = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const fontMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});
*/

/*
// OPTION 2: Plus Jakarta Sans (Modern & Geometric)
import { Plus_Jakarta_Sans, Fira_Code } from "next/font/google";

export const fontSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const fontMono = Fira_Code({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});
*/

/*
// OPTION 3: Manrope (Friendly & Rounded)
import { Manrope, IBM_Plex_Mono } from "next/font/google";

export const fontSans = Manrope({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const fontMono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});
*/

/*
// OPTION 4: Space Grotesk (Tech-Forward)
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";

export const fontSans = Space_Grotesk({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const fontMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});
*/

/*
// OPTION 5: Instrument Sans (Editorial & Sophisticated)
import { Instrument_Sans, Source_Code_Pro } from "next/font/google";

export const fontSans = Instrument_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const fontMono = Source_Code_Pro({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});
*/

// ============================================
// EXPORTS (Don't change these)
// ============================================
export const fontVariables = `${fontSans.variable} ${fontMono.variable}`;
