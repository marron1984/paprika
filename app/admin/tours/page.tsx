import { redirect } from "next/navigation";
import { createTour } from "@/app/actions/admin";
import { AdminShell } from "@/components/AdminShell";
import { requireSession, supabaseFetch } from "@/lib/supabase-rest";
import type { Facility, Lead, Tour } from "@/lib/types";
export default async function Tours() {
  if (!(await requireSession())) redirect("/admin/login");
  const [tours, leads, facilities] = await Promise.all([
    supabaseFetch<Tour[]>(
      "tours?select=*,leads(consultant_name,resident_name),facilities(name)&order=scheduled_at.desc",
      {},
      true,
    ),
    supabaseFetch<Lead[]>(
      "leads?select=id,consultant_name,resident_name&order=created_at.desc&limit=200",
      {},
      true,
    ),
    supabaseFetch<Facility[]>(
      "facilities?select=id,name&order=name.asc",
      {},
      true,
    ),
  ]);
  return (
    <AdminShell>
      <h1 className="text-3xl font-black">見学管理</h1>
      <form
        action={createTour}
        className="card mt-6 grid gap-4 p-6 md:grid-cols-3"
      >
        <select className="input" name="lead_id" required>
          <option value="">案件を選択</option>
          {leads.map((l) => (
            <option value={l.id} key={l.id}>
              {l.consultant_name} / {l.resident_name}
            </option>
          ))}
        </select>
        <select className="input" name="facility_id" required>
          <option value="">施設を選択</option>
          {facilities.map((f) => (
            <option value={f.id} key={f.id}>
              {f.name}
            </option>
          ))}
        </select>
        <input
          className="input"
          name="scheduled_at"
          type="datetime-local"
          required
        />
        <input className="input" name="participants" placeholder="参加者" />
        <input className="input" name="meeting_place" placeholder="集合場所" />
        <input className="input" name="result" placeholder="見学結果" />
        <input className="input" name="impression" placeholder="感触" />
        <input
          className="input"
          name="next_action"
          placeholder="次回アクション"
        />
        <textarea className="input" name="note" placeholder="見学後メモ" />
        <button className="btn btn-primary md:col-span-3">見学を登録</button>
      </form>
      <div className="card mt-6 overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>見学日時</th>
              <th>案件</th>
              <th>施設</th>
              <th>参加者</th>
              <th>集合場所</th>
              <th>結果</th>
              <th>次回</th>
            </tr>
          </thead>
          <tbody>
            {tours.map((t) => (
              <tr key={t.id}>
                <td>{new Date(t.scheduled_at).toLocaleString("ja-JP")}</td>
                <td>
                  {t.leads?.consultant_name} / {t.leads?.resident_name}
                </td>
                <td>{t.facilities?.name}</td>
                <td>{t.participants}</td>
                <td>{t.meeting_place}</td>
                <td>{t.result || t.impression}</td>
                <td>{t.next_action}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-sm text-slate-500">
        見学前日リマインドは scheduled_at
        を基点に通知ジョブを追加できる設計です。
      </p>
    </AdminShell>
  );
}
