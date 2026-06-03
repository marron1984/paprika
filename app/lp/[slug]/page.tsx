import { InquiryForm } from "@/components/InquiryForm";
import { PublicHeader } from "@/components/PublicHeader";
import { getSiteSettings, normalizeTelHref } from "@/lib/site-settings";

export default async function LandingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const title = decodeURIComponent(slug);
  const settings = await getSiteSettings();
  return (
    <>
      <PublicHeader />
      <main>
        <section className="section">
          <div className="container grid gap-8 md:grid-cols-[1fr_380px]">
            <div>
              <span className="badge">広告LPテンプレート</span>
              <h1 className="mt-4 text-4xl font-black">{title}</h1>
              <p className="mt-5 text-lg leading-8 text-slate-600">
                {settings.siteName}
                では、条件が難しい介護施設探しも無料で整理し、候補施設の提案から見学調整までサポートします。
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a className="btn btn-primary" href="#form">
                  無料で相談する
                </a>
                <a
                  className="btn btn-secondary"
                  href={normalizeTelHref(settings.phoneNumber)}
                >
                  電話CTA
                </a>
                <a className="btn btn-line" href={settings.lineUrl}>
                  LINE CTA
                </a>
              </div>
            </div>
            <div className="card p-6">
              <h2 className="text-xl font-black">対象者</h2>
              <ul className="mt-4 grid gap-3 text-slate-700">
                <li>施設探しを急いでいるご家族</li>
                <li>費用・医療・保証人に不安がある方</li>
                <li>大阪市周辺で入居先を探している方</li>
              </ul>
            </div>
          </div>
        </section>
        <section className="section bg-white">
          <div className="container grid gap-5 md:grid-cols-3">
            {["悩みの整理", "候補施設の提案", "見学・申込の支援"].map((x) => (
              <div className="card p-6" key={x}>
                <h2 className="text-xl font-black">{x}</h2>
                <p className="mt-3 text-slate-600">
                  相談内容をCRMに登録し、将来の広告分析・AIマッチングに拡張しやすい構造です。
                </p>
              </div>
            ))}
          </div>
        </section>
        <section className="section">
          <div className="container">
            <InquiryForm lpName={title} />
          </div>
        </section>
      </main>
    </>
  );
}
