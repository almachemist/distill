import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/modules/auth/hooks/useAuth";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Distil - Distillery Management System",
  description: "Modern distillery management for craft spirits production",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#894128" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        <AuthProvider>{children}</AuthProvider>
        <Script id="sw-register" strategy="afterInteractive">
          {`
            (function() {
              var shouldEnable = ${String(process.env.NEXT_PUBLIC_ENABLE_PWA || '').toLowerCase() === '1' 
                || String(process.env.NEXT_PUBLIC_ENABLE_PWA || '').toLowerCase() === 'true' 
                || String(process.env.NEXT_PUBLIC_ENABLE_PWA || '').toLowerCase() === 'yes'};
              if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
                if (shouldEnable) {
                  window.addEventListener('load', function() {
                    navigator.serviceWorker.register('/sw.js').catch(function(err) {});
                  });
                } else {
                  navigator.serviceWorker.getRegistrations().then(function(regs) {
                    regs.forEach(function(r) { r.unregister(); });
                  }).catch(function() {});
                  if (navigator.serviceWorker.controller) {
                    navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
                  }
                }
              }
            })();
          `}
        </Script>
      </body>
    </html>
  );
}
