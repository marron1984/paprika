import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DCかいご相談ダイヤル | 介護施設探しの無料相談窓口",
  description:
    "認知症・生活保護・身寄りなし・退院後の住まい探しまで専門スタッフが無料で相談をお受けします。",
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID;
  return (
    <html lang="ja">
      <body>
        {gtmId ? (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
            />
          </noscript>
        ) : null}
        {children}
      </body>
    </html>
  );
}
