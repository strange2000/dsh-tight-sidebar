# 紧凑侧边栏 · Tight Sidebar

给 **DeepSeek Harness**（DSH NEXT / DSH Desktop）用的一套**纯 CSS 排版皮肤**：不改配色、不换材质、不动字体，只把侧边栏里那些「一行一个」的控件收拢起来，把纵向空间还给真正要看的「工作区」会话列表。

```
改前                          改后
┌──────────────┐             ┌──────────────┐
│ 插件           │             │ □ ◇ ▤ ▦ ▧ ✦ │  ← 面板收成一行图标条
│ Skill / MCP    │             │              │
│ 自动化任务      │             │              │
│ 上下文洞察      │             │  会话 1       │
| 任务看板        │      →      │  会话 2       │
│ 记忆           │             │  会话 3       │  ← 多出 6+ 行
│ 邮件           │             │  ...         │
│ ──────────── │             │ ──────────── │
│ ▯        📞   │  ← 占一整行  │ 头像 昵称  ▯ 📞 │  ← 并入账号行
│ 今日用量        │             │ 今日用量      │
│ 头像 昵称       │             │              │
└──────────────┘             └──────────────┘
```

280px 宽、700px 高的侧栏实测：**省下约 190–230px，多显示 6 个以上会话**。

## 三件事

| 段落 | 做什么 | 省 |
| --- | --- | --- |
| §1 面板图标条 | 全局面板（插件 / 记忆 / 任务看板 …）从竖排列表收成 `32×32` 方块横排，**文字不丢**：标题仍留在 DOM 里，`:hover` / `:focus-visible` 时浮出气泡 | 约 110px |
| §2 页脚并入账号行 | 页脚动作图标（远程控制、更新、电话…）绝对定位钉到账号行右侧；图标数量变化时让位自动跟随（1 颗 50px / 2 颗 92px / 再往上每颗 +42px）；最后把绝对定位遗留的空盒子高度归零 | 约 80px + 36px |
| §3 会话轨 | `.ima-rail` 去掉 `min-height:180px`，不再把会话行裁半截 | — |

## 安装

前置：DSH 已装皮肤中心插件 `@linxin666/dsh-client-ui-skin-center`（提供 `~/.dsh/skins` 目录与 L3 补丁通道）。

```bash
# 1. 复制三个文件进用户皮肤目录
#    Windows: %USERPROFILE%\.dsh\skins\tight-sidebar\
#    macOS:   ~/.dsh/skins/tight-sidebar/
mkdir -p ~/.dsh/skins/tight-sidebar
cp skin/skin.json skin/skin.css skin/patches.css ~/.dsh/skins/tight-sidebar/

# 2. 启用
#    设置 → 皮肤中心 → 紧凑侧边栏 → 使用 / 试穿
#    或直接写激活文件（等价，跳过 UI）：
#    ~/.dsh/skin-center-active.json
#    {"active":"tight-sidebar","initialized":true}

# 3. 重开 DSH（桌面端没有页面刷新快捷键；Web GUI 里 ⌘R / F5 即可）
```

回滚：皮肤中心切回「官方默认」，或把 `skin-center-active.json` 的 `active` 改回 `null`，或删掉 `~/.dsh/skins/tight-sidebar/`。

## 结构：为什么分三个文件

皮肤中心是三层结构，这套皮肤只在最外层动手：

| 层 | 文件 | 内容 |
| --- | --- | --- |
| L1 / L2 | `skin.css` | **刻意留空**，只放一个惰性变量 `--dsh-tight-sidebar:1`。不重映射任何 `--dsw-*` 设计令牌 → 配色、圆角、壁纸穿透、字体全部沿用官方 |
| L3 | `patches.css` | 全部改动都在这里，是「自由选择器」层，可以写任意 `body:not(:has(...)) ...` 规则 |

所有规则都带 `body:not(:has([data-sidebar-collapsed]))` 前置 —— **侧栏收起时保持官方布局**，不去猜收起态的形状。

## 已知风险（用之前请读）

1. **靠语义类名，不靠稳定 API。** 选择器用的是 `[class*="panelList"]`、`[class*="footArea"]`、`[class*="settingsArea"]` 这类子串匹配（官方构建给类名加了哈希前缀，如 `bJOniG_footArea`）。宿主升级后如果改了这些词，规则会**静默失效**：不报错、也不会套错元素，表现就是「皮肤好像没生效」。
2. **页脚那段是绝对定位方案。** 依赖 `footArea / footerActions / settingsArea` 三个容器同时存在。这是唯一能让图标进入账号行右侧、又不改动宿主 DOM 的方式，代价是丑（见 CHANGELOG 里被推翻的 10 个版本）。
3. **§2f 那条高度归零是必须的。** 绝对定位让按钮脱流，但 `footerActions` 容器还留在文档流里保留 36px 空盒子 —— 不处理就是账号行上方一条空白带。
4. 只在 **DSH NEXT 2.x（Windows / macOS）** 上验证过；Web GUI 与桌面端共用同一套渲染代码。

## 版本

一共 **21 个编号版本**，其中 **10 个是被推翻的尝试**（网格、摊平 flex、分层特异性、按序号定位、flex 重排……几乎每条死路都走过一遍）。每个版本为什么失败、教训是什么，全写在 [CHANGELOG.md](CHANGELOG.md) —— 那部分比成品更有用。

## License

MIT
