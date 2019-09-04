Daily-Interview-Question 41-50
====
<!-- TOC -->

- [Daily-Interview-Question 41-50](#daily-interview-question-41-50)
  - [第 41 题：下面代码输出什么](#第-41-题下面代码输出什么)
  - [第 42 题：实现一个 sleep 函数](#第-42-题实现一个-sleep-函数)
  - [第 43 题：使用 sort() 对数组 [3, 15, 8, 29, 102, 22] 进行排序，输出结果](#第-43-题使用-sort-对数组-3-15-8-29-102-22-进行排序输出结果)
  - [第 44 题：介绍 HTTPS 握手过程](#第-44-题介绍-https-握手过程)
  - [第 45 题：HTTPS 握手过程中，客户端如何验证证书的合法性](#第-45-题https-握手过程中客户端如何验证证书的合法性)
  - [第 46 题：输出以下代码执行的结果并解释为什么](#第-46-题输出以下代码执行的结果并解释为什么)
  - [第 47 题：双向绑定和 vuex 是否冲突](#第-47-题双向绑定和-vuex-是否冲突)
  - [第 48 题：call 和 apply 的区别是什么，哪个性能更好一些](#第-48-题call-和-apply-的区别是什么哪个性能更好一些)
  - [第 49 题：为什么通常在发送数据埋点请求的时候使用的是 1x1 像素的透明 gif 图片？](#第-49-题为什么通常在发送数据埋点请求的时候使用的是-1x1-像素的透明-gif-图片)
  - [第 50 题：实现 (5).add(3).minus(2) 功能。](#第-50-题实现-5add3minus2-功能)

<!-- /TOC -->

## 第 41 题：下面代码输出什么
```js
var a = 10;
(function () {
    console.log(a)
    a = 5
    console.log(window.a)
    var a = 20;
    console.log(a)
})()
```

依次输出：undefined -> 10 -> 20

解析：

在立即执行函数中，var a = 20; 语句定义了一个局部变量 a，由于js的变量声明提升机制，局部变量a的声明会被提升至立即执行函数的函数体最上方，且由于这样的提升并不包括赋值，因此第一条打印语句会打印undefined，最后一条语句会打印20。

由于变量声明提升，a = 5; 这条语句执行时，局部的变量a已经声明，因此它产生的效果是对局部的变量a赋值，此时window.a 依旧是最开始赋值的10，

```js
var a = 10;
(function () {
    console.log(a); 
    a = 5;
    console.log(window.a);
    var a = 20;
    console.log(a); 
})();
//  ===
var a = 10;
(function () {
    var a;
    console.log(a); // undefined
    a = 5;
    console.log(window.a);  //  此时是window.a => 10
    a = 20;
    console.log(a); //  20
});
```



## 第 42 题：实现一个 sleep 函数
比如 sleep(1000) 意味着等待1000毫秒，可从 Promise、Generator、Async/Await 等角度实现

```js
const sleep = (time) => {
  return new Promise(resolve => setTimeout(resolve, time))
}

async function sleepAsync() {
  console.log('fuck the code')
  await sleep(1000)
  console.log('fuck the code again')
}

sleepAsync()
```

```js
//Promise
const sleep = time => {
  return new Promise(resolve => setTimeout(resolve,time))
}
sleep(1000).then(()=>{
  console.log(1)
})

//Generator
function* sleepGenerator(time) {
  yield new Promise(function(resolve,reject){
    setTimeout(resolve,time);
  })
}
sleepGenerator(1000).next().value.then(()=>{console.log(1)})

//async
function sleep(time) {
  return new Promise(resolve => setTimeout(resolve,time))
}
async function output() {
  let out = await sleep(1000);
  console.log(1);
  return out;
}
output();

//ES5
function sleep(callback,time) {
  if(typeof callback === 'function')
    setTimeout(callback,time)
}

function output(){
  console.log(1);
}
sleep(output,1000);
```


## 第 43 题：使用 sort() 对数组 [3, 15, 8, 29, 102, 22] 进行排序，输出结果
我的答案：

`[102, 15, 22, 29, 3, 8]`

解析：

根据MDN上对`Array.sort()`的解释，默认的排序方法会将数组元素转换为字符串，然后比较字符串中字符的UTF-16编码顺序来进行排序。所以'102' 会排在 '15' 前面。以下是MDN中的解释原文：

> The sort() method sorts the elements of an array in place and returns the array. The default sort order is built upon converting the elements into strings, then comparing their sequences of UTF-16 code units values.

[从Chrome源码看JS Array的实现](https://www.cnblogs.com/yincheng/p/chrome-js-array.html)

## 第 44 题：介绍 HTTPS 握手过程
1. clientHello
2. SeverHello
3. 客户端回应
4. 服务器的最后回应

other:
1. 客户端使用https的url访问web服务器,要求与服务器建立ssl连接
2. web服务器收到客户端请求后, 会将网站的证书(包含公钥)传送一份给客户端
3. 客户端收到网站证书后会检查证书的颁发机构以及过期时间, 如果没有问题就随机产生一个秘钥
4. 客户端利用公钥将会话秘钥加密, 并传送给服务端, 服务端利用自己的私钥解密出会话秘钥
5. 之后服务器与客户端使用秘钥加密传输

**握手阶段分成五步:**

第一步，爱丽丝给出协议版本号、一个客户端生成的随机数（Client random），以及客户端支持的加密方法。

第二步，鲍勃确认双方使用的加密方法，并给出数字证书、以及一个服务器生成的随机数（Server random）。

第三步，爱丽丝确认数字证书有效，然后生成一个新的随机数（Premaster secret），并使用数字证书中的公钥，加密这个随机数，发给鲍勃。

第四步，鲍勃使用自己的私钥，获取爱丽丝发来的随机数（即Premaster secret）。

第五步，爱丽丝和鲍勃根据约定的加密方法，使用前面的三个随机数，生成"对话密钥"（session key），用来加密接下来的整个对话过程。


## 第 45 题：HTTPS 握手过程中，客户端如何验证证书的合法性
1. 首先浏览器读取证书中的证书所有者、有效期等信息进行校验，校验证书的网站域名是否与证书颁发的域名一致，校验证书是否在有效期内
2. 浏览器开始查找操作系统中已内置的受信任的证书发布机构CA，与服务器发来的证书中的颁发者CA比对，用于校验证书是否为合法机构颁发
3. 如果找不到，浏览器就会报错，说明服务器发来的证书是不可信任的。
4. 如果找到，那么浏览器就会从操作系统中取出颁发者CA 的公钥(多数浏览器开发商发布
版本时，会事先在内部植入常用认证机关的公开密钥)，然后对服务器发来的证书里面的签名进行解密
5. 浏览器使用相同的hash算法计算出服务器发来的证书的hash值，将这个计算的hash值与证书中签名做对比
6. 对比结果一致，则证明服务器发来的证书合法，没有被冒充


## 第 46 题：输出以下代码执行的结果并解释为什么
```js
var obj = {
    '2': 3,
    '3': 4,
    'length': 2,
    'splice': Array.prototype.splice,
    'push': Array.prototype.push
}
obj.push(1)
obj.push(2)
console.log(obj)
```

`devtools` 判断类数组的方法：

```js
/**
  * @param {?Object} obj
  * @return {boolean}
  */
function isArrayLike(obj) {
   if (!obj || typeof obj !== 'object')
     return false;
   try {
     if (typeof obj.splice === 'function') {
       const len = obj.length;
       return typeof len === 'number' && (len >>> 0 === len && (len > 0 || 1 / len > 0));
     }
   } catch (e) {

   }
   return false;
}
```

判断的过程：
1. 存在且是对象
2. 对象上的 `splice` 属性是函数类型
3. 对象上有 `length` 属性且为正整数


```js
/** 
 * 1. 当一个对象拥有length属性，并且splice属性是个函数，对我们来说就可以看作是一个类数组
 * 2. 既然是类数组，对象的键就是数组的下标，对象的值就是数组当前下标的值
 * 3. 此时撇开length属性不管，这个类数组可以看作：[empty, empty, 3, 4]
 * 4. 当length属性起作用时，它将这个类数组的长度截断了，此时可以看作：[empty, empty]
 * 5. 之后这个类数组进行了两次push操作，结果可以看作：[empty, empty, 1, 2]
 * 6. 当然，这个类数组中还包含push和splice函数以及它的length，但并没有数组的其它方法，所以实 
 * 际上它只是一个对象而已
 */
let obj = {
    '2': 3,
    '3': 4,
    length: 2,
    splice: [].splice,
    push: [].push
};

obj.push(1);
obj.push(2);
console.log(obj); // [empty, empty, 1, 2]
console.log(Object.prototype.toString.call(obj)); // [object Object]
```

试了一下，**只要一个对象的 `length` 属性为`数字`，同时`splice`属性为`函数`时， 对象的函数输出结果就会变成 `伪数组`**。
```js
var obj1 = {
    length: 1,
    splice: function () {},
}; // Object [empty, splice: ƒ]

var obj2 = {
    length: '1',
    splice: function () {},
}; // {length: "1", splice: ƒ}

var obj3 = {
    length: 1,
    splice: {},
}; // {length: 1, splice: {…}}
```

## 第 47 题：双向绑定和 vuex 是否冲突
在严格模式下直接使用确实会有问题。

解决方案：
```js
computed: {
    message: {
        set (value) {
            this.$store.dispatch('updateMessage', value);
        },
        get () {
            return this.$store.state.obj.message
        }
    }
}
mutations: {
    UPDATE_MESSAGE (state, v) {
        state.obj.message = v;
    }
}
actions: {
    update_message ({ commit }, v) {
        commit('UPDATE_MESSAGE', v);
    }
}
```

## 第 48 题：call 和 apply 的区别是什么，哪个性能更好一些
1. Function.prototype.apply和Function.prototype.call 的作用是一样的，区别在于传入参数的不同；
2. 第一个参数都是，指定函数体内this的指向；
3. 第二个参数开始不同，apply是传入带下标的集合，数组或者类数组，apply把它传给函数作为参数，call从第二个开始传入的参数是不固定的，都会传给函数作为参数。
4. call比apply的性能要好，平常可以多用call, call传入参数的格式正是内部所需要的格式，[参考call和apply的性能对比](https://github.com/noneven/__/issues/6)

尤其是es6 引入了 Spread operator (延展操作符) 后，即使参数是数组，可以使用 call
```js
let params = [1,2,3,4]
xx.call(obj, ...params)
```


## 第 49 题：为什么通常在发送数据埋点请求的时候使用的是 1x1 像素的透明 gif 图片？
作用：工作中，用于前端监控，比如曝光等等，谷歌和百度的都是用的1x1 像素的透明 gif 图片；

why?
1. 没有跨域问题，一般这种上报数据，代码要写通用的；（排除ajax）
2. 不会阻塞页面加载，影响用户的体验，只要new Image对象就好了；（排除JS/CSS文件资源方式上报）
3. 在所有图片中，体积最小；（比较PNG/JPG）

补充:
1. 能够完成整个 HTTP 请求+响应（尽管不需要响应内容）
2. 触发 GET 请求之后不需要获取和处理数据、服务器也不需要发送数据
3. 跨域友好
4. 执行过程无阻塞
5. 相比 XMLHttpRequest 对象发送 GET 请求，性能上更好
6. GIF的最低合法体积最小（最小的BMP文件需要74个字节，PNG需要67个字节，而合法的GIF，只需要43个字节）
7. 图片请求不占用 Ajax 请求限额

```html
<script type="text/javascript">
 var thisPage = location.href;
 var referringPage = (document.referrer) ? document.referrer : "none";
 var beacon = new Image();
 beacon.src = "http://www.example.com/logger/beacon.gif?page=" + encodeURI(thisPage)
 + "&ref=" + encodeURI(referringPage);
</script>
```

英文术语叫：`image beacon`   
在Google 的 Make the Web Faster 的 #Track web traffic in the background 中有提到。

主要应用于只需要向服务器发送数据(日志数据)的场合，且无需服务器有消息体回应。比如收集访问者的统计信息。

一般做法是服务器用一个1x1的gif图片来作为响应，当然这有点浪费服务器资源。因此用header来响应比较合适，目前比较合适的做法是服务器发送"204 No Content"，即“服务器成功处理了请求，但不需要返回任何实体内容”。

另外该脚本的位置一般放在页面最后以免阻塞页面渲染,并且一般情况下也不需要append到DOM中。通过它的onerror和onload事件来检测发送状态。

```html
<script type="text/javascript">
 var thisPage = location.href;
 var referringPage = (document.referrer) ? document.referrer : "none";
 var beacon = new Image();
 beacon.src = "http://www.example.com/logger/beacon.gif?page=" + encodeURI(thisPage)
 + "&ref=" + encodeURI(referringPage);
</script>
```

这样做和ajax请求的区别在于：
1. 只能是get请求，因此可发送的数据量有限。
2. 只关心数据是否发送到服务器，服务器不需要做出消息体响应。并且一般客户端也不需要做出响应。
3. 实现了跨域。



## 第 50 题：实现 (5).add(3).minus(2) 功能。
> 例： 5 + 3 - 2，结果为 6

```js
Number.prototype.add = function(n) {
  return this.valueOf() + n;
};
Number.prototype.minus = function(n) {
  return this.valueOf() - n;
};
```

这个方法，可以扩展到数字字符串类型和排除 `NaN` 值

```js
Number.prototype.add = function (value) {
    let  number = parseFloat(value);
    if (typeof number !== 'number' || Number.isNaN(number)) {
        throw new Error('请输入数字或者数字字符串～');
    };
    return this + number;
};
Number.prototype.minus = function (value) {
    let  number = parseFloat(value);
    if (typeof number !== 'number' || Number.isNaN(number)) {
        throw new Error('请输入数字或者数字字符串～');
    }
    return this - number;
};
console.log((5).add(3).minus(2));
```

对于在 `Object` 上添加原型方法是不建议的，因为这个影响太大，会影响所有以 `Object` 构造的对象
