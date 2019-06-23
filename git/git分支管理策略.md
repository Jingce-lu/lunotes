# git工作流

### 工作流

基于gitflow, 简化版本

参考文档: http://nvie.com/posts/a-successful-git-branching-model/

区别： 不设`release`, `develop`分支， 暂不打tag， 保留`master`, `feature/*`, `hotfix/*`

### 项目

`feprogram/taoche`等项目锁定master, 不允许直接在master下改动，需要提交merge request进行review

`act`等项目进行敏捷开发, 不锁定master, 分支自行管理

`crm`等项目设立develop分支，特性分支开发完成后合并入develop, master分支从develop单向merge

### 工作流程

1. 基于最新master建立分支，功能分支`feature/xxx` 或 线上bug修复分支 `hotfix/xxx`
2. 在分支下开发
3. 开发完成， merge master到当前分支，release灰度/上线。
