Daily-Interview-Question 111-120
===
<!-- TOC -->

- [Daily-Interview-Question 111-120](#daily-interview-question-111-120)
  - [第 111 题：编程题，写个程序把 entry 转换成如下对象](#第-111-题编程题写个程序把-entry-转换成如下对象)
  - [第 112 题：编程题，写个程序把 entry 转换成如下对象（跟昨日题目相反）](#第-112-题编程题写个程序把-entry-转换成如下对象跟昨日题目相反)
  - [第 113 题：编程题，根据以下要求，写一个数组去重函数（蘑菇街）](#第-113-题编程题根据以下要求写一个数组去重函数蘑菇街)
  - [第 114 题：编程题，找出字符串中连续出现最多的字符和个数（蘑菇街）](#第-114-题编程题找出字符串中连续出现最多的字符和个数蘑菇街)
  - [第 115 题：写一个单向链数据结构的 js 实现并标注复杂度（水滴筹）](#第-115-题写一个单向链数据结构的-js-实现并标注复杂度水滴筹)
  - [第 116 题：输出以下代码运行结果](#第-116-题输出以下代码运行结果)
  - [第 117 题：介绍下 http1.0、1.1、2.0 协议的区别？](#第-117-题介绍下-http101120-协议的区别)
    - [HTTP/0.9](#http09)
    - [HTTP/1.0](#http10)
    - [HTTP/1.1](#http11)
    - [HTTP/2](#http2)
    - [帧、消息、流和TCP连接](#帧消息流和tcp连接)
    - [HPACK 算法](#hpack-算法)
    - [服务器推送](#服务器推送)
  - [第 118 题：vue 渲染大量数据时应该怎么优化？](#第-118-题vue-渲染大量数据时应该怎么优化)
  - [第 119 题：vue 如何优化首页的加载速度？vue 首页白屏是什么问题引起的？如何解决呢？](#第-119-题vue-如何优化首页的加载速度vue-首页白屏是什么问题引起的如何解决呢)
  - [第 120 题：为什么 for 循环嵌套顺序会影响性能？](#第-120-题为什么-for-循环嵌套顺序会影响性能)

<!-- /TOC -->

## 第 111 题：编程题，写个程序把 entry 转换成如下对象
```js
var entry = {
  a: {
    b: {
      c: {
        dd: 'abcdd'
      }
    },
    d: {
      xx: 'adxx'
    },
    e: 'ae'
  }
}

// 要求转换成如下对象
var output = {
  'a.b.c.dd': 'abcdd',
  'a.d.xx': 'adxx',
  'a.e': 'ae'
}
```

```js
function flatObj(obj, parentKey = "", result = {}) {
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      let keyName = `${parentKey}${key}`;
      if (typeof obj[key] === 'object')
        flatObj(obj[key], keyName+".", result)
      else
        result[keyName] = obj[key];
    }
  }
  return result;
}
```

```js
function loop(entry, key = '', result = {}) {
  const obj = Object.keys(entry);
  for (let i = 0; i < obj.length; i++) {
    const keyName = key + obj[i];
    if (typeof entry[obj[i]] === 'object') {
      this.loop(entry[obj[i]], `${keyName}.`, result);
    } else {
      result[keyName] = entry[obj[i]];
    }
  }
 return result;
}
```




## 第 112 题：编程题，写个程序把 entry 转换成如下对象（跟昨日题目相反）
```js
var entry = {
  'a.b.c.dd': 'abcdd',
  'a.d.xx': 'adxx',
  'a.e': 'ae'
}

// 要求转换成如下对象
var output = {
  a: {
    b: {
      c: {
        dd: 'abcdd'
      }
    },
    d: {
      xx: 'adxx'
    },
    e: 'ae'
  }
}
```

```js
var entry = {
	'a.b.c.dd': 'abcdd',
	'a.d.xx': 'adxx',
	'a.e': 'ae'
};

function map(entry) {
	const obj = Object.create(null);
	for (const key in entry) {
		const keymap = key.split('.');
		set(obj, keymap, entry[key]);
	}
	return obj;
}

function set(obj, map, val) {
	let tmp;
	if (!obj[map[0]]) obj[map[0]] = Object.create(null);
	tmp = obj[map[0]];
	for (let i = 1; i < map.length; i++) {
		if (!tmp[map[i]])
			tmp[map[i]] = map.length - 1 === i ? val : Object.create(null);
		tmp = tmp[map[i]];
	}
}
console.log(map(entry));
```

**实现思路**   
遍历对象，如果键名称含有 `.` 将最后一个子键拿出来，构成对象，如 `{'a.b.c.dd': 'abcdd'} `变为 `{'a.b.c': { dd: 'abcdd' }}` , 如果变换后的新父键名中仍还有点，递归进行以上操作即可。
```js
function nested(obj) {
    Object.keys(obj).map(k => {
        getNested(k);
    });

    return obj;

    function getNested(key) {
        const idx = key.lastIndexOf('.');
        const value = obj[key];
        if (idx !== -1) {
            delete obj[key];
            const mainKey = key.substring(0, idx);
            const subKey = key.substr(idx + 1);
            if (obj[mainKey] === undefined) {
                obj[mainKey] = { [subKey]: value };
            } else {
                obj[mainKey][subKey] = value;
            }
            if (/\./.test(mainKey)) {
                getNested(mainKey);
            }
        }
    }
}

console.log(JSON.stringify(nested(entry), 0, 2));
```



## 第 113 题：编程题，根据以下要求，写一个数组去重函数（蘑菇街）
> 1. 如传入的数组元素为[123, "meili", "123", "mogu", 123]，则输出：[123, "meili", "123", "mogu"]  
> 2. 如传入的数组元素为[123, [1, 2, 3], [1, "2", 3], [1, 2, 3], "meili"]，则输出：[123, [1, 2, 3], [1, "2", 3], "meili"]   
> 3. 如传入的数组元素为[123, {a: 1}, {a: {b: 1}}, {a: "1"}, {a: {b: 1}}, "meili"]，则输出：[123, {a: 1}, {a: {b: 1}}, {a: "1"}, "meili"]


没有考虑到数据类型为null,undefind等类型 包括数据为对象时key顺序不同的问题
```js
// 判断对象
function isObj(obj) {
  return Object.prototype.toString.call(obj) === '[object Object]'
}
// 对象重整 对key进行排序
function parseObj(obj) {
  let keys = Object.keys(obj).sort()
  let newObj = {}
  for (let key of keys) {
    // 不晓得有没有有必要，反正把value为obj的情况也处理一下 - -
    obj[key] = isObj(obj[key]) ? parseObj(obj[key]) : obj[key]
    newObj[key] = obj[key]
  }
  return newObj
}

// 最后
const arr = [1,'1',{a:1,b:"1"},{b:'1',a:1},{a:1,b:2},[1,2,3],null,undefined,undefined]

function passArr(arr) {
  return [...new Set(arr.map(item =>
    isObj(item) ? JSON.stringify(parseObj(item)) : (!item ? item : JSON.stringify(item))
  ))].map(item => !item ? item : JSON.parse(item))
}
```

```js
function unique(arr) {
	const result = [];
	const isArray = Array.isArray;
	for (let v of arr) {
		result.every(e => !equal(v, e)) && result.push(v);
	}
	return result;

	function equal(a, b) {
		if (a && b && typeof a === 'object' && typeof b === 'object') {
			return (
				isArray(a) === isArray(b) &&
				(isArray(a)
					? a.length === b.length && a.every((e, i) => equal(e, b[i]))
					: Object.keys(a).length === Object.keys(b).length &&
						Object.keys(a).every(k => equal(a[k], b[k])))
			);
		} else {
			return a === b;
		}
	}
}
```


## 第 114 题：编程题，找出字符串中连续出现最多的字符和个数（蘑菇街）
```js
'abcaakjbb' => {'a':2,'b':2}
'abbkejsbcccwqaa' => {'c':3}
```


```js
const arr = str.match(/(\w)\1*/g);
const maxLen = Math.max(...arr.map(s => s.length));
const result = arr.reduce((pre, curr) => {
  if (curr.length === maxLen) {
    pre[curr[0]] = curr.length;
  }
  return pre;
}, {});

console.log(result);
```




## 第 115 题：写一个单向链数据结构的 js 实现并标注复杂度（水滴筹）
```js
class LinkList {
  constructor() {
    this.head = null
  }

  find(value) {
    let curNode = this.head
    while (curNode.value !== value) {
      curNode = curNode.next
    }
    return curNode
  }

  findPrev(value) {
    let curNode = this.head
    while (curNode.next!==null && curNode.next.value !== value) {
      curNode = curNode.next
    }
    return curNode
  }

  insert(newValue, value) {
    const newNode = new Node(newValue)
    const curNode = this.find(value)
    newNode.next = curNode.next
    curNode.next = newNode
  }

  delete(value) {
    const preNode = this.findPrev(value)
    const curNode = preNode.next
    preNode.next = preNode.next.next
    return curNode
  }
}

class Node {
  constructor(value, next) {
    this.value = value
    this.next = null
  }
}
```




## 第 116 题：输出以下代码运行结果
```js
1 + "1"

2 * "2"

[1, 2] + [2, 1]

"a" + + "b"
```

```js
'11'
 4
'1,22,1'
'aNaN'

// [1, 2] + [2, 1]  
// Javascript中所有对象基本都是先调用valueOf方法，如果不是数值，再调用toString方法。
// 所以两个数组对象的toString方法相加，值为："1,22,1"

//"a" + + "b"其实可以理解为
//   + "b" -> NaN
//“a”+NaN
```

Javascript中所有对象基本都是先调用valueOf方法，如果不是数值，再调用toString方法。

所以两个数组对象的toString方法相加，值为："1,22,1"



## 第 117 题：介绍下 http1.0、1.1、2.0 协议的区别？
### HTTP/0.9
已过时。只接受GET一种请求方法，没有在通讯中指定版本号，且不支持请求头。由于该版本不支持POST方法，因此客户端无法向服务器传递太多信息。

### HTTP/1.0
这是第一个在通讯中指定版本号的HTTP协议版本，至今仍被广泛采用，特别是在代理服务器中。
- 构建可扩展性

### HTTP/1.1
持久连接被默认采用，并能很好地配合代理服务器工作。还支持以管道方式在同时发送多个请求，以便降低线路负载，提高传输速度。

HTTP/1.1相较于HTTP/1.0协议的区别主要体现在：
- 缓存处理
- 带宽优化及网络连接的使用
- 错误通知的管理
- 消息在网络中的发送
- 互联网地址的维护
- 安全性及完整性

**标准化的协议**
- 连接可以复用，允许在第一个应答被完全发送之前就发送第二个请求，以降低通信延迟。
- 增加流水线操作
- 支持响应分块
- 引入额外的缓存控制机制
- 引入内容协商机制，包括语言，编码，类型等，并允许客户端和服务器之间约定以最合适的内容进行交换
- 感谢Host头，能够使不同域名配置在同一个IP地址的服务器上

### HTTP/2
在 HTTP/2 的第一版草案（对 SPDY 协议的复刻）中，新增的性能改进不仅包括HTTP/1.1中已有的多路复用，修复队头阻塞问题，允许设置设定请求优先级，还包含了一个头部压缩算法(HPACK)[15][16]。此外， HTTP/2 采用了二进制而非明文来打包、传输客户端—服务器间的数据。[12]

- 加密传输层
- Server-sent events，服务器可以偶尔推送消息到浏览器
- WebSocket，一个新协议，可以通过升级现有 HTTP 协议来建立
- 多路复用，一个Tcp中多个http请求是并行的 (雪碧图、多域名散列等优化手段http/2中将变得多余)
- 二进制格式编码传输
- header压缩
- 服务端推送

### 帧、消息、流和TCP连接
有别于HTTP/1.1在连接中的明文请求，HTTP/2与SPDY一样，将一个TCP连接分为若干个流（Stream），每个流中可以传输若干消息（Message），每个消息由若干最小的二进制帧（Frame）组成。[12]这也是HTTP/1.1与HTTP/2最大的区别所在。 HTTP/2中，每个用户的操作行为被分配了一个流编号(stream ID)，这意味着用户与服务端之间创建了一个TCP通道；协议将每个请求分割为二进制的控制帧与数据帧部分，以便解析。这个举措在SPDY中的实践表明，相比HTTP/1.1，新页面加载可以加快11.81% 到 47.7%[17]


### HPACK 算法
HPACK算法是新引入HTTP/2的一个算法，用于对HTTP头部做压缩。其原理在于：

客户端与服务端根据 RFC 7541 的附录A，维护一份共同的静态字典（Static Table），其中包含了常见头部名及常见头部名称与值的组合的代码；
客户端和服务端根据先入先出的原则，维护一份可动态添加内容的共同动态字典（Dynamic Table）；
客户端和服务端根据 RFC 7541 的附录B，支持基于该静态哈夫曼码表的哈夫曼编码（Huffman Coding）。

### 服务器推送
网站为了使请求数减少，通常采用对页面上的图片、脚本进行极简化处理。但是，这一举措十分不方便，也不高效，依然需要诸多HTTP链接来加载页面和页面资源。

HTTP/2引入了服务器推送，即服务端向客户端发送比客户端请求更多的数据。这允许服务器直接提供浏览器渲染页面所需资源，而无须浏览器在收到、解析页面后再提起一轮请求，节约了加载时间。



## 第 118 题：vue 渲染大量数据时应该怎么优化？
1. 按需加载局部数据, 虚拟列表，无限下拉刷新
2. js运行异步处理:
    分割任务，实现时间切片处理, 类似react fiber, 每次执行记录时间, 超过一定执行时间则settimeout或requestAnimation推迟到下一个时间片,一般一个时间片为16ms
3. 大量纯展示的数据,不需要追踪变化的 用object.freeze冻结



## 第 119 题：vue 如何优化首页的加载速度？vue 首页白屏是什么问题引起的？如何解决呢？
首页白屏的原因：
- 单页面应用的 html 是靠 js 生成，因为首屏需要加载很大的js文件(app.js vendor.js)，所以当网速差的时候会产生一定程度的白屏

解决办法：
1. 优化 webpack 减少模块打包体积，code-split 按需加载
2. 服务端渲染，在服务端事先拼装好首页所需的 html
3. 首页加 loading 或 骨架屏 （仅仅是优化体验）
4. 处理加载的时间片，合理安排加载顺序，尽量不要有大面积空隙
5. CDN资源还是很重要的，最好分开，也能减少一些不必要的资源损耗
6. 使用Quicklink，在网速好的时候 可以帮助你预加载页面资源
7. 骨架屏这种的用户体验的东西一定要上，最好借助stream先将这部分输出给浏览器解析
8. 合理使用web worker优化一些计算
9. 缓存一定要使用，但是请注意合理使用
10. 大概就这么多，最后可以借助一些工具进行性能评测，重点调优，例如使用performance自己实现下等



## 第 120 题：为什么 for 循环嵌套顺序会影响性能？
```js
var t1 = new Date().getTime()
for (let i = 0; i < 100; i++) {
  for (let j = 0; j < 1000; j++) {
    for (let k = 0; k < 10000; k++) {
    }
  }
}
var t2 = new Date().getTime()
console.log('first time', t2 - t1)

for (let i = 0; i < 10000; i++) {
  for (let j = 0; j < 1000; j++) {
    for (let k = 0; k < 100; k++) {

    }
  }
}
var t3 = new Date().getTime()
console.log('two time', t3 - t2)
```

for循环中使用let，js引擎会为每一次循环初始化一个独立作用域和变量。

所以，第一种情况：    
i 初始化次数：100，j 初始化次数：100 * 1000，k 初始化次数：100 * 1000 * 10000

第二种情况：   
i 初始化次数：10000，j 初始化次数：10000 * 1000，k 初始化次数：10000 * 1000 * 100

通过比较可得   
第二种情况，需要初始化的次数较多，所以耗时较长。

