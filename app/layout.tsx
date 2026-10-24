import type { Metadata } from "next";
import { Fraunces, Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.AUTH_URL ?? "http://localhost:3000"),
  applicationName: "LeBabyName",
  title: {
    default: "LeBabyName · Trouvez votre favori",
    template: "%s · LeBabyName",
  },
  description: "Comparez des prénoms et faites émerger votre favori grâce à un tournoi privé.",
  openGraph: {
    type: "website",
    siteName: "LeBabyName",
    title: "LeBabyName · Trouvez votre favori",
    description: "Comparez des prénoms et faites émerger votre favori grâce à un tournoi privé.",
  },
  twitter: {
    card: "summary_large_image",
    title: "LeBabyName · Trouvez votre favori",
    description: "Comparez des prénoms et faites émerger votre favori grâce à un tournoi privé.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${geistSans.variable} ${fraunces.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
