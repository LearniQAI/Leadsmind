import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "sonner";
import { AIAssistant } from "@/components/ai/AIAssistant";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Leadsmind | The Ultra-Premium CRM & CRM Automation Platform",
  description: "Capture, automate, and close more deals with the world's most intelligent CRM. Built for high-performance sales, marketing, and course creators.",
  keywords: ["CRM", "Marketing Automation", "LMS", "Lead Capture", "Sales Pipeline", "Email Marketing", "Automation Workflow"],
  authors: [{ name: "Leadsmind Team" }],
  openGraph: {
    title: "Leadsmind | Premium CRM & Automation",
    description: "The all-in-one platform for lead capture and visual automation.",
    url: "https://leadsmind.ai",
    siteName: "Leadsmind",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Leadsmind | Premium CRM",
    description: "Automate your sales pipeline with ease.",
    images: ["/og-image.jpg"],
  },
  robots: "index, follow",
};

import Script from "next/script";

const jsonLd = {
// ... existing jsonLd ...
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={poppins.variable}>
      <head>
        <Script
          id="ld-json"
          type="application/ld+json"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Script
          id="theme-initializer"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  document.documentElement.classList.add('dark');
                  localStorage.setItem('theme', 'dark');
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="antialiased font-sans">
        <ThemeProvider>
          {children}
          <Toaster position="top-right" richColors />
          <AIAssistant />
        </ThemeProvider>
      </body>
    </html>
  );
}
