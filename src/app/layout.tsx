// src/app/layout.tsx (server)
import { ClerkProvider } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import "@/app/globals.css";
import { ApiTokenProvider } from "@/lib/api-token-provider"; // adjust path if needed
import ReactQueryProvider from "./react-query-provider";
import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: {
    default: "WA Send - AI-Powered WhatsApp Automation Platform",
    template: "%s | WA Send"
  },
  description: "Automate your WhatsApp business communication with AI. Smart chatbot, appointment booking, lead capture, CRM integration, and unlimited messaging for just $20/month. Increase conversions by 300%.",
  keywords: [
    "WhatsApp automation",
    "WhatsApp chatbot",
    "AI chatbot",
    "WhatsApp business",
    "WhatsApp CRM",
    "lead generation",
    "appointment booking",
    "customer support automation",
    "WhatsApp API",
    "business messaging",
    "sales automation",
    "customer engagement",
    "marketing automation"
  ],
  authors: [{ name: "WA Send Team" }],
  creator: "WA Send",
  publisher: "WA Send",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://wasend.com",
    siteName: "WA Send",
    title: "WA Send - AI-Powered WhatsApp Automation Platform",
    description: "Automate your WhatsApp business communication with AI. Smart chatbot, appointment booking, lead capture, and CRM integration. Start for just $20/month.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "WA Send - WhatsApp Automation Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "WA Send - AI-Powered WhatsApp Automation",
    description: "Automate your WhatsApp business communication with AI. Smart chatbot, appointment booking, and lead capture.",
    images: ["/twitter-image.png"],
    creator: "@wasend",
  },
  alternates: {
    canonical: "https://wasend.com",
  },
  category: "Technology",
  classification: "Business Software",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0f1a" },
  ],
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="format-detection" content="telephone=no" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "WA Send",
              applicationCategory: "BusinessApplication",
              operatingSystem: "Web",
              description: "AI-Powered WhatsApp Automation Platform for businesses. Automate customer communication, booking, and lead capture.",
              offers: {
                "@type": "Offer",
                price: "20",
                priceCurrency: "USD",
                priceValidUntil: "2025-12-31",
              },
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: "4.9",
                ratingCount: "200",
                bestRating: "5",
                worstRating: "1"
              },
              featureList: [
                "AI Chatbot",
                "Appointment Booking",
                "Lead Capture",
                "CRM Integration",
                "Unlimited Messages"
              ]
            }),
          }}
        />
      </head>
      <body>
        <ClerkProvider>
          <ApiTokenProvider>
            {/* No dehydration state yet; add later if you do server prefetch */}
            <ReactQueryProvider>{children}</ReactQueryProvider>
          </ApiTokenProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}

