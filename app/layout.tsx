import type { Metadata } from "next";
import { Fraunces, Geist } from "next/font/google";
import LocaleProvider from "@/components/LocaleProvider";
import { translate } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/locale-server";
import CookieConsent from "@/components/CookieConsent";
import PostHogAnalytics from "@/components/PostHogAnalytics";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const title = translate(locale, 'meta.title');
  const description = translate(locale, 'meta.description');
  const image = `/api/og?lang=${encodeURIComponent(locale)}&kind=home`;
  return {
    metadataBase: new URL(process.env.AUTH_URL ?? "http://localhost:3000"),
    applicationName: "LeBabyName",
    appleWebApp: {
      capable: true,
      title: "LeBabyName",
      statusBarStyle: "black-translucent",
    },
    title: { default: title, template: "%s · LeBabyName" },
    description,
    manifest: "/manifest.webmanifest",
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "64x64" },
        { url: "/icon.svg", type: "image/svg+xml" },
        { url: "/icons/icon-192.png", type: "image/png", sizes: "192x192" },
      ],
      apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
    },
    openGraph: {
      type: "website",
      siteName: "LeBabyName",
      title,
      description,
      locale: locale.replace('-', '_'),
      images: [{ url: image, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getRequestLocale();
  return (
    <html lang={locale}>
      <body
        className={`${geistSans.variable} ${fraunces.variable} antialiased`}
      >
        <LocaleProvider locale={locale}>
          {children}
          <CookieConsent enabled={process.env.ADS_ENABLED === "true" || Boolean(process.env.NEXT_PUBLIC_POSTHOG_KEY)} />
          <PostHogAnalytics />
        </LocaleProvider>
      </body>
    </html>
  );
}
