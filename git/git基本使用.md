# git基本使用

<!-- TOC -->

- [git基本使用](#git基本使用)
    - [开始](#开始)
    - [基本命令](#基本命令)
    - [使用合并流程](#使用合并流程)
    - [分支命名](#分支命名)
    - [注意事项](#注意事项)
    - [alias 别名](#alias-别名)

<!-- /TOC -->

### 开始
```
git config --global user.name xxx
git config --global user.email xxx
```

### 基本命令
* git checkout -b xxx   ： 创建分支并切换到分支xxx
* git status  ： 查看当前分支状态
* git add . : 将新添加的文件加入暂存区
* git commit -am “注释”  ：添加并提交所有修改文件
* git merge xxx : 将xxx(本地)分支的代码合并到当前分支
* git pull : 从远端获取, 或git pull origin xxx(分支名)
* git push : 更新到远端, 或git push origin xxx(分支名)
* git add filename : 添加未跟踪的文件到暂存区
* git add . : 添加所有未跟踪的文件到暂存区
* git log : 日志

### 使用合并流程
1. [master下]创建分支: `git checkout -b xxx`
2. [分支下] 开发代码并不断commit, 开发完毕
3. [分支下] 切换到master: `git checkout master`
3. [master下] 更新代码: `git pull`
4. [master下] 切换到分支xxx: `git checkout xxx`
5. [分支下] 合并master到分支： `git merge master`
6. [分支下] 切换master: `git checkout master`
7. [master下] 合并分支xxx到master: `git merge xxx`
8. [master下] 更新到远端 `git push`

### 分支命名
建议采用git-flow规范：
1. 新项目，新功能： feature/xxx
2. 快速更改，修复bug: hotfix/xxx

### 注意事项
1. windows下客户端: sourcetree(注册需翻墙), tortoiseGit, mac下客户端: sourcetree, tower
2. master分支尽量不要进行耗时项目开发，远端master要保持随时可以上线版本
3. push之前要先pull
4. 所有命令操作都在根目录下执行。
5. 不建议单文件commit， 每次commit都是提交当前所有的修改

### alias 别名
 使用命令行的同学可以在git bash里 `vi ~/.gitconfig`, 将下面别名加入文件末尾:

```
[alias]
     cm = commit
     co = checkout
     ac = !git add -A && git commit
     st = status -sb
     tags = tag -l
     branches = branch -a
     cleanup = git config --global alias.cleanup "git branch --merged | grep -v '*' | xargs git branch -d"
     remotes = remote -v
     lg = log --color --graph --pretty=format:'%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset' --abbrev-commit --
```