import { redirect } from "next/navigation";
import { AdminShell } from "@/components/AdminShell";
import { requireSession, supabaseFetch } from "@/lib/supabase-rest";
import type {
  AuditLog,
  ConversionEvent,
  Lead,
  Notification,
  Room,
  Tour,
} from "@/lib/types";

export default async function Admin() {
  if (!(await requireSession())) redirect("/admin/login");
  const [leads, rooms, tours, conversionEvents, notifications, auditLogs] =
    await Promise.all([
      supabaseFetch<Lead[]>(
        "leads?select=*&order=created_at.desc&limit=200",
        {},
        true,
      ),
      supabaseFetch<Room[]>("rooms?select=*&limit=200", {}, true),
      supabaseFetch<Tour[]>(
        "tours?select=*&order=scheduled_at.desc&limit=50",
        {},
        true,
      ),
      supabaseFetch<ConversionEvent[]>(
        "conversion_events?select=*&order=created_at.desc&limit=500",
        {},
        true,
      ),
      supabaseFetch<Notification[]>(
        "notifications?select=*&is.read_at.null&limit=100",
        {},
        true,
      ),
      supabaseFetch<AuditLog[]>(
        "audit_logs?select=*&order=created_at.desc&limit=10",
        {},
        true,
      ),
    ]);
  const month = new Date().toISOString().slice(0, 7);
  const monthly = leads.filter((l) => l.created_at?.startsWith(month));
  const moved = leads.filter((l) => l.status === "入居完了").length;
  const lost = leads.filter((l) => l.status === "失注").length;
  const vacant = rooms.filter((r) => r.status === "空室").length;
  const monthlyConversions = conversionEvents.filter((event) =>
    event.created_at?.startsWith(month),
  );
  const conversionCounts = monthlyConversions.reduce<Record<string, number>>(
    (acc, event) => {
      acc[event.event_type] = (acc[event.event_type] || 0) + 1;
      return acc;
    },
    {},
  );
  const cards = [
    ["問い合わせ数", monthly.length],
    ["見学数", tours.length],
    ["入居数", moved],
    ["失注数", lost],
    [
      "成約率",
      `${leads.length ? Math.round((moved / leads.length) * 100) : 0}%`,
    ],
    ["空室数", vacant],
    ["電話タップ", conversionCounts.CV2 || 0],
    ["LINE追加", conversionCounts.CV3 || 0],
    ["未読通知", notifications.length],
    ["操作ログ", auditLogs.length],
  ];
  const status = Object.entries(
    leads.reduce<Record<string, number>>((a, l) => {
      a[l.status] = (a[l.status] || 0) + 1;
      return a;
    }, {}),
  );
  return (
    <AdminShell>
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-black">簡易ダッシュボード</h1>
          <p className="mt-2 text-slate-600">
            月次KPI・ステータス別件数・空室状況を確認できます。
          </p>
        </div>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-6">
        {cards.map(([k, v]) => (
          <div className="card p-5" key={k}>
            <p className="text-sm font-bold text-slate-500">{k}</p>
            <p className="mt-2 text-3xl font-black text-blue-700">{v}</p>
          </div>
        ))}
      </div>
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <section className="card p-6">
          <h2 className="text-xl font-black">ステータス別件数</h2>
          <div className="mt-4 grid gap-3">
            {status.map(([s, c]) => (
              <div key={s} className="flex items-center justify-between">
                <span className="status">{s}</span>
                <b>{c}件</b>
              </div>
            ))}
          </div>
        </section>
        <section className="card p-6">
          <h2 className="text-xl font-black">CVトラッキング</h2>
          <div className="mt-4 grid gap-3">
            {[
              ["CV1 問い合わせフォーム送信", conversionCounts.CV1 || 0],
              ["CV2 電話タップ", conversionCounts.CV2 || 0],
              ["CV3 LINE追加", conversionCounts.CV3 || 0],
              ["CV4 見学予約", conversionCounts.CV4 || 0],
              ["CV5 入居完了", conversionCounts.CV5 || 0],
            ].map(([label, count]) => (
              <div key={label} className="flex items-center justify-between">
                <span className="text-slate-600">{label}</span>
                <b>{count}件</b>
              </div>
            ))}
          </div>
        </section>
        <section className="card p-6">
          <h2 className="text-xl font-black">CSV出力</h2>
          <p className="mt-2 text-sm text-slate-500">
            案件・施設・部屋・見学・広告・紹介元をCSVで出力します。
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {[
              ["/admin/export/leads", "案件"],
              ["/admin/export/facilities", "施設"],
              ["/admin/export/rooms", "部屋"],
              ["/admin/export/tours", "見学"],
              ["/admin/export/ads", "広告"],
              ["/admin/export/referrers", "紹介元"],
              ["/admin/export/conversions", "CV"],
              ["/admin/export/audit-logs", "操作ログ"],
            ].map(([href, label]) => (
              <a className="btn btn-secondary py-2" href={href} key={href}>
                {label}
              </a>
            ))}
          </div>
        </section>
        <section className="card p-6">
          <h2 className="text-xl font-black">最近の操作ログ</h2>
          <div className="mt-4 grid gap-3">
            {auditLogs.slice(0, 5).map((log) => (
              <div className="rounded-2xl bg-slate-50 p-4 text-sm" key={log.id}>
                <p className="font-black">{log.summary || log.action}</p>
                <p className="mt-1 text-slate-600">
                  {log.user_email || "ユーザー不明"} /{" "}
                  {log.target_table || "対象なし"}
                </p>
              </div>
            ))}
            {!auditLogs.length ? (
              <p className="text-slate-500">操作ログはまだありません。</p>
            ) : null}
          </div>
          <a
            className="mt-4 inline-block text-sm font-bold text-blue-700"
            href="/admin/audit-logs"
          >
            すべて見る
          </a>
        </section>
      </div>
    </AdminShell>
  );
}
