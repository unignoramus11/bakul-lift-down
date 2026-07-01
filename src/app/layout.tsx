import type { Metadata, Viewport } from "next";
import { Geist, IBM_Plex_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { MotionPrefsProvider } from "@/components/MotionPrefsProvider";
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
    "Surveillance ops for the Bakul Hostel lift, IIIT Hyderabad. Crowd-sourced downtime tracking.",
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
      "Is the Bakul Hostel lift down? Crowd-sourced surveillance log.",
    url: "https://bakul-lift-down.vercel.app",
    siteName: "BAKUL LIFT DOWN",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BAKUL LIFT DOWN",
    description:
      "Is the Bakul Hostel lift down? Crowd-sourced surveillance log.",
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
    "Crowd-sourced surveillance log for the Bakul Hostel lift at IIIT Hyderabad.",
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
        <MotionPrefsProvider>{children}</MotionPrefsProvider>
      </body>
    </html>
  );
}
