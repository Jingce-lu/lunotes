### 1. start
```bash
$ brew  update && brew doctor
$ xcode-select --install

$ brew install watchman

$ brew install flow
$ npm install react-native-cli -g

$ android-sdk
$ brew install android-sdk
$ brew cask install java  # 安装java sdk
$ vi ~/.bash_profile
$ android



北京 朝阳区 黄杉木店路9号绿森时代广场7层
```

### 2. mac os x配置adb全局命令的方法
步骤如下: 
1. 启动终端Terminal （如果当前用户文件夹下已有.bash_profile文件，则直接跳到5）
2. 进入当前用户的home目录（命令行输入echo $HOME）
3. 创建.bash_profile（命令行输入touch .bash_profile）
4. 打开.bash_profile文件（命令行输入open -e .bash_profile）
5. 编辑.bash_profile文件
在.bash_profile文件中输入
export PATH=/Users/JianDan/dev_android/adt-bundle-mac-x86_64-20130729/sdk/platform-tools/:$PATH
注意：在网上搜索了很多文章，多数写的是 PATH=${PATH}:/eclipse/android_sdk/platform-tools（这样写的解释
是：如果是需要添加很多命令到PATH下时，需要用“:”(英文的冒号)隔开即可，因为android和adb这些命令是在不同的
文件夹中的，这样才能两者兼得.），而没有最后面:$PATH，结果我重复了N次创建删除 .bash_profile文件，也复制
粘贴了N次PATH=${PATH}:/eclipse/android_sdk/platform-tools，就是配置不对。
6. 保存文件，关闭.bash_profile 
7. 更新刚配置的环境变量 
输入source .bash_profile 
8. 验证配置是否成功 
adb shell

### 3. my .bash_profile configuration
```bash
# nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh" # This loads nvm

# emulator
export PATH=/Users/admin/Library/Android/sdk/emulator/:$PATH 

# adb
export PATH=/Users/admin/Library/Android/sdk/platform-tools/:$PATH 
```


### 4. android 模拟器
```bash
$ cd ~/Library/Android/sdk/emulator
$ ./emulator -list-avds
$ ./emulator @name

# or
$ emulator -list-avds
$ emulator -avd name

```

### 5. zshrc 配置
```bash
$ cd ~
$ open .zshrc 
# 在.zshrc文件末尾增加.bash_profile的引用：
      source ~/.bash_profile
# 保存后更新配置
$ source .zshrc 
```

### 6. zsh & bash 切换
```bash 
$ chsh -s /bin/zsh 
# or 
$ chsh -s `which zsh`

# 如果要切换回去bash：
$ chsh -s /bin/bash
```