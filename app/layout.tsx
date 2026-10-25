import type { Metadata } from "next";
import { Fraunces, Geist } from "next/font/google";
import LocaleProvider from "@/components/LocaleProvider";
import { translate } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/locale-server";
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
  return {
    metadataBase: new URL(process.env.AUTH_URL ?? "http://localhost:3000"),
    applicationName: "LeBabyName",
    title: { default: title, template: "%s · LeBabyName" },
    description,
    openGraph: { type: "website", siteName: "LeBabyName", title, description, locale: locale.replace('-', '_') },
    twitter: { card: "summary_large_image", title, description },
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
        </LocaleProvider>
      </body>
    </html>
  );
}
