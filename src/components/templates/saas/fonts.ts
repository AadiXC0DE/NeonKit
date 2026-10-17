import { Fragment_Mono, Mona_Sans, Tilt_Neon } from "next/font/google";

// The template brings its own type so it looks the same in any app, whatever the root layout loads.
// Mona Sans carries the width axis the display headlines stretch; Tilt Neon is only for the lit signage.
const sans = Mona_Sans({ subsets: ["latin"], axes: ["wdth"], variable: "--font-sans", display: "swap" });
const mono = Fragment_Mono({ subsets: ["latin"], weight: "400", variable: "--font-mono", display: "swap" });
const neon = Tilt_Neon({ subsets: ["latin"], variable: "--font-tilt-neon", display: "swap" });

/** Put on the template's root element: sets the three font variables and the body face. */
export const fonts = `${sans.variable} ${mono.variable} ${neon.variable} ${sans.className}`;
