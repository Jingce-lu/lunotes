Daily-Interview-Question 31-40
===
<!-- TOC -->

- [Daily-Interview-Question 31-40](#daily-interview-question-31-40)
  - [第 31 题：改造下面的代码，使之输出0 - 9，写出你能想到的所有解法。](#第-31-题改造下面的代码使之输出0---9写出你能想到的所有解法)
    - [方法一](#方法一)
    - [方法二](#方法二)
    - [方法三](#方法三)
    - [方法四](#方法四)
    - [方法五](#方法五)
  - [第 32 题：Virtual DOM 真的比操作原生 DOM 快吗？谈谈你的想法。](#第-32-题virtual-dom-真的比操作原生-dom-快吗谈谈你的想法)
    - [1. 原生 DOM 操作 vs. 通过框架封装操作。](#1-原生-dom-操作-vs-通过框架封装操作)
    - [2. 对 React 的 Virtual DOM 的误解。](#2-对-react-的-virtual-dom-的误解)
    - [3. MVVM vs. Virtual DOM](#3-mvvm-vs-virtual-dom)
    - [4. 性能比较也要看场合](#4-性能比较也要看场合)
    - [5. 总结](#5-总结)
  - [第 33 题：下面的代码打印什么内容，为什么？](#第-33-题下面的代码打印什么内容为什么)
  - [第 34 题：简单改造下面的代码，使之分别打印 10 和 20。](#第-34-题简单改造下面的代码使之分别打印-10-和-20)
  - [第 35 题：浏览器缓存读取规则](#第-35-题浏览器缓存读取规则)
  - [第 36 题：使用迭代的方式实现 flatten 函数。](#第-36-题使用迭代的方式实现-flatten-函数)
  - [第 37 题：为什么 Vuex 的 mutation 和 Redux 的 reducer 中不能做异步操作？](#第-37-题为什么-vuex-的-mutation-和-redux-的-reducer-中不能做异步操作)
    - [Mutation 必须是同步函数](#mutation-必须是同步函数)
    - [为什么Redux的reducer里不能有异步操作](#为什么redux的reducer里不能有异步操作)
  - [第 38 题：下面代码中 a 在什么情况下会打印 1？](#第-38-题下面代码中-a-在什么情况下会打印-1)
  - [第 39 题：介绍下 BFC 及其应用。](#第-39-题介绍下-bfc-及其应用)
  - [第 40 题：在 Vue 中，子组件为何不可以修改父组件传递的 Prop](#第-40-题在-vue-中子组件为何不可以修改父组件传递的-prop)

<!-- /TOC -->

## 第 31 题：改造下面的代码，使之输出0 - 9，写出你能想到的所有解法。
```js
for (var i = 0; i< 10; i++){
	setTimeout(() => {
		console.log(i);
    }, 1000)
}
```

### 方法一
原理：
- 利用 setTimeout 函数的第三个参数，会作为回调函数的第一个参数传入
- 利用 bind 函数部分执行的特性

```js
// 代码 1：
for (var i = 0; i < 10; i++) {
  setTimeout(i => {
    console.log(i);
  }, 1000, i)
}

// 代码 2：
for (var i = 0; i < 10; i++) {
  setTimeout(console.log, 1000, i)
}


// 代码 3
for (var i = 0; i < 10; i++) {
  setTimeout(console.log.bind(Object.create(null), i), 1000)
}
```

### 方法二
原理：
- 利用 let 变量的特性 — 在每一次 for 循环的过程中，let 声明的变量会在当前的块级作用域里面（for 循环的 body 体，也即两个花括号之间的内容区域）创建一个文法环境（Lexical Environment），该环境里面包括了当前 for 循环过程中的 i，具体链接

```js
for (let i = 0; i < 10; i++) {
  setTimeout(() => {
    console.log(i);
  }, 1000)
}

// 等价于
for (let i = 0; i < 10; i++) {
  let _i = i;// const _i = i;
  setTimeout(() => {
    console.log(_i);
  }, 1000)
}
```

### 方法三
原理: 
- 利用函数自执行的方式，把当前 for 循环过程中的 i 传递进去，构建出块级作用域。IIFE 其实并不属于闭包的范畴
- 利用其它方式构建出块级作用域

```js
// 代码 1
for (var i = 0; i < 10; i++) {
  (i => {
    setTimeout(() => {
      console.log(i);
    }, 1000)
  })(i)
}

// 代码 2
for (var i = 0; i < 10; i++) {
  try {
    throw new Error(i);
  } catch ({
    message: i
  }) {
    setTimeout(() => {
      console.log(i);
    }, 1000)
  }
}
```

### 方法四
原理:
- 很多其它的方案只是把 console.log(i) 放到一个函数里面，因为 setTimeout 函数的第一个参数只接受函数以及字符串，如果是 js 语句的话，js 引擎应该会自动在该语句外面包裹一层函数

```js
// 代码 1：
for (var i = 0; i < 10; i++) {
  setTimeout(console.log(i), 1000)
}

// 代码 2：
for (var i = 0; i < 10; i++) {
  setTimeout((() => {
    console.log(i);
  })(), 1000)
}


// 代码 3：
for (var i = 0; i < 10; i++) {
  setTimeout((i => {
    console.log(i);
  })(i), 1000)
}

// 代码 4：
for (var i = 0; i < 10; i++) {
  setTimeout((i => {
    console.log(i);
  }).call(Object.create(null), i), 1000)
}


// 代码 5：
for (var i = 0; i < 10; i++) {
  setTimeout((i => {
    console.log(i);
  }).apply(Object.create(null), [i]), 1000)
}


// 代码 6：
for (var i = 0; i < 10; i++) {
  setTimeout((i => {
    console.log(i);
  }).apply(Object.create(null), { length: 1, '0': i }), 1000)
}
```

### 方法五
原理：
- 利用 eval 或者 new Function 执行字符串，然后执行过程同方法四

```js
// 代码 1：
for (var i = 0; i < 10; i++) {
  setTimeout(eval('console.log(i)'), 1000)
}


// 代码 2：
for (var i = 0; i < 10; i++) {
  setTimeout(new Function('i', 'console.log(i)')(i), 1000)
}


// 代码 3：
for (var i = 0; i < 10; i++) {
  setTimeout(new Function('console.log(i)')(), 1000)
}
```


## 第 32 题：Virtual DOM 真的比操作原生 DOM 快吗？谈谈你的想法。
采用尤大大的回答：

### 1. 原生 DOM 操作 vs. 通过框架封装操作。
这是一个性能 vs. 可维护性的取舍。框架的意义在于为你掩盖底层的 DOM 操作，让你用更声明式的方式来描述你的目的，从而让你的代码更容易维护。没有任何框架可以比纯手动的优化 DOM 操作更快，因为框架的 DOM 操作层需要应对任何上层 API 可能产生的操作，它的实现必须是普适的。针对任何一个 benchmark，我都可以写出比任何框架更快的手动优化，但是那有什么意义呢？在构建一个实际应用的时候，你难道为每一个地方都去做手动优化吗？出于可维护性的考虑，这显然不可能。框架给你的保证是，你在不需要手动优化的情况下，我依然可以给你提供过得去的性能。

### 2. 对 React 的 Virtual DOM 的误解。
React 从来没有说过 “React 比原生操作 DOM 快”。React 的基本思维模式是每次有变动就整个重新渲染整个应用。如果没有 Virtual DOM，简单来想就是直接重置 innerHTML。很多人都没有意识到，在一个大型列表所有数据都变了的情况下，重置 innerHTML 其实是一个还算合理的操作... 真正的问题是在 “全部重新渲染” 的思维模式下，即使只有一行数据变了，它也需要重置整个 innerHTML，这时候显然就有大量的浪费。

我们可以比较一下 innerHTML vs. Virtual DOM 的重绘性能消耗：

- innerHTML: render html string O(template size) + 重新创建所有 DOM 元素 O(DOM size)
- Virtual DOM: render Virtual DOM + diff O(template size) + 必要的 DOM 更新 O(DOM change)

Virtual DOM render + diff 显然比渲染 html 字符串要慢，但是！它依然是纯 js 层面的计算，比起后面的 DOM 操作来说，依然便宜了太多。可以看到，innerHTML 的总计算量不管是 js 计算还是 DOM 操作都是和整个界面的大小相关，但 Virtual DOM 的计算量里面，只有 js 计算和界面大小相关，DOM 操作是和数据的变动量相关的。前面说了，和 DOM 操作比起来，js 计算是极其便宜的。这才是为什么要有 Virtual DOM：它保证了 1）不管你的数据变化多少，每次重绘的性能都可以接受；2) 你依然可以用类似 innerHTML 的思路去写你的应用。

### 3. MVVM vs. Virtual DOM
相比起 React，其他 MVVM 系框架比如 Angular, Knockout 以及 Vue、Avalon 采用的都是数据绑定：通过 Directive/Binding 对象，观察数据变化并保留对实际 DOM 元素的引用，当有数据变化时进行对应的操作。MVVM 的变化检查是数据层面的，而 React 的检查是 DOM 结构层面的。MVVM 的性能也根据变动检测的实现原理有所不同：Angular 的脏检查使得任何变动都有固定的
O(watcher count) 的代价；Knockout/Vue/Avalon 都采用了依赖收集，在 js 和 DOM 层面都是 O(change)：

- 脏检查：scope digest O(watcher count) + 必要 DOM 更新 O(DOM change)
- 依赖收集：重新收集依赖 O(data change) + 必要 DOM 更新 O(DOM change)可以看到，Angular 最不效率的地方在于任何小变动都有的和 watcher 数量相关的性能代价。但是！当所有数据都变了的时候，Angular 其实并不吃亏。依赖收集在初始化和数据变化的时候都需要重新收集依赖，这个代价在小量更新的时候几乎可以忽略，但在数据量庞大的时候也会产生一定的消耗。

MVVM 渲染列表的时候，由于每一行都有自己的数据作用域，所以通常都是每一行有一个对应的 ViewModel 实例，或者是一个稍微轻量一些的利用原型继承的 "scope" 对象，但也有一定的代价。所以，MVVM 列表渲染的初始化几乎一定比 React 慢，因为创建 ViewModel / scope 实例比起 Virtual DOM 来说要昂贵很多。这里所有 MVVM 实现的一个共同问题就是在列表渲染的数据源变动时，尤其是当数据是全新的对象时，如何有效地复用已经创建的 ViewModel 实例和 DOM 元素。假如没有任何复用方面的优化，由于数据是 “全新” 的，MVVM 实际上需要销毁之前的所有实例，重新创建所有实例，最后再进行一次渲染！这就是为什么题目里链接的 angular/knockout 实现都相对比较慢。相比之下，React 的变动检查由于是 DOM 结构层面的，即使是全新的数据，只要最后渲染结果没变，那么就不需要做无用功。

Angular 和 Vue 都提供了列表重绘的优化机制，也就是 “提示” 框架如何有效地复用实例和 DOM 元素。比如数据库里的同一个对象，在两次前端 API 调用里面会成为不同的对象，但是它们依然有一样的 uid。这时候你就可以提示 track by uid 来让 Angular 知道，这两个对象其实是同一份数据。那么原来这份数据对应的实例和 DOM 元素都可以复用，只需要更新变动了的部分。或者，你也可以直接 track by $index 来进行 “原地复用”：直接根据在数组里的位置进行复用。在题目给出的例子里，如果 angular 实现加上 track by $index 的话，后续重绘是不会比 React 慢多少的。甚至在 dbmonster 测试中，Angular 和 Vue 用了 track by $index 以后都比 React 快: dbmon (注意 Angular 默认版本无优化，优化过的在下面）

顺道说一句，React 渲染列表的时候也需要提供 key 这个特殊 prop，本质上和 track-by 是一回事。

### 4. 性能比较也要看场合
在比较性能的时候，要分清楚初始渲染、小量数据更新、大量数据更新这些不同的场合。Virtual DOM、脏检查 MVVM、数据收集 MVVM 在不同场合各有不同的表现和不同的优化需求。Virtual DOM 为了提升小量数据更新时的性能，也需要针对性的优化，比如 shouldComponentUpdate 或是 immutable data。

- 初始渲染：Virtual DOM > 脏检查 >= 依赖收集
- 小量数据更新：依赖收集 >> Virtual DOM + 优化 > 脏检查（无法优化） > Virtual DOM 无优化
- 大量数据更新：脏检查 + 优化 >= 依赖收集 + 优化 > Virtual DOM（无法/无需优化）>> MVVM 无优化

不要天真地以为 Virtual DOM 就是快，diff 不是免费的，batching 么 MVVM 也能做，而且最终 patch 的时候还不是要用原生 API。在我看来 Virtual DOM 真正的价值从来都不是性能，而是它 1) 为函数式的 UI 编程方式打开了大门；2) 可以渲染到 DOM 以外的 backend，比如 ReactNative。

### 5. 总结
以上这些比较，更多的是对于框架开发研究者提供一些参考。主流的框架 + 合理的优化，足以应对绝大部分应用的性能需求。如果是对性能有极致需求的特殊情况，其实应该牺牲一些可维护性采取手动优化：比如 Atom 编辑器在文件渲染的实现上放弃了 React 而采用了自己实现的 tile-based rendering；又比如在移动端需要 DOM-pooling 的虚拟滚动，不需要考虑顺序变化，可以绕过框架的内置实现自己搞一个。



## 第 33 题：下面的代码打印什么内容，为什么？
```js
var b = 10;
(function b(){
    b = 20;
    console.log(b); 
})();
```


1. 打印结果内容如下：
```js
ƒ b() {
b = 20;
console.log(b)
}
```
2. 原因：  
作用域：执行上下文中包含作用于链：  
在理解作用域链之前，先介绍一下作用域，作用域可以理解为执行上下文中申明的变量和作用的范围；包括块级作用域/函数作用域；  
特性：声明提前：一个声明在函数体内都是可见的，函数声明优先于变量声明；  
在非匿名自执行函数中，函数变量为只读状态无法修改；  


<br />
<br />
几个例子：
```js
var b = 10;
(function b() {
   // 内部作用域，会先去查找是有已有变量b的声明，有就直接赋值20，确实有了呀。发现了具名函数 function b(){}，拿此b做赋值；
   // IIFE的函数无法进行赋值（内部机制，类似const定义的常量），所以无效。
  // （这里说的“内部机制”，想搞清楚，需要去查阅一些资料，弄明白IIFE在JS引擎的工作方式，堆栈存储IIFE的方式等）
    b = 20;
    console.log(b); // [Function b]
    console.log(window.b); // 10，不是20
})();
```
所以严格模式下能看到错误：`Uncaught TypeError: Assignment to constant variable`

```js
var b = 10;
(function b() {
  'use strict'
  b = 20;
  console.log(b)
})() // "Uncaught TypeError: Assignment to constant variable."
```

其他情况例子：

有window：
```js
var b = 10;
(function b() {
    window.b = 20; 
    console.log(b); // [Function b]
    console.log(window.b); // 20是必然的
})();
```

有var:
```js
var b = 10;
(function b() {
    var b = 20; // IIFE内部变量
    console.log(b); // 20
   console.log(window.b); // 10 
})();
```

## 第 34 题：简单改造下面的代码，使之分别打印 10 和 20。
```js
var b = 10;
(function b(){
    b = 20;
    console.log(b); 
})();
```

打印10
```js
var b = 10;
(function b(b) {
 window.b = 20;
 console.log(b)
})(b)

// 或者
var b = 10;
(function b(b) {
 b.b = 20;
 console.log(b)
})(b)
```

打印20
```js
var b = 10;
(function b(b) {
 b = 20;
 console.log(b)
})(b)

// 或者
var b = 10;
(function b() {
 var b = 20;
 console.log(b)
})()
```

other
```js
var b = 10;
(function b(){
    var b = 20; //or let b = 20;
    console.log(this.b);
    console.log(b); 
})();
```


## 第 35 题：浏览器缓存读取规则
可以分成 Service Worker、Memory Cache、Disk Cache 和 Push Cache，那请求的时候 from memory cache 和 from disk cache 的依据是什么，哪些数据什么时候存放在 Memory Cache 和 Disk Cache中？


[https://www.jianshu.com/p/54cc04190252](https://www.jianshu.com/p/54cc04190252)
浏览器的缓存机制


掘金上这篇文章讲缓存的讲的条理更清晰
[一文读懂前端缓存](https://juejin.im/post/5c22ee806fb9a049fb43b2c5?utm_source=gold_browser_extension)


对于大文件来说，大概率是不存储在内存中的，反之优先  
当前系统内存使用率高的话，文件优先存储进硬盘


## 第 36 题：使用迭代的方式实现 flatten 函数。
```js
const spreadableSymbol = Symbol.isConcatSpreadable
const isFlattenable = (value) => {
  return Array.isArray(value) || (typeof value == 'object' && value !== null
    && Object.prototype.toString.call(value) === '[object Arguments]') ||
    !!(spreadableSymbol && value && value[spreadableSymbol])
}

/**
 * flatten的基本实现，具体可以参考lodash库的flatten源码
 * @param array 需要展开的数组
 * @param depth 展开深度
 * @param predicate 迭代时需要调用的函数
 * @param isStrict 限制通过`predicate`函数检查的值
 * @param result 初始结果值
 * @returns {Array} 返回展开后的数组
 */
function flatten(array, depth, predicate, isStrict, result) {
  predicate || (predicate = isFlattenable)
  result || (result = [])

  if (array == null) {
    return result
  }

  for (const value of array) {
    if (depth > 0 && predicate(value)) {
      if (depth > 1) {
        flatten(value, depth - 1, predicate, isStrict, result)
      } else {
        result.push(...value)
      }
    } else if (!isStrict) {
      result[result.length] = value
    }
  }
  return result
}

flatten([1, 2, 3, [4, 5, [6]]], 2)
// [1, 2, 3, 4, 5, 6]
```

迭代的实现:
```js
let arr = [1, 2, [3, 4, 5, [6, 7], 8], 9, 10, [11, [12, 13]]]

const flatten = function (arr) {
    while (arr.some(item => Array.isArray(item))) {
        arr = [].concat(...arr)
    }
    return arr
}

console.log(flatten(arr))
```

递归的实现(ES6简写):
```js
const flatten = array =>
  array.reduce(
    (acc, cur) =>
      Array.isArray(cur) ? [...acc, ...flatten(cur)] : [...acc, cur],
    []
  );
```

```js
let arr = [1, 2, [3, 4, 5, [6, 7], 8], 9, 10, [11, [12, 13]]]

// 迭代实现
function flatten(arr) {
  let arrs = [...arr];
  let newArr = [];
  while (arrs.length) {
    let item = arrs.shift();
    if (Array.isArray(item)) {
      arrs.unshift(...item);
    } else {
      newArr.push(item);
    }
  }
  return newArr;
}

// 递归实现

function flatten(arr) {
  let arrs = [];
  arr.map(item => {
    if (Array.isArray(item)) {
      arrs.push(...flatten(item));
    } else {
      arrs.push(item);
    }
  });
  return arrs;
}

// 字符串转换
arr.join(',').split(',').map(item => Number(item)))
```

## 第 37 题：为什么 Vuex 的 mutation 和 Redux 的 reducer 中不能做异步操作？
应该是各自对于状态管理机制的一种涉及。vue和redux都是一种状态管理机制。 然后他们会有自己的state、和修改state的方法， 修改state的方法涉及到同步和异步，vuex的处理方式是同步在mutation里面，异步在actions里面，然后redux的同步就是reducer ，异步更多的是用户自己去通过中间件的方式去实现的把。

### Mutation 必须是同步函数
一条重要的原则就是要记住 mutation 必须是同步函数。为什么？请参考下面的例子：
```js
mutations: {
  someMutation (state) {
    api.callAsyncMethod(() => {
      state.count++
    })
  }
}
```
现在想象，我们正在 debug 一个 app 并且观察 devtool 中的 mutation 日志。每一条 mutation 被记录，devtools 都需要捕捉到前一状态和后一状态的快照。然而，在上面的例子中 mutation 中的异步函数中的回调让这不可能完成：因为当 mutation 触发的时候，回调函数还没有被调用，devtools 不知道什么时候回调函数实际上被调用——实质上任何在回调函数中进行的状态的改变都是不可追踪的。

**在组件中提交 Mutation**

你可以在组件中使用 this.$store.commit('xxx') 提交 mutation，或者使用 mapMutations 辅助函数将组件中的 methods 映射为 store.commit 调用（需要在根节点注入 store）。
```js
import { mapMutations } from 'vuex'

export default {
  // ...
  methods: {
    ...mapMutations([
      'increment', // 将 `this.increment()` 映射为 `this.$store.commit('increment')`

      // `mapMutations` 也支持载荷：
      'incrementBy' // 将 `this.incrementBy(amount)` 映射为 `this.$store.commit('incrementBy', amount)`
    ]),
    ...mapMutations({
      add: 'increment' // 将 `this.add()` 映射为 `this.$store.commit('increment')`
    })
  }
}
```


### 为什么Redux的reducer里不能有异步操作
1. 先从Redux的设计层面来解释为什么Reducer必须是纯函数
    如果你经常用React+Redux开发，那么就应该了解Redux的设计初衷。Redux的设计参考了Flux的模式，作者希望以此来实现时间旅行，保存应用的历史状态，实现应用状态的可预测。所以整个Redux都是函数式编程的范式，要求reducer是纯函数也是自然而然的事情，使用纯函数才能保证相同的输入得到相同的输入，保证状态的可预测。所以Redux有三大原则：
  
    - 单一数据源，也就是state
    - state 是只读，Redux并没有暴露出直接修改state的接口，必须通过action来触发修改
    - 使用纯函数来修改state，reducer必须是纯函数

2. 下面在从代码层面来解释为什么reducer必须是纯函数
    那么reducer到底干了件什么事，在Redux的源码中只用了一行来表示：
    ```js
    currentState = currentReducer(currentState, action)
    ```

    这一行简单粗暴的在代码层面解释了为什么currentReducer必须是纯函数。currentReducer就是我们在createStore中传入的reducer（至于为什么会加个current有兴趣的可以自己去看源码），reducer是用来计算state的，所以它的返回值必须是state，也就是我们整个应用的状态，而不能是promise之类的。

    要在reducer中加入异步的操作，如果你只是单纯想执行异步操作，不会等待异步的返回，那么在reducer中执行的意义是什么。如果想把异步操作的结果反应在state中，首先整个应用的状态将变的不可预测，违背Redux的设计原则，其次，此时的currentState将会是promise之类而不是我们想要的应用状态，根本是行不通的。

    其实这个问题应该是Redux中为什么不能有副作用的操作更合适。



## 第 38 题：下面代码中 a 在什么情况下会打印 1？
```js
var a = ?;
if(a == 1 && a == 2 && a == 3){
 	console.log(1);
}
```

解答：   
自定义 `toString`（或者 `valueOf`）方法，每次调用改变一次返回值，从而满足判断条件。
```js
// toString
const a = {
  i: 1,
  toString: function () {
    return a.i++;
  }
}

if(a == 1 && a == 2 && a == 3) {
  console.log('Hello World!');
}

// valueOf
let a = {
  i: 1,
  valueOf () {
    return a.i++
  }
}

if(a == 1 && a == 2 && a == 3) {
  console.log('1');
}
```

当使用 == 时，如果两个参数的类型不一样，那么 JS 会尝试将其中一个的类型转换为和另一个相同。在这里左边对象，右边数字的情况下，会首先尝试调用 valueOf（如果可以调用的话）来将对象转换为数字，如果失败，再调用 toString。

比如，我比较喜欢这个：
```js
with({
  get a() {
    return Math.floor(Math.random()*4);
  }
}){
  for(var i=0;i<1000;i++){
    if (a == 1 && a == 2 && a == 3){
      console.log("after "+(i+1)+" trials, it becomes true finally!!!");
      break;
    }
  }
}
```

stackoverflow
```js
var aﾠ = 1;
var a = 2;
var ﾠa = 3;
if(aﾠ==1 && a== 2 &&ﾠa==3) {
    console.log("Why hello there!")
}
```

```js
a = [1,2,3];
a.join = a.shift;
console.log(a == 1 && a == 2 && a == 3);  // true
```

```js
let i = 0;
let a = { [Symbol.toPrimitive]: () => ++i };

console.log(a == 1 && a == 2 && a == 3); // true
```

```js
var a = {
  r: /\d/g, 
  valueOf: function(){
    return this.r.exec(123)[0]
  }
}

if (a == 1 && a == 2 && a == 3) {
    console.log("!")
}
```

```js
// ES6的symbol
let a = {[Symbol.toPrimitive]: ((i) => () => ++i) (0)};
if(a == 1 && a == 2 && a == 3) {
  console.log('1');
}
```


## 第 39 题：介绍下 BFC 及其应用。
BFC 就是块级格式上下文，是页面盒模型布局中的一种 CSS 渲染模式，相当于一个独立的容器，里面的元素和外部的元素相互不影响。

创建 BFC 的方式有：
1. html 根元素
2. float 浮动
3. 绝对定位
4. overflow 不为 visiable
5. display 为表格布局或者弹性布局

BFC 主要的作用是：
- 清除浮动
- 防止同一 BFC 容器中的相邻元素间的外边距重叠问题



## 第 40 题：在 Vue 中，子组件为何不可以修改父组件传递的 Prop
如果修改了，Vue 是如何监控到属性的修改并给出警告的。

1. 子组件为何不可以修改父组件传递的 Prop   
    单向数据流，易于监测数据的流动，出现了错误可以更加迅速的定位到错误发生的位置。
2. 如果修改了，Vue 是如何监控到属性的修改并给出警告的。

```js
if (process.env.NODE_ENV !== 'production') {
   var hyphenatedKey = hyphenate(key);
   if (isReservedAttribute(hyphenatedKey) ||
       config.isReservedAttr(hyphenatedKey)) {
     warn(
       ("\"" + hyphenatedKey + "\" is a reserved attribute and cannot be used as component prop."),
       vm
     );
   }
   defineReactive$$1(props, key, value, function () {
     if (!isRoot && !isUpdatingChildComponent) {
       warn(
         "Avoid mutating a prop directly since the value will be " +
         "overwritten whenever the parent component re-renders. " +
         "Instead, use a data or computed property based on the prop's " +
         "value. Prop being mutated: \"" + key + "\"",
         vm
       );
     }
   });
}
```

在initProps的时候，在defineReactive时通过判断是否在开发环境，如果是开发环境，会在触发set的时候判断是否此key是否处于updatingChildren中被修改，如果不是，说明此修改来自子组件，触发warning提示。

> 需要特别注意的是，当你从子组件修改的prop属于基础类型时会触发提示。 这种情况下，你是无法修改父组件的数据源的， 因为基础类型赋值时是值拷贝。你直接将另一个非基础类型（Object, array）赋值到此key时也会触发提示(但实际上不会影响父组件的数据源)， 当你修改object的属性时不会触发提示，并且会修改父组件数据源的数据。