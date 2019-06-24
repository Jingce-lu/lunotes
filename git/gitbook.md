发布到github pages
====

### 构建书籍
首先，使用 gitbook build 将书籍内容输出到默认目录，也就是当前目录下的 _book 目录。
```bash
$ gitbook build
Starting build ...
Successfully built!

$ ls _book
GLOSSARY.html       chapter1            chapter2            gitbook             glossary_index.json index.html          search_index.json
```

### 创建 gh-pages 分支
执行如下命令来创建分支，并且删除不需要的文件：
```bash
$ git checkout --orphan gh-pages
$ git rm --cached -r .
$ git clean -df
$ rm -rf *~
```

现在，目录下应该只剩下 _book 目录了，首先，忽略一些文件：
```bash
$ echo "*~" > .gitignore
$ echo "_book" >> .gitignore
$ git add .gitignore
$ git commit -m "Ignore some files"
```

然后，加入 _book 下的内容到分支中：
```bash
$ cp -r _book/* .
$ git add .
$ git commit -m "Publish book"
```

### 上传书籍内容到 GitHub
现在，可以将编译好的书籍内容上传到 GitHub 中 test 项目的 gh-pages 分支了，虽然这里还没有创建分支，上传和创建会一步完成！
```bash
$ git push -u origin gh-pages
```


### 部署到 gh-pages 分支
这个步骤我使用了 `gh-pages` 这个工具，它可以将文件夹一键发布到 GitHub 项目下的 `gh-pages` 分支中（其他分支也可以发布，但是在本文下用到的就是 `gh-pages` 这个分支）

安装 `gh-pages` 工具
```bash
$ npm install -g gh-pages
```

输入以下指令
```bash 
$ gh-pages -d _book
```
然后 _book 下的所有文档都会部署到 gh-pages 分支

### GitHub Pages 的静态资源支持下面 3 个来源：
1. master 分支
2. master 分支的 /docs 目录
3. gh-pages 分支

执行下面命令，将 _book 目录推送到 GitHub 仓库的 gh-pages 分支。
```bash
$ git subtree push --prefix=_book origin gh-pages
```

或者在生成静态网页时，将保存的目录指定为 ./docs
```bash
$ gitbook build ./ ./docs
```

然后直接推送到 GitHub 仓库的
```bash
git push origin master
```