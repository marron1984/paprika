import { redirect } from "next/navigation";
import { createAdReport } from "@/app/actions/admin";
import { AdminShell } from "@/components/AdminShell";
import { requireSession, supabaseFetch } from "@/lib/supabase-rest";
import type { AdReport } from "@/lib/types";

export default async function Ads() {
  if (!(await requireSession())) redirect("/admin/login");

  const reports = await supabaseFetch<AdReport[]>(
    "ad_reports?select=*&order=date.desc,campaign_name.asc&limit=200",
    {},
    true,
  );
  const totalCost = reports.reduce(
    (sum, report) => sum + (report.cost || 0),
    0,
  );
  const totalConversions = reports.reduce(
    (sum, report) => sum + (report.conversions || 0),
    0,
  );
  const totalMoveIns = reports.reduce(
    (sum, report) => sum + (report.move_ins || 0),
    0,
  );

  return (
    <AdminShell>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-black">広告管理</h1>
        <a className="btn btn-secondary" href="/admin/export/ads">
          CSV出力
        </a>
      </div>
      <p className="mt-2 text-slate-600">
        MVPではGoogle広告の数値を手入力し、CPA・入居単価を管理します。
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="card p-5">
          <p className="text-sm font-bold text-slate-500">広告費</p>
          <p className="mt-2 text-3xl font-black text-blue-700">
            {totalCost.toLocaleString()}円
          </p>
        </div>
        <div className="card p-5">
          <p className="text-sm font-bold text-slate-500">問い合わせCPA</p>
          <p className="mt-2 text-3xl font-black text-blue-700">
            {totalConversions
              ? Math.round(totalCost / totalConversions).toLocaleString()
              : "-"}
            円
          </p>
        </div>
        <div className="card p-5">
          <p className="text-sm font-bold text-slate-500">入居単価</p>
          <p className="mt-2 text-3xl font-black text-blue-700">
            {totalMoveIns
              ? Math.round(totalCost / totalMoveIns).toLocaleString()
              : "-"}
            円
          </p>
        </div>
      </div>

      <form
        action={createAdReport}
        className="card mt-6 grid gap-4 p-6 md:grid-cols-4"
      >
        <input className="input" name="date" type="date" required />
        <input
          className="input"
          name="campaign_name"
          placeholder="キャンペーン名"
        />
        <input
          className="input"
          name="ad_group_name"
          placeholder="広告グループ名"
        />
        <input className="input" name="keyword" placeholder="キーワード" />
        <input
          className="input"
          name="cost"
          type="number"
          placeholder="広告費"
        />
        <input
          className="input"
          name="impressions"
          type="number"
          placeholder="表示回数"
        />
        <input
          className="input"
          name="clicks"
          type="number"
          placeholder="クリック数"
        />
        <input
          className="input"
          name="conversions"
          type="number"
          placeholder="問い合わせ数"
        />
        <input
          className="input"
          name="tours"
          type="number"
          placeholder="見学数"
        />
        <input
          className="input"
          name="move_ins"
          type="number"
          placeholder="入居数"
        />
        <button className="btn btn-primary md:col-span-2">
          広告レポートを登録
        </button>
      </form>

      <div className="card mt-6 overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>日付</th>
              <th>キャンペーン</th>
              <th>広告グループ</th>
              <th>KW</th>
              <th>費用</th>
              <th>表示</th>
              <th>クリック</th>
              <th>CTR</th>
              <th>CV</th>
              <th>CPA</th>
              <th>見学</th>
              <th>入居</th>
              <th>入居単価</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report) => {
              const ctr = report.impressions
                ? Math.round(
                    ((report.clicks || 0) / report.impressions) * 1000,
                  ) / 10
                : 0;
              return (
                <tr key={report.id}>
                  <td>{report.date}</td>
                  <td>{report.campaign_name}</td>
                  <td>{report.ad_group_name}</td>
                  <td>{report.keyword}</td>
                  <td>{report.cost?.toLocaleString()}円</td>
                  <td>{report.impressions}</td>
                  <td>{report.clicks}</td>
                  <td>{ctr}%</td>
                  <td>{report.conversions}</td>
                  <td>{report.cpa?.toLocaleString() || "-"}円</td>
                  <td>{report.tours}</td>
                  <td>{report.move_ins}</td>
                  <td>{report.move_in_unit_cost?.toLocaleString() || "-"}円</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
