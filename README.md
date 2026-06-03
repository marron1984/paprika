# DCかいご相談ダイヤル

介護施設・高齢者住宅への入居相談を公開サイトで獲得し、問い合わせから見学・入居までを管理するMVPです。

## 構成

- Next.js / TypeScript / Tailwind CSS
- Supabase REST API / PostgreSQL / Supabase Auth
- Vercel想定

## セットアップ

1. `.env.example` を `.env.local` にコピーしてSupabaseの値を設定します。
2. Supabase SQL Editorで `supabase/schema.sql` を実行します。
3. Supabase Authで管理者ユーザーを作成します。
4. `npm install`、`npm run dev` を実行します。

## MVP機能

- 公開トップページ、電話CTA、LINE CTA、問い合わせフォーム、完了ページ
- 問い合わせをSupabaseの `leads` に登録
- 管理ログイン（Supabase Auth）
- 案件一覧、カンバン、案件詳細、ステータス変更、対応履歴
- 施設管理、部屋管理、見学管理、簡易ダッシュボード
- Google広告タグ設置用の環境変数領域
