import { redirect } from "next/navigation";
import { updateSiteSettings } from "@/app/actions/admin";
import { AdminShell } from "@/components/AdminShell";
import { requireSession } from "@/lib/supabase-rest";
import { getSiteSettings } from "@/lib/site-settings";

export default async function SettingsPage() {
  if (!(await requireSession())) redirect("/admin/login");
  const settings = await getSiteSettings();

  return (
    <AdminShell>
      <div>
        <h1 className="text-3xl font-black">サイト設定</h1>
        <p className="mt-2 text-slate-600">
          公開サイトの電話番号、LINEリンク、計測タグIDを管理します。更新内容はヘッダー、CTA、Google広告タグ設置エリアに反映されます。
        </p>
      </div>

      <form action={updateSiteSettings} className="card mt-6 grid gap-5 p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="label">
            サイト名
            <input
              className="input"
              name="siteName"
              defaultValue={settings.siteName}
              required
            />
          </label>
          <label className="label">
            電話番号
            <input
              className="input"
              name="phoneNumber"
              defaultValue={settings.phoneNumber}
              placeholder="06-0000-0000"
              required
            />
          </label>
          <label className="label md:col-span-2">
            LINE相談URL
            <input
              className="input"
              name="lineUrl"
              defaultValue={settings.lineUrl}
              placeholder="https://line.me/R/ti/p/@example"
              required
            />
          </label>
        </div>

        <div className="rounded-2xl bg-blue-50 p-5">
          <h2 className="text-xl font-black text-blue-900">
            広告・解析タグ設定
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            MVPではIDを保存し、公開ページの共通レイアウトにGTM/Google広告のベースタグを設置します。コンバージョン詳細イベントは次フェーズでCVログと連動できます。
          </p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="label">
              Google Tag Manager ID
              <input
                className="input"
                name="gtmId"
                defaultValue={settings.gtmId}
                placeholder="GTM-XXXXXXX"
              />
            </label>
            <label className="label">
              Google広告コンバージョンID
              <input
                className="input"
                name="googleAdsConversionId"
                defaultValue={settings.googleAdsConversionId}
                placeholder="AW-123456789"
              />
            </label>
            <label className="label md:col-span-2">
              Google広告コンバージョンラベル
              <input
                className="input"
                name="googleAdsConversionLabel"
                defaultValue={settings.googleAdsConversionLabel}
                placeholder="問い合わせフォーム送信用ラベル"
              />
            </label>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button className="btn btn-primary" type="submit">
            設定を保存
          </button>
          <a className="btn btn-secondary" href="/" target="_blank">
            公開サイトを確認
          </a>
        </div>
      </form>
    </AdminShell>
  );
}
