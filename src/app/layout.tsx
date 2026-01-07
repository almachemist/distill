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
        <link rel="icon" href="/logo.png" />
        <meta name="theme-color" content="#894128" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        <AuthProvider>{children}</AuthProvider>
        <Script id="abort-suppress-early" strategy="beforeInteractive">
          {`
            (function(){
              var isAbortish = function(text,name){
                var t=(text||'').toLowerCase()
                return name==='AbortError' || t.indexOf('net::err_aborted')>-1 || t.indexOf('abort')>-1 || t.indexOf('_rsc=')>-1
              }
              var onError=function(e){
                var msg=String(e && (e.message || (e.error && e.error.message) || ''))
                var name=String(e && e.error && e.error.name || '')
                if(isAbortish(msg,name)){ if(e.preventDefault) e.preventDefault(); if(e.stopImmediatePropagation) e.stopImmediatePropagation(); return true }
                return false
              }
              var onRejection=function(e){
                var msg=String(e && e.reason && e.reason.message || '')
                var name=String(e && e.reason && e.reason.name || '')
                if(isAbortish(msg,name)){ if(e.preventDefault) e.preventDefault(); if(e.stopImmediatePropagation) e.stopImmediatePropagation(); return true }
                return false
              }
              if(typeof window!=='undefined'){
                window.addEventListener('error', onError, true)
                window.addEventListener('unhandledrejection', onRejection, true)
                var oe=console.error, ow=console.warn, ol=console.log
                var filterArgs=function(args){
                  return args.map(function(a){
                    if(typeof a==='string') return a
                    if(a && typeof a==='object' && 'message' in a) return String(a.message)
                    return ''
                  }).join(' ')
                }
                console.error=function(){ var text=filterArgs([].slice.call(arguments)); if(isAbortish(text)) return; oe.apply(console, arguments) }
                console.warn=function(){ var text=filterArgs([].slice.call(arguments)); if(isAbortish(text)) return; ow.apply(console, arguments) }
                console.log=function(){ var text=filterArgs([].slice.call(arguments)); if(isAbortish(text)) return; ol.apply(console, arguments) }
              }
            })();
          `}
        </Script>
        <Script id="abort-suppress" strategy="afterInteractive">
          {`
            (function(){
              var isAbortish = function(text,name){
                var t=(text||'').toLowerCase()
                return name==='AbortError' || t.indexOf('net::err_aborted')>-1 || t.indexOf('abort')>-1 || t.indexOf('_rsc=')>-1
              }
              var onError=function(e){
                var msg=String(e && (e.message || (e.error && e.error.message) || ''))
                var name=String(e && e.error && e.error.name || '')
                if(isAbortish(msg,name)){ if(e.preventDefault) e.preventDefault(); if(e.stopImmediatePropagation) e.stopImmediatePropagation(); return true }
                return false
              }
              var onRejection=function(e){
                var msg=String(e && e.reason && e.reason.message || '')
                var name=String(e && e.reason && e.reason.name || '')
                if(isAbortish(msg,name)){ if(e.preventDefault) e.preventDefault(); if(e.stopImmediatePropagation) e.stopImmediatePropagation(); return true }
                return false
              }
              if(typeof window!=='undefined'){
                window.addEventListener('error', onError, true)
                window.addEventListener('unhandledrejection', onRejection, true)
                var oe=console.error, ow=console.warn, ol=console.log
                var filterArgs=function(args){
                  return args.map(function(a){
                    if(typeof a==='string') return a
                    if(a && typeof a==='object' && 'message' in a) return String(a.message)
                    return ''
                  }).join(' ')
                }
                console.error=function(){ var text=filterArgs([].slice.call(arguments)); if(isAbortish(text)) return; oe.apply(console, arguments) }
                console.warn=function(){ var text=filterArgs([].slice.call(arguments)); if(isAbortish(text)) return; ow.apply(console, arguments) }
                console.log=function(){ var text=filterArgs([].slice.call(arguments)); if(isAbortish(text)) return; ol.apply(console, arguments) }
              }
            })();
          `}
        </Script>
        <Script id="sw-register" strategy="afterInteractive">
          {`
            (function(){
              var __ENV__ = '${process.env.NODE_ENV}';
              if (
                typeof window !== 'undefined' &&
                'serviceWorker' in navigator &&
                __ENV__ === 'production'
              ) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').catch(function(err) {
                    console.log('SW registration failed:', err);
                  });
                });
              }
            })();
          `}
        </Script>
        <Script id="sw-unregister-dev" strategy="afterInteractive">
          {`
            (function(){
              var __ENV__='${process.env.NODE_ENV}';
              if (typeof window!=='undefined' && 'serviceWorker' in navigator && __ENV__!=='production') {
                navigator.serviceWorker.getRegistrations().then(function(regs){
                  regs.forEach(function(r){ r.unregister().catch(function(){}); });
                }).catch(function(){});
              }
            })();
          `}
        </Script>
        <Script id="sw-clear-caches-dev" strategy="afterInteractive">
          {`
            (function(){
              var __ENV__='${process.env.NODE_ENV}';
              if (typeof window!=='undefined' && 'caches' in window && __ENV__!=='production') {
                caches.keys().then(function(keys){
                  keys.forEach(function(k){ caches.delete(k).catch(function(){}); });
                }).catch(function(){});
              }
            })();
          `}
        </Script>
      </body>
    </html>
  );
}
