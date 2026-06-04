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

- 公開トップページ、施設・空室公開ページ、電話CTA、LINE CTA、問い合わせフォーム、完了ページ
- 問い合わせをSupabaseの `leads` に登録
- 管理ログイン（Supabase Auth）
- 案件一覧、カンバン、案件詳細、ステータス変更、対応履歴
- 施設管理、部屋管理、見学管理、簡易ダッシュボード
- Google広告タグ設置用の環境変数領域

## 追加済みの第2フェーズ基盤

- LP管理: Google広告向けLPのタイトル、slug、キーワード、本文要素、公開状態を管理できます。
- 広告管理: 手入力の広告費、表示回数、クリック数、問い合わせ数、見学数、入居数からCPAと入居単価を記録できます。
- 紹介元管理: ケアマネ、病院、MSW、地域包括、WEBなどの紹介元と営業メモを管理できます。
- CSV出力: 案件、施設、部屋、見学、広告、紹介元、CVイベントを管理画面からCSVで出力できます。
- 空室公開: `/facilities` で管理画面の施設・部屋情報を公開側に反映できます。
- 通知センター: `/admin/notifications` で新規問い合わせ、初回連絡未対応、見学前日、次回アクション期限、長期放置、失注リスクを確認できます。

## 実装メモ

- 管理画面は `robots: noindex` を設定し、各ページでSupabase AuthのアクセストークンをSupabase Auth APIで検証します。管理系サーバーアクションも同じ検証を通してから更新処理を実行します。
- SupabaseクライアントSDKに依存せず、REST APIで保存・取得するため、サーバーアクションから将来のLINE/AI/広告API連携を追加しやすい構成です。
- Tailwind CSSはNext.js 16環境に合わせて `@tailwindcss/postcss` を使うPostCSS構成にしています。


## 追加機能メモ

- 管理画面の「サイト設定」から、公開サイト名・電話番号・LINE相談URL・Google Tag Manager ID・Google広告コンバージョンID/ラベルを更新できます。
- 設定値は `site_settings` テーブルの `key = 'site'` にJSONとして保存され、公開ヘッダー/CTA/共通レイアウトの計測タグに反映されます。

- CVトラッキング: 問い合わせフォーム送信（CV1）、電話タップ（CV2）、LINE追加（CV3）、見学予約（CV4）、入居完了（CV5）を `conversion_events` に記録し、管理ダッシュボードで月次件数を確認できます。
