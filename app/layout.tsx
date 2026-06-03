import Script from "next/script";
import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/site-settings";
import "./globals.css";

export const metadata: Metadata = {
  title: "DCかいご相談ダイヤル | 介護施設探しの無料相談窓口",
  description:
    "認知症・生活保護・身寄りなし・退院後の住まい探しまで専門スタッフが無料で相談をお受けします。",
  robots: { index: true, follow: true },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSiteSettings();
  const gtmId = settings.gtmId?.trim();
  const adsId = settings.googleAdsConversionId?.trim();

  return (
    <html lang="ja">
      <body>
        {gtmId ? (
          <>
            <Script id="gtm" strategy="afterInteractive">
              {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtmId}');`}
            </Script>
            <noscript>
              <iframe
                src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
                height="0"
                width="0"
                style={{ display: "none", visibility: "hidden" }}
              />
            </noscript>
          </>
        ) : null}
        {adsId ? (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${adsId}`}
              strategy="afterInteractive"
            />
            <Script id="google-ads-base" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${adsId}');`}
            </Script>
          </>
        ) : null}
        {children}
      </body>
    </html>
  );
}
