Daily-Interview-Question 71-80
===
<!-- TOC -->

- [第 71 题： 实现一个字符串匹配算法，从长度为 n 的字符串 S 中，查找是否存在字符串 T，T 的长度是 m，若存在返回所在位置。](#第-71-题-实现一个字符串匹配算法从长度为-n-的字符串-s-中查找是否存在字符串-tt-的长度是-m若存在返回所在位置)
- [第 72 题： 为什么普通 for 循环的性能远远高于 forEach 的性能，请解释其中的原因。](#第-72-题-为什么普通-for-循环的性能远远高于-foreach-的性能请解释其中的原因)
- [第 73 题： 介绍下 BFC、IFC、GFC 和 FFC](#第-73-题-介绍下-bfcifcgfc-和-ffc)
  - [BFC](#bfc)
  - [IFC](#ifc)
  - [FFC](#ffc)
  - [GFC](#gfc)
- [第 74 题： 使用 JavaScript Proxy 实现简单的数据绑定](#第-74-题-使用-javascript-proxy-实现简单的数据绑定)
- [第 75 题：数组里面有10万个数据，取第一个元素和第10万个元素的时间相差多少](#第-75-题数组里面有10万个数据取第一个元素和第10万个元素的时间相差多少)
- [第 76 题：输出以下代码运行结果](#第-76-题输出以下代码运行结果)
- [第 77 题：算法题「旋转数组」](#第-77-题算法题旋转数组)
- [第 78 题：Vue 的父组件和子组件生命周期钩子执行顺序是什么](#第-78-题vue-的父组件和子组件生命周期钩子执行顺序是什么)
- [第 79 题：input 搜索如何防抖，如何处理中文输入](#第-79-题input-搜索如何防抖如何处理中文输入)
- [第 80 题：介绍下 Promise.all 使用、原理实现及错误处理](#第-80-题介绍下-promiseall-使用原理实现及错误处理)

<!-- /TOC -->

## 第 71 题： 实现一个字符串匹配算法，从长度为 n 的字符串 S 中，查找是否存在字符串 T，T 的长度是 m，若存在返回所在位置。
```js
const find = (S, T) => {
  if (S.length < T.length) return -1
  for (let i = 0; i < S.length; i++) {
    if (S.slice(i, i + T.length) === T) return i
  }
  return -1
}
```

```js
// 因为 T 的 length 是一定的，所以在循环S的的时候 ，循环当前项 i 后面至少还有 T.length 个元素
const find = (S, T) => {
  if (S.length < T.length) return -1;
  for (let i = 0; i < S.length - T.length ; i++) {
      if (S.substr(i, T.length) === T) return i ;
  };
  return -1;
};
```

```js
// 方法一：
const find = (S, T) => S.search(T)

// 方法二：
const find = (S, T) => {
  const matched = S.match(T) 
  return matched ? matched.index : -1 
}
```


## 第 72 题： 为什么普通 for 循环的性能远远高于 forEach 的性能，请解释其中的原因。
- for 循环没有任何额外的函数调用栈和上下文；

- forEach函数签名实际上是  
    > array.forEach(function(currentValue, index, arr), thisValue)

它不是普通的 for 循环的语法糖，还有诸多参数和上下文需要在执行的时候考虑进来，这里可能拖慢性能；



## 第 73 题： 介绍下 BFC、IFC、GFC 和 FFC
1. BFC(Block Formatting Context, 块级格式化上下文)
2. IFC(Inline Formatting Context, 行内格式上下文)
3. GFC(Grid Formatting Context, 网格布局格式化上下文)
4. FFC(Flex formatting contexts, 自适应格式上下文)

### BFC
常用的创建块级格式化上下文的方式有：
- 根元素或包含根元素的元素
- overflow不为visible的块元素。
- 行内块元素(display = inline-bloc 会在元素外层产生IFC（所以这个元素可以通过text-align水平居中），当然，它的内部则按照BFC规则渲染)
- 浮动元素
- 绝对定位元素
- 弹性元素(flex)

BFC特点：
- 清除浮动。内部box在垂直方向，一个接一个的放置，BFC区域不会与float box重叠
- 外边距塌陷。box的垂直方向由margin决定，属于同一个BFC的两个box间的margin会重叠
- BFC就是页面上的一个隔离的独立容器，容器里的子元素不会影响到外面的元素，反之也是如此；
- 计算BFC的高度时，浮动元素也参与计算（不会浮动塌陷如overflow：hidden清除浮动就是这个原理）；


### IFC
- 行内元素可以产生行内格式化上下文
- 行内框是水平方向一个接一个排列，起点是包含块的顶部。
- 行内格式化上下文高度由其包含行内元素中最高的实际高度计算而来(不受到竖直方向的padding/margin影响）。水平方向上的margin，border和padding在框之间会保留。框在垂直方向上可以以不同的方式对齐：顶部、底部对齐或根据其中文字的基线对齐)
- 最高的元素高度未设置时，行内框的高度由line-height决定，而其内部的包含块之间的可以高度各不相同(比如只含文本的行框高度与包含图片的行框高度之间)。line-height是上下两行文本的基线之间的距离


### FFC
自适应格式化上下文，当设置display为flex时，内部生成一个BFC。设置display为inline-flex时，内部生成一个IFC

### GFC
网格布局格式化上下文，当为一个元素设置display值为grid的时候，此元素将会获得一个独立的渲染区域


## 第 74 题： 使用 JavaScript Proxy 实现简单的数据绑定
```html
<body>
  hello,world
  <input type="text" id="model">
  <p id="word"></p>
</body>
<script>
  const model = document.getElementById("model")
  const word = document.getElementById("word")
  var obj= {};

  const newObj = new Proxy(obj, {
      get: function(target, key, receiver) {
        console.log(`getting ${key}!`);
        return Reflect.get(target, key, receiver);
      },
      set: function(target, key, value, receiver) {
        console.log('setting',target, key, value, receiver);
        if (key === "text") {
          model.value = value;
          word.innerHTML = value;
        }
        return Reflect.set(target, key, value, receiver);
      }
    });

  model.addEventListener("keyup",function(e){
    newObj.text = e.target.value
  })
</script>
```

```html
<b id="count"></b>
<button onclick="increase()">+</button>
<button onclick="decrease()">-</button>
```
```js
const data = { count: 0 };
const proxy = new Proxy(data, {
  get(target, property) {
    return target[property];
  },
  set(target, property, value) {
    target[property] = value;
    render(value);
  }
});

render(proxy.count);

function render(value) {
  document.getElementById('count').innerHTML = value;
}

function increase() {
  proxy.count += 1;
}

function decrease() {
  proxy.count -= 1; 
}
```


## 第 75 题：数组里面有10万个数据，取第一个元素和第10万个元素的时间相差多少
数组可以直接根据索引取的对应的元素，所以不管取哪个位置的元素的时间复杂度都是 O(1)

得出结论：消耗时间几乎一致，差异可以忽略不计

JavaScript 没有真正意义上的数组，所有的数组其实是对象，其“索引”看起来是数字，其实会被转换成字符串，作为属性名（对象的 key）来使用。所以无论是取第 1 个还是取第 10 万个元素，都是用 key 精确查找哈希表的过程，其消耗时间大致相同。

```js
var arr=new Array(100000).fill(100);
console.time('index_0')
arr[0];
console.timeEnd('index_0')

console.time('index_100000')
arr[100000-1];
console.timeEnd('index_100000')
```



## 第 76 题：输出以下代码运行结果
```js
// example 1
var a={}, b='123', c=123;  
a[b]='b';
a[c]='c';  
console.log(a[b]);

---------------------
// example 2
var a={}, b=Symbol('123'), c=Symbol('123');  
a[b]='b';
a[c]='c';  
console.log(a[b]);

---------------------
// example 3
var a={}, b={key:'123'}, c={key:'456'};  
a[b]='b';
a[c]='c';  
console.log(a[b]);
```


这题考察的是对象的键名的转换。
- 对象的键名只能是字符串和 Symbol 类型。
- 其他类型的键名会被转换成字符串类型。
- 对象转字符串默认会调用 toString 方法。

```js
// example 1
var a={}, b='123', c=123;
a[b]='b';

// c 的键名会被转换成字符串'123'，这里会把 b 覆盖掉。
a[c]='c';  

// 输出 c
console.log(a[b]);
```

```js
// example 2
var a={}, b=Symbol('123'), c=Symbol('123');  

// b 是 Symbol 类型，不需要转换。
a[b]='b';

// c 是 Symbol 类型，不需要转换。任何一个 Symbol 类型的值都是不相等的，所以不会覆盖掉 b。
a[c]='c';

// 输出 b
console.log(a[b]);
```

```js
// example 3
var a={}, b={key:'123'}, c={key:'456'};  

// b 不是字符串也不是 Symbol 类型，需要转换成字符串。
// 对象类型会调用 toString 方法转换成字符串 [object Object]。
a[b]='b';

// c 不是字符串也不是 Symbol 类型，需要转换成字符串。
// 对象类型会调用 toString 方法转换成字符串 [object Object]。这里会把 b 覆盖掉。
a[c]='c';  

// 输出 c
console.log(a[b]);
```



## 第 77 题：算法题「旋转数组」
> 给定一个数组，将数组中的元素向右移动 k 个位置，其中 k 是非负数。

示例 1：
```js
输入: [1, 2, 3, 4, 5, 6, 7] 和 k = 3
输出: [5, 6, 7, 1, 2, 3, 4]
解释:
向右旋转 1 步: [7, 1, 2, 3, 4, 5, 6]
向右旋转 2 步: [6, 7, 1, 2, 3, 4, 5]
向右旋转 3 步: [5, 6, 7, 1, 2, 3, 4]
```

示例 2：
```js
输入: [-1, -100, 3, 99] 和 k = 2
输出: [3, 99, -1, -100]
解释: 
向右旋转 1 步: [99, -1, -100, 3]
向右旋转 2 步: [3, 99, -1, -100]
```

解答： 
```js
// 因为步数有可能大于数组长度，所以要先取余
function rotate(arr, k) {
  const len = arr.length
  const step = k % len
  return arr.slice(-step).concat(arr.slice(0, len - step))
}
// rotate([1, 2, 3, 4, 5, 6], 7) => [6, 1, 2, 3, 4, 5]
```

## 第 78 题：Vue 的父组件和子组件生命周期钩子执行顺序是什么
1. 加载渲染过程
    `父beforeCreate->父created->父beforeMount->子beforeCreate->子created->子beforeMount->子mounted->父mounted`
2. 子组件更新过程
    `父beforeUpdate->子beforeUpdate->子updated->父updated`
3. 父组件更新过程
    `父beforeUpdate->父updated`
4. 销毁过程
    `父beforeDestroy->子beforeDestroy->子destroyed->父destroyed`

总结：从外到内，再从内到外




## 第 79 题：input 搜索如何防抖，如何处理中文输入
简易防抖
```html
<div>
    <input type="text" id="ipt">
  </div>

  <script>
    let ipt = document.getElementById('ipt');
    let dbFun = debounce()
    ipt.addEventListener('keyup', function (e) {
      dbFun(e.target.value);
    })

    function debounce() {
      let timer;
      return function (value) {
        clearTimeout(timer);
        timer = setTimeout(() => {
          console.log(value)
        }, 500);
      }
    }
  </script>
```

官方定义如下compositionstart 事件触发于一段文字的输入之前（类似于 keydown 事件，但是该事件仅在若干可见字符的输入之前，而这些可见字符的输入可能需要一连串的键盘操作、语音识别或者点击输入法的备选词）
简单来说就是切换中文输入法时在打拼音时(此时input内还没有填入真正的内容)，会首先触发compositionstart，然后每打一个拼音字母，触发compositionupdate，最后将输入好的中文填入input中时触发compositionend。触发compositionstart时，文本框会填入 “虚拟文本”（待确认文本），同时触发input事件；在触发compositionend时，就是填入实际内容后（已确认文本）,所以这里如果不想触发input事件的话就得设置一个bool变量来控制。

参考vue源码对v-model的实现中，对输入中文的处理
```js
// <input id='myinput'>
function jeiliu(timeout){
    var timer;
    function input(e){
    if(e.target.composing){
        return ;
    }
    if(timer){
        clearTimeout(timer);
    }
    timer = setTimeout(() => {
            console.log(e.target.value);
            timer = null;
        }, timeout); 
    }
    return input;
}

function onCompositionStart(e){
    e.target.composing = true;
}
function onCompositionEnd(e){
    //console.log(e.target)
    e.target.composing = false;
    var event = document.createEvent('HTMLEvents');
    event.initEvent('input');
    e.target.dispatchEvent(event);
}
var input_dom = document.getElementById('myinput');
input_dom.addEventListener('input',jeiliu(1000));
input_dom.addEventListener('compositionstart',onCompositionStart);
input_dom.addEventListener('compositionend',onCompositionEnd);
```

## 第 80 题：介绍下 Promise.all 使用、原理实现及错误处理
Promise是JS异步编程中的重要概念，异步抽象处理对象，是目前比较流行Javascript异步编程解决方案之一。Promise.all()接受一个由promise任务组成的数组，可以同时处理多个promise任务，当所有的任务都执行完成时，Promise.all()返回resolve，但当有一个失败(reject)，则返回失败的信息，即使其他promise执行成功，也会返回失败。和后台的事务类似。和rxjs中的forkJoin方法类似，合并多个 Observable 对象 ，等到所有的 Observable 都完成后，才一次性返回值。

对于 Promise.all(arr) 来说，在参数数组中所有元素都变为决定态后，然后才返回新的 promise。
```js
// 以下 demo，请求两个 url，当两个异步请求返还结果后，再请求第三个 url
const p1 = request(`http://some.url.1`)
const p2 = request(`http://some.url.2`)
Promise.all([p1, p2])
  .then((datas) => { // 此处 datas 为调用 p1, p2 后的结果的数组
    return request(`http://some.url.3?a=${datas[0]}&b=${datas[1]}`)
  })
  .then((data) => {
    console.log(msg)
  })
```

**Promise.all原理实现**
```js
function promiseAll(promises) {
  return new Promise(function (resolve, reject) {
    if (!Array.isArray(promises)) {
      return reject(new TypeError("argument must be anarray"))
    }

    var countNum = 0;
    var promiseNum = promises.length;
    var resolvedvalue = new Array(promiseNum);

    for (var i = 0; i < promiseNum; i++) {
      (function (i) {
        Promise.resolve(promises[i]).then(function (value) {
          countNum++;
          resolvedvalue[i] = value;

          if (countNum === promiseNum) {
            return resolve(resolvedvalue)
          }

        }, function (reason) {
          return reject(reason)
        })
      })(i)
    }
  })
}

var p1 = Promise.resolve(1),
  p2 = Promise.resolve(2),
  p3 = Promise.resolve(3);

promiseAll([p1, p2, p3]).then(function (value) {
  console.log(value)
})
```
