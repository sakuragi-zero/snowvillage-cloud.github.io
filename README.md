# SnowVillage Official Website

Snowflake ユーザーコミュニティ「SnowVillage」のポータルサイトです。

## 技術スタック & 設計思想
- **Frontend**: HTML5, CSS3 (Flexbox / Grid), JavaScript (Vanilla JS)
- **Data Management**: `newsData.js` などのデータ専用 JS による疑似ヘッドレス CMS 構造
- **Component Engine**: `script.js` による共通パーツ（Header / Footer）の動的インジェクション
- **Scalability**: `rem` 単位とルートの `font-size` 操作による一括レスポンシブ・スケーリング

## ディレクトリ構成

- **`/` (Root)**: トップページ (`index.html`)、共通スクリプト (`script.js`)、お知らせデータ (`newsData.js`)
- **`/css/`**: ページ・機能ごとに分割されたスタイルシート群
- **`/images/brand/`**: SnowVillage ロゴ・ファビコンなどブランド資産
- **`/news/`**: お知らせのアーカイブページ
- **`/about/`**: 運営のハブページ
  - `/about/mayors/`: Mayors（運営中核メンバー）の個人紹介
  - `/about/neighbors/`: Neighbors（年次募集の貢献メンバー）の紹介
  - `/about/departments/`: 部門別の活動紹介 + Sponsors
  - `/about/alumni/`: 卒業メンバー紹介
- **`/events/`**: 年次・大型イベントの紹介ページ
- **`/calendar/`**: Google カレンダー連携による定例予定の見える化ページ
- **`/guide/`**: コミュニティの歩き方・Slack 利用ルール・オフィス利用ガイド
- **`/contents/`**: 登壇資料・ブログ・録画などコミュニティ資産の紹介
- **`/links/`**: 外部サイトへのリンク集
- **`/join/`**: 行動規範同意付きの Slack 参加導線

## ブランドルール

- 表記は **「SnowVillage」** に統一。`Snow Village` / `SNOW VILLAGE` / `Snow` と `Village` を分割した装飾 (`<span>` 等) は禁止。
- ロゴは `images/brand/logo-white.png`。ファビコンは `images/brand/favicon.png`。
- ページタイトルは `{メニュー名} - SnowVillage` に揃える（`script.js` の `setPageTitle` が自動付与）。

## 運用

### ニュースの追加
`newsData.js` の配列先頭にオブジェクトを追加する。
```js
{
  date: "YYYY.MM.DD",
  text: "お知らせのタイトル",
  link: "リンク先URLまたは相対パス",
  isExternal: false,
}
```
トップページには最新 5 件が表示され、1 件目には自動でパルスアイコンが付く。

### ヘッダー制御
各ページ最後の `<script>` で `renderHeader("階層", "アクティブメニューキー")` を呼ぶ。メニュー定義は `script.js` の `NAV_ITEMS`、タイトル定義は `PAGE_TITLES` に集約。

### 新規ページ
スタイルは `css/新規ページ名.css` を作成して読み込む。共通スタイルを汚さず、ページ単位で分離する原則を守る。

### 季節バナーの更新（トップページ・ヒーロー背景）
`images/seasonal/hero-YYYY-MM.jpg` を配置するだけで、該当月になるとトップページの背景に自動で重なる（コード変更不要）。命名規則・推奨サイズは `images/seasonal/README.md` を参照。対象月の画像が無い場合は既存の雪結晶背景にフォールバックする。

## 開発・デプロイ前チェック

このリポジトリはビルド不要の静的サイトだが、デプロイ前チェック用に Node ツールチェーンを同梱している。

```bash
npm install
npm run check   # HTML/CSS/JS lint + 季節バナー画像サイズ + リンク切れ + コンソールエラー検知（PC/モバイル）
```

- `npm run check` は GitHub Actions の CI (`.github/workflows/ci.yml`) と全く同じコマンドで、PR作成前にローカル/Codespace で先に赤信号を潰せる。
- GitHub Codespaces で開く場合は `.devcontainer/devcontainer.json` により依存関係とPlaywrightのブラウザが自動セットアップされる。
- `npm run test:smoke` は PR テンプレートの「コンソールに赤いエラーが出ていないか」「PC/モバイル両幅でレイアウト崩れがないか」の手動チェックを自動化したもの（Playwright）。
- CI/CD の全体設計（マージ後の自動デプロイ・Actionsディスパッチからのロールバック）は、GitHub Pages のデプロイ方式を「ブランチデプロイ」から「GitHub Actions」に切り替える権限が必要なため、現時点では未導入（保留中）。切り替え後に `deploy.yml` を追加する想定。
