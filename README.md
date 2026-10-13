# 杨鹏博 · 个人主页

纯静态、零依赖的个人主页：深色 + 青紫渐变、玻璃拟态，以及一整套丝滑的滚动动画。

**在线地址：<https://csypb123.github.io/>**

## 文件结构

| 文件 | 说明 |
| --- | --- |
| `index.html` | 页面结构：首页 / 关于我 / 兴趣 / 近况 / 联系 |
| `styles.css` | 全部样式，配色集中在顶部 `:root` |
| `script.js` | 滚动动画与交互（原生 JS，无第三方库） |
| `counting-game.html` | 「数一数」限时计数小游戏（Canvas 手写，单文件零依赖） |
| `assets/favicon.svg` | 站点图标 |
| `assets/landscape.svg` | 首页个人卡片里的「风景窗」插画 |
| `.nojekyll` | 让 GitHub Pages 跳过 Jekyll 处理 |
| `preview-server.cjs` | 本地预览用的零依赖静态服务器 |

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

> **注意**：工作流只把 `index.html`、`styles.css`、`script.js`、`counting-game.html`、
> `.nojekyll`、`assets/`、`README.md` 拷进发布产物。**新增页面时必须同步修改
> `.github/workflows/deploy.yml` 里的 `cp` 那一行**，否则线上会 404。

> 若用 GitHub token 通过 API 修改 `.github/workflows/**`，token 必须带 `workflow` 权限
> （`gh auth refresh -s workflow`），否则 GitHub 会返回 404。

若工作流的发布步骤报错，把仓库 **Settings → Pages → Source** 改成
**Deploy from a branch**（分支 `main`、目录 `/ (root)`）也能直接发布根目录内容。

## 自定义

- **文字**：改 `index.html`
- **配色**：改 `styles.css` 里 `:root` 的 `--bg` / `--cyan` / `--violet` / `--pink`
- **打字机文案**：改 `script.js` 里的 `lines` 数组
- **头像**：改 `index.html` 中 `.profile__avatar img` 的 `src`
- **动画节奏**：HTML 上的 `data-delay="80"`（毫秒）控制各区块入场先后

## 无障碍

已适配 `prefers-reduced-motion`：系统开启「减少动态效果」时，
所有入场动画与视差会关闭，内容直接呈现。
