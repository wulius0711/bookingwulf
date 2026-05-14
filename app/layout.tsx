import type { Metadata } from "next";
import { Geist, Geist_Mono, Nunito_Sans } from "next/font/google";
import CookieBanner from "./components/CookieBanner";
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
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{if(!window.location.pathname.startsWith('/admin'))return;var d=localStorage.getItem('admin-dark');var s=window.matchMedia('(prefers-color-scheme: dark)').matches;var dark=d==='true'||(d===null&&s);var t=localStorage.getItem('admin-theme');if(dark){document.documentElement.classList.add('dark');document.documentElement.setAttribute('data-theme','dark');document.documentElement.style.colorScheme='dark';document.documentElement.style.backgroundColor='#0f1117';document.body&&(document.body.style.backgroundColor='#0f1117');}else{document.documentElement.setAttribute('data-theme','light');document.documentElement.style.colorScheme='light';var bg=t==='classic'?'#f5f5f7':t==='orange'?'#fdf6f0':'#f0f2f8';document.documentElement.style.backgroundColor=bg;document.body&&(document.body.style.backgroundColor=bg);}if(t&&t!=='indigo'&&(t==='classic'||t==='orange'))document.documentElement.classList.add('theme-'+t);}catch(e){}})();` }} />
      </head>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <CookieBanner />
        {children}
      </body>
    </html>
  );
}
