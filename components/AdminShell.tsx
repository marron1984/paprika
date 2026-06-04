import { logout } from "@/app/actions/admin";
import { siteName } from "@/lib/constants";
export function AdminShell({ children }: { children: React.ReactNode }) {
  const links = [
    ["/admin", "ダッシュボード"],
    ["/admin/leads", "案件一覧"],
    ["/admin/notifications", "通知センター"],
    ["/admin/facilities", "施設管理"],
    ["/admin/rooms", "部屋管理"],
    ["/admin/tours", "見学管理"],
    ["/admin/referrers", "紹介元管理"],
    ["/admin/ads", "広告管理"],
    ["/admin/lps", "LP管理"],
    ["/admin/settings", "サイト設定"],
    ["/admin/audit-logs", "操作ログ"],
  ];
  return (
    <div className="admin-grid">
      <aside className="admin-sidebar p-5">
        <a href="/admin" className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-blue-600 font-black text-white shadow-lg shadow-blue-100">
            DC
          </span>
          <span>
            <span className="block text-lg font-black text-blue-700">
              {siteName}
            </span>
            <span className="text-sm font-bold text-slate-500">管理画面</span>
          </span>
        </a>
        <nav className="mt-8 grid gap-1.5">
          {links.map(([href, label]) => (
            <a key={href} className="nav-link" href={href}>
              {label}
            </a>
          ))}
        </nav>
        <form action={logout} className="mt-8">
          <button className="btn btn-secondary w-full" type="submit">
            ログアウト
          </button>
        </form>
      </aside>
      <main className="p-5 md:p-8">{children}</main>
    </div>
  );
}
