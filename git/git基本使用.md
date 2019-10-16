# git基本使用

<!-- TOC -->

- [git基本使用](#git基本使用)
    - [开始](#开始)
    - [基本命令](#基本命令)
    - [使用合并流程](#使用合并流程)
    - [分支命名](#分支命名)
    - [注意事项](#注意事项)
    - [alias 别名](#alias-别名)
    - [git合并一个分支上改动的部分文件到另外一个分支](#git合并一个分支上改动的部分文件到另外一个分支)
    - [git远程分支强制覆盖本地文件](#git远程分支强制覆盖本地文件)
    - [公共远程分支版本回退的方法](#公共远程分支版本回退的方法)
    - [更换git远程仓库地址](#更换git远程仓库地址)
    - [git删除分支](#git删除分支)
  - [6. 附：](#6-附)

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

* git reflog
* git reset --hard 139dcfaa
* git push -f -u origin master

### 使用合并流程
1. [master下]创建分支: `git checkout -b xxx`
2. [分支下] 开发代码并不断commit, 开发完毕
3. [分支下] 切换到master: `git checkout master`
4. [master下] 更新代码: `git pull`
5. [master下] 切换到分支xxx: `git checkout xxx`
6. [分支下] 合并master到分支： `git merge master`
7. [分支下] 切换master: `git checkout master`
8. [master下] 合并分支xxx到master: `git merge xxx`
9. [master下] 更新到远端 `git push`

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

### git合并一个分支上改动的部分文件到另外一个分支
```bash
$ git checkeout master
$ git checkout --path branchXX file
```

### git远程分支强制覆盖本地文件
```bash
$ git reset --hard origin/master
```

### 公共远程分支版本回退的方法
```bash
$ git revert HEAD       # 撤销最近一次提交
$ git revert HEAD~1     # 撤销上上次的提交，注意：数字从0开始
$ git revert 0ffaacc    # 撤销0ffaacc这次提交
```

`git revert` 命令意思是撤销某次提交。它会产生一个新的提交，虽然代码回退了，但是版本依然是向前的，所以,当你用revert回退之后，所有人pull之后，他们的代码也自动的回退了。   
但是，要注意以下几点：
*  revert 是撤销一次提交，所以后面的commit id是你需要回滚到的版本的前一次提交
*  使用revert HEAD是撤销最近的一次提交，如果你最近一次提交是用revert命令产生的，那么你再执行一次，就相当于撤销了上次的撤销操作，换句话说，你连续执行两次revert HEAD命令，就跟没执行是一样的
*  使用revert HEAD~1 表示撤销最近2次提交，这个数字是从0开始的，如果你之前撤销过产生了commi id，那么也会计算在内的。
*  如果使用 revert 撤销的不是最近一次提交，那么一定会有代码冲突，需要你合并代码，合并代码只需要把当前的代码全部去掉，保留之前版本的代码就可以了.

自己的分支回滚直接用reset  
公共分支回滚用revert  

### 更换git远程仓库地址
方法一 ： 通过命令直接修改远程仓库地址
```js
git remote 查看所有远程仓库
git remote xxx 查看指定远程仓库地址
git remote set-url origin 你新的远程仓库地址
```

方法二： 先删除在添加你的远程仓库
```js
git remote rm origin
git remote add origin 你的新远程仓库地址
```

方法三： 直接修改你本地的.git文件
- 进入.git文件编辑.git文件中的config文件修改config文件中的url路径为你的新远程仓库地址路径。


### git删除分支
- `git branch -d <branch_name>` 删除一个已被终止的分支
- `git branch -D <branch_name>` 删除一个正打开的分支
- 恢复被删除的分支 -- Git会自行负责分支的管理，所以当我们删除一个分支时，Git只是删除了指向相关提交的指针，但该提交对象依然会留在版本库中。 
因此，如果我们知道删除分支时的散列值，就可以将某个删除的分支恢复过来。在已知提交的散列值的情况下恢复某个分支：
`git branch <branch_name> <hash_val>`  
如果我们不知道想要恢复的分支的散列值，可以用`git reflog`命令将它找出来。
- `git push origin --delete <branch_name>` 删除远程分支

## 6. 附：
git配置，供参考（~/.gitconfig）
```
[user]
     name = Lu jingce
     email = lujingce@163.com
[alias]
     st = status
     br = branch
     bra = branch -a
     cm = commit -m
     cam = commit -a -m
     co = checkout
     cf = checkout -f
     diffn = diff --numstat
     diffs = diff --shortstat
     diffd = diff --dirstat
     lg = log --color --graph --pretty=format:'%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset' --abbrev-commit --
[push]
     default = simple
```