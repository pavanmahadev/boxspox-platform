import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { ToastProvider } from "@/components/ui/ToastProvider";
import { LayoutWrapper } from "@/components/layout/LayoutWrapper";

export const metadata: Metadata = {
  title: "Boxspox — Learn to Code, The Smart Way",
  description:
    "A modern, interactive educational platform for learning web development. Master HTML, CSS, JavaScript, Python, React, and more with hands-on tutorials and a live code editor.",
  keywords: [
    "learn coding",
    "web development tutorials",
    "HTML tutorial",
    "CSS tutorial",
    "JavaScript tutorial",
    "Python tutorial",
    "React tutorial",
    "interactive code editor",
    "learn programming",
    "coding platform",
  ],
  authors: [{ name: "Boxspox" }],
  openGraph: {
    title: "Boxspox — Learn to Code, The Smart Way",
    description:
      "Master web development with interactive tutorials and a live code editor. Free tutorials for HTML, CSS, JavaScript, Python, and more.",
    type: "website",
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
      </body>
    </html>
  );
}
