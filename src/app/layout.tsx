import type { Metadata, Viewport } from "next";
import { Geist, IBM_Plex_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { MotionPrefsProvider } from "@/components/MotionPrefsProvider";
import { ImageViewerProvider } from "@/components/ImageViewer";
import { StampFilters } from "@/components/StampFilters";

// Primary — UI, headings.
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

// Secondary — body, labels.
const ibmPlex = IBM_Plex_Sans({
  variable: "--font-plex-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

// Telemetry — timestamps, data, the IST clock.
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://bakul-lift-down.vercel.app"),
  title: {
    default: "BAKUL LIFT DOWN",
    template: "%s",
  },
  applicationName: "BAKUL LIFT DOWN",
  description:
    "A crowd-sourced tracker for whether the Bakul Hostel lift at IIIT Hyderabad is working.",
  keywords: [
    "Bakul Hostel",
    "IIIT Hyderabad",
    "lift down",
    "elevator status",
    "lift tracker",
    "IIITH",
    "hostel lift",
    "downtime tracker",
  ],
  authors: [{ name: "Bakul Hostel residents" }],
  category: "utilities",
  alternates: { canonical: "/" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  openGraph: {
    title: "BAKUL LIFT DOWN",
    description:
      "Is the Bakul Hostel lift down? A crowd-sourced log.",
    url: "https://bakul-lift-down.vercel.app",
    siteName: "BAKUL LIFT DOWN",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BAKUL LIFT DOWN",
    description:
      "Is the Bakul Hostel lift down? A crowd-sourced log.",
  },
};

const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "BAKUL LIFT DOWN",
  url: "https://bakul-lift-down.vercel.app",
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "Web",
  description:
    "A crowd-sourced log of whether the Bakul Hostel lift at IIIT Hyderabad is working.",
  offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
};

export const viewport: Viewport = {
  themeColor: "#05070A",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${ibmPlex.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="ops-surface min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
        />
        <StampFilters />
        <MotionPrefsProvider>
          <ImageViewerProvider>{children}</ImageViewerProvider>
        </MotionPrefsProvider>
      </body>
    </html>
  );
}
