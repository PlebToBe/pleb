import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Pleb.be – The Dumbest AI on the Internet",
  description: "Be Pleb. Be Free. Be Stupid.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* SEO Meta Tags */}
        <meta property="og:title" content="Pleb.be – The Dumbest AI on the Internet" />
        <meta property="og:description" content="Be Pleb. Be Free. Be Stupid." />
        <meta property="og:url" content="https://pleb.be" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />

        {/* Google AdSense (Si quieres activar anuncios) */}
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2753183170718760" crossorigin="anonymous"></script>
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
