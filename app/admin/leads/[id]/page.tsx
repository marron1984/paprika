import { redirect } from "next/navigation";
import { addActivity, updateLeadStatus } from "@/app/actions/admin";
import { AdminShell } from "@/components/AdminShell";
import { leadStatuses } from "@/lib/constants";
import { requireSession, supabaseFetch } from "@/lib/supabase-rest";
import type { Activity, Facility, Lead, Tour } from "@/lib/types";
export default async function LeadDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!(await requireSession())) redirect("/admin/login");
  const { id } = await params;
  const [lead] = await supabaseFetch<Lead[]>(
    `leads?id=eq.${id}&select=*`,
    {},
    true,
  );
  const [activities, facilities, tours] = await Promise.all([
    supabaseFetch<Activity[]>(
      `lead_activities?lead_id=eq.${id}&select=*&order=created_at.desc`,
      {},
      true,
    ),
    supabaseFetch<Facility[]>("facilities?select=*&order=name.asc", {}, true),
    supabaseFetch<Tour[]>(
      `tours?lead_id=eq.${id}&select=*,facilities(name)&order=scheduled_at.desc`,
      {},
      true,
    ),
  ]);
  if (!lead) redirect("/admin/leads");
  const rows = [
    ["相談者氏名", lead.consultant_name],
    ["フリガナ", lead.consultant_kana],
    ["電話番号", lead.consultant_phone],
    ["メール", lead.consultant_email],
    ["続柄", lead.relationship],
    ["住所/相談地域", lead.consultant_area],
    ["入居予定者", lead.resident_name],
    ["年齢", lead.resident_age],
    ["性別", lead.resident_gender],
    ["現在地", lead.current_address],
    ["要介護度", lead.care_level],
    ["認知症", lead.dementia_status],
    ["生活保護", lead.welfare_status],
    ["医療行為", lead.medical_needs],
    ["精神疾患", lead.mental_illness],
    ["保証人", lead.guarantor_status],
    ["希望時期", lead.desired_move_in_date],
    ["予算", lead.budget],
    ["希望地域", lead.desired_area],
    ["相談内容", lead.note],
  ];
  return (
    <AdminShell>
      <a className="text-blue-700 font-bold" href="/admin/leads">
        ← 案件一覧
      </a>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black">{lead.consultant_name}</h1>
          <p className="mt-2 text-slate-600">
            {lead.resident_name || "入居予定者未入力"} / {lead.desired_area}
          </p>
        </div>
        <span className="status text-base">{lead.status}</span>
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        <section className="card p-6">
          <h2 className="text-xl font-black">案件詳細</h2>
          <dl className="mt-5 grid gap-4 md:grid-cols-2">
            {rows.map(([k, v]) => (
              <div key={k} className="rounded-xl bg-slate-50 p-4">
                <dt className="text-sm font-bold text-slate-500">{k}</dt>
                <dd className="mt-1 font-bold whitespace-pre-wrap">
                  {v || "-"}
                </dd>
              </div>
            ))}
          </dl>
          <h2 className="mt-8 text-xl font-black">流入元情報</h2>
          <dl className="mt-4 grid gap-3 md:grid-cols-3">
            {[
              ["LP名", lead.lp_name],
              ["utm_source", lead.utm_source],
              ["utm_medium", lead.utm_medium],
              ["utm_campaign", lead.utm_campaign],
              ["utm_term", lead.utm_term],
              ["utm_content", lead.utm_content],
              ["gclid", lead.gclid],
            ].map(([k, v]) => (
              <div key={k} className="rounded-xl border p-3">
                <dt className="text-xs text-slate-500">{k}</dt>
                <dd className="font-bold break-all">{v || "-"}</dd>
              </div>
            ))}
          </dl>
          <h2 className="mt-8 text-xl font-black">見学予定</h2>
          <div className="mt-4 grid gap-3">
            {tours.map((t) => (
              <div className="rounded-xl border p-4" key={t.id}>
                <b>{t.facilities?.name}</b>
                <p>{new Date(t.scheduled_at).toLocaleString("ja-JP")}</p>
                <p className="text-slate-600">
                  {t.result || t.next_action || t.note}
                </p>
              </div>
            ))}
          </div>
        </section>
        <aside className="grid gap-6 content-start">
          <form action={updateLeadStatus} className="card grid gap-4 p-6">
            <h2 className="text-xl font-black">ステータス変更</h2>
            <input type="hidden" name="id" value={id} />
            <label className="label">
              ステータス
              <select
                className="input"
                name="status"
                defaultValue={lead.status}
              >
                {leadStatuses.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
            <label className="label">
              担当者ID
              <input
                className="input"
                name="assigned_user_id"
                defaultValue={lead.assigned_user_id}
              />
            </label>
            <label className="label">
              失注理由
              <input
                className="input"
                name="loss_reason"
                defaultValue={lead.loss_reason}
              />
            </label>
            <label className="label">
              再アプローチ予定日
              <input
                className="input"
                name="reapproach_date"
                type="date"
                defaultValue={lead.reapproach_date}
              />
            </label>
            <button className="btn btn-primary">更新</button>
          </form>
          <form action={addActivity} className="card grid gap-4 p-6">
            <h2 className="text-xl font-black">対応履歴追加</h2>
            <input type="hidden" name="lead_id" value={id} />
            <label className="label">
              種別
              <select className="input" name="activity_type">
                <option>メモ</option>
                <option>電話</option>
                <option>LINE</option>
                <option>メール</option>
                <option>施設提案</option>
              </select>
            </label>
            <label className="label">
              内容
              <textarea className="input min-h-28" name="content" required />
            </label>
            <label className="label">
              次回アクション期限
              <input className="input" name="next_action_date" type="date" />
            </label>
            <button className="btn btn-primary">履歴を追加</button>
          </form>
          <section className="card p-6">
            <h2 className="text-xl font-black">提案施設候補</h2>
            <div className="mt-4 grid gap-3">
              {facilities.slice(0, 5).map((f) => (
                <div key={f.id} className="rounded-xl bg-slate-50 p-3">
                  <b>{f.name}</b>
                  <p className="text-sm text-slate-600">
                    {f.area} / 空室 {f.vacancy_count ?? 0}
                  </p>
                </div>
              ))}
            </div>
          </section>
          <section className="card p-6">
            <h2 className="text-xl font-black">対応履歴</h2>
            <div className="mt-4 grid gap-3">
              {activities.map((a) => (
                <div className="rounded-xl border p-3" key={a.id}>
                  <p>
                    <b>{a.activity_type}</b>{" "}
                    <span className="text-xs text-slate-500">
                      {new Date(a.created_at).toLocaleString("ja-JP")}
                    </span>
                  </p>
                  <p className="mt-2 whitespace-pre-wrap text-slate-700">
                    {a.content}
                  </p>
                  {a.next_action_date ? (
                    <p className="mt-2 text-sm font-bold text-blue-700">
                      次回: {a.next_action_date}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </AdminShell>
  );
}
