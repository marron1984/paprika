import { InquiryForm } from "@/components/InquiryForm";
import { TrackingLink } from "@/components/TrackingLink";
import { PublicHeader } from "@/components/PublicHeader";
import { getSiteSettings, normalizeTelHref } from "@/lib/site-settings";

const worries = [
  "認知症の方の入居相談",
  "生活保護の方の入居相談",
  "身寄りがない方の入居相談",
  "退院後すぐの住まい探し",
  "医療対応が必要な方",
  "介護費用を抑えたい方",
  "要介護度が高い方",
  "精神疾患がある方",
];
const features = [
  "相談から見学・申込まで一元サポート",
  "大阪エリアの施設・高齢者住宅に対応",
  "費用・医療・保証人など難しい条件も整理",
  "電話・フォーム・LINEから相談可能",
];
const flow = [
  "無料相談",
  "状況ヒアリング",
  "施設提案",
  "見学調整",
  "申込・契約",
  "入居フォロー",
];

export default async function Home() {
  const settings = await getSiteSettings();

  return (
    <>
      <PublicHeader />
      <main>
        <section className="section">
          <div className="container">
            <div className="hero-shell grid items-center gap-10 p-6 md:grid-cols-[1.08fr_.92fr] md:p-10">
              <div className="relative z-10">
                <span className="badge">介護施設探しの無料相談窓口</span>
                <h1 className="mt-5 text-4xl font-black leading-tight tracking-tight md:text-6xl">
                  介護施設探しで
                  <br />
                  お困りではありませんか？
                </h1>
                <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
                  認知症・生活保護・身寄りなし・退院後の住まい探しまで、専門スタッフが無料でご相談をお受けします。条件整理から見学調整まで、家族に寄り添って伴走します。
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <a className="btn btn-primary" href="#form">
                    無料で相談する
                  </a>
                  <TrackingLink
                    className="btn btn-secondary"
                    conversionType="CV2"
                    href={normalizeTelHref(settings.phoneNumber)}
                    label="home_hero_phone"
                    metadata={{ phoneNumber: settings.phoneNumber }}
                  >
                    電話で相談する
                  </TrackingLink>
                  <TrackingLink
                    className="btn btn-line"
                    conversionType="CV3"
                    href={settings.lineUrl}
                    label="home_hero_line"
                  >
                    LINEで相談する
                  </TrackingLink>
                </div>
                <div className="mt-6 flex flex-wrap gap-3 text-sm font-bold text-slate-600">
                  <span className="stat-pill">相談無料</span>
                  <span className="stat-pill">大阪エリア対応</span>
                  <span className="stat-pill">
                    電話番号：{settings.phoneNumber}
                  </span>
                </div>
              </div>
              <div className="relative z-10 grid gap-4">
                <div className="card p-6">
                  <p className="text-sm font-black text-blue-700">
                    {settings.siteName}の相談範囲
                  </p>
                  <ul className="mt-5 grid gap-3 text-base font-bold text-slate-700">
                    {features.map((f) => (
                      <li className="flex gap-3" key={f}>
                        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-blue-100 text-blue-700">
                          ✓
                        </span>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    ["30件", "月間問合せ目標"],
                    ["10件", "見学目標"],
                    ["3件", "入居目標"],
                  ].map(([value, label]) => (
                    <div className="stat-pill text-center" key={label}>
                      <p className="text-2xl font-black text-blue-700">
                        {value}
                      </p>
                      <p className="mt-1 text-xs font-bold text-slate-500">
                        {label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="section bg-white" id="worries">
          <div className="container">
            <span className="badge">悩み別相談導線</span>
            <h2 className="mt-3 text-3xl font-black">
              状況に合わせた相談ができます
            </h2>
            <div className="mt-8 grid gap-4 md:grid-cols-4">
              {worries.map((w) => (
                <a
                  key={w}
                  className="card card-hover p-5 font-black text-blue-900"
                  href={`/lp/${encodeURIComponent(w)}`}
                >
                  {w}
                  <p className="mt-3 text-sm font-medium text-slate-500">
                    個別LP化できる構造で拡張予定
                  </p>
                </a>
              ))}
            </div>
          </div>
        </section>
        <section className="section">
          <div className="container grid gap-6 md:grid-cols-2">
            <div className="card card-hover p-7">
              <span className="badge">特徴</span>
              <h2 className="mt-3 text-3xl font-black">
                紹介会社依存を下げる自社相談基盤
              </h2>
              <p className="mt-4 leading-8 text-slate-600">
                問い合わせ・ヒアリング・施設提案・見学・申込・契約・入居までをCRMで一元管理できる設計です。
              </p>
            </div>
            <div className="card card-hover p-7">
              <span className="badge">対応できる相談</span>
              <p className="mt-4 leading-8 text-slate-600">
                費用、要介護度、認知症、医療対応、生活保護、身元保証人、退院支援など複合的な条件を整理します。
              </p>
            </div>
          </div>
        </section>
        <section className="section bg-white" id="flow">
          <div className="container">
            <span className="badge">入居までの流れ</span>
            <div className="mt-8 grid gap-4 md:grid-cols-6">
              {flow.map((f, i) => (
                <div className="card card-hover p-5" key={f}>
                  <p className="text-3xl font-black text-blue-200">{i + 1}</p>
                  <p className="mt-2 font-black">{f}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className="section" id="facilities">
          <div className="container">
            <span className="badge">施設・住宅一覧</span>
            <h2 className="mt-3 text-3xl font-black">
              空室・費用・対応条件を管理
            </h2>
            <div className="mt-8 grid gap-5 md:grid-cols-3">
              {[
                "サービス付き高齢者向け住宅",
                "住宅型有料老人ホーム",
                "グループホーム",
              ].map((x) => (
                <div className="card card-hover p-6" key={x}>
                  <h3 className="text-xl font-black">{x}</h3>
                  <p className="mt-3 text-slate-600">
                    空室数・月額費用・認知症/生活保護/医療対応を管理画面から更新できます。
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className="section bg-white">
          <div className="container grid gap-4 md:grid-cols-2">
            <div>
              <span className="badge">よくある質問</span>
              <h2 className="mt-3 text-3xl font-black">FAQ</h2>
            </div>
            {[
              "相談は無料ですか？",
              "生活保護でも相談できますか？",
              "退院まで日数が少なくても大丈夫ですか？",
              "身元保証人がいない場合も相談できますか？",
            ].map((q) => (
              <details key={q} className="card p-5">
                <summary className="cursor-pointer font-black">{q}</summary>
                <p className="mt-3 text-slate-600">
                  はい。条件をお聞きし、対応可能な施設や進め方を整理します。
                </p>
              </details>
            ))}
          </div>
        </section>
        <section className="section">
          <div className="container">
            <InquiryForm />
          </div>
        </section>
        <section className="section bg-blue-700 text-white">
          <div className="container text-center">
            <h2 className="text-3xl font-black">LINEでも気軽に相談できます</h2>
            <p className="mt-3 text-blue-100">
              MVPではLINEボタン設置まで。将来は自動ヒアリング・CRM反映に拡張します。
            </p>
            <TrackingLink
              className="btn btn-line mt-6"
              conversionType="CV3"
              href={settings.lineUrl}
              label="home_footer_line"
            >
              LINEで相談する
            </TrackingLink>
          </div>
        </section>
      </main>
    </>
  );
}
