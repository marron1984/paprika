import { InquiryForm } from "@/components/InquiryForm";
import { PublicHeader } from "@/components/PublicHeader";
import { supabaseFetch } from "@/lib/supabase-rest";
import type { Facility, Room } from "@/lib/types";

type FacilityWithRooms = Facility & {
  rooms?: Pick<Room, "id" | "room_number" | "floor" | "rent" | "status">[];
};

export const dynamic = "force-dynamic";

export const metadata = {
  title: "施設・空室情報 | DCかいご相談ダイヤル",
  description:
    "大阪周辺の介護施設・高齢者住宅の空室、費用、認知症・生活保護・医療対応状況を確認できます。",
};

export default async function PublicFacilities() {
  const facilities = await supabaseFetch<FacilityWithRooms[]>(
    "facilities?select=*,rooms(id,room_number,floor,rent,status)&order=name.asc",
    {},
    true,
  ).catch(() => []);

  return (
    <>
      <PublicHeader />
      <main>
        <section className="section">
          <div className="container">
            <span className="badge">施設・空室情報</span>
            <h1 className="mt-4 text-4xl font-black">
              公開できる施設・住宅一覧
            </h1>
            <p className="mt-4 max-w-3xl leading-8 text-slate-600">
              管理画面で更新した空室数、費用、認知症・生活保護・医療対応項目を公開ページにも反映します。詳細な条件や最新状況は無料相談で確認できます。
            </p>
          </div>
        </section>

        <section className="section bg-white pt-0">
          <div className="container grid gap-5 md:grid-cols-2">
            {facilities.map((facility) => {
              const publicRooms = (facility.rooms || []).filter((room) =>
                ["空室", "予約中", "申込中"].includes(room.status),
              );
              return (
                <article className="card p-6" key={facility.id}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-blue-700">
                        {facility.type || "高齢者住宅"}
                      </p>
                      <h2 className="mt-1 text-2xl font-black">
                        {facility.name}
                      </h2>
                    </div>
                    <span className="status">
                      空室 {facility.vacancy_count ?? publicRooms.length} 室
                    </span>
                  </div>
                  <p className="mt-4 text-slate-600">{facility.address}</p>
                  <dl className="mt-5 grid gap-3 text-sm md:grid-cols-2">
                    <div className="rounded-xl bg-slate-50 p-3">
                      <dt className="font-bold text-slate-500">月額費用</dt>
                      <dd className="mt-1 font-black">
                        {facility.monthly_fee?.toLocaleString() || "要相談"}円
                      </dd>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-3">
                      <dt className="font-bold text-slate-500">初期費用</dt>
                      <dd className="mt-1 font-black">
                        {facility.initial_fee?.toLocaleString() || "要相談"}円
                      </dd>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-3">
                      <dt className="font-bold text-slate-500">認知症</dt>
                      <dd className="mt-1 font-black">
                        {facility.accepts_dementia ? "対応可" : "要確認"}
                      </dd>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-3">
                      <dt className="font-bold text-slate-500">生活保護</dt>
                      <dd className="mt-1 font-black">
                        {facility.accepts_welfare ? "対応可" : "要確認"}
                      </dd>
                    </div>
                  </dl>
                  {facility.medical_support ? (
                    <p className="mt-4 text-sm text-slate-600">
                      医療対応: {facility.medical_support}
                    </p>
                  ) : null}
                  {publicRooms.length ? (
                    <div className="mt-5 rounded-2xl border border-blue-100 p-4">
                      <h3 className="font-black text-blue-900">公開中の部屋</h3>
                      <div className="mt-3 grid gap-2">
                        {publicRooms.slice(0, 3).map((room) => (
                          <div
                            className="flex justify-between rounded-xl bg-blue-50 px-3 py-2 text-sm"
                            key={room.id}
                          >
                            <span>
                              {room.floor ? `${room.floor} / ` : ""}
                              {room.room_number}
                            </span>
                            <b>{room.status}</b>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                  <a className="btn btn-primary mt-6" href="#form">
                    この施設について相談する
                  </a>
                </article>
              );
            })}
          </div>
        </section>

        <section className="section">
          <div className="container">
            <InquiryForm lpName="施設・空室情報" />
          </div>
        </section>
      </main>
    </>
  );
}
