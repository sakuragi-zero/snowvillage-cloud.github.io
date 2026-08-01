import js from "@eslint/js";
import globals from "globals";

export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "script",
      globals: {
        ...globals.browser,
      },
    },
    rules: {
      "no-unused-vars": "warn",
      // 日本語コンテンツ（コメント・文字列）で全角スペースを使うのは意図的な慣習のため対象外
      "no-irregular-whitespace": "off",
    },
  },
  {
    // script.js は各ページで <script src="xxxData.js"> の後に読み込まれ、
    // それらのデータファイルが定義するグローバル定数（疑似ヘッドレスCMS）を参照する。
    // *Data.js 自身はここでは対象にしない（自分で const 宣言するため redeclare になる）。
    files: ["script.js"],
    languageOptions: {
      globals: {
        newsData: "readonly",
        eventsData: "readonly",
        linksData: "readonly",
        aboutData: "readonly",
        contentsData: "readonly",
      },
    },
  },
  {
    ignores: ["node_modules/", "playwright-report/", "test-results/"],
  },
];
