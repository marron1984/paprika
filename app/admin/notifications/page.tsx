import { redirect } from "next/navigation";
import { markNotificationRead } from "@/app/actions/admin";
import { AdminShell } from "@/components/AdminShell";
import { requireSession, supabaseFetch } from "@/lib/supabase-rest";
import type { Activity, Lead, Notification, Tour } from "@/lib/types";

type ActivityWithLead = Activity & {
  leads?: { consultant_name: string; resident_name?: string };
};

type TourWithLead = Tour & {
  leads?: { consultant_name: string; resident_name?: string };
  facilities?: { name: string };
};

function dateOnly(date: Date) {
  return date.toISOString().slice(0, 10);
}

function formatDateTime(value?: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleString("ja-JP", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function leadName(lead?: { consultant_name?: string; resident_name?: string }) {
  if (!lead) return "-";
  return [lead.consultant_name, lead.resident_name].filter(Boolean).join(" / ");
}

export default async function NotificationsPage() {
  if (!(await requireSession())) redirect("/admin/login");

  const now = new Date();
  const today = dateOnly(now);
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  const tomorrowDate = dateOnly(tomorrow);
  const staleDate = new Date(now);
  staleDate.setDate(now.getDate() - 14);

  const [notifications, leads, activities, tours] = await Promise.all([
    supabaseFetch<Notification[]>(
      "notifications?select=*,leads(consultant_name,resident_name)&is.read_at.null&order=created_at.desc&limit=100",
      {},
      true,
    ),
    supabaseFetch<Lead[]>(
      "leads?select=*&order=updated_at.desc&limit=300",
      {},
      true,
    ),
    supabaseFetch<ActivityWithLead[]>(
      "lead_activities?select=*,leads(consultant_name,resident_name)&order=next_action_date.asc&limit=200",
      {},
      true,
    ),
    supabaseFetch<TourWithLead[]>(
      "tours?select=*,leads(consultant_name,resident_name),facilities(name)&order=scheduled_at.asc&limit=200",
      {},
      true,
    ),
  ]);

  const firstContactOverdue = leads.filter(
    (lead) =>
      ["新規相談", "初回連絡待ち"].includes(lead.status) &&
      lead.created_at.slice(0, 10) < today,
  );
  const nextActionDue = activities.filter(
    (activity) =>
      activity.next_action_date && activity.next_action_date <= today,
  );
  const tomorrowTours = tours.filter(
    (tour) => tour.scheduled_at.slice(0, 10) === tomorrowDate,
  );
  const staleLeads = leads.filter(
    (lead) =>
      !["入居完了", "失注"].includes(lead.status) &&
      new Date(lead.updated_at || lead.created_at) < staleDate,
  );
  const riskLeads = leads.filter((lead) =>
    ["保留", "申込検討中", "見学済"].includes(lead.status),
  );

  const summary = [
    ["未読通知", notifications.length],
    ["初回連絡未対応", firstContactOverdue.length],
    ["見学前日", tomorrowTours.length],
    ["次回アクション期限", nextActionDue.length],
    ["長期放置案件", staleLeads.length],
    ["失注リスク", riskLeads.length],
  ];

  return (
    <AdminShell>
      <div>
        <h1 className="text-3xl font-black">通知センター</h1>
        <p className="mt-2 text-slate-600">
          新規問い合わせ、初回連絡未対応、見学前日、次回アクション期限、長期放置、失注リスクをまとめて確認します。
        </p>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-6">
        {summary.map(([label, count]) => (
          <div className="card p-5" key={label}>
            <p className="text-sm font-bold text-slate-500">{label}</p>
            <p className="mt-2 text-3xl font-black text-blue-700">{count}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <section className="card p-6">
          <h2 className="text-xl font-black">未読通知</h2>
          <div className="mt-4 grid gap-3">
            {notifications.length ? (
              notifications.map((notification) => (
                <div
                  className="rounded-2xl bg-slate-50 p-4"
                  key={notification.id}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-black">{notification.title}</p>
                      <p className="mt-1 text-sm text-slate-600">
                        {notification.body || leadName(notification.leads)}
                      </p>
                      <p className="mt-2 text-xs text-slate-500">
                        {formatDateTime(notification.created_at)} /{" "}
                        {notification.notification_type}
                      </p>
                    </div>
                    <form action={markNotificationRead}>
                      <input name="id" type="hidden" value={notification.id} />
                      <button className="btn btn-secondary py-2" type="submit">
                        既読
                      </button>
                    </form>
                  </div>
                  {notification.lead_id ? (
                    <a
                      className="mt-3 inline-block text-sm font-bold text-blue-700"
                      href={`/admin/leads/${notification.lead_id}`}
                    >
                      案件を見る
                    </a>
                  ) : null}
                </div>
              ))
            ) : (
              <p className="text-slate-500">未読通知はありません。</p>
            )}
          </div>
        </section>

        <section className="card p-6">
          <h2 className="text-xl font-black">初回連絡未対応</h2>
          <div className="mt-4 grid gap-3">
            {firstContactOverdue.slice(0, 10).map((lead) => (
              <a
                className="rounded-2xl bg-red-50 p-4 text-sm"
                href={`/admin/leads/${lead.id}`}
                key={lead.id}
              >
                <b>{lead.consultant_name}</b>
                <p className="mt-1 text-slate-600">
                  {lead.status} / 登録日{" "}
                  {new Date(lead.created_at).toLocaleDateString("ja-JP")}
                </p>
              </a>
            ))}
            {!firstContactOverdue.length ? (
              <p className="text-slate-500">対象はありません。</p>
            ) : null}
          </div>
        </section>

        <section className="card p-6">
          <h2 className="text-xl font-black">見学前日リマインド</h2>
          <div className="mt-4 grid gap-3">
            {tomorrowTours.map((tour) => (
              <div className="rounded-2xl bg-blue-50 p-4 text-sm" key={tour.id}>
                <b>{leadName(tour.leads)}</b>
                <p className="mt-1 text-slate-600">
                  {tour.facilities?.name || "施設未設定"} /{" "}
                  {formatDateTime(tour.scheduled_at)}
                </p>
              </div>
            ))}
            {!tomorrowTours.length ? (
              <p className="text-slate-500">明日の見学予定はありません。</p>
            ) : null}
          </div>
        </section>

        <section className="card p-6">
          <h2 className="text-xl font-black">次回アクション期限</h2>
          <div className="mt-4 grid gap-3">
            {nextActionDue.slice(0, 10).map((activity) => (
              <a
                className="rounded-2xl bg-amber-50 p-4 text-sm"
                href={`/admin/leads/${activity.lead_id}`}
                key={activity.id}
              >
                <b>{leadName(activity.leads)}</b>
                <p className="mt-1 text-slate-600">
                  {activity.next_action_date} / {activity.activity_type}
                </p>
              </a>
            ))}
            {!nextActionDue.length ? (
              <p className="text-slate-500">
                期限到来のアクションはありません。
              </p>
            ) : null}
          </div>
        </section>

        <section className="card p-6">
          <h2 className="text-xl font-black">長期放置案件</h2>
          <div className="mt-4 grid gap-3">
            {staleLeads.slice(0, 10).map((lead) => (
              <a
                className="rounded-2xl bg-slate-50 p-4 text-sm"
                href={`/admin/leads/${lead.id}`}
                key={lead.id}
              >
                <b>{lead.consultant_name}</b>
                <p className="mt-1 text-slate-600">
                  {lead.status} / 最終更新{" "}
                  {new Date(
                    lead.updated_at || lead.created_at,
                  ).toLocaleDateString("ja-JP")}
                </p>
              </a>
            ))}
            {!staleLeads.length ? (
              <p className="text-slate-500">対象はありません。</p>
            ) : null}
          </div>
        </section>

        <section className="card p-6">
          <h2 className="text-xl font-black">失注リスク案件</h2>
          <div className="mt-4 grid gap-3">
            {riskLeads.slice(0, 10).map((lead) => (
              <a
                className="rounded-2xl bg-orange-50 p-4 text-sm"
                href={`/admin/leads/${lead.id}`}
                key={lead.id}
              >
                <b>{lead.consultant_name}</b>
                <p className="mt-1 text-slate-600">
                  {lead.status} / 次の一手を確認
                </p>
              </a>
            ))}
            {!riskLeads.length ? (
              <p className="text-slate-500">対象はありません。</p>
            ) : null}
          </div>
        </section>
      </div>
    </AdminShell>
  );
}
