# 搭建一个私有的npm仓库

<!-- TOC -->

- [搭建一个私有的npm仓库](#搭建一个私有的npm仓库)
    - [基于npm我们可以做](#基于npm我们可以做)
    - [如何搭建一个私有npm仓库？](#如何搭建一个私有npm仓库)
        - [1. Sinopia方案篇](#1-sinopia方案篇)
            - [1.1 服务端部署](#11-服务端部署)
            - [1.2 客户端配置](#12-客户端配置)
            - [1.3 发包](#13-发包)
        - [2. cnpmjs.org 方案篇](#2-cnpmjsorg-方案篇)
            - [2.1 服务端部署](#21-服务端部署)

<!-- /TOC -->

## 基于npm我们可以做
基于npm我们可以做哪些事情呢？  
简单来说就是：
* 一行命令，(批量）安装别人写好的模块
* 一行命令，卸载安装好的模块
* 一行命令，更新到最新（或指定版本）的模块 


**私有npm仓库有如下好处：**
* 便于管理企业内的业务组件或者模块
* 私密性
* 确保npm服务快速、稳定
* 控制npm模块质量和安全（防止恶意代码植入）


## 如何搭建一个私有npm仓库？
业界主流的私有npm仓库搭建的主流方案有如下几种：
* 付费购买
* 使用 git+ssh 这种方式直接引用到 GitHub 项目地址
* 使用 [Sinopia](https://github.com/rlidwka/sinopia)
* 使用 [cnpmjs.org](https://link.zhihu.com/?target=https%3A//github.com/cnpm/cnpmjs.org)

第一种，一是考虑到公司可能不会提供经费，二npm在国内访问很慢，就是花钱也买不到好的体验。

第二种，不能更新即 npm update， 不能使用semver（语义化版本规范）。

那么较好的选择就只剩下第三种和第四种。

下面将分别使用基于Sinopia和基于 cnpmjs.org 这两种方案来搭建私有npm仓库并进行总结。

### 1. Sinopia方案篇

#### 1.1 服务端部署
安装    
前置工作：配置nodejs及npm环境
```bash
npm install -g sinopia
```

启动
```
sinopia
warn  --- config file - /home/map/.config/sinopia/config.yaml
warn  --- http address - http://localhost:4873/
```

此时访问localhost:4873,可获取html文件并且服务端响应正常，表示安装成功。
```bash
$ curl localhost:4873
```

服务端响应
```bash
$ sinopia
...
http  <-- 200, user: undefined, req: 'GET /', bytes: 0/10896
```

配置    
运行sinopia，自动生成的工作目录如下(通过第一个warn可以看到具体路径)：
```bash
$ tree /home/map/.config/sinopia/
/home/map/.config/sinopia/
|-- config.yaml //存放所有配置信息
|-- htpasswd        //存放所有账户信息
`-- storage         //存放私有npm包及缓存公有包
|-- npm_test
|   |-- npm_test-1.0.0.tgz
|   |-- npm_test-1.0.1.tgz
|   `-- package.json
`-- sinopia
       `-- package.json

3 directories, 6 files
```

config.yaml默认配置
```bash
# This is the default config file. It allows all users to do anything,
# so don't use it on production systems.
#
# Look here for more config file examples:
# https://github.com/rlidwka/sinopia/tree/master/conf

# path to a directory with all packages
storage: ./storage      //npm包存放的路径

auth:
 htpasswd:
file: ./htpasswd    //保存用户的账号密码等信息
# Maximum amount of users allowed to register, defaults to "+inf".
# You can set this to -1 to disable registration.
#max_users: 1000 //默认为1000，改为-1，禁止注册

# a list of other known repositories we can talk to
uplinks:
 npmjs:
url: https://registry.npmjs.org/    
//拉取公共包的地址源，默认为npm的官网，可以使用淘宝的npm镜像地址

packages: //配置权限管理
'@*/*':
# scoped packages
   access: $all
publish: $authenticated
'*':

# allow all users (including non-authenticated users) to read and
# publish all packages
#
# you can specify usernames/groupnames (depending on your auth plugin)
# and three keywords: "$all", "$anonymous", "$authenticated"
   access: $all

# allow all known users to publish packages
# (anyone can register by default, remember?)
publish: $authenticated

# if package is not available locally, proxy requests to 'npmjs' registry
proxy: npmjs

# log settings
logs:
- {type: stdout, format: pretty, level: http}
#- {type: file, path: sinopia.log, level: info}
```

**外网访问配置**    
通过在config.yaml中修改服务默认的监听端口，从而可以通过外网访问 sinopia 仓库。
```
listen: 0.0.0.0:4873
```
外网通过`http://[IP | 域名]:[端口]`的形式来访问。

账号配置
config.yaml 中auth部分对应账号的管理，默认可以通过客户端npm adduser添加账号。可以通过max_users:-1禁止客户端创建，而通过我们修改htpasswd文件来管理用户。
htpasswd文件示例：
```
lisi:{SHA}????????????????=:autocreated 2016-02-05T15:39:19.960Z
wangwu:{SHA}????????????????=:autocreated 2016-02-05T17:59:05.041Z
```
密码是被加密过的，是简单的SHA1哈稀之后再转换成 Base64 。


#### 1.2 客户端配置
**配置npm registry**
建议客户端使用nrm 进行npm registry地址管理和切换

**安装**
```
npm install -g nrm
```

添加sinopia仓库地址
```
nrm add sinopia http://192.168.xx.xx:4873
```

切换私有仓库
```
nrm use sinopia
```

查看所有仓库地址(星标为当前仓库源)
```js
nrm ls
npm ---- https://registry.npmjs.org/
cnpm --- http://r.cnpmjs.org/
taobao - https://registry.npm.taobao.org/
nj ----- https://registry.nodejitsu.com/
rednpm - http://registry.mirror.cqupt.edu.cn/
npmMirror https://skimdb.npmjs.com/registry/
edunpm - http://registry.enpmjs.org/
* sinopia http://192.168.xx.xx:4873/
```

#### 1.3 发包
切换到私有仓库之后，发包的操作跟npm发包基本无差别。
登录账号之后：
```
npm publish
+ npm_test@1.0.1
```
ps: 版本号重复的情况再次发布的包不会主动更新，并且发布不会有错误提示，更新包务必更新版本号。


### 2. cnpmjs.org 方案篇
#### 2.1 服务端部署
官方依赖如下图：
![官方依赖配置](../assets/npm.webp)

我这边的配置：
* 服务器Linux version 3.10.0_1-0-0-8
* node v8.9.0
* npm v5.5.1
* mysql 5.1.73

安装 cnpmjs.org
```
npm i -g cnpmjs.org
```

修改 cnpmjs.org 配置文件
cnpmjs.org 默认安装路径：/usr/local/lib/node_modules/cnpmjs.org
部分配置项说明
```js
/*
 * server configure //服务器配置
 */
 
registryPort: 7001,         //仓库访问端口（执行发布安装）
webPort: 7002,              //展示查询站点访问端口
bindingHost: '',   //监听绑定的 Host，默认127.0.0.1，外网访问注释掉此项即可


/**
* database config //数据库相关设置
*/

database: {
    db: 'cnpmjs',      //数据库名称
    username: 'root',       //数据库访问账号
    password: '123456',           //数据库访问密码
    
    // the sql dialect of the database
    // - currently supported: 'mysql', 'sqlite', 'postgres', 'mariadb'
    dialect: 'mysql',       //使用数据库，默认sqlite，这里我们改成mysql
    
    // custom host; default: 127.0.0.1
    host: '127.0.0.1',      //数据库访问IP，通常127.0.0.1
    
    // custom port; default: 3306
    port: 3306,             //数据库访问端口，通常3306
    
    
// 模块文件存储，默认将发布的私有模块跟缓存公共模块存储在本地文件系统中，路径~/.cnpmjs.org/nfs ,也就是模块文件都存储在这个目录下；或者可以选择三方储存方式比如七牛等，着这里配置插件；也支持接口开发扩展储存；

nfs: require('fs-cnpm')({
    dir: path.join(dataDir, 'nfs')
}),
    
// registry url name //模块注册列表访问域名，默认r.cnpmjs.org，安装模块时会到这个域名下查找，这个默认设置略坑，建议没有外网域名的先清空回头再配
registryHost: '',


// default system admins    //默认管理员账号
  admins: {
    // name: email
    //fengmk2: 'fengmk2@gmail.com',
    admin: 'admin@cnpmjs.org',
    //dead_horse: 'dead_horse@qq.com',
  },
  
 
/*
 * registry mode config  私有模块发布相关配置
*/

  //是否开启私有模式，默认为 false；
  //私有模式下只有管理员能发布模块，其他账号只有同步权限
  //非私有模式，注册用户都可以发布模块
  enablePrivate: false, 

  // registry scopes
  //若为非私有模式发布则此项必填，非管理员发布模块式命名必须以scopes字段开头，模块命名示例“@cnpm/packagename”
  //更多了解npm-scope请查阅https://docs.npmjs.com/misc/scope
  scopes: [ '@cnpm', '@cnpmtest', '@cnpm-test' ],

  // 私有模块非scopes白名单，各种非以scope方式发布的老模块的白名单管理，数组形式维护
  privatePackages: [],


/**
* sync configs 同步源仓库相关设置
*/

//npm官方registry地址，不会直接从这个地址同步模块，但有时会从这里获取模块信息，除非必要请勿更改
officialNpmRegistry: 'https://registry.npmjs.com',
officialNpmReplicate: 'https://replicate.npmjs.com',

//同步模块上游registry地址
sourceNpmRegistry: 'https://registry.npm.taobao.org',

//上游registry是否是cnpm，默认true，若要使用npm官方地址作为同步上游，请设置为false
sourceNpmRegistryIsCNpm: true,

//若安装时模块不存在，是否向源registry进行同步，默认true
syncByInstall: true,

// 同步模式选项
// none: 不进行同步，只管理用户上传的私有模块，公共模块直接从上游获取
// exist: 只同步已经存在于数据库的模块
// all: 定时同步所有源registry的模块
syncModel: 'exist', // 'none', 'all', 'exist'

// 同步时间间隔，默认10分钟
syncInterval: '10m',


// 是否同步模块中devDependencies，默认false
syncDevDependencies: false,

//用户账号系统接入，可以扩展接入公司的账号系统
//本文暂不涉及，详见https://github.com/cnpm/cnpmjs.org/wiki/Use-Your-Own-User-Authorization
userService: null,

//另外一个比较坑的默认设置,默认false，踩坑记录里详细说
enableAbbreviatedMetadata: true,
```


**未完...**
[原文地址](https://juejin.im/entry/5b76444c6fb9a0098c1fed56)