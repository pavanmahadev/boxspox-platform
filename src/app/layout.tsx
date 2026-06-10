import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { ToastProvider } from "@/components/ui/ToastProvider";
import { LayoutWrapper } from "@/components/layout/LayoutWrapper";
import { SpeedInsights } from '@vercel/speed-insights/next';

export const metadata: Metadata = {
  metadataBase: new URL('https://boxspox.in'),
  title: {
    default: "Boxspox \u2014 Learn to Code, The Smart Way",
    template: "%s | Boxspox"
  },
  description: "A modern, interactive educational platform for learning web development. Master HTML, CSS, JavaScript, Python, React, and more with hands-on tutorials and a live code editor.",
  keywords: [
    "learn coding", "web development tutorials", "HTML tutorial", "CSS tutorial",
    "JavaScript tutorial", "Python tutorial", "React tutorial", "interactive code editor",
    "learn programming", "coding platform", "free coding courses", "programming examples"
  ],
  authors: [{ name: "Boxspox" }],
  creator: "Boxspox",
  publisher: "Boxspox",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Boxspox \u2014 Learn to Code, The Smart Way",
    description: "Master web development with interactive tutorials and a live code editor. Free tutorials for HTML, CSS, JavaScript, Python, and more.",
    url: "https://boxspox.in",
    siteName: "Boxspox",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Boxspox Platform Preview',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Boxspox \u2014 Learn to Code, The Smart Way",
    description: "A modern, interactive educational platform for learning web development.",
    creator: "@boxspox",
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

import { Inter, Space_Grotesk, JetBrains_Mono } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-space',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <body>
        <ToastProvider>
          <ThemeProvider>
            <LayoutWrapper>
              {children}
            </LayoutWrapper>
          </ThemeProvider>
        </ToastProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}
