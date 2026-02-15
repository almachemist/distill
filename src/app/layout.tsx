import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/modules/auth/hooks/useAuth";
import { QueryProvider } from "@/lib/query-provider";

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
        <QueryProvider>
          <AuthProvider>{children}</AuthProvider>
        </QueryProvider>
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
        <Script id="dev-console-clear-on-load" strategy="afterInteractive">
          {`
            (function() {
              var isDev = ${JSON.stringify(process.env.NODE_ENV === 'development')};
              if (typeof window === 'undefined' || !isDev) return;
              try {
                if (window.console && typeof window.console.clear === 'function') {
                  window.console.clear();
                }
              } catch (_) {}
            })();
          `}
        </Script>
        <Script id="ignore-abort-errors" strategy="beforeInteractive">
          {`
            (function() {
              var isDev = ${JSON.stringify(process.env.NODE_ENV === 'development')};
              if (typeof window === 'undefined' || !isDev) return;
              function isAbortError(reason) {
                try {
                  if (!reason) return false;
                  if (reason.name === 'AbortError') return true;
                  var msg = typeof reason === 'string' ? reason : (reason.message || '');
                  return typeof msg === 'string' && msg.indexOf('ERR_ABORTED') !== -1;
                } catch (_) { return false; }
              }
              var clearedOnce = false;
              function safeClear() {
                try {
                  if (!clearedOnce && window && window.console && typeof window.console.clear === 'function') {
                    window.console.clear();
                    clearedOnce = true;
                  }
                } catch (_) {}
              }
              window.addEventListener('unhandledrejection', function(e) {
                if (isAbortError(e.reason)) {
                  try {
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    safeClear();
                  } catch (_) {}
                  return true;
                }
              });
              window.addEventListener('error', function(e) {
                try {
                  var msg = e && e.message;
                  if (typeof msg === 'string' && msg.indexOf('ERR_ABORTED') !== -1) {
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    safeClear();
                    return true;
                  }
                  var t = e && e.target;
                  if (t && t.tagName === 'LINK') {
                    var rel = t.getAttribute('rel') || '';
                    var href = t.getAttribute('href') || '';
                    if ((rel.indexOf('stylesheet') !== -1 || rel.indexOf('preload') !== -1) && href.indexOf('/_next/static/css') !== -1) {
                      e.preventDefault();
                      e.stopPropagation();
                      e.stopImmediatePropagation();
                      safeClear();
                      return true;
                    }
                  }
                } catch (_) {}
              }, true);
              
            })();
          `}
        </Script>
      </body>
    </html>
  );
}
