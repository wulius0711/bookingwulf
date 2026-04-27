import type { Metadata } from "next";
import { Geist, Geist_Mono, Nunito_Sans } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const nunitoSans = Nunito_Sans({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

export const metadata: Metadata = {
  title: "bookingwulf — Das Buchungssystem für Hotels",
  description: "Buchungsanfragen direkt auf Ihrer Website entgegennehmen — ohne Provision, ohne Drittplattform.",
  openGraph: {
    title: "bookingwulf — Das Buchungssystem für Hotels",
    description: "Buchungsanfragen direkt auf Ihrer Website entgegennehmen — ohne Provision, ohne Drittplattform. Einbauen in 5 Minuten.",
    type: "website",
    locale: "de_AT",
    siteName: "bookingwulf",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${nunitoSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <script dangerouslySetInnerHTML={{ __html: `(function(){document.documentElement.classList.remove('dark');var t=localStorage.getItem('admin-theme');if(t&&t!=='indigo'&&(t==='classic'||t==='orange'))document.documentElement.classList.add('theme-'+t);})();` }} />
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-PJLWNDWCLV" strategy="afterInteractive" />
        <Script id="ga-init" strategy="afterInteractive">{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-PJLWNDWCLV');
        `}</Script>
        {children}
      </body>
    </html>
  );
}
