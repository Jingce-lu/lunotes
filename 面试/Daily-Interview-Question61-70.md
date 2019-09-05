Daily-Interview-Question 61-70
===
<!-- TOC -->

- [Daily-Interview-Question 61-70](#daily-interview-question-61-70)
  - [第 61 题：介绍下如何实现 token 加密](#第-61-题介绍下如何实现-token-加密)
  - [第 62 题：redux 为什么要把 reducer 设计成纯函数](#第-62-题redux-为什么要把-reducer-设计成纯函数)
  - [第 63 题：如何设计实现无缝轮播](#第-63-题如何设计实现无缝轮播)
  - [第 64 题：模拟实现一个 Promise.finally](#第-64-题模拟实现一个-promisefinally)
  - [第 65 题： a.b.c.d 和 a['b']['c']['d']，哪个性能更高？](#第-65-题-abcd-和-abcd哪个性能更高)
  - [第 66 题：ES6 代码转成 ES5 代码的实现思路是什么](#第-66-题es6-代码转成-es5-代码的实现思路是什么)
  - [第 67 题：数组编程题](#第-67-题数组编程题)
  - [第 68 题： 如何解决移动端 Retina 屏 1px 像素问题](#第-68-题-如何解决移动端-retina-屏-1px-像素问题)
  - [第 69 题： 如何把一个字符串的大小写取反（大写变小写小写变大写），例如 ’AbC' 变成 'aBc' 。](#第-69-题-如何把一个字符串的大小写取反大写变小写小写变大写例如-abc-变成-abc-)
  - [第 70 题： 介绍下 webpack 热更新原理，是如何做到在不刷新浏览器的前提下更新页面的](#第-70-题-介绍下-webpack-热更新原理是如何做到在不刷新浏览器的前提下更新页面的)

<!-- /TOC -->

## 第 61 题：介绍下如何实现 token 加密
这个题目是问： 生成token的方法，比如 JWT，还是说利用加密算法，比如对称加密或者非对称加密 加密生成后的token ?

jwt举例：
1. 需要一个secret（随机数）
2. 后端利用secret和加密算法(如：HMAC-SHA256)对payload(如账号密码)生成一个字符串(token)，返回前端
3. 前端每次request在header中带上token
4. 后端用同样的算法解密


## 第 62 题：redux 为什么要把 reducer 设计成纯函数
首先命题应当改一下，中文有歧义，可能改为 “redux中的reducer为什么必须（最好）是纯函数“，我想表达的意思是，redux没有强制你reducer是个纯函数，事实上，没有人能通过框架限制判断一个函数是否是纯函数，所以题目中的'设计成'这个短语貌似在说redux已经把reducer强制规定是纯函数了。这回让你怀疑你对redux的认知。

**正文如下**

然后说一下为什么reducer最好是纯函数，首先你得看看文档怎么说reducer的作用的，‘**接收旧的 state 和 action，返回新的 state**’，您可得瞧好咯，他**就是起一个对数据做简单处理后返回state的作用**，

为什么只起这个作用，这时用设计这个词回答这个问题才恰当，因为redux把reducer设计成只负责这个作用。

很白痴的问答对吧，所以题目的答案也就简单了，**reducer的职责不允许有副作用，副作用简单来说就是不确定性，如果reducer有副作用，那么返回的state就不确定**，

举个例子，你的reducer就做了一个value = value + 1这个逻辑，然后返回state为{value}，ok，这个过程太jr纯了，然后你可能觉得要加个请求来取得value后再加1，那么你的逻辑就是value = getValue() + 1, getValue是个请求函数，返回一个值，这种情况，退一万步讲，如果你的网络请求这次出错，那么getValue就返回的不是一个数值，value就不确定了，所以return的state你也不确定了，前端UI拿到的数据也不确定了，所以就是这个环节引入了副作用，他娘的redux设计好的规范就被你破坏了，redux就没卵用了。到此为止这个问题回答完了，我没有说什么上面几个jr说的教科书的理论，甚至还加了些脏话。请原谅，这只是戏剧需要。

最后我回答下如何解决这个副作用，实际上也很白痴的问题，**这里的请求可以放在reducer之前，你先请求，该做出错处理的就做出错处理，等拿到实际数据后在发送action来调用reducer。这样通过前移副作用的方式，使reducer变得纯洁**。


## 第 63 题：如何设计实现无缝轮播
简单来说，无缝轮播的核心是制造一个连续的效果。最简单的方法就是复制一个轮播的元素，当复制元素将要滚到目标位置后，把原来的元素进行归位的操作，以达到无缝的轮播效果。

贴一段轮播的核心代码：
```js
  // scroll the notice
  useEffect(() => {
    const requestAnimationFrame =
      window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame
    const cancelAnimationFrame =
      window.cancelAnimationFrame || window.webkitCancelAnimationFrame || window.mozCancelAnimationFrame

    const scrollNode = noticeContentEl.current
    const distance = scrollNode.clientWidth / 2

    scrollNode.style.left = scrollNode.style.left || 0
    window.__offset = window.__offset || 0

    let requestId = null
    const scrollLeft = () => {
      const speed = 0.5
      window.__offset = window.__offset + speed
      scrollNode.style.left = -window.__offset + 'px'
      // 关键行：当距离小于偏移量时，重置偏移量
      if (distance <= window.__offset) window.__offset = 0
      requestId = requestAnimationFrame(scrollLeft)
    }
    requestId = requestAnimationFrame(scrollLeft)

    if (pause) cancelAnimationFrame(requestId)
    return () => cancelAnimationFrame(requestId)
  }, [notice, pause])
```
<br />
<br />
无限轮播基本插件都可以做到,不过要使用原生代码实现无缝滚动的话我可以提点思路,  
因为轮播图基本都在ul盒子里面的li元素,  
首先获取第一个li元素和最后一个li元素,  
克隆第一个li元素,和最后一个li元素,  
分别插入到lastli的后面和firstli的前面,  
然后监听滚动事件,如果滑动距离超过x或-x,让其实现跳转下一张图或者跳转上一张,(此处最好设置滑动距离),  
然后在滑动最后一张实现最后一张和克隆第一张的无缝转换,当到克隆的第一张的时候停下的时候,,让其切入真的第一张,则实现无线滑动,向前滑动同理


<br />
<br />

这里说一个不需要clone的方案：
```html
<div class="slide">
  <ul>
    <li>图片1</li>
    <li>图片2</li>
   <li>图片3</li>
  </ul>
</div>
```

1、最外层div.slide定宽、相对定位relative

2、ul 足够宽，最起码li数*li宽度，这里有个技巧，直接 width: 9999em，目的是让里面的所有li一字排开

3、滚动效果通过控制ul的left或者transform来进行滚动效果

4、到了最后一个li，往后看第一个li的时：

4.1、准备继续滚动，把最后一个的li设置为相对定位relative，left值为此时此刻相对ul的位置（设置的时候不要带缓动效果），目的是让最后一个li不动。

4.2、然后把ul的left或者transform设为0（这步没有缓动效果），

4.3、然后再正常的开始一样出现第一个li的滚动效果（这步有缓动效果）

4.4、最后等无缝的第一个li效果完成后，把最后一个li的left值复原为0

5、到第一个li，往前看最后一个li时，也是和上面同理

<br />
<br />

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>轮播</title>
    <style>
        *{
            padding: 0;
            margin: 0;
            list-style: none;
        }
        #continer{
            width: 300px;
            height: 200px;
            position: relative;
            margin: 20px auto;
            border: 1px solid;
            overflow: hidden;
        }
        #lunbo{
            width: 9999em;
            height: 100%;
            position: absolute;
            top: 0;
            left: 0;
        }
        li{
            float: left;
            width: 300px;
            height: 200px;
            text-align: center;
            line-height: 200px;
            color: brown;
            font-size: 30px;
        }
    </style>
</head>
<body>
    <div id="continer">
        <ul class="ul" id="lunbo">
            <li class="list">1</li>
            <li class="list">2</li>
            <li class="list">3</li>
            <li class="list">4</li>
            <li class="list">5</li> 
        </ul>
    </div>
</body>
<script src="./js/jquery3.0.min.js"></script>
<script>
    let selectNum = 0
    function lunboFun (selectNum, time) {
        $('#lunbo').animate({
            'left': -1 * selectNum * 300
        }, time, () => {
            selectNum++
            setTimeout(() => {
                if (selectNum > 4) {
                    selectNum = 0
                    $('ul li:last').css({
                        'position': 'absolute'
                    }, 0)
                    $('ul li:last').animate({
                        'left': -300
                    }, 0)
                    $('#lunbo').animate({
                        'left': 300
                    }, 0)
                } else if (selectNum <3) {
                    $('ul li:last').css({
                        'position': 'relative',
                        'left': 0
                    }, 0)
                }
                lunboFun(selectNum, 1000)
            }, 2000)
        });
    }
    lunboFun(selectNum, 1000)

</script>
</html>
```

<br />
<br />

```js
(function () {
    let prev = document.getElementsByClassName("carousel-prev")[0];
    let next = document.getElementsByClassName("carousel-next")[0];
    let board = document.getElementsByClassName("carousel-board")[0];
    let panels = Array.from(document.getElementsByClassName('carousel-board-item'));
    board.style.left = "-400px"; //设置初始的left值
    let index = 1; //设置初始的index值
    prev.addEventListener("click", function () {
        index++
        console.log(index);
        animate(-400);
        //关键点 如果当前在 1fake 的位置
        if (index === panels.length - 1) {
            setTimeout(() => {
                //去掉动画
                board.style.transition = "0s";
                let distance = 4 * 400
                //默默的左移board至 1
                board.style.left = parseInt(board.style.left) + distance + "px"
            }, 600)
            index = 1;
        }

    })
    next.addEventListener("click", () => {
        index--
        console.log(index);
        animate(400);
        //关键点 如果当前在 4fake 的位置
        if (index === 0) {
            setTimeout(() => {
                // 去掉动画
                board.style.transition = "0s";
                let distance = -4 * 400
                //默默的右移board 至 4
                board.style.left = parseInt(board.style.left) + distance + "px"
            }, 600)
            index = 4;
        }
    })

    function animate(width = 400) {
        board.style.transition = "0.5s";
        board.style.left || (board.style.left = 0)
        board.style.left = parseInt(board.style.left) + width + "px";
    }
})()
```


## 第 64 题：模拟实现一个 Promise.finally
```js
Promise.prototype.finally = function (callback) {
  let P = this.constructor;
  return this.then(
    value  => P.resolve(callback()).then(() => value),
    reason => P.resolve(callback()).then(() => { throw reason })
  );
};
```

为什么需要`Promise.resolve(callback()).then(() => value)`  
而不能直接执行`callback, return value`  
因为callback如果是个异步操作，返回promise呢.希望等callback执行完再接着执行


```js
window.Promise && !('finally' in Promise) && !function() {        
  Promise.prototype.finally = function(cb) {
    cb = typeof cb === 'function' ? cb : function() {};
      
    var Fn = this.constructor;  // 获取当前实例构造函数的引用

    // 接受状态：返回数据
    var onFulfilled = function(data) {
      return Fn.resolve(cb()).then(function() {
        return data
      })
    };

    // 拒绝状态：抛出错误
    var onRejected = function(err) {
      return Fn.resolve(cb()).then(function() {
        throw err
      })
    };

    return this.then(onFulfilled, onRejected);
  }
}();

/*********************** 测试 ***********************/
const p = new Promise((resolve, reject) => {
  console.info('starting...');

  setTimeout(() => {
    Math.random() > 0.5 ? resolve('success') : reject('fail');
  }, 1000);
});

// 正常顺序测试
p.then((data) => {
    console.log(`%c resolve: ${data}`, 'color: green')
  })
  .catch((err) => {
    console.log(`%c catch: ${err}`, 'color: red')
  })
  .finally(() => {
    console.info('finally: completed')
  });

// finally 前置测试  
p.finally(() => {
    console.info('finally: completed')
  })	
  .then((data) => {
    console.log(`%c resolve: ${data}`, 'color: green')
  })
  .catch((err) => {
    console.log(`%c catch: ${err}`, 'color: red')
  });
```


## 第 65 题： a.b.c.d 和 a['b']['c']['d']，哪个性能更高？
应该是 `a.b.c.d` 比 `a['b']['c']['d']` 性能高点，后者还要考虑 [ ] 中是变量的情况，再者，从两种形式的结构来看，显然编译器解析前者要比后者容易些，自然也就快一点。

```js
function compare(times) {
  let a = { key: {} };
  let temp = a;
  for (let i = 0; i < times; i++) {
    let tmp = temp['key'];
    tmp['key'] = {};
    temp = tmp;
  }
  temp['key']['key'] = 'surprise';

  let d0 = new Date();
  let i = a;
  while (i['key'] !== 'surprise') {
    i = i['key'];
  }
  console.log('[] time', new Date() - d0);

  let d1 = new Date();
  let ii = a;
  while (ii.key !== 'surprise') {
    ii = ii.key;
  }
  console.log('. time', new Date() - d1);
}
```


## 第 66 题：ES6 代码转成 ES5 代码的实现思路是什么
题目说的是 ES6，所以不考虑 `.jsx`、`.ts` 这类 js 拓展语言。

ES6 转 ES5 目前行业标配是用 Babel，转换的大致流程如下：
1. 解析：解析代码字符串，生成 AST；
2. 转换：按一定的规则转换、修改 AST；
3. 生成：将修改后的 AST 转换成普通代码。

如果不用工具，纯人工的话，就是使用或自己写各种 polyfill 了。


## 第 67 题：数组编程题
随机生成一个长度为 10 的整数类型的数组，例如 `[2, 10, 3, 4, 5, 11, 10, 11, 20]`，将其排列成一个新数组，要求新数组形式如下，例如 `[[2, 3, 4, 5], [10, 11], [20]]`。

```js
// 随机生成长度为 10 的整数
let arr = function randomArray() {
  let arr = []
  for(let i = 0; i < 10; i++) {
    arr.push(Math.floor(Math.random() * 100))
  }
  return arr
}()

// 排序
arr.sort((a,b) => a-b )

// 去重
arr = [...new Set(arr)]

// 连续值存一个数组，不连续的单独存一个数组
let resultArr = [],  newArr = [arr[0]],  index = 0                  
for(let i = 1; i < arr.length; i++) {
  if(arr[i] == arr[i -1] + 1) {
    newArr.push(arr[i])
  } else {
    resultArr.push(newArr)
    newArr = [arr[i]]
    index++
  }
}

console.log(arr)           // [36, 37, 44, 50, 57, 61, 62, 78, 79]
console.log(resultArr)     // [[36, 37], [44], [50], [57], [61, 62]]
```

```js
// 得到一个两数之间的随机整数，包括两个数在内
function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min; //含最大值，含最小值 
}
// 随机生成10个整数数组, 排序, 去重
let initArr = Array.from({ length: 10 }, (v) => { return getRandomIntInclusive(0, 99) });
initArr.sort((a,b) => { return a - b });
initArr = [...(new Set(initArr))];

// 放入hash表
let obj = {};
initArr.map((i) => {
    const intNum = Math.floor(i/10);
    if (!obj[intNum]) obj[intNum] = [];
    obj[intNum].push(i);
})

// 输出结果
const resArr = [];
for(let i in obj) {
    resArr.push(obj[i]);
}
console.log(resArr);
```


## 第 68 题： 如何解决移动端 Retina 屏 1px 像素问题
问题是 现在已经没有1px的问题了啊。17以前的BUG了吧？

1. 伪元素 + transform scaleY(.5)
2. border-image
3. background-image
4. box-shadow

## 第 69 题： 如何把一个字符串的大小写取反（大写变小写小写变大写），例如 ’AbC' 变成 'aBc' 。
```js
function processString (s) {
    var arr = s.split('');
    var new_arr = arr.map((item) => {
        return item === item.toUpperCase() ? item.toLowerCase() : item.toUpperCase();
    });
    return new_arr.join('');
}
console.log(processString('AbC'));
```

```js
function swapString(str) {
  var result = ''

  for (var i = 0; i < str.length; i++) {
    var c = str[i]

    if (c === c.toUpperCase()) {
      result += c.toLowerCase()
    } else {
      result += c.toUpperCase()
    }
  }

  return result
}

swapString('ADasfads123!@$!@#') // => 'adASFADS123!@$!@#'
```


有没有想到用ascii码的？
```js
const STEP = 'a'.charCodeAt() - 'A'.charCodeAt();

function transCase(char) {
  const asciiCode = char.charCodeAt();
  const resultCode = asciiCode < 'a'.charCodeAt() ? asciiCode + STEP : asciiCode - STEP;
  return String.fromCharCode(resultCode);
}

function transStr(str) {
  const charArr = str.split('');
  return charArr.map(char => transCase(char)).join('');
}
```



## 第 70 题： 介绍下 webpack 热更新原理，是如何做到在不刷新浏览器的前提下更新页面的
1. 当修改了一个或多个文件；
2. 文件系统接收更改并通知webpack；
3. webpack重新编译构建一个或多个模块，并通知HMR服务器进行更新；
4. HMR Server 使用webSocket通知HMR runtime 需要更新，HMR运行时通过HTTP请求更新jsonp；
5. HMR运行时替换更新中的模块，如果确定这些模块无法更新，则触发整个页面刷新。


当时略微看了一下HMR的代码Webpack4和实现，主要要点在于：
1. 在页面使用socket和http-server建立链接
2. module.hot.accpet来添加HMR的js模块
3. 当对应模块发生变化，发送socket请求和client的chunk头进行比较
4. 如果有变化，头部追加script脚本chunk

可以参见一个不太成熟的源码解析：
[https://juejin.im/post/5c86ec276fb9a04a10301f5b](https://juejin.im/post/5c86ec276fb9a04a10301f5b)

[Webpack HMR 原理解析](https://zhuanlan.zhihu.com/p/30669007)