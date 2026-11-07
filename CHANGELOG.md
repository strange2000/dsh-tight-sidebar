<div align="center">

<h2>📜 变更记录 · Changelog</h2>

<b>🌐 语言 / Language</b>：🇨🇳 <b>简体中文</b>　·　🇬🇧 <a href="CHANGELOG.en.md"><b>English →</b></a>

</div>

> 一份「怎么走到今天」的完整记录。✅ = 维护者确认可用，❌ = 被推翻，⚠️ = 可用但埋了雷。
> 版本号是迭代序号，不是发布号 —— **正式发布从 `2.0.0` 起**（对应 v21）。

---

## v21 · 13,440 B / 254 行 —— 🩹 清掉 36px 空白带 ✅

账号行上方出现一条 36px 的空白（无悬停、无点击、纯空气）。
量出的几何：`footArea` h=145 = `footerActions` **36** + 用量卡 57 + 账号行 52；而按钮本体被绝对定位钉在 y=752。
**绝对定位让按钮脱流，容器却还留在流里占着 36px。**

```css
body:not(:has([data-sidebar-collapsed])) [class*="footArea"] > [class*="footerActions"] {
  height: 0 !important; min-height: 0 !important; max-height: none !important;
  margin: 0 !important; padding: 0 !important; overflow: visible !important;
}
```

坑：三个高度都要写（插件设过 `min-height`）；`overflow` 必须 `visible`，否则把钉住的图标裁掉。

## v20 · 12,877 B / 242 行 —— 📐 让位按实际颗数算 ✅

页脚让位 `padding-right` 原来写死 92px（按「2 颗图标」算的）。只剩 1 颗时多出 42px 空气带，看起来像「有东西被藏了」，其实是**地方空占**。

- 基础 50px（1 颗：6 + 36 + 6 + 2）
- 出现第 2 颗 → 92px（`footerActions button:nth-last-of-type(2)` 及两种包装结构的 `:has()` 变体）
- 3 / 4 / 5 颗 → 134 / 176 / 218px
- 外加 `box-sizing: border-box`：这两个元素是 `content-box`，不加这条 padding 只会把盒子撑大、向右溢出，不会向内让位

**反面教训**：看到「空白占位 + 悬停无轮廓 + 点击无反应」，先量盒子归属，别急着给图标加可见性保险（v17 / v18 两轮都白做）。

## v16–v19 · 仅 macOS 实测 —— 💊 连接药丸压图标

「连接成功」瞬态药丸（`div[role="status"]`，约 2 秒）压在页脚图标上。

| 版本 | 做法 | 结果 |
| :--: | --- | :--: |
| v16 | 给 `triggerRow` 加 `padding-right:46px` | ❌ content-box 只撑大盒子 |
| v17 | 加 `box-sizing:border-box` + 按 CSS Modules 类名隐藏药丸 | ❌ 方向错（药丸本来就不是问题） |
| v18 | 再给 `svg` 加可见性保险 | ❌ 同上 |
| v19 | 让位跟随实际颗数（1 颗 50 / 2 颗 92） | ✅ |

## v15 · 11,709 B / 225 行 —— 🏁 回滚到 v9 + 面板图标条 ✅ 稳定基线

要求是「回到第一次改动之前的那个版本」，随后又指出「底栏对了，但面板那里应该是纯图标的那个版本」。

做法：第 1 段取 v14 的面板图标条，第 2、3 段逐字节取回 v9 —— 靠 `/* ── 1.` `/* ── 2.` `/* ── 3.` 三个段头做 splice。

## v13 / v14 · 7,428 / 7,371 B —— ↕️ footArea 改横向排布 ❌

- v13：`footArea{flex-flow:row wrap}` + 账号行 `flex:1 1 0` + 动作行 `order:2` → 动作行自己折行，图标掉到账号行**下面**
- v14：动作行改 `nowrap`、加 `:has()` 兼容「动作行被多包一层」→ 依旧错

**教训**：`footerActions` 里是 `<div data-slot="sidebar.footer.action" style="display:contents">`，`display:contents` 不生成盒子 → 给这个出口层设 `position:absolute` **完全无效**（v11 挪不动的根因）。

## v11 · 7,687 B —— 🧵 「不数序号」的 flex 横条 ❌

想彻底摆脱序号推断：用 `:has(> button)` 找出「装按钮的那一层」，整层做成右下角 flex 横条。结果按钮被挤小、互相重叠。

## v10 · 11,708 B —— 🎛️ 面板改图标条 + 悬停浮出文字 ✅

官方「侧栏收起」态本来就有 36×36 方块几何（`.collapsed .panelRow{width:36px;height:36px;justify-content:center;padding:0}`），直接搬到展开态用。

文字没丢：`panelTitle` 仍在 DOM，改成绝对定位浮层，`:hover` / `:focus-visible` 时显示 —— **纯 CSS，零脚本，Windows / macOS 都有效**，不依赖 `title` 属性、也不依赖任何插件。

（想「点击折叠并记住状态」才需要一小段前端 JS，且折叠入口本身仍占一行，净收益与图标条相当，所以没做。）

## v9 · 10,207 B —— 🧮 面板单列改自适应多列 ✅

`display:grid` + `repeat(auto-fit,minmax(84px,1fr))`，7 个面板从 4 行变 3 行。

⚠️ **被否的中间版**：曾把字号压到 12.5px、图标 14px 来多换 60px —— 被否决（「牺牲了控件的文字显示效果」）。**此后不再用改字号换空间。**

## v8 · 9,352 B —— 🌱 补齐第 3–5 颗图标的位置 ⚠️

v7 只写了前两颗的位置，第 3 颗会落回 `right:6px` 和电话图标重叠。补了 `:nth-last-of-type(1..5)` + 「各自被包一层」的四层深度兜底。

⚠️ 埋雷：两套判据权重不同、且**没排除 `display:none` 的隐藏按钮**（比如「无更新时」的更新按钮），数量一变序号整体错位 → 图标被排到 `right:132px` 这种奇怪位置。

## v7 · 5,151 B —— 🎯 绝对定位 + 按序号分左右 ✅ 首个可用版

`footArea{position:relative}`，中间层全部 `position:static`，按钮 `position:absolute; right:6px; bottom:6px; 36×36; border-radius:50%`，账号行 `padding-right:92px` 让位。

维护者确认：「这次终于没问题了」。

## v2–v6 —— 🕳️ 为「把图标并进账号行」做的五轮尝试 ❌

| 版本 | 做法 | 死因 |
| :--: | --- | --- |
| v2 | `footArea` 改两列网格，`footerActions` 放窄列 | 窄列塞不下支出卡整块，被挤坏 |
| v3 | `footerActions{display:contents}` 摊平 + `order` 重排 | 图标各自占一整行（`>` 是 DOM 层级，`display:contents` 只改排版不改选择器层级） |
| v4 · 4,693 B | 特异性分层（0,1,0 / 0,3,0 各管一类） | 仍判错元素 |
| v5 · 4,242 B | 改绝对定位 | 两个图标重叠 |
| v6 · 4,236 B | 绝对定位 + 中间层 `position:static` | 仍重叠（两按钮各自被包一层，`first-of-type` 谁都没选中） |

**教训**：不要靠「第 N 个按钮」推断位置 —— 页脚按钮数量是随用户开关插件变化的变量，不是常量。

## v1 · 4,444 B —— 🌱 初版（macOS 移植）

面板两列 + 页脚动作收成一行 + `.ima-rail{min-height:0}`。280×700 实测省约 190px。

---

<div align="center"><sub>🌐 <a href="CHANGELOG.en.md">Read this changelog in English</a>　·　<a href="README.md">返回 README</a></sub></div>
