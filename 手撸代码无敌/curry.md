# 深入详解函数的柯里化

<!-- TOC -->

- [深入详解函数的柯里化](#深入详解函数的柯里化)
  - [简单实现](#简单实现)
  - [柯里化的题](#柯里化的题)
  - [柯里化通用式](#柯里化通用式)
  - [柯里化与bind](#柯里化与bind)
  - [柯里化的特点](#柯里化的特点)
  - [--------](#--------)
  - [通用版](#通用版)
  - [ES6骚写法](#ES6骚写法)

<!-- /TOC -->


柯里化是指这样一个函数(假设叫做createCurry)，他接收函数A作为参数，运行后能够返回一个新的函数。并且这个新的函数能够处理函数A的剩余参数。

## 简单实现
```js
// 简单实现，参数只能从右到左传递
function createCurry(func, args) {

    var arity = func.length;
    var args = args || [];

    return function() {
        var _args = [].slice.call(arguments);
        [].push.apply(_args, args);

        // 如果参数个数小于最初的func.length，则递归调用，继续收集参数
        if (_args.length < arity) {
            return createCurry.call(this, func, _args);
        }

        // 参数收集完毕，则执行func
        return func.apply(this, _args);
    }
}
```

## 柯里化的题
```js
// 实现一个add方法，使计算结果能够满足如下预期：
add(1)(2)(3) = 6;
add(1, 2, 3)(4) = 10;
add(1)(2)(3)(4)(5) = 15;
```

**实现**
```js
function add() {
    // 第一次执行时，定义一个数组专门用来存储所有的参数
    var _args = [].slice.call(arguments);

    // 在内部声明一个函数，利用闭包的特性保存_args并收集所有的参数值
    var adder = function () {
        var _adder = function() {
            // [].push.apply(_args, [].slice.call(arguments));
            _args.push(...arguments);
            return _adder;
        };

        // 利用隐式转换的特性，当最后执行时隐式转换，并计算最终的值返回
        _adder.toString = function () {
            return _args.reduce(function (a, b) {
                return a + b;
            });
        }

        return _adder;
    }
    // return adder.apply(null, _args);
    return adder(..._args);
}

var a = add(1)(2)(3)(4);   // f 10
var b = add(1, 2, 3, 4);   // f 10
var c = add(1, 2)(3, 4);   // f 10
var d = add(1, 2, 3)(4);   // f 10

// 可以利用隐式转换的特性参与计算
console.log(a + 10); // 20
console.log(b + 20); // 30
console.log(c + 30); // 40
console.log(d + 40); // 50

// 也可以继续传入参数，得到的结果再次利用隐式转换参与计算
console.log(a(10) + 100);  // 120
console.log(b(10) + 100);  // 120
console.log(c(10) + 100);  // 120
console.log(d(10) + 100);  // 120
```

## 柯里化通用式
```js
var currying = function(fn) {
    var args = [].slice.call(arguments, 1);

    return function() {
        // 主要还是收集所有需要的参数到一个数组中，便于统一计算
        var _args = args.concat([].slice.call(arguments));
        return fn.apply(null, _args);
    }
}

var sum = currying(function() {
    var args = [].slice.call(arguments);
    return args.reduce(function(a, b) {
        return a + b;
    })
}, 10)

console.log(sum(20, 10));  // 40
console.log(sum(10, 5));   // 25
```

## 柯里化与bind
```js
Object.prototype.bind = function(context) {
    var _this = this;
    var args = [].slice.call(arguments, 1);

    return function() {
        return _this.apply(context, args)
    }
}
```

## 柯里化的特点
* 接收单一参数，将更多的参数通过回调函数来搞定
* 返回一个新函数，用于处理所有的想要传入的参数；
* 需要利用call/apply与arguments对象收集参数；
* 返回的这个函数正是用来处理收集起来的参数。

--------
--------
## 通用版
```js
function multi() {
  var args = Array.prototype.slice.call(arguments);
  var fn = function() {
	var newArgs = args.concat(Array.prototype.slice.call(arguments));
    return multi.apply(this, newArgs);
  }
  fn.toString = function() {
    return args.reduce(function(a, b) {
      return a * b;
    })
  }
  return fn;
}

function multiFn(a, b, c) {
  return a * b * c;
}

var multi = curry(multiFn);

multi(2)(3)(4);
multi(2,3,4);
multi(2)(3,4);
multi(2,3)(4);
```

## ES6骚写法
```js
const curry = (fn, arr = []) => (...args) => (
  arg => arg.length === fn.length
    ? fn(...arg)
    : curry(fn, arg)
)([...arr, ...args])

let curryTest=curry((a,b,c,d)=>a+b+c+d)
curryTest(1,2,3)(4) //返回10
curryTest(1,2)(4)(3) //返回10
curryTest(1,2)(3,4) //返回10
```
