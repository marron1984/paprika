import { redirect } from "next/navigation";
import { createLpPage } from "@/app/actions/admin";
import { AdminShell } from "@/components/AdminShell";
import { requireSession, supabaseFetch } from "@/lib/supabase-rest";
import type { LpPage } from "@/lib/types";

export default async function Lps() {
  if (!(await requireSession())) redirect("/admin/login");

  const pages = await supabaseFetch<LpPage[]>(
    "lp_pages?select=*&order=updated_at.desc",
    {},
    true,
  );

  return (
    <AdminShell>
      <h1 className="text-3xl font-black">LP管理</h1>
      <p className="mt-2 text-slate-600">
        Google広告用の認知症・生活保護・地域別LPの下書きを管理します。
      </p>

      <form
        action={createLpPage}
        className="card mt-6 grid gap-4 p-6 md:grid-cols-2"
      >
        <input className="input" name="title" placeholder="タイトル" required />
        <input
          className="input"
          name="slug"
          placeholder="slug（例 dementia-osaka）"
          required
        />
        <input
          className="input"
          name="target_keyword"
          placeholder="対象キーワード"
        />
        <select className="input" name="status">
          <option value="draft">下書き</option>
          <option value="published">公開</option>
        </select>
        <textarea
          className="input md:col-span-2"
          name="hero_copy"
          placeholder="キャッチコピー"
        />
        <textarea className="input" name="target" placeholder="対象者" />
        <textarea
          className="input"
          name="worries"
          placeholder="解決できる悩み"
        />
        <textarea
          className="input md:col-span-2"
          name="faq"
          placeholder="よくある質問"
        />
        <button className="btn btn-primary md:col-span-2">LPを登録</button>
      </form>

      <div className="card mt-6 overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>タイトル</th>
              <th>slug</th>
              <th>KW</th>
              <th>状態</th>
              <th>公開URL</th>
              <th>更新日</th>
            </tr>
          </thead>
          <tbody>
            {pages.map((page) => (
              <tr key={page.id}>
                <td className="font-black">{page.title}</td>
                <td>{page.slug}</td>
                <td>{page.target_keyword}</td>
                <td>
                  <span className="status">{page.status}</span>
                </td>
                <td>
                  <a
                    className="font-bold text-blue-700"
                    href={`/lp/${page.slug}`}
                  >
                    /lp/{page.slug}
                  </a>
                </td>
                <td>
                  {page.updated_at
                    ? new Date(page.updated_at).toLocaleDateString("ja-JP")
                    : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
