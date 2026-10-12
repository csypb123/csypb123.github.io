# 杨鹏博 · 个人主页

一个以清晨山野和个人手记为灵感的静态主页。使用原生 HTML、CSS 和 JavaScript，原创 SVG 插画，无第三方字体、CDN、框架或构建依赖。

包含关于我、兴趣、近况；平滑锚点跳转、滚动显现、轻量背景视差、阅读进度；适配移动端与减少动态效果的系统设置。没有添加未经提供的社交账号、联系方式或技能。

## 本地预览

安装了 Node.js 时，在本目录运行：

```sh
node preview-server.cjs
```

打开 http://127.0.0.1:4173。也可以直接双击 `index.html`。

## 发布到 GitHub Pages

1. 在你的 GitHub 账户下创建公开仓库，例如 `personal-homepage`。
2. 将本项目推送到该仓库的 `main` 分支，包括 `.github/workflows/deploy.yml`。
3. 仓库 Settings → Pages → Build and deployment → Source 选择 **GitHub Actions**。
4. 在 Actions 中查看 `Deploy personal homepage to GitHub Pages`。首次部署若因 Pages 未启用失败，在完成第 3 步后重新运行工作流。
5. 部署成功后访问 `https://你的用户名.github.io/personal-homepage/`。若仓库名为 `你的用户名.github.io`，则访问 `https://你的用户名.github.io/`。

页面使用相对路径，两种仓库形式都支持。后续更新推送到 `main` 后会自动部署。

## 修改文案与样式

- `index.html`：个人文案、页面结构和 SEO 描述。
- `styles.css`：颜色、排版和响应式布局。
- `script.js`：滚动动画与导航状态。
- `assets/landscape.svg`：原创山湖背景。

公开发布前请确认文案可以公开。GitHub 凭据应仅用于认证，切勿写入源码或提交到仓库。
