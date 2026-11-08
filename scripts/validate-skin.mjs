#!/usr/bin/env node
/**
 * 皮肤静态校验 · 零依赖
 *
 * 校验四件事：
 *   1) 皮肤必需文件齐全
 *   2) skin.json 是合法 JSON，且字段与文件引用都成立
 *   3) CSS 花括号配平（先剥掉注释，避免注释里的 {} 误判）
 *   4) 没有遗留的调试标记
 *
 * 用法：node scripts/validate-skin.mjs
 * 退出码：0 通过；1 有硬错误（CI 会红）
 */

import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];
const warnings = [];

const fail = (m) => errors.push(m);
const warn = (m) => warnings.push(m);

// 1) 必需文件
const required = [
  'skin/skin.json',
  'skin/skin.css',
  'skin/patches.css',
  'README.md',
  'README.en.md',
  'CHANGELOG.md',
  'LICENSE',
];
for (const f of required) {
  if (!existsSync(join(root, f))) fail(`缺少必需文件：${f}`);
}

// 2) skin.json
let manifest = null;
const manifestPath = join(root, 'skin/skin.json');
if (existsSync(manifestPath)) {
  const raw = readFileSync(manifestPath, 'utf8');
  try {
    manifest = JSON.parse(raw);
  } catch (e) {
    fail(`skin/skin.json 不是合法 JSON：${e.message}`);
  }
}

if (manifest) {
  for (const key of ['id', 'name', 'version', 'author']) {
    if (!manifest[key]) fail(`skin.json 缺少字段：${key}`);
  }
  if (manifest.version && !/^\d+\.\d+\.\d+$/.test(manifest.version)) {
    fail(`skin.json 的 version 不是语义化版本：${manifest.version}`);
  }
  const c = manifest.contributes ?? {};
  if (!c.stylesheet) fail('skin.json 缺少 contributes.stylesheet');
  if (!c.patches) fail('skin.json 缺少 contributes.patches');

  // 清单里指到的样式表必须真的存在
  for (const key of ['stylesheet', 'patches']) {
    const rel = c[key];
    if (!rel) continue;
    const p = join(root, 'skin', rel);
    if (!existsSync(p)) {
      fail(`skin.json 的 contributes.${key} 指向不存在的文件：skin/${rel}`);
    } else if (readFileSync(p, 'utf8').trim() === '') {
      fail(`skin/${rel} 是空文件`);
    }
  }
}

// 3) CSS 花括号配平
const stripComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '');

function checkBraces(rel) {
  const p = join(root, rel);
  if (!existsSync(p)) return;
  const css = stripComments(readFileSync(p, 'utf8'));
  let depth = 0;
  let line = 1;
  for (const ch of css) {
    if (ch === '\n') line++;
    else if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth < 0) {
        fail(`${rel}:${line} 出现多余的 }`);
        return;
      }
    }
  }
  if (depth !== 0) fail(`${rel} 花括号不配平，结尾还有 ${depth} 个未闭合的 {`);
}

for (const rel of ['skin/skin.css', 'skin/patches.css']) checkBraces(rel);

// 4) 调试残留
for (const rel of ['skin/skin.css', 'skin/patches.css']) {
  const p = join(root, rel);
  if (!existsSync(p)) continue;
  readFileSync(p, 'utf8')
    .split(/\r?\n/)
    .forEach((text, i) => {
      if (/\b(FIXME|XXX|console\.log)\b/.test(text)) {
        warn(`${rel}:${i + 1} 疑似调试残留：${text.trim().slice(0, 80)}`);
      }
    });
}

// 输出
for (const w of warnings) console.log(`::warning::${w}`);
if (errors.length) {
  for (const e of errors) console.error(`::error::${e}`);
  console.error(`\n✗ 校验未通过，${errors.length} 个错误`);
  process.exit(1);
}
console.log(`✓ 校验通过：${manifest ? manifest.name + ' v' + manifest.version : 'skin'}`);
if (warnings.length) console.log(`  （${warnings.length} 条警告，不阻塞）`);
