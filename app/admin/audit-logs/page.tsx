import { redirect } from "next/navigation";
import { AdminShell } from "@/components/AdminShell";
import { requireSession, supabaseFetch } from "@/lib/supabase-rest";
import type { AuditLog } from "@/lib/types";

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("ja-JP", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function buildFilters(params: Record<string, string | undefined>) {
  const filters = ["select=*"];
  if (params.action)
    filters.push(`action=ilike.*${encodeURIComponent(params.action)}*`);
  if (params.target_table)
    filters.push(`target_table=eq.${encodeURIComponent(params.target_table)}`);
  if (params.user_email)
    filters.push(`user_email=ilike.*${encodeURIComponent(params.user_email)}*`);
  filters.push("order=created_at.desc", "limit=200");
  return filters.join("&");
}

export default async function AuditLogsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  if (!(await requireSession())) redirect("/admin/login");
  const sp = await searchParams;
  const logs = await supabaseFetch<AuditLog[]>(
    `audit_logs?${buildFilters(sp)}`,
    {},
    true,
  );

  return (
    <AdminShell>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-black">操作ログ</h1>
          <p className="mt-2 text-slate-600">
            管理画面で実行された更新操作を記録し、個人情報を扱うCRMの監査証跡として確認できます。
          </p>
        </div>
        <a className="btn btn-secondary" href="/admin/export/audit-logs">
          CSV出力
        </a>
      </div>

      <form className="mt-5 flex flex-wrap gap-3">
        <input
          className="input max-w-xs"
          name="action"
          placeholder="操作名"
          defaultValue={sp.action}
        />
        <input
          className="input max-w-xs"
          name="target_table"
          placeholder="対象テーブル"
          defaultValue={sp.target_table}
        />
        <input
          className="input max-w-xs"
          name="user_email"
          placeholder="メールアドレス"
          defaultValue={sp.user_email}
        />
        <button className="btn btn-primary">検索</button>
      </form>

      <div className="card mt-6 overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>日時</th>
              <th>操作</th>
              <th>概要</th>
              <th>対象</th>
              <th>ユーザー</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id}>
                <td>{formatDateTime(log.created_at)}</td>
                <td>
                  <span className="status">{log.action}</span>
                </td>
                <td>{log.summary || "-"}</td>
                <td>
                  {log.target_table || "-"}
                  {log.target_id ? ` / ${log.target_id}` : ""}
                </td>
                <td>{log.user_email || log.user_id || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
