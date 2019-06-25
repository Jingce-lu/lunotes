Node 命令
====

### npm 查看全局安装过的包
```bash
$ npm list -g --depth 0

$ npm view jquery versions
$ npm install jquery@1.11.1

# npm查看包的最新版本  
$ npm view <packagename> versions --json

# 查看node安装路径     
$ which node
```

### nvm包管理器
```bash
$ nvm alias default
$ nvm alias default 9.5.0
```

### 16. Yarn >> Npm
```bash
$ yarn install  ==  npm install
$ yarn add koa  || yarn global add koa  == npm install koa -g
$ yarn list
$ yarn info koa  ==  npm view koa
$ yarn init == npm init
$ yarn run == npm run 
$ yarn remove [package] == npm uninstall --save [package] && npm uninstall --save-dev [package] && npm uninstall --save-optional [package]
$ yarn cache clean == npm cache clean
$ yarn upgrade == rm -rf node_modules && npm install
$ yarn remove [package] == npm uninstall [package]
```

### FTP常用命令
```bash
$ ftp 60.205.47.38
$ put file
$ get file
```

