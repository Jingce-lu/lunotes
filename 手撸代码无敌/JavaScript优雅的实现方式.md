# JavaScript 优雅的实现方式

<!-- TOC -->

- [JavaScript 优雅的实现方式](#javascript-优雅的实现方式)
    - [1、简短优雅地实现 sleep 函数](#1简短优雅地实现-sleep-函数)
        - [1.1 普通版](#11-普通版)
        - [1.2 Promise 版本](#12-promise-版本)
        - [1.3 Generator 版本](#13-generator-版本)
        - [1.4 Async/Await 版本](#14-asyncawait-版本)
        - [1.5 不要忘了开源的力量](#15-不要忘了开源的力量)
    - [2、获取时间戳](#2获取时间戳)
        - [2.1 普通版](#21-普通版)
        - [2.2 进阶版](#22-进阶版)
        - [2.3 终极版](#23-终极版)
    - [3. 数组去重](#3-数组去重)
        - [3.1 普通版 复杂度 O(n^2)](#31-普通版-复杂度-on^2)
        - [3.2 进阶版](#32-进阶版)
        - [3.3 时间复杂度为O(n)](#33-时间复杂度为on)
        - [3.4 终极版](#34-终极版)
    - [4. 数字格式化 1234567890 --> 1,234,567,890](#4-数字格式化-1234567890----1234567890)
        - [4.1 普通版](#41-普通版)
        - [4.2 进阶版](#42-进阶版)
        - [4.3 正则版](#43-正则版)
        - [4.4 API版](#44-api版)
    - [5、交换两个整数](#5交换两个整数)
        - [5.1 普通版](#51-普通版)
        - [5.2 进阶版](#52-进阶版)
        - [5.3 终极版](#53-终极版)
            - [利用一个数异或本身等于０和异或运算符合交换率](#利用一个数异或本身等于０和异或运算符合交换率)
        - [5.4 究极版 ES6](#54-究极版-es6)
    - [6、将 argruments 对象(类数组)转换成数组](#6将-argruments-对象类数组转换成数组)
        - [6.1 普通版](#61-普通版)
        - [6.2 进阶版](#62-进阶版)
        - [6.3 ES6 版本](#63-es6-版本)
    - [7、数字取整 2.33333 => 2](#7数字取整-233333--2)
        - [7.1 普通版](#71-普通版)
        - [7.2 进阶版](#72-进阶版)
        - [7.3 黑科技版](#73-黑科技版)
            - [7.3.1 ~~number](#731-number)
            - [7.3.2 number | 0](#732-number--0)
            - [7.3.3 number ^ 0](#733-number-^-0)
            - [7.3.4 number << 0](#734-number--0)
    - [8、数组求和](#8数组求和)
        - [8.1 普通版](#81-普通版)
        - [8.2 优雅版](#82-优雅版)
        - [8.3 终极版](#83-终极版)

<!-- /TOC -->

## 1、简短优雅地实现 sleep 函数

很多语言都有 sleep 函数，显然 js 没有，那么如何能简短优雅地实现这个方法？

### 1.1 普通版
```js
function sleep(sleepTime) {
	for(var start = +new Date; +new Date - start <= sleepTime;) {}
}
var t1 = +new Date()
sleep(3000)
var t2 = +new Date()
console.log(t2 - t1)
```
  * 优点：简单粗暴，通俗易懂。
  * 缺点：这是最简单粗暴的实现，确实 sleep 了，也确实卡死了，CPU 会飙升，无论你的服务器 CPU 有多么 Niubility。

### 1.2 Promise 版本
```js
function sleep(time) {
  return new Promise(resolve => setTimeout(resolve, time))
}

const t1 = +new Date()
sleep(3000).then(() => {
  const t2 = +new Date()
  console.log(t2 - t1)
})
```
  * 优点：这种方式实际上是用了 setTimeout，没有形成进程阻塞，不会造成性能和负载问题。
  * 缺点：虽然不像 callback 套那么多层，但仍不怎么美观，而且当我们需要在某过程中需要停止执行（或者在中途返回了错误的值），还必须得层层判断后跳出，非常麻烦，而且这种异步并不是那么彻底，还是看起来别扭。


### 1.3 Generator 版本
```js
function sleep(delay) {
  return function(cb) {
    setTimeout(cb.bind(this), delay)
  };
}

function* genSleep() {
  const t1 = +new Date()
  yield sleep(3000)
  const t2 = +new Date()
  console.log(t2 - t1)
}

async(genSleep)

function async(gen) {
  const iter = gen()
  function nextStep(it) {
    if (it.done) return
    if (typeof it.value === "function") {
      it.value(function(ret) {
        nextStep(iter.next(ret))
      })
    } else {
      nextStep(iter.next(it.value))
    }
  }
  nextStep(iter.next())
}
```
  * 优点：同 Promise 优点，另外代码就变得非常简单干净，没有 then 那么生硬和恶心。
  * 缺点：但不足也很明显，就是每次都要执行 next() 显得很麻烦，虽然有 co（第三方包）可以解决，但就多包了一层，不好看，错误也必须按 co 的逻辑来处理，不爽。

<b>co 之所以这么火并不是没有原因的，当然不是仅仅实现 sleep 这么无聊的事情，而是它活生生的借着generator/yield 实现了很类似 async/await 的效果！这一点真是让我三观尽毁刮目相看。</b>

```js
const co = require("co")
function sleep(delay) {
  return function(cb) {
    setTimeout(cb.bind(this), delay)
  }
}

co(function*() {
  const t1 = +new Date()
  yield sleep(3000)
  const t2 = +new Date()
  console.log(t2 - t1)
})
```

### 1.4 Async/Await 版本
```js
function sleep(delay) {
  return new Promise(reslove => {
    setTimeout(reslove, delay)
  })
}

!async function test() {
  const t1 = +new Date()
  await sleep(3000)
  const t2 = +new Date()
  console.log(t2 - t1)
}()
```
  * 优点：同 Promise 和 Generator 优点。 Async/Await 可以看做是 Generator 的语法糖，Async 和 Await 相较于 * 和 yield 更加语义，另外各个函数都是扁平的，不会产生多余的嵌套，代码更加清爽易读。
  * 缺点： ES7 语法存在兼容性问题，有 babel 一切兼容性都不是问题

### 1.5 不要忘了开源的力量

在 javascript 优雅的写 sleep 等于如何优雅的不优雅

> 这里有 C++ 实现的模块：https://github.com/ErikDubbelboer/node-sleep

```js
const sleep = require("sleep")

const t1 = +new Date()
sleep.msleep(3000)
const t2 = +new Date()
console.log(t2 - t1)
```
  * 优点：能够实现更加精细的时间精确度，而且看起来就是真的 sleep 函数，清晰直白。
  * 缺点：缺点需要安装这个模块，^_^，这也许算不上什么缺点。

## 2、获取时间戳

上面第一个用多种方式实现 `sleep` 函数，我们可以发现代码有 `+new Date()`获取时间戳的用法，这只是其中的一种，下面就说一下其他两种以及 `+new Date()`的原理。

### 2.1 普通版
```js
var timestamp=new Date().getTime()
```
  * 优点：具有普遍性，大家都用这个
  * 缺点：目前没有发现

### 2.2 进阶版
```js
var timestamp = (new Date()).valueOf()
```

> valueOf 方法返回对象的原始值(Primitive,'Null','Undefined','String','Boolean','Number'五种基本数据类型之一)，可能是字符串、数值或 bool 值等，看具体的对象。
  * 优点：说明开发者原始值有一个具体的认知，让人眼前一亮。
  * 缺点: 目前没有发现

### 2.3 终极版
```js
var timestamp = +new Date()
```
  * 优点：对 JavaScript 隐式转换掌握的比较牢固的一个表现
  * 缺点：目前没有发现

现在就简单分析一下为什么 `+new Date() 拿到的是时间戳`。

<b>一言以蔽之，这是隐式转换的玄学，实质还是调用了 valueOf() 的方法。</b>

<b>一元+ 运算符</b>
一元 `+` 运算符将其操作数转换为 Number 类型并反转其正负。注意负的 `+0` 产生 `-0`，负的 `-0` 产生 `+0`。产生式 `UnaryExpression : - UnaryExpression` 按照下面的过程执行。

> 1. 令 expr 为解释执行 UnaryExpression 的结果 .
> 2. 令 oldValue 为 ToNumber(GetValue(expr)).
> 3. 如果 oldValue is NaN ，return NaN.
> 4. 返回 oldValue 取负（即，算出一个数字相同但是符号相反的值）的结果。

<b>+new Date() 相当于 ToNumber(new Date())</b>

我们再来看看 `ECMAScript` 规范对 `ToNumber` 的定义：

我们知道 `new Date()` 是个对象，满足上面的 `ToPrimitive()`，所以进而成了 `ToPrimitive(new Date())`。

接着我们再来看看 `ECMAScript` 规范对 `ToPrimitive` 的定义，一层一层来，抽丝剥茧。

<b>ToPrimitive(obj,preferredType)</b>

`JavaScript` 引擎内部转换为原始值 `ToPrimitive(obj,preferredType)` 函数接受两个参数，第一个 `obj` 为被转换的对象，第二个`preferredType` 为希望转换成的类型（默认为空，接受的值为 `Number` 或 `String）`

在执行 `ToPrimitive(obj,preferredType)` 时如果第二个参数为空并且 `obj` 为 `Date` 的实例时，此时 `preferredType` 会被设置为 `String`，其他情况下 `preferredType` 都会被设置为`Number` 如果 `preferredType` 为 `Number`，`ToPrimitive` 执行过程如下：

> 1. 如果obj为原始值，直接返回；
> 2. 否则调用 obj.valueOf()，如果执行结果是原始值，返回之；
> 3. 否则调用 obj.toString()，如果执行结果是原始值，返回之；
> 4. 否则抛异常。

如果 `preferredType` 为 `String`，将上面的第2步和第3步调换，即：

> 1. 如果obj为原始值，直接返回；
> 2. 否则调用 obj.toString()，如果执行结果是原始值，返回之；
> 3. 否则调用 obj.valueOf()，如果执行结果是原始值，返回之；
> 4. 否则抛异常。


首先我们要明白 `obj.valueOf()` 和 `obj.toString()` 还有原始值分别是什么意思,这是弄懂上面描述的前提之一:

<b> `toString` 用来返回对象的字符串表示。 </b>

```js
var obj = {};
console.log(obj.toString());//[object Object]

var arr2 = [];
console.log(arr2.toString());//""空字符串

var date = new Date();
console.log(date.toString());//Sun Feb 28 2016 13:40:36 GMT+0800 (中国标准时间)
```

<b> `valueOf` 方法返回对象的原始值，可能是字符串、数值或 bool 值等，看具体的对象。 </b>

```js
var obj = {
  name: "obj"
}
console.log(obj.valueOf()) //Object {name: "obj"}

var arr1 = [1]
console.log(arr1.valueOf()) //[1]

var date = new Date()
console.log(date.valueOf())//1456638436303
如代码所示，三个不同的对象实例调用valueOf返回不同的数据
```

<b>原始值指的是 `'Null','Undefined','String','Boolean','Number','Symbol'` 6种基本数据类型之一，上面已经提到过这个概念，这里再次申明一下。</b>

最后分解一下其中的过程：+new Date():
> 1. 运算符 new 的优先级高于一元运算符 +，所以过程可以分解为：
>     var time=new Date();
>     +time
> 2. 根据上面提到的规则相当于：`ToNumber(time)`
> 3. `time` 是个日期对象，根据 `ToNumber` 的转换规则，所以相当于：`ToNumber(ToPrimitive(time))`
> 4. 根据 `ToPrimitive` 的转换规则：`ToNumber(time.valueOf())`，`time.valueOf()` 就是 原始值 得到的是个时间戳，假设 `time.valueOf()=1503479124652`
> 5. 所以 `ToNumber(1503479124652)` 返回值是 `1503479124652` 这个数字。
> 6. 分析完毕


## 3. 数组去重

注：暂不考虑`对象字面量`，`函数`等引用类型的去重，也不考虑 `NaN`, `undefined`, `null`等特殊类型情况。

> 数组样本：[1, 1, '1', '2', 1]

### 3.1 普通版 复杂度 O(n^2)

无需思考，我们可以得到 O(n^2) 复杂度的解法。定义一个变量数组 res 保存结果，遍历需要去重的数组，如果该元素已经存在在 res 中了，则说明是重复的元素，如果没有，则放入 res 中。
```js
var a = [1, 1, '1', '2', 1]
function unique(arr) {
    var res = []
    for (var i = 0, len = arr.length; i < len; i++) {
        var item = arr[i]
        for (var j = 0, jlen = res.length; j < jlen; j++) {
            if (item === res[j]) //arr数组的item在res已经存在,就跳出循环
                break
        }
        if (j === jlen) //循环完毕,arr数组的item在res找不到,就push到res数组中
            res.push(item)
    }
    return res
}
console.log(unique(a)) // [1, 2, "1"]
```
  * 优点： 没有任何兼容性问题，通俗易懂，没有任何理解成本
  * 缺点： 看起来比较臃肿比较繁琐，时间复杂度比较高O(n^2)

### 3.2 进阶版
```js
var a =  [1, 1, '1', '2', 1]
function unique(arr) {
    return arr.filter(function(ele,index,array){
        return array.indexOf(ele) === index//很巧妙,这样筛选一对一的,过滤掉重复的
    })
}
console.log(unique(a)) // [1, 2, "1"]
```
  * 优点：很简洁，思维也比较巧妙，直观易懂。
  * 缺点：不支持 IE9 以下的浏览器，时间复杂度还是O(n^2)

### 3.3 时间复杂度为O(n)
```js
var a =  [1, 1, '1', '2', 1]
function unique(arr) {
    var obj = {}
    return arr.filter(function(item, index, array){
        return obj.hasOwnProperty(typeof item + item) ? 
        false : 
        (obj[typeof item + item] = true)
    })
}

console.log(unique(a)) // [1, 2, "1"]
```
  * 优点：`hasOwnProperty` 是对象的属性(名称)存在性检查方法。对象的属性可以基于 `Hash` 表实现，因此对属性进行访问的时间复杂度可以达到`O(1)`;
  `filter` 是数组迭代的方法，内部还是一个 `for` 循环，所以时间复杂度是 `O(n)`。
  * 缺点：不兼容 IE9 以下浏览器，其实也好解决，把 filter 方法用 for 循环代替或者自己模拟一个 filter 方法。

### 3.4 终极版

> 以 Set 为例，ES6 提供了新的数据结构 Set。它类似于数组，但是成员的值都是唯一的，没有重复的值。

```js
const unique = a => [...new Set(a)]
```
  * 优点：ES6 语法，简洁高效，我们可以看到，去重方法从原始的 14 行代码到 ES6 的 1 行代码，其实也说明了 JavaScript 这门语言在不停的进步，相信以后的开发也会越来越高效。
  * 缺点：兼容性问题，现代浏览器才支持，有 babel 这些都不是问题。


## 4. 数字格式化 1234567890 --> 1,234,567,890
### 4.1 普通版
```js
function formatNumber(str) {
  let arr = [],
    count = str.length

  while (count >= 3) {
    arr.unshift(str.slice(count - 3, count))
    count -= 3
  }

  // 如果是不是3的倍数就另外追加到上去
  str.length % 3 && arr.unshift(str.slice(0, str.length % 3))

  return arr.toString()

}
console.log(formatNumber("1234567890")) // 1,234,567,890
```
  * 优点：自我感觉比网上写的一堆 for循环 还有 if-else 判断的逻辑更加清晰直白。
  * 缺点：太普通

### 4.2 进阶版
```js
function formatNumber(str) {

  // ["0", "9", "8", "7", "6", "5", "4", "3", "2", "1"]
  return str.split("").reverse().reduce((prev, next, index) => {
    return ((index % 3) ? next : (next + ',')) + prev
  })
}

console.log(formatNumber("1234567890")) // 1,234,567,890
```
  * 优点：把 JS 的 API 玩的了如指掌
  * 缺点：可能没那么好懂，不过读懂之后就会发出我怎么没想到的感觉

### 4.3 正则版
```js
function formatNumber(str) {
  return str.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

console.log(formatNumber("123456789")) // 1,234,567,890
```

下面简单分析下正则`/\B(?=(\d{3})+(?!\d))/g`：
>1. /\B(?=(\d{3})+(?!\d))/g：正则匹配边界\B，边界后面必须跟着(\d{3})+(?!\d);
>2. (\d{3})+：必须是1个或多个的3个连续数字;
>3. (?!\d)：第2步中的3个数字不允许后面跟着数字;
>4. (\d{3})+(?!\d)：所以匹配的边界后面必须跟着3*n（n>=1）的数字。

最终把匹配到的所有边界换成,即可达成目标。

优点：代码少，浓缩的就是精华
缺点：需要对正则表达式的位置匹配有一个较深的认识，门槛大一点

### 4.4 API版
```js
(1234567890).toLocaleString('en-US')  // 1,234,567,890
```

还可以使用 Intl对象 - MDN
>Intl 对象是 ECMAScript 国际化 API 的一个命名空间，它提供了精确的字符串对比，数字格式化，日期和时间格式化。Collator，NumberFormat 和 DateTimeFormat 对象的构造函数是 Intl 对象的属性。
```js
new Intl.NumberFormat().format(1234567890) // 1,234,567,890
```
  * 优点：简单粗暴，直接调用 API
  * 缺点：Intl兼容性不太好，不过 toLocaleString的话 IE6 都支持


## 5、交换两个整数
  let a = 3,b = 4 变成 a = 4, b = 3


### 5.1 普通版
  首先最常规的办法，引入一个 temp 中间变量
```js
let a = 3,b = 4
let temp = a
a = b
b = temp
console.log(a, b)
```
  * 优点：一眼能看懂就是最好的优点
  * 缺点：硬说缺点就是引入了一个多余的变量


### 5.2 进阶版
  在不引入中间变量的情况下也能交互两个变量
```js
let a = 3,b = 4
a += b
b = a - b
a -= b
console.log(a, b)
```
  * 优点：比起楼上那种没有引入多余的变量，比上面那一种稍微巧妙一点
  * 缺点：当然缺点也很明显，整型数据溢出，比如说对于32位字符最大表示有符号数字是2147483647，也就是Math.pow(2,31)-1，如果是2147483645和2147483646交换就失败了。


### 5.3 终极版
  利用一个数异或本身等于０和异或运算符合交换率。
```js
let a = 3,b = 4
  a ^= b
  b ^= a
  a ^= b
console.log(a, b)
```

#### 利用一个数异或本身等于０和异或运算符合交换率
  下面用竖式进行简单说明：(10进制化为二进制)
```js
    a = 011
(^) b = 100
则  a = 111(a ^ b的结果赋值给a，a已变成了7)
(^) b = 100
则  b = 011(b^a的结果赋给b，b已经变成了3)
(^) a = 111
则  a = 100(a^b的结果赋给a，a已经变成了4)
```
  从上面的竖式可以清楚的看到利用异或运算实现两个值交换的基本过程。

下面从深层次剖析一下：
  1. 对于开始的两个赋值语句，a = a ^ b，b = b ^ a，相当于b = b ^ (a ^ b) = a ^ b ^ b，而b ^ b 显然等于0。因此b = a ^ 0，显然结果为a。
  2. 同理可以分析第三个赋值语句，a = a ^ b = (a ^ b) ^ a = b

注：
  1. <b>^ 即”异或“运算符。</b>
  > 它的意思是判断两个相应的位值是否为”异“，为”异"(值不同)就取真（1）;否则为假（0）。
  2. <b>^ 运算符的特点是与0异或，保持原值；与本身异或，结果为0。</b>
    * 优点：不存在引入中间变量，不存在整数溢出
    * 缺点：前端对位操作这一块可能了解不深，不容易理解


### 5.4 究极版 ES6
```js
var a = 3,b = 4;
[b, a] = [a, b]
```


## 6、将 argruments 对象(类数组)转换成数组
  `{0:1,1:2,2:3,length:3}`这种形式的就属于类数组，就是按照数组下标排序的对象，还有一个 length 属性，有时候我们需要这种对象能调用数组下的一个方法，这时候就需要把把类数组转化成真正的数组。


### 6.1 普通版
  ```js
  var makeArray = function(array) {
    var ret = []
    if (array != null) {
      var i = array.length
      if (i == null || typeof array === "string") ret[0] = array
      else while (i) ret[--i] = array[i];
    }
    return ret
  }
  makeArray({0:1,1:2,2:3,length:3}) //[1,2,3]
  ```
  * 优点：通用版本，没有任何兼容性问题
  * 缺点：太普通


### 6.2 进阶版
  ```js
  var arr = Array.prototype.slice.call(arguments);
  ```
  <b>简单的说就是根据参数，返回数组的一部分的 copy。所以了解其内部实现才能确定它是如何工作的。所以查看 V8 源码中的 Array.js 可以看到如下的代码：</b>

  `slice.call` 的作用原理就是，利用 `call`，将 `slice` 的方法作用于 `arrayLike`，`slice` 的两个参数为空，`slice` 内部解析使得 `arguments.lengt` 等于0的时候 相当于处理 `slice(0)` ： 即选择整个数组，slice 方法内部没有强制判断必须是 `Array` 类型，`slice` 返回的是新建的数组（使用循环取值）”，所以这样就实现了类数组到数组的转化，call 这个神奇的方法、slice 的处理缺一不可。

  直接看 slice 怎么实现的吧。其实就是将 `array-like` 对象通过下标操作放进了新的 Array 里面：
```js
// This will work for genuine arrays, array-like objects, 
// NamedNodeMap (attributes, entities, notations),
// NodeList (e.g., getElementsByTagName), HTMLCollection (e.g., childNodes),
// and will not fail on other DOM objects (as do DOM elements in IE < 9)
Array.prototype.slice = function(begin, end) {
    // IE < 9 gets unhappy with an undefined end argument
    end = (typeof end !== 'undefined') ? end : this.length;

    // For native Array objects, we use the native slice function
    if (Object.prototype.toString.call(this) === '[object Array]'){
    return _slice.call(this, begin, end); 
    }

    // For array like object we handle it ourselves.
    var i, cloned = [],
    size, len = this.length;

    // Handle negative value for "begin"
    var start = begin || 0;
    start = (start >= 0) ? start : Math.max(0, len + start);

    // Handle negative value for "end"
    var upTo = (typeof end == 'number') ? Math.min(end, len) : len;
    if (end < 0) {
    upTo = len + end;
    }

    // Actual expected size of the slice
    size = upTo - start;

    if (size > 0) {
    cloned = new Array(size);
    if (this.charAt) {
        for (i = 0; i < size; i++) {
        cloned[i] = this.charAt(start + i);
        }
    } else {
        for (i = 0; i < size; i++) {
        cloned[i] = this[start + i];
        }
    }
    }

    return cloned;
};
```
 * 优点：最常用的版本，兼容性较强
 * 缺点：ie 低版本，无法处理 dom 集合的 slice call 转数组。（虽然具有数值键值、length 符合ArrayLike 的定义，却报错）搜索资料得到 ：因为 ie 下的 dom 对象是以 com 对象的形式实现的，js 对象与com对象不能进行转换 。


### 6.3 ES6 版本
    使用 `Array.from`, 值需要对象有 leng`th 属性, 就可以转换成数组
```js
var arr = Array.from(arguments);
```
  扩展运算符
```js
var args = [...arguments];
```
ES6 中的扩展运算符...也能将某些数据结构转换成数组，这种数据结构必须有便利器接口。
* 优点：直接使用内置 API，简单易维护
* 缺点：兼容性，使用 babel 的 profill 转化可能使代码变多，文件包变大



## 7、数字取整 2.33333 => 2

### 7.1 普通版
```js
const a = parseInt(2.33333)
```

### 7.2 进阶版
```js
const a = Math.trunc(2.33333)
```
Math.trunc() 方法会将数字的小数部分去掉，只保留整数部分。

特别要注意的是：Internet Explorer 不支持这个方法，不过写个 Polyfill 也很简单：
```js
Math.trunc = Math.trunc || function(x) {
  if (isNaN(x)) {
    return NaN;
  }
  if (x > 0) {
    return Math.floor(x);
  }
  return Math.ceil(x);
};
```

### 7.3 黑科技版
#### 7.3.1 ~~number
  双波浪线 ~~ 操作符也被称为“双按位非”操作符。你通常可以使用它作为代替 Math.trunc() 的更快的方法。
  ```js
    console.log(~~47.11)  // -> 47
    console.log(~~1.9999) // -> 1
    console.log(~~3)      // -> 3
    console.log(~~[])     // -> 0
    console.log(~~NaN)    // -> 0
    console.log(~~null)   // -> 0
  ```
  失败时返回0,这可能在解决 Math.trunc() 转换错误返回 NaN 时是一个很好的替代。

  但是当数字范围超出 ±2^31−1 即：2147483647 时，异常就出现了：
  ```js
  // 异常情况
  console.log(~~2147493647.123) // -> -2147473649 🙁
  ```

#### 7.3.2 number | 0
| (按位或) 对每一对比特位执行或（OR）操作。
```js
console.log(20.15|0);          // -> 20
console.log((-20.15)|0);       // -> -20
console.log(3000000000.15|0);  // -> -1294967296 
```

#### 7.3.3 number ^ 0
^ (按位异或)，对每一对比特位执行异或（XOR）操作。
```js
console.log(20.15^0);          // -> 20
console.log((-20.15)^0);       // -> -20
console.log(3000000000.15^0);  // -> -1294967296 🙁
```

#### 7.3.4 number << 0
<< (左移) 操作符会将第一个操作数向左移动指定的位数。向左被移出的位被丢弃，右侧用 0 补充。
```js
console.log(20.15 < < 0);     // -> 20
console.log((-20.15) < < 0);  //-20
console.log(3000000000.15 << 0);  // -> -1294967296 🙁
```
上面这些按位运算符方法执行很快，当你执行数百万这样的操作非常适用，速度明显优于其他方法。但是代码的可读性比较差。还有一个特别要注意的地方，处理比较大的数字时（当数字范围超出 ±2^31−1 即：2147483647），会有一些异常情况。使用的时候明确的检查输入数值的范围。



## 8、数组求和

### 8.1 普通版
```js
let arr = [1, 2, 3, 4, 5]
function sum(arr){
    let x = 0
    for(let i = 0; i < arr.length; i++){
        x += arr[i]
    }
    return x
}
sum(arr) // 15
```
  * 优点：通俗易懂，简单粗暴
  * 缺点：没有亮点，太通俗


### 8.2 优雅版
```js
let arr = [1, 2, 3, 4, 5]
function sum(arr) {
return arr.reduce((a, b) => a + b)
}
sum(arr) //15
```
* 优点：简单明了，数组迭代器方式清晰直观
* 缺点：不兼容 IE 9以下浏览器


### 8.3 终极版
```js
let arr = [1, 2, 3, 4, 5]
function sum(arr) {
return eval(arr.join("+"))
}
sum(arr) //15
```
* 优点：让人一时看不懂的就是"好方法"。
* 缺点：
  1. eval 不容易调试。用 chromeDev 等调试工具无法打断点调试，所以麻烦的东西也是不推荐使用的…
  2. 性能问题，在旧的浏览器中如果你使用了eval，性能会下降10倍。在现代浏览器中有两种编译模式：fast path和slow path。fast path是编译那些稳定和可预测（stable and predictable）的代码。而明显的，eval 不可预测，所以将会使用 slow path ，所以会慢。