如何写出优雅耐看的JavaScript代码
===
<!-- TOC -->

- [前言](#前言)
- [变量](#变量)
  - [1、变量命名](#1变量命名)
  - [2、可描述](#2可描述)
  - [3、形参命名](#3形参命名)
  - [4、避免无意义的前缀](#4避免无意义的前缀)
  - [5、默认值](#5默认值)
- [函数](#函数)
  - [1、参数](#1参数)
  - [2、单一化处理](#2单一化处理)
  - [3、对象设置默认属性](#3对象设置默认属性)
  - [4、避免副作用](#4避免副作用)
  - [5、全局方法](#5全局方法)
  - [6、避免类型检查](#6避免类型检查)
- [复杂条件判断](#复杂条件判断)
  - [1、if/else](#1ifelse)
  - [2、switch/case](#2switchcase)
  - [3、存放到Object](#3存放到object)
  - [4、存放到Map](#4存放到map)
- [代码风格](#代码风格)
  - [常量大写](#常量大写)
  - [先声明后调用](#先声明后调用)

<!-- /TOC -->

## 前言
在我们平时的工作开发中，大多数都是大人协同开发的公共项目；在我们平时开发中代码codeing的时候我们考虑代码的`可读性`、`复用性`和`扩展性`。

干净的代码，既在质量上较为可靠，也为后期维护、升级奠定了良好基础。

我们从以下几个方面进行探讨：

## 变量
### 1、变量命名
一般我们在定义变量是要使用有意义的词汇命令，要做到见面知义
```js
//bad code
const yyyymmdstr = moment().format('YYYY/MM/DD');
//better code
const currentDate = moment().format('YYYY/MM/DD');
```

### 2、可描述
通过一个变量生成了一个新变量，也需要为这个新变量命名，也就是说每个变量当你看到他第一眼你就知道他是干什么的。

```js
//bad code
const ADDRESS = 'One Infinite Loop, Cupertino 95014';
const CITY_ZIP_CODE_REGEX = /^[^,\\]+[,\\\s]+(.+?)\s*(\d{5})?$/;
saveCityZipCode(ADDRESS.match(CITY_ZIP_CODE_REGEX)[1], ADDRESS.match(CITY_ZIP_CODE_REGEX)[2]);

//better code
const ADDRESS = 'One Infinite Loop, Cupertino 95014';
const CITY_ZIP_CODE_REGEX = /^[^,\\]+[,\\\s]+(.+?)\s*(\d{5})?$/;
const [, city, zipCode] = ADDRESS.match(CITY_ZIP_CODE_REGEX) || [];
saveCityZipCode(city, zipCode);
```

### 3、形参命名
在for、forEach、map的循环中我们在命名时要直接
```js
//bad code
const locations = ['Austin', 'New York', 'San Francisco'];
locations.map((l) => {
  doStuff();
  doSomeOtherStuff();
  // ...
  // ...
  // ...
  // 需要看其他代码才能确定 'l' 是干什么的。
  dispatch(l);
});

//better code
const locations = ['Austin', 'New York', 'San Francisco'];
locations.forEach((location) => {
  doStuff();
  doSomeOtherStuff();
  // ...
  // ...
  // ...
  dispatch(location);
});
```

### 4、避免无意义的前缀
例如我们只创建一个对象是，没有必要再把每个对象的属性上再加上对象名
```js
//bad code
const car = {
  carMake: 'Honda',
  carModel: 'Accord',
  carColor: 'Blue'
};

function paintCar(car) {
  car.carColor = 'Red';
}

//better code
const car = {
  make: 'Honda',
  model: 'Accord',
  color: 'Blue'
};

function paintCar(car) {
  car.color = 'Red';
}
```

### 5、默认值
```js
//bad code
function createMicrobrewery(name) {
  const breweryName = name || 'Hipster Brew Co.';
  // ...
}

//better code
function createMicrobrewery(name = 'Hipster Brew Co.') {
  // ...
}
```

## 函数
### 1、参数
一般参数多的话要使用ES6的解构传参的方式
```js
//bad code
function createMenu(title, body, buttonText, cancellable) {
  // ...
}

//better code
function createMenu({ title, body, buttonText, cancellable }) {
  // ...
}

//better code
createMenu({
  title: 'Foo',
  body: 'Bar',
  buttonText: 'Baz',
  cancellable: true
});
```

### 2、单一化处理
一个方法里面最好只做一件事，不要过多的处理，这样代码的可读性非常高
```js
//bad code
function emailClients(clients) {
  clients.forEach((client) => {
    const clientRecord = database.lookup(client);
    if (clientRecord.isActive()) {
      email(client);
    }
  });
}

//better code
function emailActiveClients(clients) {
  clients
    .filter(isActiveClient)
    .forEach(email);
}
function isActiveClient(client) {
  const clientRecord = database.lookup(client);    
  return clientRecord.isActive();
}
```

### 3、对象设置默认属性
```js
//bad code
const menuConfig = {
  title: null,
  body: 'Bar',
  buttonText: null,
  cancellable: true
};
function createMenu(config) {
  config.title = config.title || 'Foo';
  config.body = config.body || 'Bar';
  config.buttonText = config.buttonText || 'Baz';
  config.cancellable = config.cancellable !== undefined ? config.cancellable : true;
}
createMenu(menuConfig);


//better code
const menuConfig = {
  title: 'Order',
  // 'body' key 缺失
  buttonText: 'Send',
  cancellable: true
};

function createMenu(config) {
  config = Object.assign({
    title: 'Foo',
    body: 'Bar',
    buttonText: 'Baz',
    cancellable: true
  }, config);

  // config 就变成了: {title: "Order", body: "Bar", buttonText: "Send", cancellable: true}
  // ...
}

createMenu(menuConfig);
```

### 4、避免副作用
函数接收一个值返回一个新值，除此之外的行为我们都称之为副作用，比如修改全局变量、对文件进行 IO 操作等。

当函数确实需要副作用时，比如对文件进行 IO 操作时，请不要用多个函数/类进行文件操作，有且仅用一个函数/类来处理。也就是说副作用需要在唯一的地方处理。

副作用的三大天坑：随意修改可变数据类型、随意分享没有数据结构的状态、没有在统一地方处理副作用。

```js
//bad code
// 全局变量被一个函数引用
// 现在这个变量从字符串变成了数组，如果有其他的函数引用，会发生无法预见的错误。
var name = 'Ryan McDermott';
function splitIntoFirstAndLastName() {
  name = name.split(' ');
}
splitIntoFirstAndLastName();
console.log(name); // ['Ryan', 'McDermott'];


//better code
var name = 'Ryan McDermott';
var newName = splitIntoFirstAndLastName(name)

function splitIntoFirstAndLastName(name) {
  return name.split(' ');
}

console.log(name); // 'Ryan McDermott';
console.log(newName); // ['Ryan', 'McDermott'];
```

在 JavaScript 中，基本类型通过赋值传递，对象和数组通过引用传递。以引用传递为例：

假如我们写一个购物车，通过 `addItemToCart()`方法添加商品到购物车，修改 `购物车数组`。此时调用 `purchase()`方法购买，由于引用传递，获取的 `购物车数组`正好是最新的数据。

看起来没问题对不对？

如果当用户点击购买时，网络出现故障， `purchase()`方法一直在重复调用，与此同时用户又添加了新的商品，这时网络又恢复了。那么 `purchase()`方法获取到 `购物车数组`就是错误的。

为了避免这种问题，我们需要在每次新增商品时，克隆 `购物车数组`并返回新的数组。

```js
//bad code
const addItemToCart = (cart, item) => {
  cart.push({ item, date: Date.now() });
};

//better code
const addItemToCart = (cart, item) => {
  return [...cart, {item, date: Date.now()}]
};
```

### 5、全局方法
在 JavaScript 中，永远不要污染全局，会在生产环境中产生难以预料的 bug。举个例子，比如你在 `Array.prototype` 上新增一个 `diff` 方法来判断两个数组的不同。而你同事也打算做类似的事情，不过他的 `diff` 方法是用来判断两个数组首位元素的不同。很明显你们方法会产生冲突，遇到这类问题我们可以用 ES2015/ES6 的语法来对 `Array` 进行扩展。

```js
//bad code
Array.prototype.diff = function diff(comparisonArray) {
  const hash = new Set(comparisonArray);
  return this.filter(elem => !hash.has(elem));
};

//better code
class SuperArray extends Array {
  diff(comparisonArray) {
    const hash = new Set(comparisonArray);
    return this.filter(elem => !hash.has(elem));        
  }
}
```

### 6、避免类型检查
JavaScript 是无类型的，意味着你可以传任意类型参数，这种自由度很容易让人困扰，不自觉的就会去检查类型。仔细想想是你真的需要检查类型还是你的 API 设计有问题？
```js
//bad code
function travelToTexas(vehicle) {
  if (vehicle instanceof Bicycle) {
    vehicle.pedal(this.currentLocation, new Location('texas'));
  } else if (vehicle instanceof Car) {
    vehicle.drive(this.currentLocation, new Location('texas'));
  }
}

//better code
function travelToTexas(vehicle) {
  vehicle.move(this.currentLocation, new Location('texas'));
}
```

如果你需要做静态类型检查，比如字符串、整数等，推荐使用 TypeScript，不然你的代码会变得又臭又长。

```js
//bad code
function combine(val1, val2) {
  if (typeof val1 === 'number' && typeof val2 === 'number' ||
      typeof val1 === 'string' && typeof val2 === 'string') {
    return val1 + val2;
  }

  throw new Error('Must be of type String or Number');
}

//better code
function combine(val1, val2) {
  return val1 + val2;
}
```


## 复杂条件判断
我们编写js代码时经常遇到复杂逻辑判断的情况，通常大家可以用if/else或者switch来实现多个条件判断，但这样会有个问题，随着逻辑复杂度的增加，代码中的if/else/switch会变得越来越臃肿，越来越看不懂，那么如何更优雅的写判断逻辑

### 1、if/else
点击列表按钮事件
```js
/**
 * 按钮点击事件
 * @param {number} status 活动状态：1 开团进行中 2 开团失败 3 商品售罄 4 开团成功 5 系统取消
 */
const onButtonClick = (status)=>{
  if(status == 1){
    sendLog('processing')
    jumpTo('IndexPage')
  }else if(status == 2){
    sendLog('fail')
    jumpTo('FailPage')
  }else if(status == 3){
    sendLog('fail')
    jumpTo('FailPage')
  }else if(status == 4){
    sendLog('success')
    jumpTo('SuccessPage')
  }else if(status == 5){
    sendLog('cancel')
    jumpTo('CancelPage')
  }else {
    sendLog('other')
    jumpTo('Index')
  }
}
```

从上面我们可以看到的是通过不同的状态来做不同的事情，代码看起来非常不好看，大家可以很轻易的提出这段代码的改写方案，switch出场：

### 2、switch/case
```js
/**
 * 按钮点击事件
 * @param {number} status 活动状态：1 开团进行中 2 开团失败 3 商品售罄 4 开团成功 5 系统取消
 */
const onButtonClick = (status)=>{
  switch (status){
    case 1:
      sendLog('processing')
      jumpTo('IndexPage')
      break
    case 2:
    case 3:
      sendLog('fail')
      jumpTo('FailPage')
      break  
    case 4:
      sendLog('success')
      jumpTo('SuccessPage')
      break
    case 5:
      sendLog('cancel')
      jumpTo('CancelPage')
      break
    default:
      sendLog('other')
      jumpTo('Index')
      break
  }
}
```

这样看起来比if/else清晰多了，细心的同学也发现了小技巧，case 2和case 3逻辑一样的时候，可以省去执行语句和break，则case 2的情况自动执行case 3的逻辑。

### 3、存放到Object
将判断条件作为对象的属性名，将处理逻辑作为对象的属性值，在按钮点击的时候，通过对象属性查找的方式来进行逻辑判断，这种写法特别适合一元条件判断的情况。
```js
const actions = {
  '1': ['processing','IndexPage'],
  '2': ['fail','FailPage'],
  '3': ['fail','FailPage'],
  '4': ['success','SuccessPage'],
  '5': ['cancel','CancelPage'],
  'default': ['other','Index'],
}
/**
 * 按钮点击事件
 * @param {number} status 活动状态：1开团进行中 2开团失败 3 商品售罄 4 开团成功 5 系统取消
 */
const onButtonClick = (status)=>{
  let action = actions[status] || actions['default'],
      logName = action[0],
      pageName = action[1]
  sendLog(logName)
  jumpTo(pageName)
}
```

### 4、存放到Map
```js
const actions = new Map([
  [1, ['processing','IndexPage']],
  [2, ['fail','FailPage']],
  [3, ['fail','FailPage']],
  [4, ['success','SuccessPage']],
  [5, ['cancel','CancelPage']],
  ['default', ['other','Index']]
])
/**
 * 按钮点击事件
 * @param {number} status 活动状态：1 开团进行中 2 开团失败 3 商品售罄 4 开团成功 5 系统取消
 */
const onButtonClick = (status)=>{
  let action = actions.get(status) || actions.get('default')
  sendLog(action[0])
  jumpTo(action[1])
}
```

这样写用到了es6里的Map对象，是不是更爽了？Map对象和Object对象有什么区别呢？
1. 一个对象通常都有自己的原型，所以一个对象总有一个"prototype"键。
2. 一个对象的键只能是字符串或者Symbols，但一个Map的键可以是任意值。
3. 你可以通过size属性很容易地得到一个Map的键值对个数，而对象的键值对个数只能手动确认。


## 代码风格
### 常量大写
```js
//bad code
const DAYS_IN_WEEK = 7;
const daysInMonth = 30;

const songs = ['Back In Black', 'Stairway to Heaven', 'Hey Jude'];
const Artists = ['ACDC', 'Led Zeppelin', 'The Beatles'];

function eraseDatabase() {}
function restore_database() {}

class animal {}
class Alpaca {}

//better code
const DAYS_IN_WEEK = 7;
const DAYS_IN_MONTH = 30;

const SONGS = ['Back In Black', 'Stairway to Heaven', 'Hey Jude'];
const ARTISTS = ['ACDC', 'Led Zeppelin', 'The Beatles'];

function eraseDatabase() {}
function restoreDatabase() {}

class Animal {}
class Alpaca {}
```

### 先声明后调用
```js
//bad code
class PerformanceReview {
  constructor(employee) {
    this.employee = employee;
  }

  lookupPeers() {
    return db.lookup(this.employee, 'peers');
  }

  lookupManager() {
    return db.lookup(this.employee, 'manager');
  }

  getPeerReviews() {
    const peers = this.lookupPeers();
    // ...
  }

  perfReview() {
    this.getPeerReviews();
    this.getManagerReview();
    this.getSelfReview();
  }

  getManagerReview() {
    const manager = this.lookupManager();
  }

  getSelfReview() {
    // ...
  }
}

const review = new PerformanceReview(employee);
review.perfReview();

//better code
class PerformanceReview {
  constructor(employee) {
    this.employee = employee;
  }

  perfReview() {
    this.getPeerReviews();
    this.getManagerReview();
    this.getSelfReview();
  }

  getPeerReviews() {
    const peers = this.lookupPeers();
    // ...
  }

  lookupPeers() {
    return db.lookup(this.employee, 'peers');
  }

  getManagerReview() {
    const manager = this.lookupManager();
  }

  lookupManager() {
    return db.lookup(this.employee, 'manager');
  }

  getSelfReview() {
    // ...
  }
}

const review = new PerformanceReview(employee);
review.perfReview();
```
