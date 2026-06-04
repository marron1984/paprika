import { cookies } from "next/headers";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function assertConfig(key?: string, name?: string) {
  if (!key) throw new Error(`${name} is not configured`);
  return key;
}

export async function supabaseFetch<T>(
  path: string,
  init: RequestInit = {},
  admin = false,
): Promise<T> {
  const base = assertConfig(url, "NEXT_PUBLIC_SUPABASE_URL");
  const key = assertConfig(
    admin ? serviceKey : anonKey,
    admin ? "SUPABASE_SERVICE_ROLE_KEY" : "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  );
  const res = await fetch(`${base}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      ...(init.headers || {}),
    },
  });
  if (!res.ok) throw new Error(await res.text());
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export async function signInWithPassword(email: string, password: string) {
  const base = assertConfig(url, "NEXT_PUBLIC_SUPABASE_URL");
  const key = assertConfig(anonKey, "NEXT_PUBLIC_SUPABASE_ANON_KEY");
  const res = await fetch(`${base}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { apikey: key, "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok)
    throw new Error("メールアドレスまたはパスワードが正しくありません。");
  return res.json() as Promise<{
    access_token: string;
    refresh_token: string;
    expires_in: number;
    user: { id: string; email?: string };
  }>;
}

export async function getSessionUser(token: string) {
  const base = assertConfig(url, "NEXT_PUBLIC_SUPABASE_URL");
  const key = assertConfig(anonKey, "NEXT_PUBLIC_SUPABASE_ANON_KEY");
  const res = await fetch(`${base}/auth/v1/user`, {
    headers: { apikey: key, Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!res.ok) return null;
  return res.json() as Promise<{ id: string; email?: string }>;
}

export async function requireSession() {
  const token = (await cookies()).get("sb-access-token")?.value;
  if (!token) return null;

  const user = await getSessionUser(token);
  if (!user) return null;

  return { token, user };
}
