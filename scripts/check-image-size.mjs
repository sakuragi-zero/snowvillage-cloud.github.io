#!/usr/bin/env node
// 季節バナー画像 (images/seasonal/) のファイルサイズをチェックする。
// ヒーロー全画面背景として使われるため、重すぎる画像はページ表示速度に直結する。
// 対象を images/seasonal/ に限定しているのは、既存の他ディレクトリの写真資産まで
// 遡って基準を強制すると無関係な変更でCIが壊れるため。
import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const TARGET_DIR = "images/seasonal";
const WARN_BYTES = 500 * 1024;
const FAIL_BYTES = 1.5 * 1024 * 1024;
const IMAGE_EXT = /\.(jpe?g|png|webp)$/i;

let hasFailure = false;
let files = [];
try {
  files = readdirSync(TARGET_DIR).filter((f) => IMAGE_EXT.test(f));
} catch {
  console.log(`(${TARGET_DIR} が存在しないためスキップ)`);
  process.exit(0);
}

if (files.length === 0) {
  console.log(`(${TARGET_DIR} に画像がまだ無いためスキップ)`);
  process.exit(0);
}

for (const file of files) {
  const path = join(TARGET_DIR, file);
  const { size } = statSync(path);
  const kb = (size / 1024).toFixed(0);

  if (size > FAIL_BYTES) {
    console.error(`✗ ${path}: ${kb}KB — ${(FAIL_BYTES / 1024 / 1024).toFixed(1)}MBの上限を超えています`);
    hasFailure = true;
  } else if (size > WARN_BYTES) {
    console.warn(`⚠ ${path}: ${kb}KB — 推奨500KBを超えています。圧縮を検討してください`);
  } else {
    console.log(`✓ ${path}: ${kb}KB`);
  }
}

if (hasFailure) process.exit(1);
