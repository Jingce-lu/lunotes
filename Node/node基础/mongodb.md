# mongodb
<!-- TOC -->

- [mongodb](#mongodb)
  - [安装](#安装)
  - [创建数据文件](#创建数据文件)
  - [开机自启动](#开机自启动)
    - [1. 设置plist文件 查找可执行文件mongod的位置](#1-设置plist文件-查找可执行文件mongod的位置)
    - [2. 查找plist配置启动项文件](#2-查找plist配置启动项文件)
    - [3. 修改plist配置启动项文件](#3-修改plist配置启动项文件)
    - [4. 拷贝plist配置启动项文件](#4-拷贝plist配置启动项文件)
  - [5.启动服务](#5启动服务)

<!-- /TOC -->
## 安装
```bash
$ brew update
$ brew info mongodb
$ brew install mongodb

$ mongo --version
```

启动
```bash
mongod —config /usr/local/etc/mongod.conf
```

连接到MongoDb,可以用命令行工具mongo连接：
```bash
$ mongo
MongoDB shell version: 2.6.5
connecting to: test
Welcome to the MongoDB shell.
For interactive help, type “help”.
For more comprehensive documentation, see
http://docs.mongodb.org/
Questions? Try the support group
http://groups.google.com/group/mongodb-user
```

## 创建数据文件
1. 进入根目录
    ```bash
    cd /
    ```

2. 创建目录
    ```bash
    mkdir -p /data/db
    ```

3. 设置权限，并输入用户密码
    ```bash
    sudo chmod -R 777 /data
    ```
> 提示：其中`-p`是创建多个文件目录使用的参数,`-R`表示对目录进行递归操作，就是data目录下的子文件也设置该权限。


## 开机自启动
### 1. 设置plist文件 查找可执行文件mongod的位置
1. 查看安装位置
    ```bash
    which mongod
    ```
2. 右击Dock中的Finder选中前往文件夹...，输入/usr/local/bin找到这个mongod可执行文件
3. 右击mongod可执行文件，选中显示简介...，可以看到路径例：/usr/local/Cellar/mongodb/3.2.6/bin/mongod

### 2. 查找plist配置启动项文件
使用homebrew安装mongodb会产生一个启动项配置文件，一般位于mongod可执行文件的上一级bin文件所在的目录文件中。

### 3. 修改plist配置启动项文件
1. 使用vim或者xcode打开plist配置文件，该文件名可能类似于homebrew.mxcl.mongodb.plist
2. 方便起见，修改文件名为mongodb.plist
3. 修改其中的Label为mongodb,与文件名相同
4. 修改ProgramArguments的可执行进程为可执行文件mongod的位置，例如以上/usr/local/Cellar/mongodb/3.2.6/bin/mongod，可删除ProgramArguments的其余项。


### 4. 拷贝plist配置启动项文件
```
cp mongodb.plist /Library/LaunchDaemons/
```
> 提示：`mongodb.plist`如果不是在当前的文件夹路径下，先进入所在文件夹，注意该目录与`~/Library/LaunchDaemons/`和`/System/Library/LaunchDaemons/`的区别。


## 5.启动服务
使用root权限
```bash
sudo -s
```

启动服务
```bash
sudo launchctl load -w /Library/LaunchDaemons/mongodb.plist 
```

关闭服务
```bash
sudo launchctl unload -w /Library/LaunchDaemons/mongodb.plist   
```

若发现以下错误：
```bash
Path had bad permissions
```
是因为文件的权限不够，将权限修改为root,执行以下命令，再执行启动服务
```bash
sudo chown root mongodb.plist 
```
测试数据库是否可启动
使用`CMD + N`新建一个终端，输入`mongo`
```bash
Last login: Tue Jun  7 21:50:28 on ttys001
victor:~ victor$ mongo
MongoDB shell version: 3.2.6
connecting to: test
>
```

表明连接成功！如果关机重新启动，仍然可以连接数据库。

> 提示：如果有`RoboMongo`等mongdodb可视化工具，在启动服务时可以尝试连接数据库，此时应该可以连接上数据库。

