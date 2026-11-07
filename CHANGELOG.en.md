<div align="center">

<h2>📜 Changelog · 变更记录</h2>

<b>🌐 Language / 语言</b>：🇬🇧 <b>English</b>　·　🇨🇳 <a href="CHANGELOG.md"><b>简体中文 →</b></a>

</div>

> A complete record of how this skin got here. ✅ = maintainer-confirmed, ❌ = rejected, ⚠️ = works but hides a trap.
> Version numbers are iteration indices, not releases — **the first release is `2.0.0`** (= v21).

---

## v21 · 13,440 B / 254 lines — 🩹 Removing the 36px empty band ✅

A 36px block of nothing appeared above the account row (no hover, no click, just air).
Measured geometry: `footArea` h=145 = `footerActions` **36** + usage card 57 + account row 52, while the buttons themselves sit at y=752 — pinned by absolute positioning.

**Absolute positioning takes the buttons out of flow, but the container stays in flow holding 36px.**

```css
body:not(:has([data-sidebar-collapsed])) [class*="footArea"] > [class*="footerActions"] {
  height: 0 !important; min-height: 0 !important; max-height: none !important;
  margin: 0 !important; padding: 0 !important; overflow: visible !important;
}
```

Traps: all three heights are needed (plugins set `min-height`); `overflow` must stay `visible` or the pinned icons get clipped.

## v20 · 12,877 B / 242 lines — 📐 Reserving space by actual icon count ✅

The footer's `padding-right` was hard-coded to 92px (calculated for 2 icons). With a single icon it left a 42px air gap that looked like *something was hidden* — it was simply unused space.

- Base 50px (1 icon: 6 + 36 + 6 + 2)
- 2nd icon appears → 92px (`footerActions button:nth-last-of-type(2)` plus `:has()` variants for two wrapper structures)
- 3 / 4 / 5 icons → 134 / 176 / 218px
- Plus `box-sizing: border-box`: these elements are `content-box`, so padding alone only grows the box and overflows to the right

**Lesson (learned the hard way)**: on "empty space + no hover outline + no click reaction", measure which box owns the space — don't rush to add visibility safety nets for the icons (v17 / v18 were both wasted).

## v16–v19 · macOS only — 💊 The "connected" pill overlapping icons

The transient "connected" pill (`div[role="status"]`, ~2s) sat on top of the footer icons.

| Version | Approach | Result |
| :--: | --- | :--: |
| v16 | `padding-right:46px` on `triggerRow` | ❌ content-box just grows the box |
| v17 | `box-sizing:border-box` + hide the pill by CSS-Modules class | ❌ wrong direction (the pill was never the problem) |
| v18 | plus a visibility safety net on `svg` | ❌ same |
| v19 | reserve space by actual count (50 / 92) | ✅ |

## v15 · 11,709 B / 225 lines — 🏁 Roll back to v9 + panel icon bar ✅ stable baseline

The request was "go back to the version before the first change", followed by "the footer is right now, but the panel area should be the icon-only version".

Method: section 1 from v14's icon bar, sections 2 and 3 taken byte-for-byte from v9 — spliced using the `/* ── 1.` `/* ── 2.` `/* ── 3.` section headers.

## v13 / v14 · 7,428 / 7,371 B — ↕️ Reworking `footArea` into a horizontal row ❌

- v13: `footArea{flex-flow:row wrap}` + account row `flex:1 1 0` + action row `order:2` → the action row wrapped onto its own line and dropped **below** the account row
- v14: action row `nowrap` plus `:has()` support for a doubly-wrapped row → still wrong

**Lesson**: inside `footerActions` there is `<div data-slot="sidebar.footer.action" style="display:contents">`. `display:contents` generates no box, so `position:absolute` on that outlet **does nothing** — the root cause of v11 not moving.

## v11 · 7,687 B — 🧵 A "no index counting" flex strip ❌

An attempt to drop index-based reasoning entirely: find "the layer that holds the buttons" with `:has(> button)` and turn that layer into a bottom-right flex strip. Result: buttons shrank and overlapped.

## v10 · 11,708 B — 🎛️ Panel icon bar with hover tooltips ✅

The official *collapsed rail* already has 36×36 tile geometry (`.collapsed .panelRow{width:36px;height:36px;justify-content:center;padding:0}`) — reused as-is in the expanded state.

Text is not lost: `panelTitle` stays in the DOM and becomes an absolutely-positioned tooltip revealed on `:hover` / `:focus-visible`. **Pure CSS, zero JavaScript, works on both Windows and macOS**, no `title` attribute, no plugin dependency.

(A click-to-collapse-with-persisted-state would need a small renderer-side script, and the collapse entry itself still occupies a row — net gain equals the icon bar, so it was not done.)

## v9 · 10,207 B — 🧮 Panel list: single column → responsive multi-column ✅

`display:grid` + `repeat(auto-fit,minmax(84px,1fr))`: 7 panels went from 4 rows to 3.

⚠️ **Rejected intermediate version**: shrinking the font to 12.5px and icons to 14px to reclaim another 60px was turned down ("it sacrifices text legibility of the controls"). **No more space trades via font size.**

## v8 · 9,352 B — 🌱 Positioning for a possible 3rd–5th icon ⚠️

v7 only positioned the first two icons; a 3rd would fall back to `right:6px` and overlap the phone icon. Added `:nth-last-of-type(1..5)` plus four depth levels of "each button wrapped separately" fallbacks.

⚠️ Trap: the two rule sets had different specificity and **did not exclude `display:none` hidden buttons** (e.g. the update button when no update exists). Once the count changed, indices shifted and an icon landed at `right:132px`.

## v7 · 5,151 B — 🎯 Absolute positioning + index-based left/right ✅ first working version

`footArea{position:relative}`, every intermediate layer `position:static`, buttons `position:absolute; right:6px; bottom:6px; 36×36; border-radius:50%`, account row `padding-right:92px`.

Maintainer: "this time it's finally fine."

## v2–v6 — 🕳️ Five attempts at merging icons into the account row ❌

| Version | Approach | Cause of death |
| :--: | --- | --- |
| v2 | `footArea` as a two-column grid, `footerActions` in the narrow column | the cost card could not fit the narrow column and got crushed |
| v3 | `footerActions{display:contents}` flattening + `order` reshuffling | each icon took a full row (`>` is DOM hierarchy; `display:contents` only changes layout) |
| v4 · 4,693 B | specificity tiers (0,1,0 / 0,3,0) | still matched the wrong elements |
| v5 · 4,242 B | absolute positioning | the two icons overlapped |
| v6 · 4,236 B | absolute positioning + `position:static` on intermediate layers | still overlapped (`first-of-type` matched nothing when each button has its own wrapper) |

**Lesson**: never infer position from "the Nth button" — the number of footer buttons is a variable driven by which plugins the user enables.

## v1 · 4,444 B — 🌱 Initial version (macOS port)

Two-column panels + footer actions on one row + `.ima-rail{min-height:0}`. ~190px saved at 280×700.

---

<div align="center"><sub>🇨🇳 <a href="CHANGELOG.md">用中文阅读本变更记录</a>　·　<a href="README.en.md">Back to README</a></sub></div>
