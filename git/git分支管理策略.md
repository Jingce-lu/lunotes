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

### 推荐工作流程
切换到release分支；  
pull最新代码；  
建立自己的工作分支（新功能开发、快速验证，bug修复建议都建分支）：`git checkout -b dev_xmli`；  
或者创建开发同一功能几个人公用的分支(如：dev-insurance, change-price)；   
在自己的分支上提交（commit）；  
开发完毕，做测试；   
切换到release分支，pull;  
切换到工作分支，merge代码： g`it merge release`，合并线上最新更改，测试一下自己的更改；  
切换到release, 然后 git merge dev_xmli，把自己的更改合并到线上分支；  
提交代码到服务器-- git push;  
如有必要告知其他同事更新代码，尤其是项目文件的改动；  
如果是发布的release，打tag；  
`git tag -a v1.8.0`  
提交tag:  
`git push --tags ` 
