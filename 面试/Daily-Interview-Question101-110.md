Daily-Interview-Question 101-110
===
<!-- TOC -->

- [第 101 题：修改以下 print 函数，使之输出 0 到 99，或者 99 到 0](#第-101-题修改以下-print-函数使之输出-0-到-99或者-99-到-0)
- [第 102 题：不用加减乘除运算符，求整数的7倍](#第-102-题不用加减乘除运算符求整数的7倍)
- [第 103 题：模拟实现一个 localStorage](#第-103-题模拟实现一个-localstorage)
- [第 104 题：模拟 localStorage 时如何实现过期时间功能](#第-104-题模拟-localstorage-时如何实现过期时间功能)
- [第 105 题：编程题](#第-105-题编程题)
- [第 106 题：分别写出如下代码的返回值](#第-106-题分别写出如下代码的返回值)
- [第 107 题：考虑到性能问题，如何快速从一个巨大的数组中随机获取部分元素。](#第-107-题考虑到性能问题如何快速从一个巨大的数组中随机获取部分元素)
- [第 108 题：请写出如下代码的打印结果](#第-108-题请写出如下代码的打印结果)
- [第 109 题：扩展题，请写出如下代码的打印结果](#第-109-题扩展题请写出如下代码的打印结果)
- [第 110 题：编程题，请写一个函数，完成以下功能](#第-110-题编程题请写一个函数完成以下功能)

<!-- /TOC -->

## 第 101 题：修改以下 print 函数，使之输出 0 到 99，或者 99 到 0
要求：
1. 只能修改 `setTimeout` 到 `Math.floor(Math.random() * 1000` 的代码
2. 不能修改 `Math.floor(Math.random() * 1000`
3. 不能使用全局变量

```js
function print(n) {
  setTimeout(() => {
    console.log(n);
  }, Math.floor(Math.random() * 1000));
}
for (var i = 0; i < 100; i++) {
  print(i);
}
```

```js
function print(n){
  setTimeout((() => {
    console.log(n)
    return ()=>{}
  }).call(n,[]), Math.floor(Math.random() * 1000));
}
for(var i = 0; i < 100; i++){
  print(i);
}
```

```js
function print(n){
  setTimeout(() => {
    console.log(n);
  }, 1, Math.floor(Math.random() * 1000));
}
for(var i = 0; i < 100; i++){
  print(i);
}
```


## 第 102 题：不用加减乘除运算符，求整数的7倍
可以使用三类方式：位运算加法、JS hack、进制转换。实现方式分别如下：
```js
/* -- 位运算 -- */

// 先定义位运算加法
function bitAdd(m, n){
    while(m){
        [m, n] = [(m & n) << 1, m ^ n];
    }
    return n;
}

// 位运算实现方式 1 - 循环累加7次
let multiply7_bo_1 = (num)=>
{
  let sum = 0,counter = new Array(7); // 得到 [empty × 7]
  while(counter.length){
    sum = bitAdd(sum, num);
    counter.shift();
  }
  return sum;
}

// 位运算实现方式 2 - 二进制进3位(乘以8)后，加自己的补码(乘以-1)
let multiply7_bo_2 = (num) => bitAdd(num << 3, -num) ;

/* -- JS hack -- */

// hack 方式 1 - 利用 Function 的构造器 & 乘号的字节码
let multiply7_hack_1 = (num) => 
    new Function(["return ",num,String.fromCharCode(42),"7"].join(""))();

// hack 方式 2 - 利用 eval 执行器 & 乘号的字节码
let multiply7_hack_2 = (num) => 
		eval([num,String.fromCharCode(42),"7"].join(""));

// hack 方式 3 - 利用 SetTimeout 的参数 & 乘号的字节码
setTimeout(["window.multiply7_hack_3=(num)=>(7",String.fromCharCode(42),"num)"].join(""))

/* -- 进制转换 -- */

// 进制转换方式 - 利用 toString 转为七进制整数；然后末尾补0(左移一位)后通过 parseInt 转回十进制
let multiply7_base7 = 
    (num)=>parseInt([num.toString(7),'0'].join(''),7);
```



## 第 103 题：模拟实现一个 localStorage
```js
const localStorageMock = (function() {
  let store = {}
  return {
    getItem: function(key) { return store[key] || null },
    setItem: function(key, value) { store[key] = value.toString() },
    removeItem: function(key) { delete store[key] },
    clear: function() { store = {} },
  }
})()

Object.defineProperty(window, 'localStorage2', {
  value: localStorageMock
})

localStorage2.setItem('test', 'test')
console.log(localStorage2.getItem("test"))  //test
localStorage2.removeItem('test')
console.log(localStorage2.getItem("test"))  //null
localStorage2.setItem('test', 'test')
localStorage2.clear()
console.log(localStorage2.getItem("test"))  //null
```

用 cookie 模拟 localStorage
```js
if (!window.localStorage) {
  window.localStorage = {
    getItem: function (sKey) {
      if (!sKey || !this.hasOwnProperty(sKey)) { return null; }
      return unescape(document.cookie.replace(new RegExp("(?:^|.*;\\s*)" + escape(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*((?:[^;](?!;))*[^;]?).*"), "$1"));
    },
    key: function (nKeyId) {
      return unescape(document.cookie.replace(/\s*\=(?:.(?!;))*$/, "").split(/\s*\=(?:[^;](?!;))*[^;]?;\s*/)[nKeyId]);
    },
    setItem: function (sKey, sValue) {
      if(!sKey) { return; }
      document.cookie = escape(sKey) + "=" + escape(sValue) + "; expires=Tue, 19 Jan 2038 03:14:07 GMT; path=/";
      this.length = document.cookie.match(/\=/g).length;
    },
    length: 0,
    removeItem: function (sKey) {
      if (!sKey || !this.hasOwnProperty(sKey)) { return; }
      document.cookie = escape(sKey) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
      this.length--;
    },
    hasOwnProperty: function (sKey) {
      return (new RegExp("(?:^|;\\s*)" + escape(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=")).test(document.cookie);
    }
  };
  window.localStorage.length = (document.cookie.match(/\=/g) || window.localStorage).length;
}
```



## 第 104 题：模拟 localStorage 时如何实现过期时间功能
扩展 localStorage 支持 expires
```js
(function () {
  var getItem = localStorage.getItem.bind(localStorage)
  var setItem = localStorage.setItem.bind(localStorage)
  var removeItem = localStorage.removeItem.bind(localStorage)
  localStorage.getItem = function (keyName) {
    var expires = getItem(keyName + '_expires')
    if (expires && new Date() > new Date(Number(expires))) {
      removeItem(keyName)
      removeItem(keyName + '_expires')
    }
    return getItem(keyName)
  }
  localStorage.setItem = function (keyName, keyValue, expires) {
    if (typeof expires !== 'undefined') {
      var expiresDate = new Date(expires).valueOf()
      setItem(keyName + '_expires', expiresDate)
    }
    return setItem(keyName, keyValue)
  }
})()
```

使用： 
```js
localStorage.setItem('key', 'value', new Date() + 10000) // 10 秒钟后过期
localStorage.getItem('key')
```



## 第 105 题：编程题
url有三种情况
```js
https://www.xx.cn/api?keyword=&level1=&local_batch_id=&elective=&local_province_id=33
https://www.xx.cn/api?keyword=&level1=&local_batch_id=&elective=800&local_province_id=33
https://www.xx.cn/api?keyword=&level1=&local_batch_id=&elective=800,700&local_province_id=33
```

匹配elective后的数字输出（写出你认为的最优解法）:
```js
[] || ['800'] || ['800','700']
```

解答：
```js
function getUrlValue(url){
    if(!url) return;
    let res = url.match(/(?<=elective=)(\d+(,\d+)*)/);
    return res ?res[0].split(',') : [];
}
```

other: 

思路：
1. 利用 a 标签过滤出 url 中的 search 参数，防止 url 中的其他不可控内容干扰，降低下一步中正则匹配的复杂度；
2. 构建正则表达式，来捕获分组；（形如：`/(?<=[?&]elective=)(\d*)(?:(?:[^&]{1})(\d+))*/`）
3. 将捕获到的分组数组进行过滤处理（去掉第 0 项和空值）。

上码
```js
var testUrls = [
  'https://www.xx.cn/api?keyword=&level1=&local_batch_id=&elective=&local_province_id=33',
  'https://www.xx.cn/api?keyword=&level1=&local_batch_id=&elective=800&local_province_id=33',
  'https://www.xx.cn/api?keyword=&level1=&local_batch_id=&elective=800,700&local_province_id=33',
  'a.com?hello=123|456&world=789'
];

function getSearchParams(url, key) {
  var link = document.createElement('a');
  link.href = url;
  var params = link.search;
  link = null;

  if (params) {
    var reg = new RegExp('(?<=[\?&]' + key + '=' + ')(\\d*)(?:(?:[^&]{1})(\\d+))*');
    var result = params.match(reg);

    // console.log(reg);
    
    return result.filter(function(s, index) {
      return index > 0 && s;
    });
  }

  return null;
}

console.log(getSearchParams(testUrls[0], 'elective'));  // []
console.log(getSearchParams(testUrls[1], 'elective'));  // ["800"]
console.log(getSearchParams(testUrls[2], 'elective'));  // ["800", "700"]
console.log(getSearchParams(testUrls[2], 'local_province_id'));  // ["33"]
console.log(getSearchParams(testUrls[3], 'hello'));  // ["123", "456"]
console.log(getSearchParams(testUrls[3], 'world'));  // ["789"]
```





## 第 106 题：分别写出如下代码的返回值
```js
String('11') == new String('11');
String('11') === new String('11');
```

Answer
```js
true
false
```

Analysis
```js
new String() 返回的是对象

== 的时候，实际运行的是
String('11') == new String('11').toString();

=== 不再赘述。
```


## 第 107 题：考虑到性能问题，如何快速从一个巨大的数组中随机获取部分元素。
> 比如有个数组有100K个元素，从中不重复随机选取10K个元素。

1. 快速生成一个巨大数组 使用`Array.from()`
2. 通过Set特性，存放随机数，这里需要注意的是，没有就add，有就递归，总之要保证遍历的每一项都要找到一个唯一随机值，如果有就跳过就不能保证最后能获取到10k个值。

```js
const randomNumHandle = (len, randomNum) => {
  // 快速生成一个有len个元素的巨大数组
  let originArr = Array.from({length: len}, (v, i) => i);
  let resultSet = new Set()

  // 快速选取randomNum个元素
  for(let i = 0; i < randomNum; i++) {
    addNum(resultSet, originArr)
  }

  function addNum () {
    let luckDog = Math.floor(Math.random() * (len - 1))

    if(!resultSet.has(originArr[luckDog])) {
      resultSet.add(originArr[luckDog])
    } else {
      addNum()
    }
  }

  return Array.from(resultSet)
}

// 比如有个数组有100K个元素，从中不重复随机选取10K个元素
console.log(randomNumHandle(100000, 10000))
```

```js
/* 洗牌算法：
    1.生成一个0 - arr.length 的随机数
    2.交换该随机数位置元素和数组的最后一个元素，并把该随机位置的元素放入结果数组
    3.生成一个0 - arr.length - 1 的随机数
    4.交换该随机数位置元素和数组的倒数第二个元素，并把该随机位置的元素放入结果数组
    依次类推，直至取完所需的10k个元素
*/

function shuffle(arr, size) {
    let result = []
    for (let i = 0; i < size; i++) {
        const randomIndex = Math.floor(Math.random() * (arr.length - i))
        const item = arr[randomIndex]
        result.push(item)
        arr[randomIndex] = arr[arr.length - 1 - i]
        arr[arr.length - 1 - i] = item
    }
    return result
}
```


按题意，应该是用洗牌算法 O(n)，  
做下改动，当n足够大时，需要用蓄水池算法
```js
function reservoir(n,m){
  // 假设数据为0~n-1,抽 m 个元素
  // 初始化池中数据为 0~m-1
  let ret = Array.from({length: m}, (v, i) => i);
  for(let i=m;i<n;i++){
    // 第i个元素有 m/i 概率替换ret中任一元素
   // 即 Math.random()*(i+1) <=m 表示命中
    if(Math.random()*(i+1)<=m){
      // 命中，选择ret一个元素进行替换
      let index = Math.floor(Math.random()*m)
      ret[index] = i
    }
  }
  return ret
}
```




## 第 108 题：请写出如下代码的打印结果
```js
var name = 'Tom';
(function() {
 if (typeof name == 'undefined') {
     var name = 'Jack';
     console.log('Goodbye ' + name);
 } else {
     console.log('Hello ' + name);
 }
})();
```

> Goodbye Jack

```js
// Hello Tom
var name = 'Tom';
(function() {
if (typeof name == 'undefined') {
        let name = 'Jack';
        console.log('Goodbye ' + name);
    } else {
        console.log('Hello ' + name);
    }
})();
```

## 第 109 题：扩展题，请写出如下代码的打印结果
```js
var name = 'Tom';
(function() {
 if (typeof name == 'undefined') {
     name = 'Jack';
     console.log('Goodbye ' + name);
 } else {
     console.log('Hello ' + name);
 }
})();
```

hello Tom
1. 首先在进入函数作用域当中，获取name属性
2. 在当前作用域没有找到name
3. 通过作用域链找到最外层，得到name属性
4. 执行else的内容，得到Hello Tom


## 第 110 题：编程题，请写一个函数，完成以下功能
> 输入 `'1, 2, 3, 5, 7, 8, 10'` 输出 `'1~3, 5, 7~8, 10'`

这道题的意思是：如果连续数字的话，就取连续的第一个数和最后一个数，中间用~隔开。如果不连续就用，隔开。

```js
const nums1 = [1, 2, 3, 5, 7, 8, 10];
function simplifyStr(num) {
  var result = [];
  var temp = num[0]
  num.forEach((value, index) => {
    if (value + 1 !== num[index + 1]) {
      if (temp !== value) {
        result.push(`${temp}~${value}`)
      } else {
        result.push(`${value}`)
      }
      temp = num[index + 1]
    }
  })
  return result;
}
console.log(simplifyStr(nums1).join(','))
```