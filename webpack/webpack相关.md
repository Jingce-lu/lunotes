webpack相关
===

<!-- TOC -->

- [webpack相关](#webpack相关)
  - [打包体积 优化思路](#打包体积-优化思路)
  - [打包效率](#打包效率)
  - [Loader 编写一个loader](#loader-编写一个loader)
  - [plugins](#plugins)

<!-- /TOC -->

## 打包体积 优化思路
1. 提取第三方库或通过引用外部文件的方式引入第三方库
2. 代码压缩插件UglifyJsPlugin
3. 服务器启用gzip压缩
4. 按需加载资源文件 require.ensure
5. 优化devtool中的source-map
6. 剥离css文件，单独打包
7. 去除不必要插件，通常就是开发环境与生产环境用同一套配置文件导致


## 打包效率
1. 开发环境采用增量构建，启用热更新
2. 开发环境不做无意义的工作如提取css计算文件hash等
3. 配置devtool
4. 选择合适的loader
5. 个别loader开启cache 如babel-loader
6. 第三方库采用引入方式
7. 提取公共代码
8. 优化构建时的搜索路径 指明需要构建目录及不需要构建目录
9. 模块化引入需要的部分

## Loader 编写一个loader
loader就是一个node模块，它输出了一个函数。当某种资源需要用这个loader转换时，这个函数会被调用。并且，这个函数可以通过提供给它的this上下文访问Loader API。

reverse-txt-loader
```js
// reverse-txt-loader
// 定义
module.exports = function(src) {
  //src是原文件内容（abcde），下面对内容进行处理，这里是反转
  var result = src.split('').reverse().join(''); 
  //返回JavaScript源码，必须是String或者Buffer
  return `module.exports = '${result}'`;
}

// 使用
{
  test: /\.txt$/,
  use: [
    {
      './path/reverse-txt-loader'
     }
  ]
},
```

## plugins
使用范围更广，通常只需要require()然后添加到plugins数组中，且需要new一个