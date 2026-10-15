# 杨鹏博 · 个人主页

纯静态、零依赖的个人主页：**白底 + 蓝紫渐变**、插画铺满整页背景、玻璃拟态，
以及一整套丝滑的滚动动画，附带一个可在线试玩的计数小游戏。

**在线地址：<https://csypb123.github.io/>**
**评分卡：<https://csypb123.github.io/scorecard.html>**（创新性 45 / 美观性 30 / 完整性 20 / 部署与可用性 5）

## 文件结构

| 文件 | 说明 |
| --- | --- |
| `index.html` | 页面结构：首页 / 关于我 / 项目 / 技能 / 兴趣 / 近况 / 关于本站 / 联系 |
| `styles.css` | 全部样式，配色集中在顶部 `:root`（改主题基本只动这里） |
| `script.js` | 入口门、背景音乐（预载 / 自动播放）、滚动动画与交互（原生 JS，无第三方库） |
| `scorecard.html` | 评分卡：逐项打分依据、与参考站对比、待改进项 |
| `counting-game.html` | 「数一数」限时计数小游戏（Canvas 手写，单文件零依赖） |
| `assets/bg-light.jpg` | 整页背景插画（1280×1920，约 280 KB，用 multiply 混合融进白底） |
| `assets/fishinthepool.mp3` | 背景音乐 |
| `assets/favicon.svg` | 站点图标 |
| `assets/landscape.svg` | 首页个人卡片里的「风景窗」插画 |
| `.nojekyll` | 让 GitHub Pages 跳过 Jekyll 处理 |
| `preview-server.cjs` | 本地预览用的零依赖静态服务器 |

## 功能

- **打开即主页**：没有任何遮挡层，不需要点击任何按钮才能看内容（曾经有个入口门，因为它可能在缓存/脚本异常时把页面挡住，已经移除）。
- **入口门 + 自动播放**：点「进入主页」本身就是一次**有效的用户手势**，浏览器才允许播放背景音乐——所以进门即出声，这是绕开自动播放限制的正规做法。门口停留期间就把整段音乐**预载**进内存（换成 Blob），所以点击后近乎瞬时出声（实测 1 ms），不会出现「点了等十几秒才有声音」。
  - 安全网：门 **3.5 秒自动让开**、有「不播音乐，直接浏览」、Esc / Enter 可跳过，且兜底脚本让它在 **script.js 加载失败时也一定能关**——绝不会再卡在门口。
  - 右上角 BGM 按钮随时开关；若浏览器仍拒绝播放，播放时会显示「载入中…／点击开启声音」状态提示。「近况」版块里有一张播放卡，带播放/暂停、静音、重新开始、音量滑块，以及一块 **Canvas 实时频谱**（用 `AnalyserNode` 取频谱画柱状波形；没有音频上下文时自动退化成呼吸波形）。
- **滚动动画**：逐字上浮、打字机、滚动显现、背景视差、时间线进度、技能条填充、卡片 3D 倾斜。
- **背景处理**：插画用 `mix-blend-mode: multiply` 铺在白底上，画面清晰但插画自身的白底不会变成一块灰；再叠一层 `mix-blend-mode: color` 的蓝紫渐变统一色调，白色柔光保证正文对比度。
- **性能取舍**：动画只用 `transform` 与 `opacity`；不用 `background-attachment: fixed`（改为固定定位图层），避免移动端掉帧。

## 小游戏：数一数

<https://csypb123.github.io/counting-game.html>

- 每轮限时 **5 秒**，数清画面里的目标图形数量
- 猜对进入下一轮，**每 3 轮**提升难度（目标变多、干扰图形变多，出现运动、闪烁与成堆重叠）
- 答错或超时立即结束；从第 4 轮起答数相差 1 以内也算对，精确命中加分更多
- 页面里留了只读接口 `window.CountingGame`，方便自动化测试或二次开发

## 本地预览

```sh
node preview-server.cjs
```

打开 <http://127.0.0.1:4173>，也可以直接双击 `index.html`。

## 部署

推送到 `main` 分支即自动发布，工作流见 `.github/workflows/deploy.yml`
（GitHub Actions → `actions/deploy-pages`），通常 1–3 分钟生效。

> **注意**：工作流只把 `index.html`、`scorecard.html`、`counting-game.html`、`styles.css`、
> `script.js`、`.nojekyll`、`assets/`、`README.md` 拷进发布产物。**新增页面时必须同步修改
> `.github/workflows/deploy.yml` 里的 `cp` 那一行**，否则线上会 404。

> 若用 GitHub token 通过 API 修改 `.github/workflows/**`，token 必须带 `workflow` 权限
> （`gh auth refresh -s workflow`），否则 GitHub 会返回 404。

若工作流的发布步骤报错，把仓库 **Settings → Pages → Source** 改成
**Deploy from a branch**（分支 `main`、目录 `/ (root)`）也能直接发布根目录内容。

## 自定义

- **文字**：改 `index.html`
- **配色**：改 `styles.css` 里 `:root` 的 `--bg` / `--violet` / `--blue` / `--pink` / `--text`
- **背景图**：换掉 `assets/bg-light.jpg`；画面对比度在 `.backdrop__wash`（白色柔光），插画混合方式在 `.backdrop__art`
- **背景音乐**：换掉 `assets/fishinthepool.mp3`（`index.html` 里 `<audio id="bgm">` 的 `src`）
- **打字机文案**：改 `script.js` 里的 `lines` 数组
- **头像**：改 `index.html` 中 `.profile__avatar img` 的 `src`
- **动画节奏**：HTML 上的 `data-delay="80"`（毫秒）控制各区块入场先后

## 无障碍

已适配 `prefers-reduced-motion`：系统开启「减少动态效果」时，入场动画、视差与光斑动画会关闭。
入口门点是有效的用户手势，故背景音乐可以自动播放；音频在门口停留期间就预载好，点击后瞬时出声；键盘可完整操作小游戏、Esc/Enter 可跳过入口门。

## 素材说明

背景插画来自网络，图上带有「無断転載 & AI 学習禁止 / No AI training」标记。
按需求已用于本站；若长期公开运营，建议替换为自有或已获授权的图片。字体、图标、脚本均为手写或系统自带。
