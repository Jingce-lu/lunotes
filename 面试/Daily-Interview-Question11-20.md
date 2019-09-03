Daily-Interview-Question 11-20
===

<!-- TOC -->

- [Daily-Interview-Question 11-20](#daily-interview-question-11-20)
  - [第 11 题： 将数组扁平化并去除其中重复数据，最终得到一个升序且不重复的数组](#第-11-题-将数组扁平化并去除其中重复数据最终得到一个升序且不重复的数组)
  - [第 12 题：JS 异步解决方案的发展历程以及优缺点](#第-12-题js-异步解决方案的发展历程以及优缺点)
    - [1. 回调函数（callback）](#1-回调函数callback)
    - [2. Promise](#2-promise)
    - [3. Generator](#3-generator)
    - [4. Async/await](#4-asyncawait)
  - [第 13 题：Promise 构造函数是同步执行还是异步执行，那么 then 方法呢？](#第-13-题promise-构造函数是同步执行还是异步执行那么-then-方法呢)
  - [第 14 题：如何实现一个 new](#第-14-题如何实现一个-new)
  - [第 15 题：简单讲解一下http2的多路复用](#第-15-题简单讲解一下http2的多路复用)
  - [第 16 题：谈谈你对TCP三次握手和四次挥手的理解](#第-16-题谈谈你对tcp三次握手和四次挥手的理解)
  - [第 17 题：A、B 机器正常连接后，B 机器突然重启，问 A 此时处于 TCP 什么状态](#第-17-题ab-机器正常连接后b-机器突然重启问-a-此时处于-tcp-什么状态)
    - [问题定义](#问题定义)
    - [问题答案](#问题答案)
  - [第 18 题：React 中 setState 什么时候是同步的，什么时候是异步的？](#第-18-题react-中-setstate-什么时候是同步的什么时候是异步的)
  - [第 19 题：React setState 笔试题，下面的代码输出什么？](#第-19-题react-setstate-笔试题下面的代码输出什么)
  - [第 20 题：介绍下 npm 模块安装机制，为什么输入 npm install 就可以自动安装对应的模块？](#第-20-题介绍下-npm-模块安装机制为什么输入-npm-install-就可以自动安装对应的模块)
    - [1. npm 模块安装机制：](#1-npm-模块安装机制)
    - [2. npm 实现原理](#2-npm-实现原理)

<!-- /TOC -->

## 第 11 题： 将数组扁平化并去除其中重复数据，最终得到一个升序且不重复的数组

已知如下数组：
```js
var arr = [ [1, 2, 2], [3, 4, 5, 5], [6, 7, 8, 9, [11, 12, [12, 13, [14] ] ] ], 10];
```

编写一个程序将数组扁平化去并除其中重复部分数据，最终得到一个升序且不重复的数组

```js
Array.from(new Set(arr.flat(Infinity))).sort((a,b)=>{ return a-b})
```

```js
arr.toString().split(",").sort((a,b)=>{ return a-b})
```

```js
Array.prototype.flat= function() {
    return [].concat(...this.map(item => (Array.isArray(item) ? item.flat() : [item])));
}

Array.prototype.unique = function() {
    return [...new Set(this)]
}

const sort = (a, b) => a - b;

console.log(arr.flat().unique().sort(sort)); 
// [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14 ]
```

```js
var arr = [ [1, 2, 2], [3, 4, 5, 5], [6, 7, 8, 9, [11, 12, [12, 13, [14] ] ] ], 10];
function flatten(arr) {

    while (arr.some(item => Array.isArray(item))) {
        arr = [].concat(...arr);
    }

    return arr;
}
Array.from(new Set(flatten(arr))).sort((a, b) => {
 return a - b
})
```

## 第 12 题：JS 异步解决方案的发展历程以及优缺点
### 1. 回调函数（callback）
```js
setTimeout(() => {
   // callback 函数体
}, 1000)
```

1. **缺点**：回调地狱，不能用 try catch 捕获错误，不能 return

回调地狱的根本问题在于：
- 缺乏顺序性： 回调地狱导致的调试困难，和大脑的思维方式不符；
- 嵌套函数存在耦合性，一旦有所改动，就会牵一发而动全身，即（控制反转）；
- 嵌套函数过多的多话，很难处理错误。

```js
ajax('XXX1', () => {
   // callback 函数体
   ajax('XXX2', () => {
       // callback 函数体
       ajax('XXX3', () => {
           // callback 函数体
       })
   })
})
```

2. **优点**：解决了同步的问题（只要有一个任务耗时很长，后面的任务都必须排队等着，会拖延整个程序的执行）。


### 2. Promise
Promise 就是为了解决 callback 的问题而产生的。

Promise 实现了链式调用，也就是说每次 then 后返回的都是一个全新 Promise，如果我们在 then 中 return ，return 的结果会被 Promise.resolve() 包装。

**优点：解决了回调地狱的问题。**
```js
ajax('XXX1')
 .then(res => {
     // 操作逻辑
     return ajax('XXX2')
 }).then(res => {
     // 操作逻辑
     return ajax('XXX3')
 }).then(res => {
     // 操作逻辑
 })
```

**缺点：无法取消 Promise ，错误需要通过回调函数来捕获。**

### 3. Generator
**特点：可以控制函数的执行**，可以配合 co 函数库使用。
```js
function *fetch() {
   yield ajax('XXX1', () => {})
   yield ajax('XXX2', () => {})
   yield ajax('XXX3', () => {})
}
let it = fetch()
let result1 = it.next()
let result2 = it.next()
let result3 = it.next()
```

### 4. Async/await
async、await 是异步的终极解决方案。

**优点是：代码清晰，不用像 Promise 写一大堆 then 链，处理了回调地狱的问题；**

**缺点：await 将异步代码改造成同步代码，如果多个异步操作没有依赖性而使用 await 会导致性能上的降低。**

```js
async function test() {
 // 以下代码没有依赖性的话，完全可以使用 Promise.all 的方式
 // 如果有依赖性的话，其实就是解决回调地狱的例子了
 await fetch('XXX1')
 await fetch('XXX2')
 await fetch('XXX3')
}
```

下面来看一个使用 await 的例子：
```js
let a = 0
let b = async () => {
 a = a + await 10
 console.log('2', a) // -> '2' 10
}
b()
a++
console.log('1', a) // -> '1' 1

// 1 1
// 2 10
```

对于以上代码你可能会有疑惑，让我来解释下原因：
- 首先函数 `b` 先执行，在执行到 `await 10` 之前变量 `a` 还是 0，因为 `await` 内部实现了 `generator` ，**generator 会保留堆栈中东西，所以这时候 a = 0 被保存了下来**；
- 因为 `await` 是异步操作，后来的表达式不返回 `Promise` 的话，就会包装成 `Promise.reslove(返回值)`，然后会去执行函数外的同步代码；
- 同步代码执行完毕后开始执行异步代码，将保存下来的值拿出来使用，这时候 a = 0 + 10

上述解释中提到了 `await` 内部实现了 `generator`，其实 `await` 就是 `generator` 加上 Promise的语法糖，且内部实现了自动执行 `generator`。如果你熟悉 co 的话，其实自己就可以实现这样的语法糖。


## 第 13 题：Promise 构造函数是同步执行还是异步执行，那么 then 方法呢？
.then()当然是同步执行，只不过是.then的cb被放入了微任务队列，产生了异步执行

```js
const promise = new Promise((resolve, reject) => {
  console.log(1)
  resolve()
  console.log(2)
})

promise.then(() => {
  console.log(3)
})

console.log(4)
```

执行结果是：1243  
promise构造函数是同步执行的，then方法是异步执行的


## 第 14 题：如何实现一个 new
```js
// 实现一个new
var Dog = function(name) {
  this.name = name
}
Dog.prototype.bark = function() {
  console.log('wangwang')
}
Dog.prototype.sayName = function() {
  console.log('my name is ' + this.name)
}
let sanmao = new Dog('三毛')
sanmao.sayName()
sanmao.bark()


// new 的作用
// 创建一个新对象obj
// 把obj的__proto__指向Dog.prototype 实现继承
// 执行构造函数，传递参数，改变this指向 Dog.call(obj, ...args)
// 最后把obj赋值给sanmao
var _new = function() {
  let constructor = Array.prototype.shift.call(arguments)
  let args = arguments
  const obj = new Object()
  obj.__proto__ = constructor.prototype
  constructor.call(obj, ...args)
  return obj
}
var simao = _new(Dog, 'simao')
simao.bark()
simao.sayName()
console.log(simao instanceof Dog) // true
```

这样写是不是简单点
```js
function _new(fn, ...arg) {
    const obj = Object.create(fn.prototype);
    const ret = fn.apply(obj, arg);
    return ret instanceof Object ? ret : obj;
}
```


## 第 15 题：简单讲解一下http2的多路复用
HTTP2采用二进制格式传输，取代了HTTP1.x的文本格式，二进制格式解析更高效。

多路复用代替了HTTP1.x的序列和阻塞机制，所有的相同域名请求都通过同一个TCP连接并发完成。在HTTP1.x中，并发多个请求需要多个TCP连接，浏览器为了控制资源会有6-8个TCP连接都限制。

HTTP2中
- 同域名下所有通信都在单个连接上完成，消除了因多个 TCP 连接而带来的延时和内存消耗。
- 单个连接上可以并行交错的请求和响应，之间互不干扰

<br /><br />
在 HTTP/1 中，每次请求都会建立一次HTTP连接，也就是我们常说的3次握手4次挥手，这个过程在一次请求过程中占用了相当长的时间，即使开启了 Keep-Alive ，解决了多次连接的问题，但是依然有两个效率上的问题：

第一个：串行的文件传输。当请求a文件时，b文件只能等待，等待a连接到服务器、服务器处理文件、服务器返回文件，这三个步骤。我们假设这三步用时都是1秒，那么a文件用时为3秒，b文件传输完成用时为6秒，依此类推。（注：此项计算有一个前提条件，就是浏览器和服务器是单通道传输）

第二个：连接数过多。我们假设Apache设置了最大并发数为300，因为浏览器限制，浏览器发起的最大请求数为6，也就是服务器能承载的最高并发为50，当第51个人访问时，就需要等待前面某个请求处理完成。

HTTP/2的多路复用就是为了解决上述的两个性能问题。

在 HTTP/2 中，有两个非常重要的概念，分别是帧（frame）和流（stream）。   
帧代表着最小的数据单位，每个帧会标识出该帧属于哪个流，流也就是多个帧组成的数据流。   
多路复用，就是在一个 TCP 连接中可以存在多条流。换句话说，也就是可以发送多个请求，对端可以通过帧中的标识知道属于哪个请求。通过这个技术，可以避免 HTTP 旧版本中的队头阻塞问题，极大的提高传输性能。


## 第 16 题：谈谈你对TCP三次握手和四次挥手的理解
```js
男：我要挂了哦
女：等哈，我还要敷面膜
女：我敷完了，现在可以挂了
男：我舍不得挂，你挂吧
女：好吧，我挂了
男：等了2MSL听见嘟嘟嘟的声音后挂断
```

TCP三次握手：
1. 客户端发送syn包到服务器，等待服务器确认接收。
2. 服务器确认接收syn包并确认客户的syn，并发送回来一个syn+ack的包给客户端。
3. 客户端确认接收服务器的syn+ack包，并向服务器发送确认包ack，二者相互建立联系后，完成tcp三次握手。
4. 四次握手就是中间多了一层 等待服务器再一次响应回复相关数据的过程

<br />
<br />

- MSL   

> Maximum Segment Lifetime，译为“报文最大生存时间”。RFC 793中规定MSL为2分钟，实际应用中常用的是30秒，1分钟和2分钟等

- 为什么是2MSL  
`2MSL`即两倍的`MSL`，TCP的`TIME_WAIT`状态也称为2MSL等待状态。

当TCP的一端发起主动关闭，在发出最后一个ACK包后，即第3次握手完成后发送了第四次握手的ACK包后就进入了TIME_WAIT状态，必须在此状态上停留两倍的MSL时间。

等待2MSL时间主要目的是怕最后一个ACK包对方没收到，那么对方在超时后将重发第三次握手的FIN包，主动关闭端接到重发的FIN包后可以再发一个ACK应答包。

在TIME_WAIT状态时两端的端口不能使用，要等到2MSL时间结束才可继续使用。
当连接处于2MSL等待阶段时任何迟到的报文段都将被丢弃。不过在实际应用中可以通过设置SO_REUSEADDR选项达到不必等待2MSL时间结束再使用此端口。


## 第 17 题：A、B 机器正常连接后，B 机器突然重启，问 A 此时处于 TCP 什么状态 
### 问题定义
A -> B 发起TCP请求，A端为请求侧，B端为服务侧  
TCP 三次握手已完成   
TCP 三次握手后双方没有任何数据交互  
B 在无预警情况下掉线（类似意外掉电重启状态）

### 问题答案
**结论**   
A侧的TCP链路状态在未发送任何数据的情况下与等待的时间相关，如果在多个超时值范围以内那么状态为`<established>`;如果触发了某一个超时的情况那么视情况的不同会有不同的改变。

一般情况下不管是KeepAlive超时还是内核超时，只要出现超时，那么必然会抛出异常，只是这个异常截获的时机会因编码方式的差异而有所不同。（同步异步IO，以及有无使用select、poll、epoll等IO多路复用机制）

**原因与相关细节**  

**`<大前提>`**

基于IP网络的无状态特征，A侧系统不会在无动作情况下收到任何通知获知到B侧掉线的情况(除非AB是直连状态，那么A可以获知到自己网卡掉线的异常)

在此大前提的基础上，会因为链路环境、SOCKET设定、以及内核相关配置的不同，A侧会在不同的时机获知到B侧无响应的结果，但总归是以异常的形式获得这个结果。

**`<关于内核对待无数据传递SOCKET的方式>`**

操作系统有一堆时间超级长的兜底用timeout参数，用于在不同的时候给TCP栈一个异常退出的机会，避免无效连接过多而耗尽系统资源

其中，<TCP KeepAive>特性能让应用层配置一个远小于内核timeout参数的值，用于在这一堆时间超长的兜底参数生效之前，判断链路是否为有效状态。

**`<关于超时的各个节点>`**

**以下仅讨论三次握手成功之后的兜底情况**

TCP链路在建立之后，内核会初始化一个由`<nf_conntrack_tcp_timeout_established>`参数控制的计时器（这个计时器在Ubuntu 18.04里面长达5天），以防止在未开启TCP KeepAlive的情况下连接因各种原因导致的长时间无动作而过度消耗系统资源，这个计时器会在每次TCP链路活动后重置

TCP正常传输过程中，每一次数据发送之后，必然伴随对端的ACK确认信息。如果对端因为各种原因失去反应（网络链路中断、意外掉电等）这个ACK将永远不会到来，内核在每次发送之后都会重置一个由`<nf_conntrack_tcp_timeout_unacknowledged>`参数控制的计时器，以防止对端以外断网导致的资源过度消耗。（这个计时器在Ubuntu 18.04里面是300秒/5分钟）

以上两个计时器作为keepalive参数未指定情况下的兜底参数，为内核自保特性，所以事件都很长，建议实际开发与运维中用更为合理的参数覆盖这些数值

**`<关于链路异常后发生的操作>`**

A侧在超时退出之后一般会发送一个RST包用于告知对端重置链路，并给应用层一个异常的状态信息，视乎同步IO与异步IO的差异，这个异常获知的时机会有所不同。

B侧重启之后，因为不存有之前A-B之间建立链路相关的信息，这时候收到任何A侧来的数据都会以RST作为响应，以告知A侧链路发生异常

RST的设计用意在于链路发生意料之外的故障时告知链路上的各方释放资源（一般指的是NAT网关与收发两端）;FIN的设计是用于在链路正常情况下的正常单向终止与结束。二者不可混淆。

**`<关于阻塞>`**

应用层到底层网卡发送的过程中，数据包会经历多个缓冲区，也会经历一到多次的分片操作，阻塞这一结果的发生是具有从底向上传递的特性。

这一过程中有一个需要强调的关键点：socket.send这个操作只是把数据发送到了内核缓冲区，只要数据量不大那么这个调用必然是在拷贝完之后立即返回的。而数据量大的时候，必然会产生阻塞。

在TCP传输中，决定阻塞与否的最终节点，是TCP的可靠传输特性。此特性决定了必须要有ACK数据包回复响应正确接收的数据段范围，内核才会把对应的数据从TCP发送缓冲区中移除，腾出空间让新的数据可以写入进来。

这个过程意味着，只要应用层发送了大于内核缓冲区可容容纳的数据量，那么必然会在应用层出现阻塞，等待ACK的到来，然后把新数据压入缓冲队列，循环往复，直到数据发送完毕。


## 第 18 题：React 中 setState 什么时候是同步的，什么时候是异步的？
在React中，**如果是由React引发的事件处理（比如通过onClick引发的事件处理），调用setState不会同步更新this.state，除此之外的setState调用会同步执行this.state。**  
所谓“除此之外”，指的是绕过React通过addEventListener直接添加的事件处理函数，还有通过setTimeout/setInterval产生的异步调用。

**原因:** 在React的setState函数实现中，会根据一个变量isBatchingUpdates判断是直接更新this.state还是放到队列中回头再说，而isBatchingUpdates默认是false，也就表示setState会同步更新this.state，但是，**有一个函数batchedUpdates，这个函数会把isBatchingUpdates修改为true，而当React在调用事件处理函数之前就会调用这个batchedUpdates，造成的后果，就是由React控制的事件处理过程setState不会同步更新this.state**。


## 第 19 题：React setState 笔试题，下面的代码输出什么？
```js
class Example extends React.Component {
  constructor() {
    super();
    this.state = {
      val: 0
    };
  }
  
  componentDidMount() {
    this.setState({val: this.state.val + 1});
    console.log(this.state.val);    // 第 1 次 log

    this.setState({val: this.state.val + 1});
    console.log(this.state.val);    // 第 2 次 log

    setTimeout(() => {
      this.setState({val: this.state.val + 1});
      console.log(this.state.val);  // 第 3 次 log

      this.setState({val: this.state.val + 1});
      console.log(this.state.val);  // 第 4 次 log
    }, 0);
  }

  render() {
    return null;
  }
};
```

1. 第一次和第二次都是在 react 自身生命周期内，触发时 `isBatchingUpdates` 为 true，所以并不会直接执行更新 state，而是加入了 `dirtyComponents`，所以打印时获取的都是更新前的状态 0。

2. 两次 setState 时，获取到 this.state.val 都是 0，所以执行时都是将 0 设置成 1，在 react 内部会被合并掉，只执行一次。设置完成后 state.val 值为 1。

3. setTimeout 中的代码，触发时 `isBatchingUpdates` 为 false，所以能够直接进行更新，所以连着输出 2，3。

输出： 0 0 2 3


## 第 20 题：介绍下 npm 模块安装机制，为什么输入 npm install 就可以自动安装对应的模块？
### 1. npm 模块安装机制：
- 发出`npm install`命令
- 查询node_modules目录之中是否已经存在指定模块
  - 若存在，不再重新安装
  - 若不存在
    - npm 向 registry 查询模块压缩包的网址
    - 下载压缩包，存放在根目录下的`.npm`目录里
    - 解压压缩包到当前项目的`node_modules`目录

### 2. npm 实现原理
输入 npm install 命令并敲下回车后，会经历如下几个阶段（以 npm 5.5.1 为例）：
1. 执行工程自身 preinstall  
  当前 npm 工程如果定义了 preinstall 钩子此时会被执行。
2. 确定首层依赖模块
  首先需要做的是确定工程中的首层依赖，也就是 dependencies 和 devDependencies 属性中直接指定的模块（假设此时没有添加 npm install 参数）。  
  工程本身是整棵依赖树的根节点，每个首层依赖模块都是根节点下面的一棵子树，npm 会开启多进程从每个首层依赖模块开始逐步寻找更深层级的节点。
3. 获取模块
  获取模块是一个递归的过程，分为以下几步：
  - 获取模块信息。在下载一个模块之前，首先要确定其版本，这是因为 package.json 中往往是 semantic version（semver，语义化版本）。此时如果版本描述文件（npm-shrinkwrap.json 或 package-lock.json）中有该模块信息直接拿即可，如果没有则从仓库获取。如 packaeg.json 中某个包的版本是 ^1.1.0，npm 就会去仓库中获取符合 1.x.x 形式的最新版本。
  - 获取模块实体。上一步会获取到模块的压缩包地址（resolved 字段），npm 会用此地址检查本地缓存，缓存中有就直接拿，如果没有则从仓库下载。
  - 查找该模块依赖，如果有依赖则回到第1步，如果没有则停止。
4. 模块扁平化（dedupe）
    上一步获取到的是一棵完整的依赖树，其中可能包含大量重复模块。比如 A 模块依赖于 loadsh，B 模块同样依赖于 lodash。在 npm3 以前会严格按照依赖树的结构进行安装，因此会造成模块冗余。  

    从 npm3 开始默认加入了一个 dedupe 的过程。它会遍历所有节点，逐个将模块放在根节点下面，也就是 node-modules 的第一层。当发现有重复模块时，则将其丢弃。

    这里需要对重复模块进行一个定义，它指的是模块名相同且 semver 兼容。每个 semver 都对应一段版本允许范围，如果两个模块的版本允许范围存在交集，那么就可以得到一个兼容版本，而不必版本号完全一致，这可以使更多冗余模块在 dedupe 过程中被去掉。  

    比如 node-modules 下 foo 模块依赖 lodash@^1.0.0，bar 模块依赖 lodash@^1.1.0，则 ^1.1.0 为兼容版本。 
    
    而当 foo 依赖 lodash@^2.0.0，bar 依赖 lodash@^1.1.0，则依据 semver 的规则，二者不存在兼容版本。会将一个版本放在 node_modules 中，另一个仍保留在依赖树里。

    举个例子，假设一个依赖树原本是这样：
    node_modules
    -- foo
    ---- lodash@version1

    -- bar
    ---- lodash@version2

    假设 version1 和 version2 是兼容版本，则经过 dedupe 会成为下面的形式：
    node_modules
    -- foo

    -- bar

    -- lodash（保留的版本为兼容版本）

    假设 version1 和 version2 为非兼容版本，则后面的版本保留在依赖树中：

    node_modules
    -- foo
    -- lodash@version1

    -- bar
    ---- lodash@version2

5. 安装模块
  这一步将会更新工程中的 node_modules，并执行模块中的生命周期函数（按照 preinstall、install、postinstall 的顺序）。

6. 执行工程自身生命周期
    当前 npm 工程如果定义了钩子此时会被执行（按照 install、postinstall、prepublish、prepare 的顺序）。
  
    最后一步是生成或更新版本描述文件，npm install 过程完成。
