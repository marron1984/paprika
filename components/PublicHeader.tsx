import { lineUrl, phoneNumber, siteName } from "@/lib/constants";
export function PublicHeader() {
  return (
    <header className="sticky top-0 z-10 border-b border-blue-100 bg-white/90 backdrop-blur">
      <div className="container flex items-center justify-between py-4">
        <a href="/" className="text-xl font-black text-blue-700">
          {siteName}
        </a>
        <nav className="hide-mobile flex gap-5 text-sm font-bold text-slate-600">
          <a href="#worries">相談内容</a>
          <a href="#flow">流れ</a>
          <a href="/facilities">施設・空室</a>
          <a href="#form">相談フォーム</a>
        </nav>
        <div className="flex gap-2">
          <a className="btn btn-secondary py-2" href={`tel:${phoneNumber}`}>
            電話
          </a>
          <a className="btn btn-line py-2" href={lineUrl}>
            LINE
          </a>
        </div>
      </div>
    </header>
  );
}
