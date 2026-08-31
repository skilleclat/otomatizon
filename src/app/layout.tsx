export interface Metadata {
  title?: string;
  description?: string;
  icons?: { icon?: string };
}
import "./globals.css";

export const metadata: Metadata = {
  title: "Otomatizon — Turn the free apps you already use into one business system",
  description: "Tell Otomatizon how your business works. It finds what you're doing manually, shows you what to automate, and builds it for you. Built for Kenyan small businesses, coaches & tutors.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@1,400;1,600;1,700&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&family=Outfit:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-obsidian-950 text-stone-100 antialiased min-h-screen selection:bg-emerald-500/20 selection:text-emerald-300">
        {/* Global SVG Noise Texture */}
        <svg className="noise-overlay" aria-hidden="true">
          <filter id="noiseFilter">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.8"
              numOctaves="3"
              stitchTiles="stitch"
            />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#noiseFilter)" />
        </svg>

        <div className="relative z-10 flex flex-col min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}
