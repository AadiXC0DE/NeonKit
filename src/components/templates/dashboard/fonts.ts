import { Fragment_Mono, Mona_Sans } from "next/font/google";

// The template brings its own type so it looks the same in any app, whatever the root layout loads.
// Mona Sans carries the width axis the display headlines stretch.
const sans = Mona_Sans({ subsets: ["latin"], axes: ["wdth"], variable: "--font-sans", display: "swap" });
const mono = Fragment_Mono({ subsets: ["latin"], weight: "400", variable: "--font-mono", display: "swap" });

/** Put on the template's root element: sets the font variables and the body face. */
export const fonts = `${sans.variable} ${mono.variable} ${sans.className}`;
