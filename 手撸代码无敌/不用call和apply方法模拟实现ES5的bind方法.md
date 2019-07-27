# 1. 不用call和apply方法模拟实现ES5的bind方法

<!-- TOC -->

- [1. 不用call和apply方法模拟实现ES5的bind方法](#1-不用call和apply方法模拟实现ES5的bind方法)
  - [1.1 什么是call和apply方法](#11-什么是call和apply方法)
    - [总结一句话介绍call和apply](#总结一句话介绍call和apply)
  - [1.2 分析call和apply的原理](#12-分析call和apply的原理)
  - [1.3 实现apply方法](#13-实现apply方法)
    - [1.3.1 模拟实现第一步](#131-模拟实现第一步)
    - [1.3.2 模拟实现第二步](#132-模拟实现第二步)
    - [1.3.3 模拟实现第三步](#133-模拟实现第三步)
    - [1.3.4 模拟实现第四步](#134-模拟实现第四步)
    - [1.3.5 模拟实现第五步](#135-模拟实现第五步)
  - [1.4 实现Call方法](#14-实现Call方法)
    - [call完整实现](#call完整实现)
  - [1.5 实现bind方法](#15-实现bind方法)
    - [1.5.1 bind语法：](#151-bind语法)
    - [1.5.2 用一句话总结bind的用法](#152-用一句话总结bind的用法)
    - [1.5.3 bind在实际中的应用](#153-bind在实际中的应用)
    - [1.5.4 bind初级实现](#154-bind初级实现)
      - [1.5.4.1 初级实现的加分项](#1541-初级实现的加分项)
      - [1.5.4.2 柯里化（curring）实现](#1542-柯里化curring实现)
      - [1.5.4.3 构造函数场景下的兼容](#1543-构造函数场景下的兼容)
      - [1.5.4.4 更严谨的做法](#1544-更严谨的做法)
  - [最终实现](#最终实现)
- [-------------](#-------------)
- [2. `apply 实现 bind`](#2-apply-实现-bind)
  - [2.1 简单实现](#21-简单实现)
  - [2.2 完整实现](#22-完整实现)
    - [说明](#说明)
  - [2.3 bind实现2](#23-bind实现2)
    - [2.3.1 [].shift.call(arguments) 的含义](#231-shiftcallarguments-的含义)
    - [2.3.2 返回函数](#232-返回函数)

<!-- /TOC -->

来自朋友去某信用卡管家的做的一道面试题，用原生JavaScript模拟ES5的`bind`方法，不准用`call`和`apply`方法。

简单粗暴地来说，call，apply，bind是用于绑定this指向的

## 1.1 什么是call和apply方法

我们单独看看ECMAScript规范对apply的定义，看个大概就行：

> Function.prototype.apply (thisArg, argArray) 

通过定义简单说一下call和apply方法，他们就是参数不同，作用基本相同
1. 每个函数都包含两个非继承而来的方法：apply()和call()。
2. 他们的用途相同，都是在特定的作用域中调用函数。
3. 接收参数方面不同，apply()接收两个参数，一个是函数运行的作用域(this)，另一个是参数数组。
4. call()方法第一个参数与apply()方法相同，但传递给函数的参数必须列举出来。

简单的demo
```js
var jawil = {
    name: "jawil",
    sayHello: function (age) {
         console.log("hello, i am ", this.name + " " + age + " years old");
     }
};

var  lulin = {
    name: "lulin",
};

jawil.sayHello(24);

// hello, i am jawil 24 years old
```

然后看看使用`apply`和`call`之后的输出：
```js
jawil.sayHello.call(lulin, 24);// hello, i am lulin 24 years old

jawil.sayHello.apply(lulin, [24]);// hello, i am lulin 24 years old
```

### 总结一句话介绍call和apply

* call()方法在使用一个指定的this值和若干个指定的参数值的前提下调用某个函数或方法。
* apply()方法在使用一个指定的this值和参数值必须是数组类型的前提下调用某个函数或方法。

## 1.2 分析call和apply的原理

<img align='center' src="https://github.com/Jingce-lu/mystudy/blob/more/assets/prototype.png"/>

注意红色框中的部分，f.call(o)其原理就是先通过 o.m = f 将 f作为o的某个临时属性m存储，然后执行m，执行完毕后将m属性删除。

`jawil.sayHello.call(lulin, 24)`执行的过程：
```js
// 第一步
lulin.fn = jawil.sayHello
// 第二步
lulin.fn()
// 第三步
delete lulin.fn
```

## 1.3 实现apply方法

### 1.3.1 模拟实现第一步

```js
// 第一版
Function.prototype.applyOne = function(context) {
    // 首先要获取调用call的函数，用this可以获取
    context.fn = this;
    context.fn();
    delete context.fn;
}

//简单写一个不带参数的demo
var jawil = {
    name: "jawil",
    sayHello: function (age) {
         console.log(this.name);
     }
};

var  lulin = {
    name: "lulin",
};

//看看结果：
jawil.sayHello.applyOne(lulin)//lulin
```

### 1.3.2 模拟实现第二步

最一开始也讲了，apply函数还能给定参数执行函数。举个例子：

```js
Function.prototype.applyTwo = function(context) {
    var args = arguments[1]; //获取传入的数组参数
    context.fn = this; //假想context对象预先不存在名为fn的属性
    var fnStr = 'context.fn(';
    for (var i = 0; i < args.length; i++) {
        fnStr += i == args.length - 1 ? args[i] : args[i] + ',';
    }
    fnStr += ')';//得到"context.fn(arg1,arg2,arg3...)"这个字符串在，最后用eval执行
    eval(fnStr); //还是eval强大
    delete context.fn; //执行完毕之后删除这个属性
}
//测试一下
var jawil = {
    name: "jawil",
    sayHello: function (age) {
         console.log(this.name,age);
     }
};

var  lulin = {
    name: "lulin",
};

jawil.sayHello.applyTwo(lulin,[24])//lulin 24
```

### 1.3.3 模拟实现第三步

其实还有几个小地方需要注意：

A. this参数可以传null或者不传，当为null的时候，视为指向window  
```js
// demo1
var name = 'jawil';

function sayHello() {
    console.log(this.name);
}

sayHello.apply(null); // 'jawil'


// demo2
var name = 'jawil';

function sayHello() {
    console.log(this.name);
}

sayHello.apply(); // 'jawil'
```

B. 函数是可以有返回值的  

```js
var obj = {
    name: 'jawil'
}

function sayHello(age) {
    return {
        name: this.name,
        age: age
    }
}

console.log(sayHello.apply(obj,[24]));// {name: "jawil", age: 24}
```

此时的第三版apply模拟方法

```js
//原生JavaScript封装apply方法，第三版
Function.prototype.applyThree = function(context) {
    var context = context || window
    var args = arguments[1] //获取传入的数组参数
    context.fn = this //假想context对象预先不存在名为fn的属性
    if (args == void 0) { //没有传入参数直接执行
        return context.fn()
    }
    var fnStr = 'context.fn('
    for (var i = 0; i < args.length; i++) {
        //得到"context.fn(arg1,arg2,arg3...)"这个字符串在，最后用eval执行
        fnStr += i == args.length - 1 ? args[i] : args[i] + ','
    }
    fnStr += ')'
    var returnValue = eval(fnStr) //还是eval强大
    delete context.fn //执行完毕之后删除这个属性
    return returnValue
}


var obj = {
    name: 'jawil'
}

function sayHello(age) {
    return {
        name: this.name,
        age: age
    }
}

console.log(sayHello.applyThree(obj,[24]));// 完美输出{name: "jawil", age: 24}
```

### 1.3.4 模拟实现第四步

其实一开始就埋下了一个隐患，我们看看这段代码：
```js
Function.prototype.applyThree = function(context) {
    var context = context || window
    var args = arguments[1] //获取传入的数组参数
    context.fn = this //假想context对象预先不存在名为fn的属性
    ......
}
```

就是这句话， `context.fn = this //假想context对象预先不存在名为fn的属性`,这就是一开始的隐患,我们只是假设，但是并不能防止contenx对象一开始就没有这个属性，要想做到完美，就要保证这个context.fn中的fn的唯一性。

于是自然而然的想到了强大的ES6 `Symbol()`

看看下面这个栗子🌰：
```js
var a = {};
var name = Symbol();
a.name = 'jawil';
a[name] = 'lulin';
console.log(a.name,a[name]); //jawil,lulin
```

Symbol值作为属性名时，该属性还是公开属性，不是私有属性。

这个有点类似于java中的protected属性（protected和private的区别：在类的外部都是不可以访问的，在类内的子类可以继承protected不可以继承private）

但是这里的Symbol在类外部也是可以访问的，只是不会出现在for...in、for...of循环中，也不会被Object.keys()、Object.getOwnPropertyNames()返回。但有一个Object.getOwnPropertySymbols方法，可以获取指定对象的所有Symbol属性名。

看看第四版的实现demo，想必大家了解上面知识已经猜得到怎么写了，很简单。
直接加个var fn = Symbol()就行了，，，

```js
//原生JavaScript封装apply方法，第四版
Function.prototype.applyFour = function(context) {
    var context = context || window
    var args = arguments[1] //获取传入的数组参数
    var fn = Symbol()
    context[fn] = this //假想context对象预先不存在名为fn的属性
    if (args == void 0) { //没有传入参数直接执行
        return context[fn]()
    }
    var fnStr = 'context[fn]('
    for (var i = 0; i < args.length; i++) {
        //得到"context.fn(arg1,arg2,arg3...)"这个字符串在，最后用eval执行
        fnStr += i == args.length - 1 ? args[i] : args[i] + ','
    }
    fnStr += ')'
    var returnValue = eval(fnStr) //还是eval强大
    delete context[fn] //执行完毕之后删除这个属性
    return returnValue
}
```

### 1.3.5 模拟实现第五步

ES5 没有 Sybmol，属性名称只可能是一个字符串，如果我们能做到这个字符串不可预料，那么就基本达到目标。要达到不可预期，一个随机数基本上就解决了。
```js
//简单模拟Symbol属性
function jawilSymbol(obj) {
    var unique_proper = "00" + Math.random();
    if (obj.hasOwnProperty(unique_proper)) {
        arguments.callee(obj)//如果obj已经有了这个属性，递归调用，直到没有这个属性
    } else {
        return unique_proper;
    }
}
//原生JavaScript封装apply方法，第五版
Function.prototype.applyFive = function(context) {
    var context = context || window
    var args = arguments[1] //获取传入的数组参数
    var fn = jawilSymbol(context);
    context[fn] = this //假想context对象预先不存在名为fn的属性
    if (args == void 0) { //没有传入参数直接执行
        return context[fn]()
    }
    var fnStr = 'context[fn]('
    for (var i = 0; i < args.length; i++) {
        //得到"context.fn(arg1,arg2,arg3...)"这个字符串在，最后用eval执行
        fnStr += i == args.length - 1 ? args[i] : args[i] + ','
    }
    fnStr += ')'
    var returnValue = eval(fnStr) //还是eval强大
    delete context[fn] //执行完毕之后删除这个属性
    return returnValue
}



var obj = {
    name: 'jawil'
}

function sayHello(age) {
    return {
        name: this.name,
        age: age
    }
}

console.log(sayHello.applyFive(obj,[24]));// 完美输出{name: "jawil", age: 24}
```

## 1.4 实现Call方法

```js
//原生JavaScript封装call方法
Function.prototype.callOne = function(context) {
    return this.applyFive(([].shift.applyFive(arguments), arguments) 
    //巧妙地运用上面已经实现的applyFive函数
}
```

### call完整实现

```js
Function.prototype.applyFive = function(context) {
    var context = context || window
    var args = arguments[1] //获取传入的数组参数
    var fn = Symbol();
    context[fn] = this //假想context对象预先不存在名为fn的属性
    if (args == void 0) { //没有传入参数直接执行
        return context[fn]()
    }
    var fnStr = 'context[fn]('
    for (var i = 0; i < args.length; i++) {
        //得到"context.fn(arg1,arg2,arg3...)"这个字符串在，最后用eval执行
        fnStr += i == args.length - 1 ? args[i] : args[i] + ','
    }
    fnStr += ')'
    var returnValue = eval(fnStr) //还是eval强大
    delete context[fn] //执行完毕之后删除这个属性
    return returnValue
}

Function.prototype.callOne = function(context) {
    return this.applyFive(([].shift.applyFive(arguments)), arguments)
    //巧妙地运用上面已经实现的applyFive函数
}

//测试一下
var obj = {
    name: 'jawil'
}

function sayHello(age) {
    return {
        name: this.name,
        age: age
    }
}
console.log(sayHello.applyFive(obj,[24]));// 完美输出{name: "jawil", age: 24}
```

## 1.5 实现bind方法

> bind() 方法会创建一个新函数，当这个新函数被调用时，它的 this 值是传递给 bind() 的第一个参数, 它的参数是 bind() 的其他参数和其原本的参数，bind返回的绑定函数也能使用new操作符创建对象：这种行为就像把原函数当成构造器。提供的this值被忽略，同时调用时的参数被提供给模拟函数。。

### 1.5.1 bind语法：
```js
fun.bind(thisArg[, arg1[, arg2[, ...]]])
```

bind方法传递给调用函数的参数可以逐个列出，也可以写在数组中。bind方法与call、apply最大的不同就是前者返回一个绑定上下文的函数，而后两者是直接执行了函数。由于这个原因，上面的代码也可以这样写:

```js
jawil.sayHello.bind(lulin)(24); //hello, i am lulin 24 years old
jawil.sayHello.bind(lulin)([24]); //hello, i am lulin 24 years old
```

bind方法还可以这样写 `fn.bind(obj, arg1)(arg2)`

### 1.5.2 用一句话总结bind的用法

该方法创建一个新函数，称为绑定函数，绑定函数会以创建它时传入bind方法的第一个参数作为this，传入bind方法的第二个以及以后的参数加上绑定函数运行时本身的参数按照顺序作为原函数的参数来调用原函数。

### 1.5.3 bind在实际中的应用

实际使用中我们经常会碰到这样的问题：
```js
function Person(name){
 this.nickname = name;
 this.distractedGreeting = function() {
 
   setTimeout(function(){
     console.log("Hello, my name is " + this.nickname);
   }, 500);
 }
}
 
var alice = new Person('jawil');
alice.distractedGreeting();
//Hello, my name is undefined
```

这个时候输出的this.nickname是undefined，原因是this指向是在运行函数时确定的，而不是定义函数时候确定的，再因为setTimeout在全局环境下执行，所以this指向setTimeout的上下文：window。

以前解决这个问题的办法通常是缓存this，例如：
```js
function Person(name){
  this.nickname = name;
  this.distractedGreeting = function() {
    var self = this; // <-- 注意这一行!
    setTimeout(function(){
      console.log("Hello, my name is " + self.nickname); // <-- 还有这一行!
    }, 500);
  }
}
 
var alice = new Person('jawil');
alice.distractedGreeting();
// after 500ms logs "Hello, my name is jawil"
```

使用bind。上面的例子中被更新为
```js
function Person(name){
  this.nickname = name;
  this.distractedGreeting = function() {
    setTimeout(function(){
      console.log("Hello, my name is " + this.nickname);
    }.bind(this), 500); // <-- this line!
  }
}
 
var alice = new Person('jawil');
alice.distractedGreeting();
// after 500ms logs "Hello, my name is jawil"
```



### 1.5.4 bind初级实现

```js
Function.prototype.bind = function (context) {
    var that = this;
    var argsArray = Array.prototype.slice.callOne(arguments);
    return function () {
        return that.applyFive(context, argsArray.slice(1))
    }
}
```

基本原理是使用apply进行模拟。函数体内的this，就是需要绑定this的实例函数，或者说是原函数。最后我们使用apply来进行参数（context）绑定，并返回。
同时，将第一个参数（context）以外的其他参数，作为提供给原函数的预设参数，这也是基本的“颗粒化（curring）”基础。

#### 1.5.4.1 初级实现的加分项

上面的实现（包括后面的实现），其实是一个典型的“Monkey patching(猴子补丁)”，即“给内置对象扩展方法”。所以，如果面试者能进行一下“嗅探”，进行兼容处理，就是锦上添花了。
```js
Function.prototype.bind = Function.prototype.bind || function (context) {
    ...
}
```

#### 1.5.4.2 柯里化（curring）实现

上述的实现方式中，我们返回的参数列表里包含：atgsArray.slice(1)，他的问题在于存在预置参数功能丢失的现象。

想象我们返回的绑定函数中，如果想实现预设传参（就像bind所实现的那样），就面临尴尬的局面。真正实现颗粒化的“完美方式”是：
```js
Function.prototype.bind = Function.prototype.bind || function (context) {
    var that = this;
    var args = Array.prototype.slice.callOne(arguments, 1);
    return function () {
        var innerArgs = Array.prototype.slice.callOne(arguments);
        var finalArgs = args.concat(innerArgs);
        return that.applyFive(context, finalArgs);
    }
}
```

`bind返回的函数如果作为构造函数，搭配new关键字出现的话，我们的绑定this就需要“被忽略”。`

#### 1.5.4.3 构造函数场景下的兼容

有了上边的讲解，不难理解需要兼容构造函数场景的实现：
```js
Function.prototype.bind = Function.prototype.bind || function (context) {
    var that = this;
    var args = Array.prototype.slice.callOne(arguments, 1);
    var F = function () {};
    F.prototype = this.prototype;
    var bound = function () {
        var innerArgs = Array.prototype.slice.callOne(arguments);
        var finalArgs = args.concat(innerArgs);
        return that.apply(this instanceof F ? this : context || this, finalArgs);
    }
    bound.prototype = new F();
    return bound;
}
```

#### 1.5.4.4 更严谨的做法

我们需要调用bind方法的一定要是一个函数，所以可以在函数体内做一个判断：
```js
if (typeof this !== "function") {
  throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
}
```

## 最终实现
```js
//简单模拟Symbol属性
function jawilSymbol(obj) {
    var unique_proper = "00" + Math.random();
    if (obj.hasOwnProperty(unique_proper)) {
        arguments.callee(obj)//如果obj已经有了这个属性，递归调用，直到没有这个属性
    } else {
        return unique_proper;
    }
}
//原生JavaScript封装apply方法，第五版
Function.prototype.applyFive = function(context) {
    var context = context || window
    var args = arguments[1] //获取传入的数组参数
    var fn = jawilSymbol(context);
    context[fn] = this //假想context对象预先不存在名为fn的属性
    if (args == void 0) { //没有传入参数直接执行
        return context[fn]()
    }
    var fnStr = 'context[fn]('
    for (var i = 0; i < args.length; i++) {
        //得到"context.fn(arg1,arg2,arg3...)"这个字符串在，最后用eval执行
        fnStr += i == args.length - 1 ? args[i] : args[i] + ','
    }
    fnStr += ')'
    var returnValue = eval(fnStr) //还是eval强大
    // eval('context.fn('+(arguments[1]||[]).toString()+')'); // 还可以这样
    delete context[fn] //执行完毕之后删除这个属性
    return returnValue
}
//简单模拟call函数
Function.prototype.callOne = function(context) {
    return this.applyFive(([].shift.applyFive(arguments)), arguments)
    //巧妙地运用上面已经实现的applyFive函数
}

//简单模拟bind函数
Function.prototype.bind = Function.prototype.bind || function (context) {
    var that = this;
    var args = Array.prototype.slice.callOne(arguments, 1);
    var F = function () {};
    F.prototype = this.prototype;
    var bound = function () {
        var innerArgs = Array.prototype.slice.callOne(arguments);
        var finalArgs = args.concat(innerArgs);
        return that.applyFive(this instanceof F ? this : context || this, finalArgs);
    }
    bound.prototype = new F();
    return bound;
}
```

测试demo
```js
var obj = {
    name: 'jawil'
}

function sayHello(age) {
    return {
        name: this.name,
        age: age
    }
}

console.log(sayHello.bind(obj,24)());// 完美输出{name: "jawil", age: 24}
```

-------------
=============

# 2.  `apply 实现 bind` 

## 2.1 简单实现
```js
// 将bind方法的参数提取出来拼接返回的闭包函数中
Function.prototype.bind = function(context){
	var that = this;
	var args = Array.prototype.slice.call(arguments, 1);
	
	return function() {
	    // 预设参数一定是args在前拼接
	    return that.apply(context, args.concat(Array.prototype.slice.call(arguments)));
    }
};
``` 

## 2.2 完整实现

通过设置一个中转构造函数F，使绑定后的函数与调用bind()的函数处于同一原型链上，用new操作符调用绑定后的函数，返回的对象也能正常使用instanceof，因此这是最严谨的bind()实现。
```js
Function.prototype.bind = function (context) {
    if (typeof this !== "function") {
      throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
    }

    var args = Array.prototype.slice.call(arguments, 1), 
        that = this, 
        Fn = function () {},
        fBound = function () {
          // this instanceof Fn === true时,说明返回的 Fn 被当做new的构造函数调用
          return that.apply(
              this instanceof Fn && context ? this : context || window,
              // 获取调用时(fBound)的传参.bind 返回的函数入参往往是这么传递的
              args.concat(Array.prototype.slice.call(arguments))
          );
        };

    Fn.prototype = this.prototype;
    fBound.prototype = new Fn();

    return fBound;
};
```

### 说明

* 第一个是参数，agruments的使用
    var args = Array.prototype.slice.call(arguments, 1),
    这里是将bind函数的参数数组取出来，第一个参数不要（就是不要context）也就是要被绑定方法的那个对象，
    第二个是
    args.concat(Array.prototype.slice.call(arguments)));

 这里是用了数组的方法，把参数插在参数数组后面，要注意，这个函数是要被return 出去然后执行的，他的参数数组是return出去的那个fBound函数的参数数组，所以上下两个参数数组是不一样的，有点像柯里化。

* 第二个是上下文，在其中上下文的变化比较难理解，bind函数主要就是为了绑定上下文来使用的
    that = this
    这里是保存了对象的上下文，紧接着下面的apply方法让要被绑定的那个对象可以使用该上下文
    Fn.prototype = this.prototype;
    fBound.prototype = new Fn();
    这里是以Fn为中介把this.prototype这个原对象的属性给fBound，确保fBound是在定义的时候的那个上下文里面执行。本来
    bound.prototype = self.prototype
    就可以将原属性集成过来了，但是这样两个对象属性都指向同一个地方，修改 bound.prototype 将会造成self.prototype 也发生改变，这样并不是我们的本意。所以通过一个空函数 nop 做中转，能有效的防止这种情况的发生。


## 2.3 bind实现2
```js
if (!Function.prototype.bind) { 
    Function.prototype.bind = function () { 
        var self = this, // 保存原函数 
        context = [].shift.call(arguments), // 保存需要绑定的this上下文 
        args = [].slice.call(arguments); // 剩余的参数转为数组 
        return function () { // 返回一个新函数 
            self.apply(context,[].concat.call(args, [].slice.call(arguments))); 
        } 
    } 
}
```

### 2.3.1 [].shift.call(arguments) 的含义

<b>[].shift</b> 等同于 <b>Array.prototype.shift</b>
`Array.prototype.shift === [].shift`
两者其实是同一个函数，只是调用的方式存在差异，一个是通过原型的方式直接在类上调用；一个是通过实例化，继承过来，然后再调用。

> [].slice.call(["a", "b"]);    //["a", "b"]

> Array.from(["a", "b"]).slice();   //["a", "b"]

`context = [].shift.call(arguments)` 这一句就是把参数中的第一个剪切出来，赋给 context，那么也就相当于起到了将 参数中的 this 保存的目的。

<b>args = [].slice.call(arguments);</b>
这一句，将除了 this 上下文的所有参数，传给了 args ，以备后来使用。

### 2.3.2 返回函数
```js
return function () {    // 返回一个新函数
    self.apply(context,[].concat.call(args, [].slice.call(arguments)));
}
```
因为bind 绑定了上下文，因此 self.apply 的第一个参数，是之前我们保存的 context。接下来，我们将 bind 的其余参数和调用bind后返回的函数在执行的过程中接收的参数进行拼接，作为一个数组传入apply的第二个参数中去。这就完美的实现了 bind 函数的功能，