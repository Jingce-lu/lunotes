# 一行代码实现一个简单的模板字符串替换

<!-- TOC -->

- [一行代码实现一个简单的模板字符串替换](#一行代码实现一个简单的模板字符串替换)
  - [起始](#起始)
  - [实现](#实现)
    - [1. 基本实现(有缺陷)](#1-基本实现有缺陷)
    - [2. 基本实现](#2-基本实现)
    - [3. 基本实现 +1](#3-基本实现-1)
    - [4. 实现完整](#4-实现完整)
  - [`for/in` 循环获取 obj 的 key 值 、 `Object.key()`、 `Object.getOwnPropertyNames()`、 `Reflect.ownKeys()`区别](#forin-循环获取-obj-的-key-值--Objectkey-ObjectgetOwnPropertyNames-ReflectownKeys区别)
    - [demo 理解](#demo-理解)
  - [最后实现](#最后实现)
    - [MDN `str.replace(regexp|substr, newSubStr|function)`](#MDN-strreplaceregexpsubstr-newSubStrfunction)
    - [实现code](#实现code)
      - [分析](#分析)

<!-- /TOC -->

## 起始

> 主要是思路，可以使用 ES6 语法模拟 ES6的模板字符串的这个功能。  
> 后端返回的一般都是 JSON 的数据格式，所以我们按照下面的规则进行模拟。  

**需求描述**
> 实现一个 render(template, context) 方法，将 template 中的占位符用 context 填充。

**要求：**
> 不需要有控制流成分（如 循环、条件 等等），只要有变量替换功能即可  
> 级联的变量也可以展开  
> 被转义的的分隔符 { 和 } 不应该被渲染，分隔符与变量之间允许有空白字符

```js
var obj = {name:"二月",age:"15"};
var str = "{{name}}很厉害，才{{age}}岁";
// 输出：二月很厉害，才15岁。
```

## 实现
### 1. 基本实现(有缺陷)
  ```js
  let str = "{{name}}很厉害，才{{age}}岁"
  let obj = {name: '二月', age: 15}
  function test(str, obj){
      let _s = str.replace(/\{\{(\w+)\}\}/g, '$1')
      let result
      for(let k in obj) {
        _s = _s.replace(new RegExp(k, 'g'), obj[k])
      }
    return _s
  }
  const s = test(str, obj)
  ```
  最基本的是实现了，但是代码还是有很多问题没考虑到，首先 Object 的 key 值不一定只是 \w，
  还有就是如果字符串是这种的：
  ```js
  let str = "{{name}}很name厉害，才{{age}}岁"`
  会输出 ：二月很厉害二月害，才15岁
  ```
  **思路**
  1. 代码的作用目标是 `str`，先用正则匹配出 `{{name}}` 和 `{{age}}`，然后用分组获取括号的 `name`,`age`,最后用 `replace` 方法把 `{{name}}` 和 `{{age}}` 替换成 `name` 和 `age`，最后字符串就成了 name很name厉害，才age岁，最后 `for in 循环`的时候才导致一起都被替换掉了。
  2. 用 for in 循环完全没必要，能不用 for in 尽量不要用 for in，for in 会遍历自身以及原型链所有的属性。

### 2. 基本实现
```js
var str = "{{name}}很厉害，才{{age}}岁";
var str2 = "{{name}}很厉name害，才{{age}}岁{{name}}";

var obj = {name: '周杰伦', age: 15};
function fun(str, obj) {
    var arr;
    arr = str.match(/{{[a-zA-Z\d]+}}/g);
    for(var i=0;i<arr.length;i++){
        arr[i] = arr[i].replace(/{{|}}/g,'');
        str = str.replace('{{'+arr[i]+'}}',obj[arr[i]]);
    }
    return str;
}
console.log(fun(str,obj));
console.log(fun(str2,obj));
```

### 3. 基本实现 +1
```js
function a(str, obj) {
  var str1 = str;
  for (var key in obj) {
    var re = new RegExp("{{" + key + "}}", "g");
    str1 = str1.replace(re, obj[key]);
  }
  console.log(str1);
}
const str = "{{name}}很厉name害{{name}}，才{{age}}岁";
const obj = { name: "jawil", age: "15" };
a(str, obj);
```
**把 `obj` 的 `key` 值遍历，然后拼成 `{{key}}`，最后用 `obj[key]` 也就是 `value` 把 `{{key}}` 整个给替换了**

### 4. 实现完整
```js
function parseString(str, obj) {
  Object.keys(obj).forEach(key => {
    str = str.replace(new RegExp(`{{${key}}}`,'g'), obj[key]);
  });
  return str;
}
const str = "{{name}}很厉name害{{name}}，才{{age}}岁";
const obj = { name: "jawil", age: "15" };
console.log(parseString(str, obj));
```
没用 `for...in` 循环就是为了考虑不必要的循环，因为 `for...in` 循环会遍历原型链所有的可枚举属性，造成不必要的循环。

## `for/in` 循环获取 obj 的 key 值 、 `Object.key()`、 `Object.getOwnPropertyNames()`、 `Reflect.ownKeys()`区别
> 1. `for...in`循环：会遍历对象自身的属性，以及原型属性，`for...in` 循环只遍历可枚举(不包括 `enumerable`为 `false` )属性。像 `Array` 和 `Object` 使用内置构造函数所创建的对象都会继承自 `Object.prototype` 和 `String.prototype` 的不可枚举属性;  
>    
> 2. `Object.key()`：可以得到自身可枚举的属性,但得不到原型链上的属性; 
>    
> 3. `Object.getOwnPropertyNames()`：可以得到自身所有的属性(包括不可枚举),但得不到原型链上的属性, Symbols 属性也得不到. 
>    
> 4. `Reflect.ownKeys()`：该方法用于返回对象的所有属性，基本等同于 Object.getOwnPropertyNames() 与 Object.getOwnPropertySymbols 之和。

### demo 理解
```js
const parent = {
  a: 1,
  b: 2,
  c: 3
};
const child = {
  d: 4,
  e: 5,
  [Symbol()]: 6
};
child.__proto__ = parent;
Object.defineProperty(child, "d", { enumerable: false });

for (var attr in child) {
  console.log("for...in:", attr);// a,b,c,e
}
console.log("Object.keys:", Object.keys(child));// [ 'e' ]
console.log("Object.getOwnPropertyNames:", Object.getOwnPropertyNames(child)); // [ 'd', 'e' ]
console.log("Reflect.ownKeys:", Reflect.ownKeys(child)); //  [ 'd', 'e', Symbol() ]
```

## 最后实现

### MDN `str.replace(regexp|substr, newSubStr|function)`

通过 [MDN](https://developer.mozilla.org/zh-CN/) 文档里面写的 `str.replace(regexp|substr, newSubStr|function)` ，我们可以发现 `replace` 方法可以传入 `function 回调函数`，

`function (replacement)` 一个用来创建新子字符串的函数，该函数的返回值将替换掉第一个参数匹配到的结果 参考这个[指定一个函数作为参数](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/String/replace#指定一个函数作为参数)。
> 你可以指定一个函数作为第二个参数。在这种情况下，当匹配执行后， 该函数就会执行。 函数的返回值作为替换字符串。 (注意:  上面提到的特殊替换参数在这里不能被使用。) 另外要注意的是， 如果第一个参数是正则表达式， 并且其为全局匹配模式， 那么这个方法将被多次调用， 每次匹配都会被调用。 
> 下面是该函数的参数：  
> 
> | 变量名 | 代表的值 |
> | ------| ------- |
> | match | 匹配的子串。（对应于上述的$&。）|
> | `p1,p2, ...` | 假如replace()方法的第一个参数是一个`RegExp` 对象，则代表第n个括号匹配的字符串。（对应于上述的$1，$2等。）例如, 如果是用 `/(\a+)(\b+)/`这个来匹配， `p1`就是匹配的 `\a+`,  `p2` 就是匹配的 `\b+`。|
> | offset | 匹配到的子字符串在原字符串中的偏移量。（比如，如果原字符串是“abcd”，匹配到的子字符串是“bc”，那么这个参数将是1）|
> | string | 	被匹配的原字符串。|
>   
>   
>   
> (精确的参数个数依赖于replace()的第一个参数是否是一个正则表达式对象， 以及这个正则表达式中指定了多少个括号子串。)


下面的例子将会使 newString 变成'abc - 12345 - #$*%'：
```js
function replacer(match, p1, p2, p3, offset, string) {
  // p1 is nondigits, p2 digits, and p3 non-alphanumerics
  return [p1, p2, p3].join(' - ');
}
var newString = 'abc12345#$*%'.replace(/([^\d]*)(\d*)([^\w]*)/, replacer);
console.log(newString);  // abc - 12345 - #$*%
```

**依据上边最终实现**

```js
function render(template, context) {
  return template.replace(/\{\{(.*?)\}\}/g, (match, key) => context[key]);
}
const template = "{{name}}很厉name害，才{{age}}岁";
const context = { name: "jawil", age: "15" };
console.log(render(template, context));
```


### 实现code

```js
function render(template, context) {
  return template.replace(/\{\{(.*?)\}\}/g, (match, key) => context[key]);
}

// 最终挂到String
String.prototype.render = function (context) {
  return this.replace(/\{\{(.*?)\}\}/g, (match, key) => context[key.trim()]);
};

```

#### 分析
**该函数的返回值(obj[key]=jawil)将替换掉第一个参数(match=={{name}})匹配到的结果。**
简单分析一下：`.*?` 是正则固定搭配用法，表示非贪婪匹配模式，尽可能匹配少的，什么意思呢？举个简单的例子。

举个🌰：
```js
源字符串：aa<div>test1</div>bb<div>test2</div>cc

正则表达式一：<div>.*</div>

匹配结果一：<div>test1</div>bb<div>test2</div>

正则表达式二：<div>.*?</div>

匹配结果二：<div>test1</div>（这里指的是一次匹配结果，不使用/g，所以没包括<div>test2</div>）
```
**所以：正则匹配到`{{name}}`，分组获取 `name`，然后把 `{{name}}` 替换成 `obj[name](jawil)`**

发现还有一个小问题，如果有空格的话就会匹配失败，类似这种写法：
```js
const template = "{{name   }}很厉name害，才{{age   }}岁";
```

所以在上面的基础上还要去掉空格，其实也很简单，用正则或者 String.prototype.trim() 方法都行
```js
function render(template, context) {
  return template.replace(/\{\{(.*?)\}\}/g, (match, key) => context[key.trim()]);
}
const template = "{{name   }}很厉name害，才{{age   }}岁";
const context = { name: "jawil", age: "15" };
console.log(render(template, context));
```

**将函数挂到 String 的原型链，得到最终版本**  

甚至，我们可以通过修改原型链，实现一些很酷的效果：
```js
String.prototype.render = function (context) {
  return this.replace(/\{\{(.*?)\}\}/g, (match, key) => context[key.trim()]);
};
```

如果{}中间不是数字，则{}本身不需要转义，所以最终最简洁的代码：
```js
String.prototype.render = function (context) {
  return this.replace(/{{(.*?)}}/g, (match, key) => context[key.trim()]);
};
```

之后，我们便可以这样调用啦：
```js
"{{name}}很厉name害，才{{ age  }}岁".render({ name: "jawil", age: "15" });
```
