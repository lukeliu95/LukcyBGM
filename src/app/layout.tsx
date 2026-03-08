import type { Metadata } from "next";
import Script from "next/script";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://aimusicflow.com"
  ),
  title: "AI Music Flow - AI 生成的专注音乐",
  description:
    "免费的 AI 背景音乐 + 番茄钟，一个页面进入心流。学习、工作、运动、冥想，选择你的场景。",
  keywords: [
    "AI 音乐",
    "番茄钟",
    "专注",
    "学习",
    "背景音乐",
    "心流",
    "白噪音",
  ],
  openGraph: {
    title: "AI Music Flow - AI 生成的专注音乐",
    description:
      "免费的 AI 背景音乐 + 番茄钟，一个页面进入心流。",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Music Flow",
    description:
      "免费的 AI 背景音乐 + 番茄钟，一个页面进入心流。",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
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
      </body>
    </html>
  );
}
