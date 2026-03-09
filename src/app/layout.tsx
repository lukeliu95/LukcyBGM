import type { Metadata } from "next";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/react";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://luckybgm.com"
  ),
  title: "LuckyBGM - Focus Music & Pomodoro Timer",
  description:
    "Free AI background music + Pomodoro timer. One page to enter flow state. Study, work, exercise, meditate — pick your scene.",
  keywords: [
    "AI music",
    "Pomodoro timer",
    "focus",
    "study",
    "background music",
    "flow state",
    "white noise",
    "LuckyBGM",
  ],
  openGraph: {
    title: "LuckyBGM - Focus Music & Pomodoro Timer",
    description:
      "Free AI background music + Pomodoro timer. One page to enter flow state.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "LuckyBGM",
    description:
      "Free AI background music + Pomodoro timer. One page to enter flow state.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_ID}');
              `}
            </Script>
          </>
        )}
      </head>
      <body className={`${geistSans.variable} antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
