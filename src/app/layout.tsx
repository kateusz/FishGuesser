import localFont from "next/font/local";
import type { ReactNode } from "react";
import "./globals.css";

const bangers = localFont({
  src: "../fonts/Bangers-400.woff2",
  weight: "400",
  display: "swap",
  variable: "--font-display",
  fallback: ["Impact", "sans-serif"],
});

const comicNeue = localFont({
  src: [
    { path: "../fonts/ComicNeue-400.woff2", weight: "400", style: "normal" },
    { path: "../fonts/ComicNeue-700.woff2", weight: "700", style: "normal" },
  ],
  display: "swap",
  variable: "--font-comic",
  fallback: ["Trebuchet MS", "sans-serif"],
});

const nunito = localFont({
  src: [
    { path: "../fonts/Nunito-400.woff2", weight: "400", style: "normal" },
    { path: "../fonts/Nunito-600.woff2", weight: "600", style: "normal" },
    { path: "../fonts/Nunito-700.woff2", weight: "700", style: "normal" },
    { path: "../fonts/Nunito-800.woff2", weight: "800", style: "normal" },
    { path: "../fonts/Nunito-900.woff2", weight: "900", style: "normal" },
  ],
  display: "swap",
  variable: "--font-body",
  fallback: ["Arial", "sans-serif"],
});

const themeBoot = `(function(){try{var t=localStorage.getItem('fg-theme');document.documentElement.dataset.theme=t==='night'?'night':'day';}catch(e){}})();`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="pl"
      className={`${bangers.variable} ${comicNeue.variable} ${nunito.variable}`}
      suppressHydrationWarning
    >
      <body>
        <script dangerouslySetInnerHTML={{ __html: themeBoot }} />
        {children}
      </body>
    </html>
  );
}
