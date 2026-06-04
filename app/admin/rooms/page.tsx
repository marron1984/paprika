import { redirect } from "next/navigation";
import { createRoom } from "@/app/actions/admin";
import { AdminShell } from "@/components/AdminShell";
import { roomStatuses } from "@/lib/constants";
import { requireSession, supabaseFetch } from "@/lib/supabase-rest";
import type { Facility, Room } from "@/lib/types";
export default async function Rooms() {
  if (!(await requireSession())) redirect("/admin/login");
  const [rooms, facilities] = await Promise.all([
    supabaseFetch<Room[]>(
      "rooms?select=*,facilities(name)&order=updated_at.desc",
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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-black">部屋管理</h1>
        <a className="btn btn-secondary" href="/admin/export/rooms">
          CSV出力
        </a>
      </div>
      <form
        action={createRoom}
        className="card mt-6 grid gap-4 p-6 md:grid-cols-4"
      >
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
          name="room_number"
          placeholder="部屋番号"
          required
        />
        <input className="input" name="floor" placeholder="階数" />
        <select className="input" name="status">
          {roomStatuses.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <input className="input" name="rent" type="number" placeholder="家賃" />
        <input
          className="input"
          name="common_fee"
          type="number"
          placeholder="共益費"
        />
        <input
          className="input"
          name="meal_fee"
          type="number"
          placeholder="食費"
        />
        <input
          className="input"
          name="management_fee"
          type="number"
          placeholder="管理費"
        />
        <textarea
          className="input md:col-span-4"
          name="note"
          placeholder="メモ"
        />
        <button className="btn btn-primary md:col-span-4">部屋を登録</button>
      </form>
      <div className="card mt-6 overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>施設</th>
              <th>部屋</th>
              <th>階数</th>
              <th>家賃</th>
              <th>共益費</th>
              <th>食費</th>
              <th>管理費</th>
              <th>状況</th>
            </tr>
          </thead>
          <tbody>
            {rooms.map((r) => (
              <tr key={r.id}>
                <td>{r.facilities?.name}</td>
                <td className="font-black">{r.room_number}</td>
                <td>{r.floor}</td>
                <td>{r.rent?.toLocaleString()}円</td>
                <td>{r.common_fee?.toLocaleString()}円</td>
                <td>{r.meal_fee?.toLocaleString()}円</td>
                <td>{r.management_fee?.toLocaleString()}円</td>
                <td>
                  <span className="status">{r.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
