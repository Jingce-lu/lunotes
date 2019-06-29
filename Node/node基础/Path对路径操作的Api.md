# 理解Path对路径进行操作的API
<!-- TOC -->

- [理解Path对路径进行操作的API](#理解path对路径进行操作的api)
  - [一：理解normalize方法](#一理解normalize方法)
  - [二：理解dirname方法](#二理解dirname方法)
  - [三：理解basename方法](#三理解basename方法)
  - [四：理解extname方法](#四理解extname方法)
  - [五：连接路径 path.join([path1][, path2][, ...])](#五连接路径-pathjoinpath1-path2-)
  - [六：路径解析：path.resolve([from ...], to)](#六路径解析pathresolvefrom--to)
  - [七： path.join() 和 path.resolve() 对比](#七-pathjoin-和-pathresolve-对比)

<!-- /TOC -->

## 一：理解normalize方法
该方法将非标准路径字符串转换为标准路径字符串，在转换过程中执行如下处理：
1. 解析路径字符串中的 '..' 字符串与 '.' 字符串，返回解析后的标准路径。
2. 将多个斜杠字符串转换为一个斜杠字符串，比如将 '\\' 转换为 '\'。
3. 将windows操作系统中的反斜杠字符串转换为正斜杠字符串。
4. 如果路径字符串以斜杠字符串结尾，则在转换后的完整路径字符串末尾保留该斜杠字符串。

该方法使用如下所示：  
> **path.normalize(path);**

在该方法中，使用一个参数path，该参数值为需要被转换的路径字符串。该方法返回被转换后的路径字符串。

下面我们在项目中根目录下建立一个a子目录，在a子目录下新建一个b子目录，然后在b子目录下新建一个message.txt， 内容为：我喜欢编写代码，我们将使用normalize方法解析 './/a//b//d//..//c/e//..//'路径字符串，解析该路径后，并且读取message.txt文件的内容，如下代码：

```js
const fs = require('fs');

const path = require('path');

const myPath = path.normalize('.//a//b//d//../e//..//');
console.log(myPath); // 输出 a/b/

const file = fs.createReadStream(myPath + 'message.txt');
file.on('data', (data) => {
  console.log(data.toString()); // 输出 我喜欢编写代码
});
```

输出如下所示：
```
node index.js
a/b/
```


## 二：理解dirname方法
该方法用于获取一个路径中的目录名，使用方法如下所示：
> path.dirname(p);

该方法使用一个参数，参数值为一个路径，可以是相对路径、绝对路径、也可以为一个目录的路径、也可以是一个文件的路径。

当参数值为目录的路径时：该方法返回该目录的上层目录。  
当参数值为文件路径时：该方法返回该文件所在的目录。

请看如下demo：
```js
const path = require('path');

// 指定相对目录路径
const a = path.dirname('./a/b/c/d');
console.log(a); // 输出 ./a/b/c

// 指定相对文件路径
const b = path.dirname('./a/b/c/d/message.txt');
console.log(b); // 输出 ./a/b/c/d

// 指定绝对目录路径
const c = path.dirname('/a/b/c/d');
console.log(c); // 输出 /a/b/c

// 指定绝对文件路径
const d = path.dirname('/a/b/c/d/message.txt');
console.log(d); // 输出 /a/b/c/d
```


## 三：理解basename方法
该方法用于获取一个路径中的文件名，使用方式如下所示：
> **path.basename(p, [ext]);**

在该方法中，使用两个参数，`p`参数为必须的参数，它必须为一个文件的完整路径，可以是相对路径，也可以是一个绝对路径。  
`ext`是可选参数，该参数的作用是在方法返回的文件名中去除该文件的扩展名。请看如下所示的基本代码：
```js
const path = require('path');

// 默认返回文件名 index.html
const a = path.basename('/a/b/c/d/index.html');
console.log(a); // 输出 index.html

// 返回index.html后，去除.html扩展名，因此会返回 index
const b = path.basename('./a/b/c/d/index.html', '.html');
console.log(b); // 输出 index

// 返回index.html后，去除html的扩展名，因此会返回 index.
const c = path.basename('./a/b/c/d/index.html', 'html');
console.log(c); // 输出 index.

// 如果扩展名不存在的话，什么都不去除
const d = path.basename('./a/b/c/d/index.html', 'ejx');
console.log(d); // 输出 index.html
```


## 四：理解extname方法
该方法用于获取一个路径中的扩展名，使用方法如下所示：
> **path.extname(p);**

在该方法中，使用一个参数p，参数p必须为一个文件的完整路径，可以为相对路径，也可以为绝对路径，在该参数值中指定文件的扩展名(以'.'开始)，当参数值中指定的文件没有指定扩展名时，会返回一个空字符串。

比如如下代码：
```js
const path = require('path');

const a = path.extname('/a/index.html');
console.log(a); // 输出 '.html'

const b = path.extname('/a/index.');
console.log(b); // 输出 '.'

const c = path.extname('/a/index');
console.log(c); // 输出 ''
```


## 五：连接路径 path.join([path1][, path2][, ...])
该方法将多个参数值字符串结合为一个路径字符串（连接路径），使用方式如下所示：  
> **path.join([path1], [path2], [...]);**

在该方法中，使用一个或多个字符串值参数，该方法返回将这些字符串值参数结合而成的路径字符串。

请看如下demo, 在项目的根目录下有 a/b/message.txt, 内容还是为 '我喜欢编写代码'， 请看如下代码：
```js
const fs = require('fs');
const path = require('path');

const myPath = path.join(__dirname, 'a', 'b');

console.log(myPath);

const file = fs.createReadStream(myPath + '/message.txt');

file.on('data', (data) => {
  console.log(data.toString());
});

/**
 * 输出
 * __dirname/a/b
 */
```


path.join()方法可以连接任意多个路径字符串。要连接的多个路径可做为参数传入。

path.join()方法在接边路径的同时也会对路径进行规范化。例如：
```js
const path = require('path'); 
//合法的字符串连接 
path.join('/foo', 'bar', 'baz/asdf', 'quux', '..') 
// 连接后 
'/foo/bar/baz/asdf' 

//不合法的字符串将抛出异常 
path.join('foo', {}, 'bar') 
// 抛出的异常 TypeError: Arguments to path.join must be strings'
```


## 六：路径解析：path.resolve([from ...], to)
path.resolve()方法可以将多个路径解析为一个规范化的绝对路径。其处理方式类似于对这些路径逐一进行cd操作，与cd操作不同的是，这引起路径可以是文件，并且可不必实际存在（resolve()方法不会利用底层的文件系统判断路径是否存在，而只是进行路径字符串操作）。例如：
```js
path.resolve('foo/bar', '/tmp/file/', '..', 'a/../subfile')

// 相当于
cd foo/bar
cd /tmp/file/
cd ..
cd a/../subfile
pwd
```

例子：
```js
path.resolve('/foo/bar', './baz') 
// 输出结果为 
'/foo/bar/baz' 
path.resolve('/foo/bar', '/tmp/file/') 
// 输出结果为 
'/tmp/file' 

path.resolve('wwwroot', 'static_files/png/', '../gif/image.gif') 
// 当前的工作路径是 /home/itbilu/node，则输出结果为 
'/home/itbilu/node/wwwroot/static_files/gif/image.gif'
```

## 七： path.join() 和 path.resolve() 对比
```js
const path = require('path'); 
let myPath = path.join(__dirname,'/img/so'); 
let myPath2 = path.join(__dirname,'./img/so'); 
let myPath3 = path.resolve(__dirname,'/img/so'); 
let myPath4 = path.resolve(__dirname,'./img/so'); 
console.log(__dirname); //D:\myProgram\test 
console.log(myPath); //D:\myProgram\test\img\so 
console.log(myPath2); //D:\myProgram\test\img\so 
console.log(myPath3); //D:\img\so<br> 
console.log(myPath4); //D:\myProgram\test\img\so
```