// PRテンプレートの手動チェック項目
// 「コンソールに赤いエラーが出ていないことを確認した」
// 「スマホ（モバイル幅）とPC幅の両方でレイアウト崩れがないか確認した」
// を自動化するスモークテスト。
//
// 外部サービス（Google Fontsなど）の一時的な失敗でデプロイ判定が
// ブロックされないよう、自サイト（同一オリジン）のリソース欠落・
// JSエラーだけを対象にする。
import { test, expect } from "@playwright/test";

const PAGES = [
  "/",
  "/about/",
  "/calendar/",
  "/contents/",
  "/events/",
  "/guide/",
  "/join/",
  "/links/",
  "/news/",
];

const RESOURCE_FAILURE_PATTERN = /^Failed to load resource:/;
// 季節バナー(images/seasonal/hero-YYYY-MM.*)は、その月の画像が未配置なら
// 404を許容してデフォルト表示にフォールバックする設計（applySeasonalHero）。
// 画像が用意されるまで毎月このprobeが404するのは意図した挙動なので対象外にする。
const EXPECTED_404_PATTERN = /\/images\/seasonal\/hero-\d{4}-\d{2}\.(jpg|png)$/;

for (const path of PAGES) {
  test(`${path} loads without console errors or broken same-origin resources`, async ({ page, baseURL }) => {
    const consoleErrors = [];
    const brokenResources = [];

    // /join/ のように自サイトから即座に外部サイトへリダイレクトするページでは、
    // 遷移後は完全に第三者のページ（third-party制御外のJS）になるため、
    // その時点で自オリジンを離れていたらコンソールエラーの対象外にする。
    const isOnOwnOrigin = () => page.url().startsWith(baseURL);

    page.on("console", (msg) => {
      // "Failed to load resource" はURL情報を持たないため個別に扱わず、
      // response/requestfailed イベント側で同一オリジンかどうかを判定する
      if (msg.type() === "error" && !RESOURCE_FAILURE_PATTERN.test(msg.text()) && isOnOwnOrigin()) {
        consoleErrors.push(msg.text());
      }
    });
    page.on("pageerror", (err) => {
      if (isOnOwnOrigin()) consoleErrors.push(err.message);
    });

    page.on("response", (res) => {
      if (res.url().startsWith(baseURL) && res.status() >= 400 && !EXPECTED_404_PATTERN.test(res.url())) {
        brokenResources.push(`${res.status()} ${res.url()}`);
      }
    });
    page.on("requestfailed", (req) => {
      if (req.url().startsWith(baseURL)) {
        brokenResources.push(`${req.url()} (${req.failure()?.errorText})`);
      }
    });

    const response = await page.goto(path);
    expect(response?.status(), `${path} should respond with a non-error status`).toBeLessThan(400);

    await page.waitForLoadState("networkidle");

    expect(consoleErrors, `console errors on ${path}`).toEqual([]);
    expect(brokenResources, `broken same-origin resources on ${path}`).toEqual([]);
  });
}
