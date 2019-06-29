# node

## 1. npm && package.json

npm脚本有`pre` 和 `post` 两个钩子

举例来说`build` 脚本命令的钩子就是`prebuild` 和 `postbuild`
```json
{
    "prebuild": "echo I run before the build script",
    "build": "cross-env NODE_ENV=production webpack",
    "postbuild": "echo I run after the build script",
}
```
执行`npm run build`的时候，会自动按照下面的顺序执行
```bash
npm run prebuild && npm run build && npm run postbuild
```
因此，可以在两个钩子里面，完成一些准备工作和清理工作，如
```json
{
    "clean": "rimraf ./dist && mkdir dist",
    "prebuild": "npm run clean",
    "build": "cross-env NODE_ENV=production webpack",
}
```

npm 默认提供下面这些钩子。

    * prepublish，postpublish
    * preinstall，postinstall
    * preuninstall，postuninstall
    * preversion，postversion
    * pretest，posttest
    * prestop，poststop
    * prestart，poststart
    * prerestart，postrestart

自定义的脚本命令也可以加上pre和post钩子。比如，myscript这个脚本命令，也有premyscript和postmyscript钩子。不过，双重的pre和post无效，比如prepretest和postposttest是无效的。

npm 提供一个`npm_lifecycle_event`变量，返回当前正在运行的脚本名称，比如`pretest`、`test`、`posttest`等等。所以，可以利用这个变量，在同一个脚本文件里面，为不同的npm scripts命令编写代码。请看下面的例子。

```js
const TARGET = process.env.npm_lifecycle_event;

if (TARGET === 'test') {
  console.log(`Running the test task!`);
}

if (TARGET === 'pretest') {
  console.log(`Running the pretest task!`);
}

if (TARGET === 'posttest') {
  console.log(`Running the posttest task!`);
}
```

#### 变量
npm 脚本有一个非常强大的功能，就是可以使用 npm 的内部变量。

首先，通过`npm_package_`前缀，npm 脚本可以拿到package.json里面的字段。比如，下面是一个package.json。

```json
{
  "name": "foo", 
  "version": "1.2.5",
  "scripts": {
    "view": "node view.js"
  }
}
```

那么，变量`npm_package_name`返回`foo`，变量`npm_package_version`返回`1.2.5`。

```js
// view.js
console.log(process.env.npm_package_name); // foo
console.log(process.env.npm_package_version); // 1.2.5
```

#### 常用脚本示例

```js
// 删除目录
"clean": "rimraf dist/*",

// 本地搭建一个 HTTP 服务
"serve": "http-server -p 9090 dist/",

// 打开浏览器
"open:dev": "opener http://localhost:9090",

// 实时刷新
 "livereload": "live-reload --port 9091 dist/",

// 构建 HTML 文件
"build:html": "jade index.jade > dist/index.html",

// 只要 CSS 文件有变动，就重新执行构建
"watch:css": "watch 'npm run build:css' assets/styles/",

// 只要 HTML 文件有变动，就重新执行构建
"watch:html": "watch 'npm run build:html' assets/html",

// 部署到 Amazon S3
"deploy:prod": "s3-cli sync ./dist/ s3://example-com/prod-site/",

// 构建 favicon
"build:favicon": "node scripts/favicon.js",
```

------------------------

## 2. path

1. #### path.resolve([...paths])

    将路径或路径片段处理成绝对路径。

    path 从右到左依次处理，直到构造出绝对路径。 例如，指定的路径片段是：/foo、/bar、baz，则调用 path.resolve('/foo', '/bar', 'baz') 会返回 /bar/baz。

    如果处理完全部 path 片段后还未产生绝对路径，则加上当前工作目录。

    生成的路径会进行规范化，并且删除末尾的斜杠，除非路径是根目录。

    空字符串的 path 片段会被忽略。

    如果没有指定 path，则返回当前工作目录的绝对路径。

    ```js
    path.resolve('/foo/bar', './baz');
    // 返回: '/foo/bar/baz'

    path.resolve('/foo/bar', '/tmp/file/');
    // 返回: '/tmp/file'

    path.resolve('wwwroot', 'static_files/png/', '../gif/image.gif');
    // 如果当前工作目录是 /home/myself/node，则返回 '/home/myself/node/wwwroot/static_files/gif/image.gif'
    ```

2. #### path.dirname(path)

    返回 path 的目录名，类似于 Unix 中的 dirname 命令。

    ```js
    path.dirname('/foo/bar/baz/asdf/quux');
    // 返回: '/foo/bar/baz/asdf'
    ```

3. #### path.extname(path)

    返回 path 的扩展名，即从 path 的最后一部分中的最后一个 .（句号）字符到字符串结束。 
    
    如果 path 的最后一部分没有 . 或 path 的文件名（参见 path.basename()）的第一个字符是 .，则返回空字符串。

    ```js
    path.extname('index.html');
    // 返回: '.html'

    path.extname('index.coffee.md');
    // 返回: '.md'

    path.extname('index.');
    // 返回: '.'

    path.extname('index');
    // 返回: ''

    path.extname('.index');
    // 返回: ''
    ```

4. #### path.join([...paths])

    使用平台特定的分隔符把所有 path 片段连接到一起，并规范化生成的路径。

    空字符串的 path 片段会被忽略。 如果连接后的路径是一个空字符串，则返回 '.'，表示当前工作目录。

    ```js
    path.join('/foo', 'bar', 'baz/asdf', 'quux', '..');
    // 返回: '/foo/bar/baz/asdf'

    path.join('foo', {}, 'bar');
    // 抛出 'TypeError: Path must be a string. Received {}'
    ```