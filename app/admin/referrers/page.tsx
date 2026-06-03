import { redirect } from "next/navigation";
import { createReferrer } from "@/app/actions/admin";
import { AdminShell } from "@/components/AdminShell";
import { requireSession, supabaseFetch } from "@/lib/supabase-rest";
import type { Referrer } from "@/lib/types";

const referrerTypes = [
  "ケアマネ",
  "居宅介護支援事業所",
  "病院",
  "MSW",
  "地域包括支援センター",
  "紹介会社",
  "WEB",
  "Google広告",
  "LINE",
  "既存紹介",
];

export default async function Referrers() {
  if (!(await requireSession())) redirect("/admin/login");

  const referrers = await supabaseFetch<Referrer[]>(
    "referrers?select=*&order=last_contact_date.desc.nullslast,name.asc",
    {},
    true,
  );

  return (
    <AdminShell>
      <h1 className="text-3xl font-black">紹介元管理</h1>
      <p className="mt-2 text-slate-600">
        ケアマネ・病院・地域包括・WEBなどの紹介元別に件数と営業メモを管理します。
      </p>

      <form
        action={createReferrer}
        className="card mt-6 grid gap-4 p-6 md:grid-cols-3"
      >
        <select className="input" name="type" required>
          <option value="">紹介元種別</option>
          {referrerTypes.map((type) => (
            <option key={type}>{type}</option>
          ))}
        </select>
        <input className="input" name="name" placeholder="紹介元名" required />
        <input className="input" name="contact_person" placeholder="担当者名" />
        <input className="input" name="phone" placeholder="電話番号" />
        <input
          className="input"
          name="email"
          type="email"
          placeholder="メール"
        />
        <input className="input" name="last_contact_date" type="date" />
        <input
          className="input md:col-span-2"
          name="address"
          placeholder="所在地"
        />
        <textarea className="input" name="note" placeholder="営業メモ" />
        <button className="btn btn-primary md:col-span-3">紹介元を登録</button>
      </form>

      <div className="card mt-6 overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>種別</th>
              <th>紹介元名</th>
              <th>担当者</th>
              <th>電話</th>
              <th>紹介</th>
              <th>見学</th>
              <th>成約</th>
              <th>成約率</th>
              <th>最終接触日</th>
            </tr>
          </thead>
          <tbody>
            {referrers.map((referrer) => {
              const rate = referrer.referral_count
                ? Math.round(
                    ((referrer.contract_count || 0) / referrer.referral_count) *
                      100,
                  )
                : 0;
              return (
                <tr key={referrer.id}>
                  <td>
                    <span className="status">{referrer.type}</span>
                  </td>
                  <td className="font-black">{referrer.name}</td>
                  <td>{referrer.contact_person}</td>
                  <td>{referrer.phone}</td>
                  <td>{referrer.referral_count || 0}</td>
                  <td>{referrer.tour_count || 0}</td>
                  <td>{referrer.contract_count || 0}</td>
                  <td>{rate}%</td>
                  <td>{referrer.last_contact_date || "-"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
