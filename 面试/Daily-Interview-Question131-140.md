Daily-Interview-Question 131-140
===

<!-- TOC -->

- [Daily-Interview-Question 131-140](#daily-interview-question-131-140)
  - [第 131 题：接口如何防刷](#第-131-题接口如何防刷)
  - [第 132 题：实现一个 Dialog 类，Dialog可以创建 dialog 对话框，对话框支持可拖拽](#第-132-题实现一个-dialog-类dialog可以创建-dialog-对话框对话框支持可拖拽)
  - [第 133 题：用 setTimeout 实现 setInterval，阐述实现的效果与setInterval的差异](#第-133-题用-settimeout-实现-setinterval阐述实现的效果与setinterval的差异)
  - [第 134 题：求两个日期中间的有效日期](#第-134-题求两个日期中间的有效日期)
  - [第 135 题：算法题](#第-135-题算法题)
  - [第 136 题：如何实现骨架屏，说说你的思路](#第-136-题如何实现骨架屏说说你的思路)
  - [第 137 题：如何在 H5 和小程序项目中计算白屏时间和首屏时间，说说你的思路](#第-137-题如何在-h5-和小程序项目中计算白屏时间和首屏时间说说你的思路)
  - [第 138 题：反转链表，每 k 个节点反转一次，不足 k 就保持原有顺序](#第-138-题反转链表每-k-个节点反转一次不足-k-就保持原有顺序)

<!-- /TOC -->

## 第 131 题：接口如何防刷
1. referer校验
2. UA校验
3. 频率限制（1s内接口调用次数限制）
4. 把某个key加配料，带上时间戳，加密，请求时带上，过期或解密失败则403。
5. 总调用次数受限制。这个一般是在后端做限制，单位时间内最多可调用次数。
6. 同一客户端次数限制。这个前端的一般使用是给接口调用加锁，在返回结果或者一定时间之后解锁。
7. 网关控制流量洪峰，对在一个时间段内出现流量异常，可以拒绝请求
8. 源ip请求个数限制。对请求来源的ip请求个数做限制
9. http请求头信息校验；（例如host，User-Agent，Referer）
10. 对用户唯一身份uid进行限制和校验。例如基本的长度，组合方式，甚至有效性进行判断。或者uid具有一定的时效性
11. 前后端协议采用二进制方式进行交互或者协议采用签名机制
12. 人机验证，验证码，短信验证码，滑动图片形式，12306形式


## 第 132 题：实现一个 Dialog 类，Dialog可以创建 dialog 对话框，对话框支持可拖拽 
```js
class Dialog {
  constructor(text) {
    this.lastX = 0
    this.lastY = 0
    this.x
    this.y
    this.text = text || ''
    this.isMoving = false
    this.dialog
  }
  open() {
    const model = document.createElement('div')
    model.id = 'model'
    model.style = `
    position:absolute;
    top:0;
    left:0;
    bottom:0;
    right:0;
    background-color:rgba(0,0,0,.3);
    display:flex;
    justify-content: center;
    align-items: center;`
    model.addEventListener('click', this.close.bind(this))
    document.body.appendChild(model)
    this.dialog = document.createElement('div')
    this.dialog.style = `
    padding:20px;
    background-color:white`
    this.dialog.innerText = this.text
    this.dialog.addEventListener('click', e => {
      e.stopPropagation()
    })
    this.dialog.addEventListener('mousedown', this.handleMousedown.bind(this))
    document.addEventListener('mousemove', this.handleMousemove.bind(this))
    document.addEventListener('mouseup', this.handleMouseup.bind(this))
    model.appendChild(this.dialog)
  }
  close() {
    this.dialog.removeEventListener('mousedown', this.handleMousedown)
    document.removeEventListener('mousemove', this.handleMousemove)
    document.removeEventListener('mouseup', this.handleMouseup)
    document.body.removeChild(document.querySelector('#model'))
  }
  handleMousedown(e) {
    this.isMoving = true
    this.x = e.clientX
    this.y = e.clientY
  }
  handleMousemove(e) {
    if (this.isMoving) {
      this.dialog.style.transform = `translate(${e.clientX - this.x + this.lastX}px,${e.clientY - this.y + this.lastY}px)`
    }
  }
  handleMouseup(e) {
    this.lastX = e.clientX - this.x + this.lastX
    this.lastY = e.clientY - this.y + this.lastY
    this.isMoving = false
  }
}
let dialog = new Dialog('Hello')
dialog.open()
```


## 第 133 题：用 setTimeout 实现 setInterval，阐述实现的效果与setInterval的差异
```js
function mySetInterval() {
  mySetInterval.timer = setTimeout(() => {
      arguments[0]()
      mySetInterval(...arguments)
  }, arguments[1])
}

mySetInterval.clear = function() {
  clearTimeout(mySetInterval.timer)
}

mySetInterval(() => {
  console.log(11111)
}, 1000)

setTimeout(() => {
  // 5s 后清理
  mySetInterval.clear()
}, 5000)
```


## 第 134 题：求两个日期中间的有效日期
```js
function rangeDate(startDate, endDate) {
    let start_ = new Date(startDate).getTime();
    let end_ = new Date(endDate).getTime();
    let day = 24 * 60 * 60 * 1000;
    let arr = [];
    for (let i = start_; i <= end_; i += day) {
        arr.push(i);
    }
    return arr.map(item => {
        let date = new Date(item);
        let year = date.getFullYear();
        let month = (date.getMonth() + 1);
        let day = date.getDate();
        return `${year}-${month}-${day}`;
    });
}

console.log(rangeDate("2019-9-1", "2019-9-10"));
// ["2019-9-1", "2019-9-2", "2019-9-3", "2019-9-4", "2019-9-5", "2019-9-6", "2019-9-7", "2019-9-8", "2019-9-9", "2019-9-10"]
```

```js
function getAllDays(from, to) {
  const res = [];
  let current = Date.parse(from);
  const toTimeStamp = Date.parse(to);
  while((current += 86400000) <= toTimeStamp) {
    res.push(new Date(current).toISOString().split('T')[0]);
  }
  return res;
}
console.log(getAllDays("2019-9-1", "2019-9-10"));
```


## 第 135 题：算法题
在一个字符串数组中有红、黄、蓝三种颜色的球，且个数不相等、顺序不一致，请为该数组排序。使得排序后数组中球的顺序为:黄、红、蓝。

例如：红蓝蓝黄红黄蓝红红黄红，排序后为：黄黄黄红红红红红蓝蓝蓝。

```js
function sortBalls(str) {
  let arr = str.split('')
  arr.sort((a, b) => {
    return getNumByType(a) - getNumByType(b)
  })

  return arr.join('')

  function getNumByType(type) {
    switch (type) {
      case '黄':
        return 1
      case '红':
        return 2
      default:
        return 3
    }
  }
}
```

```js
const strList = '红蓝蓝黄红黄蓝红红黄红'
const sortRules = {'黄': 0, '红': 1, '蓝': 2,}
const list = [[],[],[]]
strList.split('').forEach(item => {list[sortRules[item]].push(item)})
list.reduce((pre, cur) => pre += cur.join(''), '')
//黄黄黄红红红红红蓝蓝蓝
```


## 第 136 题：如何实现骨架屏，说说你的思路
1.指令：  
首先要有骨架效果的dom必须要有初始的width,height  
在刚插入的钩子函数里面去获取dom，设置css渐变动画。  
在有数据进来时，在update的钩子函数里面去删除骨骼动画。  


Puppeteer API 是分层次的，反映了浏览器结构。说实话，这是我第一次接触这个 Node 库，刚上手安装的时候就遇到了不少坑，哈哈哈哈哈哈，尴尬。

骨架屏的开发基本上就是基于这个node库开始的。接下来我们来解析一下基础代码

skeleton.js
```js
const puppeteer = require('puppeteer')
const devices = require('puppeteer/DeviceDescriptors') //puppeteer 提供了一些设备的参数选项
const { sleep , genScriptContent } = require('./util/utils') //公共工具方法
const scriptFns = require('./util/browserUtils')

const skeleton = async function(url, option = {}) {

  const defaultOption = {
    device: 'iPhone 6'
  }

  const { 
    device, 
    defer = 0, //延迟的时间
    remove = [], //页面想要移除的class类名数组
    excludes = [], //页面想要不包括的class类名数组
    hide= [],//页面想要隐藏的class类名数组
    launch: launchOpt
 } = Object.assign({}, defaultOption, option)

  // 当 Puppeteer 连接到一个 Chromium 实例的时候会通过 puppeteer.launch 或 puppeteer.connect 创建一个 Browser 对象。
  // 返回一个新的 [Page] 对象。[Page] 在一个默认的浏览器上下文中被创建。
  const browser = await puppeteer.launch(launchOpt) 

  const page = await browser.newPage() //新建一个页面

  /**
   * 根据指定的参数和 user agent 生成模拟器。此方法是和下面两个方法效果相同
   * @param { options }
   * viewport <[Object]>
        width <[number]> 页面的宽度，单位像素.
        height <[number]> 页面的高度，单位像素.
        deviceScaleFactor <[number]> 定义设备缩放， (类似于 dpr). 默认 1。
        isMobile <[boolean]> 要不要包含meta viewport 标签. 默认 false。
        hasTouch<[boolean]> 指定终端是否支持触摸。默认 false
        isLandscape <[boolean]> 指定终端是不是 landscape 模式. 默认 false。
      userAgent <[string]>
   * 
   */
  await page.emulate(devices[device])
  
  await page.goto(url)

  // 将一些 utils 插入到打开的页面执行环境中,这里会引入如何判断图片，文字的方法，将他们覆盖成灰色，也是骨架图中必不可缺的代买
  await page.addScriptTag({
    content: genScriptContent(...scriptFns)
  })

/**
还应注意一点，defer 配置，用于告诉 Puppeteer 打开页面后需等待的时间，这是因为，在打开开发中页面后，页面中有些内容还未真正加载完成，如果在这之前进行骨架页面生成，很有可能导致最终生成的骨架页面和真实页面不符。使得生成骨架页面失败。
**/
  await sleep(defer)
/**
 * page.evaluate(pageFunction, ...args)
 * pageFunction <[function]|[string]> 要在页面实例上下文中执行的方法
    ...args <...[Serializable]|[JSHandle]> 要传给 pageFunction 的参数
    返回: <[Promise]<[Serializable]>> pageFunction执行的结果
 */
  const html = await page.evaluate(async ( remove, excludes, hide ) => { 
    const $ = document.querySelectorAll.bind(document)

    if (remove.length) { 
      const removeEle = $(remove.join(','))
      Array.from(removeEle).forEach(ele => ele.parentNode.removeChild(ele))
    }

    if (hide.length) {
      const hideEle = $(hide.join(','))
      Array.from(hideEle).forEach(ele => ele.style.opacity = 0)
    }

    const excludesEle = excludes.length ? Array.from($(excludes.join(','))) : []

    await traverse(document.documentElement, excludesEle)

    return document.documentElement.outerHTML

  }, remove, excludes,hide)

  // browser.close()

  return { html }
}

module.exports = skeleton
```


## 第 137 题：如何在 H5 和小程序项目中计算白屏时间和首屏时间，说说你的思路
白屏时间=页面开始展示的时间点-开始请求时间点。

开始请求时间点可以通过Performance Timing.navigation Start 。那么页面开始展示的时间点怎么获取呢。已经知道渲染过程是逐步完成的，而且页面解析是按照文档流从上至下解析的，因此一般认为开始解析body的时间点就是页面开始展示的时间。所以可以通过在head标签的末尾插入script来统计时间节点作为页面开始展示时间节点。但是这种方式需要打点，因此也有很多项目为了简化白屏时间的获取会选择忽略head解析时间直接用Performance Timing.dom Loading 来表示页面开始展示的时间，即使用domloading-navigation Start来表示白屏时间。

首屏时间=首屏内容渲染结束时间点-开始请求时间点。

同样开始请求时间点可以通过Performance Timing.navigation Start获取。首屏内容渲染结束的时间点通常有以下几种方法获取：

（1）首屏模块标签标记法

适用于于首屏内容不需要通过拉取数据才能生存以及页面不考虑图片等资源加载的情况。通过在 HTML 文档中对应首屏内容的标签结束位置，使用内联的 JavaScript 代码记录当前时间戳作为首屏内容渲染结束的时间点。

（2）统计首屏内加载最慢的图片的时间

通常首屏内容加载最慢的就是图片资源，因此可以把首屏内加载最慢的图片加载完成的时间作为首屏时间。由于浏览器对每个页面的 TCP 连接数有限制，使得并不是所有图片都能立刻开始下载和显示。因此在 DOM树 构建完成后会通过遍历首屏内的所有图片标签，并且监听所有图片标签 onload 事件，最终遍历图片标签的加载时间获取最大值，将这个最大值作为首屏时间。

（3）自定义首屏内容计算法

由于统计首屏内图片完成加载的时间比较复杂。所以在项目中通常会通过自定义模块内容，来简化计算首屏时间。例如忽略图片等资源加载情况，只考虑页面主要 DOM；只考虑首屏的主要模块，而不是严格意义首屏线以上的所有内容。

可交互时间=用户可以正常进行事件输入时间点-开始请求时间点。

PerformanceTiming有一个domInteractive属性，代表了DOM结构结束解析的时间点，就是Document.ready State属性变为“interactive”


## 第 138 题：反转链表，每 k 个节点反转一次，不足 k 就保持原有顺序
> 例如  
> 链表： 1->2->3->4->5->6->7->8->null, k = 3   
> 那么 6->7->8， 3->4->5，1->2 各为一组， 
> 调整后： 1->2->5->4->3->8->7->6->null，其中1，2不调整，因为不够一组

```js
let a = {
  value: 1,
  next: {
    value: 2,
    next: {
      value: 3,
      next: {
        value: 4,
        next: {
          value: 5,
          next: {
            value: 6,
            next: {
              value: 7,
              next: {
                value: 8,
                next: {

                }
              }
            }
          }
        }
      }
    }
  }
}
```

```js
// 创建链表
function createLinkList(...args) {
  const res = {};
  let current = res;
  while (args.length) {
    current.value = args.shift();
    current.next = {};
    current = current.next;
  }
  return res;
}

function reverse(linklist, k) {
  const stack = [];
  let current = linklist;
  // 前面k个入栈
  while (current.next && stack.length + 1 <= k) {
    stack.push(current.value);
    current = current.next;
  }
  // 不足k不用反转
  if (stack.length < k) {
    return linklist;
  }
  // 出栈+拼接current节点再递归
  let temp = {};
  const ret = stack.reduceRight(
    (res, cur) => ((temp.value = cur), (temp = temp.next = {}), res),
    temp
  );
  current && current.next && Object.assign(temp, reverse(current, k));
  return ret;
}

reverse(createLinkList(1, 2, 3, 4, 5, 6, 7, 8), 3);
```

```js
/**
 * 反转链表，每 k 个节点反转一次，不足 k 就保持原有顺序
 */

interface ListItem {
  next: ListItem | null;
  value: any;
}

interface group {
  head: ListItem;
  tail: ListItem;
}

function reverseEveryKItems(head: ListItem, k: number): ListItem {
  let headTmp: ListItem = head;
  let groupHeads: Array<ListItem> = [];
  let count = 1;
  groupHeads.push(headTmp);

  // 对列表分组
  while (headTmp.next) {
    count = count + 1;
    if (count === k) {
      groupHeads.push(headTmp.next);
      count = 0;
    }
    headTmp = headTmp.next;
  }

  let lastGroupHead: ListItem;
  // 不满K个节点的不反转
  if (count !== 0) {
    lastGroupHead = groupHeads.pop();
  }

  // 每K个节点置换，保存head，tail
  const groups: Array<group> = groupHeads.map((groupHead) =>
    reverseGroupList(groupHead, k)
  );

  // 将每个反转后的组前尾后头连起来
  let reverseHead: ListItem = groups[0].head;
  for (let i = 1; i < groups.length; i++) {
    let preTail = groups[i - 1].tail;
    let curHead = groups[i].head;
    preTail.next = curHead;
  }

  groups[-1].tail.next = lastGroupHead || null;

  return reverseHead;
}

/* 每K个列表反转 */
function reverseGroupList(head: ListItem, k: number): group {
  let pre: ListItem = head;
  let cur: ListItem = head.next;

  while (cur && k--) {
    let next: ListItem = cur.next;
    cur.next = pre;
    pre = cur;
    cur = next;
  }

  return {
    head: cur,
    tail: head
  };
}
```

<br/>
<br/>

大致思路：
- 遍历链表，将每个元素添加到一个栈中
- 判断栈的长度，达到指定长度后，出栈，即可反转
- 若最后一次栈的长度没有达到指定长度，则将这个栈当作队列操作，直接出队

实现如下：
```js
class Node {
  constructor(value) {
    this.value = value;
    this.next = null;
  }

  print() {
    let pointer = this;
    let result = '';
    while(pointer) {
      result += pointer.value + '>';
      pointer = pointer.next;
    }
    console.log(result.substring(0, result.length - 1));
  }
}

function reverseLinkedListByk(linkedList, k) {
  if (!linkedList) {
    return null;
  }
  if (k < 1) {
    return linkedList;
  }
  const stack = [];
  let resultHead = null;
  let resultPointer = null;
  let traversePointer = linkedList;
  while(traversePointer) {
    const copy = traversePointer;
    traversePointer = traversePointer.next;
    copy.next = null;
    stack.push(copy);
    if (stack.length == k) {
      while(stack.length) {
        const node = stack.pop();
        if (!resultHead) {
          resultHead = resultPointer = node;
        } else {
          resultPointer.next = node;
          resultPointer = resultPointer.next;
        }
      }
    }
  }
  if (stack.length && stack.length < k) {
    while(stack.length) {
      const node = stack.shift()
      resultPointer.next = node;
      resultPointer = resultPointer.next;
    }
  }
  return resultHead;
}

const linkedList = new Node(5);
n1 = new Node(8);
n2 = new Node(3);
n3 = new Node(6);
n4 = new Node(9);
n5 = new Node(1);
n6 = new Node(10);
n7 = new Node(39);
linkedList.next = n1
n1.next = n2;
n2.next = n3;
n3.next = n4;
n4.next = n5;
n5.next = n6;
n6.next = n7;
linkedList.print();
console.log('----------');
let reversed = reverseLinkedListByk(linkedList, 3);
reversed.print();

// 5>8>3>6>9>1>10>39
// ----------
// 3>8>5>1>9>6>10>39
```
