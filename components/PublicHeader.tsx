import { TrackingLink } from "@/components/TrackingLink";
import { getSiteSettings, normalizeTelHref } from "@/lib/site-settings";

export async function PublicHeader() {
  const settings = await getSiteSettings();

  return (
    <header className="sticky top-0 z-10 border-b border-blue-100 bg-white/90 backdrop-blur">
      <div className="container flex items-center justify-between py-4">
        <a href="/" className="text-xl font-black text-blue-700">
          {settings.siteName}
        </a>
        <nav className="hide-mobile flex gap-5 text-sm font-bold text-slate-600">
          <a href="/#worries">相談内容</a>
          <a href="/#flow">流れ</a>
          <a href="/facilities">施設・空室</a>
          <a href="/#form">相談フォーム</a>
        </nav>
        <div className="flex gap-2">
          <TrackingLink
            className="btn btn-secondary py-2"
            conversionType="CV2"
            href={normalizeTelHref(settings.phoneNumber)}
            label="header_phone"
            metadata={{ phoneNumber: settings.phoneNumber }}
          >
            電話
          </TrackingLink>
          <TrackingLink
            className="btn btn-line py-2"
            conversionType="CV3"
            href={settings.lineUrl}
            label="header_line"
          >
            LINE
          </TrackingLink>
        </div>
      </div>
    </header>
  );
}
