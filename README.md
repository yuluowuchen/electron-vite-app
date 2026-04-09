# electron-vite-app

An Electron application with Vue and TypeScript

## Recommended IDE Setup

- [VSCode](https://code.visualstudio.com/) + [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) + [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar)

## Project Setup

### Install

```bash
$ pnpm install
```

### Development

```bash
$ pnpm dev
```

### Build

```bash
# For windows
$ pnpm build:win

# For macOS
$ pnpm build:mac

# For Linux
$ pnpm build:linux
```

### git命令

```bash
# 初始化git仓库
$ git init

# 添加所有文件到暂存区
$ git add .

# 提交暂存区文件到本地仓库
$ git commit -m "您的提交信息"

# 关联远程仓库
$ git remote add origin <远程仓库URL>

# 推送本地仓库到远程仓库
$ git push -u origin master

# 回滚到上一个版本
$ git reset --hard HEAD^1

# 恢复所有文件到上一个版本
$ git restore .

# 1. 先从远程获取最新数据
git fetch origin

# 2. 将本地分支强制重置到远程分支的状态
git reset --hard origin/new-feiniao

# 3. 恢复指定文件到上一个版本
git restore src/renderer/src/views/index/Welcome.vue

```
