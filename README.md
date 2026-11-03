# 灯笼夜市

浏览器里的剪纸精灵平台跳跃小游戏（三关）。

## 怎么玩

1. 用浏览器打开 `index.html`，或用本地静态服务器打开整个文件夹。
2. **Enter** 开始，**方向键 / WASD** 移动，**空格 / W / ↑** 跳跃，**R** 重开当前关。

## 用 Git 保存你的修改（简单说明）

这个项目已经是一个 **Git 仓库**。你可以把它理解成：电脑会自动记住「每一次保存的快照」，以后可以回到任意一次快照。

常用操作（在项目文件夹里打开终端）：

```powershell
# 查看改了哪些文件
git status

# 把当前所有改动做成一次新快照（先改好代码，再执行下面两行）
git add -A
git commit -m "说明你这次改了什么"
```

本机若终端里输入 `git` 提示找不到命令，可以用便携版 Git（已用于初始化本仓库）：

```powershell
& "$env:LOCALAPPDATA\MinGit\cmd\git.exe" status
```

安装完整 [Git for Windows](https://git-scm.com/download/win) 后，可直接使用 `git` 命令。

## 文件说明

- `index.html` — 入口
- `css/style.css` — 页面样式
- `js/` — 游戏逻辑与绘制
