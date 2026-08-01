#!/usr/bin/env node
// header/footer は script.js が innerHTML で動的に描画するため、
// linkinator を1ページだけに向けても静的HTML上のリンクしか辿れず
// ナビ経由のページ（/about/, /guide/ など）が検査対象から漏れる。
// そのため全 index.html を事前に列挙し、それぞれを起点として渡す。
import { LinkChecker } from "linkinator";
import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const BASE_URL = "http://localhost:8080";
const SKIP_DIRS = new Set(["node_modules", ".git", ".github", ".devcontainer"]);

function findIndexPages(dir, urlPath = "/") {
  const urls = [];
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIRS.has(entry)) continue;
    const fullPath = join(dir, entry);
    if (statSync(fullPath).isDirectory()) {
      urls.push(...findIndexPages(fullPath, `${urlPath}${entry}/`));
    } else if (entry === "index.html") {
      urls.push(urlPath);
    }
  }
  return urls;
}

const pages = findIndexPages(".").sort();
console.log(`Checking links starting from ${pages.length} pages:\n${pages.join("\n")}\n`);

const checker = new LinkChecker();
let hasFailure = false;

checker.on("link", (result) => {
  if (result.state === "BROKEN") {
    hasFailure = true;
    console.error(`✗ [${result.status}] ${result.url} (linked from ${result.parent})`);
  }
});

const result = await checker.check({
  path: pages.map((p) => `${BASE_URL}${p}`),
  recurse: true,
  linksToSkip: async (link) => !link.startsWith(BASE_URL),
});

console.log(`\nScanned ${result.links.length} links total.`);
if (!result.passed || hasFailure) {
  process.exit(1);
}
