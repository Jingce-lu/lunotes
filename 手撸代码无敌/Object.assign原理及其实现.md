Object.assign 原理及其实现
====
<!-- TOC -->

- [浅拷贝 Object.assign](#浅拷贝-objectassign)
- [Object.assign 模拟实现](#objectassign-模拟实现)
  - [注意1：可枚举性](#注意1可枚举性)
  - [注意2：判断参数是否正确](#注意2判断参数是否正确)
  - [注意3：原始类型被包装为对象](#注意3原始类型被包装为对象)
  - [注意4：存在性](#注意4存在性)

<!-- /TOC -->

## 浅拷贝 Object.assign
语法： 
> Object.assign(target, ...sources)

其中 `target` 是目标对象，`sources` 是源对象，可以有多个，返回修改后的目标对象 `target`。

如果目标对象中的属性具有相同的键，则属性将被源对象中的属性覆盖。后来的源对象的属性将类似地覆盖早先的属性。


知道浅拷贝就是拷贝第一层的**基本类型值**，以及第一层的**引用类型地址**。

```js
// 第一步
let a = {
    name: "muyiy",
    age: 18
}
let b = {
    b1: Symbol("muyiy"),
    b2: null,
    b3: undefined
}
let c = Object.assign(a, b);
console.log(c);
// {
// 	name: "muyiy",
//  age: 18,
// 	b1: Symbol(muyiy),
// 	b2: null,
// 	b3: undefined
// } 
console.log(a === c);
// true
```

## Object.assign 模拟实现
实现一个 `Object.assign` 大致思路如下：

1. 判断原生 `Object` 是否支持该函数，如果不存在的话创建一个函数 `assign`，并使用 `Object.defineProperty` 将该函数绑定到 `Object` 上。

2. 判断参数是否正确（目标对象不能为空，我们可以直接设置{}传递进去,但必须设置值）。

3. 使用 `Object()` 转成对象，并保存为 to，最后返回这个对象 to。

4. 使用 `for..in` 循环遍历出所有可枚举的自有属性。并复制给新的目标对象（使用 hasOwnProperty 获取自有属性，即非原型链上的属性）。

实现代码如下，这里为了验证方便，使用 `assign2` 代替 `assign`。注意此模拟实现不支持 `symbol` 属性，因为`ES5` 中根本没有 `symbol` 。

```js
if (typeof Object.assign2 != 'function') {
  // Attention 1
  Object.defineProperty(Object, "assign2", {
    value: function (target) {
      'use strict';
      if (target == null) { // Attention 2
        throw new TypeError('Cannot convert undefined or null to object');
      }

      // Attention 3
      var to = Object(target);
        
      for (var index = 1; index < arguments.length; index++) {
        var nextSource = arguments[index];

        if (nextSource != null) {  // Attention 2
          // Attention 4
          for (var nextKey in nextSource) {
            if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
              to[nextKey] = nextSource[nextKey];
            }
          }
        }
      }
      return to;
    },
    writable: true,
    configurable: true
  });
}
```

测试一下

```js
// 测试用例
let a = {
    name: "advanced",
    age: 18
}
let b = {
    name: "muyiy",
    book: {
        title: "You Don't Know JS",
        price: "45"
    }
}
let c = Object.assign2(a, b);
console.log(c);
// {
// 	name: "muyiy",
//  age: 18,
// 	book: {title: "You Don't Know JS", price: "45"}
// } 
console.log(a === c);
// true
```

针对上面的代码做如下扩展。

### 注意1：可枚举性
原生情况下挂载在 `Object` 上的属性是不可枚举的，但是直接在 `Object` 上挂载属性 a 之后是可枚举的，所以这里必须使用 `Object.defineProperty`，并设置 `enumerable: false` 以及 `writable: true`, `configurable: true`。

```js
for(var i in Object) {
    console.log(Object[i]);
}
// 无输出

Object.keys( Object );
// []
```

上面代码说明原生 `Object` 上的属性不可枚举。

我们可以使用 2 种方法查看 `Object.assign` 是否可枚举，使用 `Object.getOwnPropertyDescriptor` 或者` Object.propertyIsEnumerabl`e 都可以，其中`propertyIsEnumerable(..)` 会检查给定的属性名是否直接存在于对象中（而不是在原型链上）并且满足 `enumerable: true`。具体用法如下：

```js
// 方法1
Object.getOwnPropertyDescriptor(Object, "assign");
// {
// 	value: ƒ, 
//  writable: true, 	// 可写
//  enumerable: false,  // 不可枚举，注意这里是 false
//  configurable: true	// 可配置
// }

// 方法2
Object.propertyIsEnumerable("assign");
// false
```

上面代码说明 `Object.assign` 是不可枚举的。

介绍这么多是因为直接在 `Object` 上挂载属性 `a` 之后是可枚举的，我们来看如下代码。

```js
Object.a = function () {
    console.log("log a");
}

Object.getOwnPropertyDescriptor(Object, "a");
// {
// 	value: ƒ, 
//  writable: true, 
//  enumerable: true,  // 注意这里是 true
//  configurable: true
// }

Object.propertyIsEnumerable("a");
// true
```

所以要实现 `Object.assign` 必须使用 `Object.defineProperty`，并设置 `writable: true, enumerable: false, configurable: true`，当然默认情况下不设置就是 `false`。

```js
Object.defineProperty(Object, "b", {
    value: function() {
        console.log("log b");
    }
});

Object.getOwnPropertyDescriptor(Object, "b");
// {
// 	value: ƒ, 
//  writable: false, 	// 注意这里是 false
//  enumerable: false,  // 注意这里是 false
//  configurable: false	// 注意这里是 false
// }
```

所以具体到本次模拟实现中，相关代码如下。

```js
// 判断原生 Object 中是否存在函数 assign2
if (typeof Object.assign2 != 'function') {
  // 使用属性描述符定义新属性 assign2
  Object.defineProperty(Object, "assign2", {
    value: function (target) { 
      ...
    },
    // 默认值是 false，即 enumerable: false
    writable: true,
    configurable: true
  });
}
```

### 注意2：判断参数是否正确
有些文章判断参数是否正确是这样的。
```js
if (target === undefined || target === null) {
	throw new TypeError('Cannot convert undefined or null to object');
}
```

这样肯定没问题，但是这样写没有必要，因为 `undefined` 和` null` 是相等的（高程 3 P52 ），即 `undefined == null` 返回 `true`，只需要按照如下方式判断就好了。

```js
if (target == null) { // TypeError if undefined or null
	throw new TypeError('Cannot convert undefined or null to object');
}
```

### 注意3：原始类型被包装为对象
```js
var v1 = "abc";
var v2 = true;
var v3 = 10;
var v4 = Symbol("foo");

var obj = Object.assign({}, v1, null, v2, undefined, v3, v4); 
// 原始类型会被包装，null 和 undefined 会被忽略。
// 注意，只有字符串的包装对象才可能有自身可枚举属性。
console.log(obj); 
// { "0": "a", "1": "b", "2": "c" }
```

面代码中的源对象 v2、v3、v4 实际上被忽略了，原因在于他们自身**没有可枚举属性**。

```js
var v1 = "abc";
var v2 = true;
var v3 = 10;
var v4 = Symbol("foo");
var v5 = null;

// Object.keys(..) 返回一个数组，包含所有可枚举属性
// 只会查找对象直接包含的属性，不查找[[Prototype]]链
Object.keys( v1 ); // [ '0', '1', '2' ]
Object.keys( v2 ); // []
Object.keys( v3 ); // []
Object.keys( v4 ); // []
Object.keys( v5 ); 
// TypeError: Cannot convert undefined or null to object

// Object.getOwnPropertyNames(..) 返回一个数组，包含所有属性，无论它们是否可枚举
// 只会查找对象直接包含的属性，不查找[[Prototype]]链
Object.getOwnPropertyNames( v1 ); // [ '0', '1', '2', 'length' ]
Object.getOwnPropertyNames( v2 ); // []
Object.getOwnPropertyNames( v3 ); // []
Object.getOwnPropertyNames( v4 ); // []
Object.getOwnPropertyNames( v5 ); 
// TypeError: Cannot convert undefined or null to object
```

但是下面的代码是可以执行的。

```js
var a = "abc";
var b = {
    v1: "def",
    v2: true,
    v3: 10,
    v4: Symbol("foo"),
    v5: null,
    v6: undefined
}

var obj = Object.assign(a, b); 
console.log(obj);
// { 
//   [String: 'abc']
//   v1: 'def',
//   v2: true,
//   v3: 10,
//   v4: Symbol(foo),
//   v5: null,
//   v6: undefined 
// }
```

原因很简单，因为此时` undefined`、`true` 等不是作为对象，而是作为对象 b 的属性值，对象 b 是可枚举的。

```js
// 接上面的代码
Object.keys( b ); // [ 'v1', 'v2', 'v3', 'v4', 'v5', 'v6' ]
```

这里其实又可以看出一个问题来，那就是目标对象是原始类型，会包装成对象，对应上面的代码就是目标对象 a 会被包装成 `[String: 'abc']`，那模拟实现时应该如何处理呢？很简单，使用 `Object(..)` 就可以了。

```js
var a = "abc";
console.log( Object(a) );
// [String: 'abc']
```

到这里已经介绍很多知识了，让我们再来延伸一下，看看下面的代码能不能执行。

```js
var a = "abc";
var b = "def";
Object.assign(a, b); 
```

答案是否定的，会提示以下错误。

```js
TypeError: Cannot assign to read only property '0' of object '[object String]'
```

原因在于 `Object("abc")` 时，其属性描述符为不可写，即 `writable: false`。

```js
var myObject = Object( "abc" );

Object.getOwnPropertyNames( myObject );
// [ '0', '1', '2', 'length' ]

Object.getOwnPropertyDescriptor(myObject, "0");
// { 
//   value: 'a',
//   writable: false, // 注意这里
//   enumerable: true,
//   configurable: false 
// }
```

同理，下面的代码也会报错。

```js
var a = "abc";
var b = {
  0: "d"
};
Object.assign(a, b); 
// TypeError: Cannot assign to read only property '0' of object '[object String]'
```

但是并不是说只要 `writable: false` 就会报错，看下面的代码。

```js
var myObject = Object('abc'); 

Object.getOwnPropertyDescriptor(myObject, '0');
// { 
//   value: 'a',
//   writable: false, // 注意这里
//   enumerable: true,
//   configurable: false 
// }

myObject[0] = 'd';
// 'd'

myObject[0];
// 'a'
```

这里并没有报错，原因在于 JS 对于不可写的属性值的修改静默失败（silently failed）,在严格模式下才会提示错误。

```js
'use strict'
var myObject = Object('abc'); 

myObject[0] = 'd';
// TypeError: Cannot assign to read only property '0' of object '[object String]'
```

所以我们在模拟实现 `Object.assign` 时需要使用严格模式。


### 注意4：存在性
如何在不访问属性值的情况下判断对象中是否存在某个属性呢，看下面的代码。

```js
var anotherObject = {
    a: 1
};

// 创建一个关联到 anotherObject 的对象
var myObject = Object.create( anotherObject );
myObject.b = 2;

("a" in myObject); // true
("b" in myObject); // true

myObject.hasOwnProperty( "a" ); // false
myObject.hasOwnProperty( "b" ); // true
```

这边使用了 `in` 操作符和 `hasOwnProperty` 方法，区别如下（你不知道的JS上卷 P119）：

1. `in` 操作符会检查属性是否在对象及其 `[[Prototype]]` 原型链中。
2. `hasOwnProperty(..)` 只会检查属性是否在 `myObject` 对象中，不会检查 `[[Prototype]]` 原型链。

`Object.assign` 方法肯定不会拷贝原型链上的属性，所以模拟实现时需要用 `hasOwnProperty(..)` 判断处理下，但是直接使用 `myObject.hasOwnProperty(..)` 是有问题的，因为有的对象可能没有连接到 `Object.prototype` 上（比如通过 `Object.create(null)` 来创建），这种情况下，使用 `myObject.hasOwnProperty(..)` 就会失败。

```js
var myObject = Object.create( null );
myObject.b = 2;

("b" in myObject); 
// true

myObject.hasOwnProperty( "b" );
// TypeError: myObject.hasOwnProperty is not a function
```

解决方法也很简单，使用我们在【进阶3-3期】中介绍的 call 就可以了，使用如下。

```js
var myObject = Object.create( null );
myObject.b = 2;

Object.prototype.hasOwnProperty.call(myObject, "b");
// true
```

所以具体到本次模拟实现中，相关代码如下。

```js
// 使用 for..in 遍历对象 nextSource 获取属性值
// 此处会同时检查其原型链上的属性
for (var nextKey in nextSource) {
    // 使用 hasOwnProperty 判断对象 nextSource 中是否存在属性 nextKey
    // 过滤其原型链上的属性
    if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
        // 赋值给对象 to,并在遍历结束后返回对象 to
        to[nextKey] = nextSource[nextKey];
    }
}
```
