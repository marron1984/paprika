import { TrackingLink } from "@/components/TrackingLink";
import { getSiteSettings, normalizeTelHref } from "@/lib/site-settings";

export async function PublicHeader() {
  const settings = await getSiteSettings();

  return (
    <header className="sticky top-0 z-20 border-b border-blue-100/70 bg-white/82 backdrop-blur-xl">
      <div className="container flex items-center justify-between py-3">
        <a href="/" className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-blue-600 text-lg font-black text-white shadow-lg shadow-blue-200">
            DC
          </span>
          <span>
            <span className="block text-lg font-black leading-tight text-blue-700">
              {settings.siteName}
            </span>
            <span className="hide-mobile text-xs font-bold text-slate-500">
              介護施設探しの無料相談窓口
            </span>
          </span>
        </a>
        <nav className="hide-mobile rounded-full border border-slate-200 bg-white/70 px-5 py-2 text-sm font-bold text-slate-600 shadow-sm">
          <div className="flex gap-5">
            <a href="/#worries">相談内容</a>
            <a href="/#flow">流れ</a>
            <a href="/facilities">施設・空室</a>
            <a href="/#form">相談フォーム</a>
          </div>
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
