# es6编码规范

[Airbnb JavaScript 代码规范（ES6）](https://www.w3cschool.cn/rtuhtw/v7q3jozt.html)

### 1：关键字import
``` javascript
// ES5  
var MyComponent = require('./MyComponent.js');
// ES6  
import MyComponent from './MyComponent';
```

### 2：关键字exports
``` javascript
// ES5  

var Mycomponent = React.createClass({});
module.exports = MyComponent;

// ES6,用export default来实现相同的功能  
// ES6  
export default class MyComponent extends React.Component {}
```
### 3：定义组件
```javascript
// ES5  
var Phono = {
    name,
    age,
    getAge: function() {
        return age
    }
}

// ES6  
//名字：function() 的写法了，而是直接使用 名字()，在方法的最后也不能在有逗号了
class Photo {
    name
    age
    getAge() {
        return this.age
    }
    getName() {
        return this.name;
    }
}
```
### 4：箭头函数 arrow function
> 注意：箭头函数中不能使用arguments对象

```javascript
//ES5与ES6对比
//ES5： function name(参数) {运算表达式;return 表达式}
//ES6： (参数) => {运算表达式;return 表达式}

// 箭头函数的例子  
() => 1;
v => v + 1;
(a, b) => a + b;
() => {
    alert("foo");
}
e => {
    if (e == 0) {
        return 0;
    }
    return 1000 / e;
}


//例如
(x, y) => {
    x++;
    y--;
    return x + y
}
// 等同于
s = function(x, y) {
    x++;
    y--;
    return x + y;
};
//例如
f = v => v;
//上面的箭头函数等同于：
f = function(v) {
    return v;
};

f = () => 5;
// 等同于
f = function() { return 5 };

sum = (num1, num2) => num1 + num2;

// 等同于
sum = function(num1, num2) {
    return num1 + num2;
};
//如果箭头函数的代码块部分多于一条语句，就要使用大括号将它们括起来，并且使用return语句返回。
sum = (num1, num2) => { return num1 + num2; }
    //由于大括号被解释为代码块，所以如果箭头函数直接返回一个对象，必须在对象外面加上括号。
getTempItem = id => ({ id: id, name: "Temp" });
//箭头函数可以与变量解构结合使用
const full = ({ first, last }) => first + ' ' + last;

// 等同于
function full(person) {
    return person.first + ' ' + person.last;
}
//click
clickBtn = (event) => { event.stopPropagation() }
$('btn').on('click', (event => event.stopPropagation()))
$('btn').on('click', (event) => {
    return event.stopPropagation()
})

```
### 5：class, extends和super
```javascript
class Animal {
    constructor() {
        this.type = 'animal'
    }
    says(say) {
        console.log(this.type + ' says ' + say)
    }
}

let animal = new Animal()
animal.says('hello') //animal says hello

class Cat extends Animal {
    constructor() {
        //super关键字，它指代父类的实例（即父类的this对象）。子类必须在constructor方法中调用super方法，否则新建实例时会报错。
        //ES6的继承机制，实质是先创造父类的实例对象this（所以必须先调用super方法），然后再用子类的构造函数修改this。
        super()
        this.type = 'cat'
    }
}

let cat = new Cat()
cat.says('hello') //cat says hello
```

> 定义类时，方法的顺序如下： 

* constructor
* public get/set 公用访问器，set只能传一个参数
* public methods 公用方法，以函数命名区分，不带下划线
* private get/set 私有访问器，私有相关命名应加上下划线_为前缀
* private methods 私有方法

```javascript
class SomeClass {
  constructor() {
    // constructor
  }
  
  get aval() {
    // public getter
  }
  
  set aval(val) {
    // public setter
  }
  
  doSth() {
    // 公用方法
  }
  
  get _aval() {
    // private getter
  }
  
  set _aval() {
    // private setter
  }
  
  _doSth() {
    // 私有方法
  }
}

``` 
### 6 ：声明变量
```javascript
// 可以初始化变量
let a = obj || {}
```
### 7 ：for循环
```javascript
var arr = ['val1', 'val2', 'val3'];
for (var i = 0; i < arr.length; i++) {
    console.log(arr[i]);
    console.log(i);
    console.log(arr);
}

//推荐
arr.map((val, index, array) => {
    console.log(val);
    console.log(index);
    console.log(array);
})
arr.forEach((val, index, array) => {
    console.log(val);
    console.log(index);
    console.log(array);
})

for (let i = 0; i < allImgs.length; i++)
//推荐
    for (let index in allImgs)

```
### 8 ：赋值的方法
```javascript
this.str = "CH";
var str = this.str && this.str.toLowerCase(); //输出  "ch"
this.str = null;
var str = this.str && this.str.toLowerCase(); //输出  null
//相当于
if (this.str) { //当this.str字符串存在，则把他转为小写赋值给str
    str = this.str.toLowerCase();
} else { //否则把他自己赋值给str
    str = this.str;
}

if (a == 1) {
    b()
}
//可以写成
a == 1 && b()


// ES5  
var a = arr[0],
    b = arr[1],
    c = arr[2];


// ES6
let [a,b,c]=arr;

```

> 嵌套数组解构

```javascript
var arr = [[1, 2, [3, 4]], 5, 6];
var [[d, e, [f, g]], h, i] = arr;
console.log(d);//1
console.log(f);//3
console.log(i);//6
```

> 函数传参解构

```javascript
var arr = ['this is a string', 2, 3];

function fn1([a, b, c]) {
    console.log(a);
    console.log(b);
    console.log(c);
}

fn1(arr);
//this is a string
//2
//3
```

> for循环解构

```javascript
var arr = [[11, 12], [21, 22], [31, 32]];
for (let [a, b] of arr) {
    console.log(a);
    console.log(b);
}
//11
//12
//21
//22
//31
//32
```

> 对象赋值解构

```javascript
var obj = {
    name: 'chris',
    sex: 'male',
    age: 26,
    son: {
        sonname: '大熊',
        sonsex: 'male',
        sonage: 1
    }
};

var {name, sex, age, son} = obj;
console.log(name + ' ' + sex + ' ' + age); //chris male 26
console.log(son); // { sonname: '大熊', sonsex: 'male', sonage: 1 }
```

> 对象传参解构

```javascript
var obj = {
    name: 'chris',
    sex: 'male',
    age: 26,
    son: {
        sonname: '大熊',
        sonsex: 'male',
        sonage: 1
    }
};

function fn2({sex, age, name}) {
    console.log(name + ' ' + sex + ' ' + age);
}

fn2(obj);
//chris male 26
```

> 变量名与对象属性名不一致解构

```javascript
var obj = {
    name: 'chris',
    sex: 'male',
    age: 26
};
var {name: nickname, age: howold} = obj;
console.log(nickname + ' ' + howold); //chris 26
```

> 嵌套对象解构

```javascript
var obj = {
    name: 'chris',
    sex: 'male',
    age: 26,
    son: {
        sonname: '大熊',
        sonsex: 'male',
        sonage: 1
    }
};
var {name, sex, age, son: {sonname, sonsex, sonage}} = obj;
console.log(sonname + ' ' + sonsex + ' ' + sonage);
//大熊 male 1

//Babel暂不支持这种嵌套解构
obj = {
    name: 'chris',
    sex: 'male',
    age: [1, 2, 3]
}

{name, sex, age: [a, b, c]} = obj;
console.log(c);
```

> 嵌套对象属性重名，解构时需要更改变量名

```javascript
var obj = {
    name: 'chris',
    sex: 'male',
    age: 26,
    son: {
        name: '大熊',
        sex: 'male',
        age: 1
    }
};
//赋值解构
var {name: fathername, son: {name, sex, age}} = obj;
console.log(fathername); //chris
console.log(name); //大熊

//传参解构
function fn3({sex, age, name, son: {name: sonname}}) {
    console.log(name + ' ' + sex + ' ' + age + ' ' + sonname);
}

fn3(obj);
//chris male 26 大熊
```

> 循环解构对象

```javascript
var arr = [{name: 'chris', age: 26}, {name: 'jack',    age: 27}, {name: 'peter',age: 28}];

for (let {age, name} of arr) {
    console.log(name + ' ' + age);
}
//chris 26
//jack 27
//peter 28
```

> 解构的特殊应用场景

```javascript
//变量互换
var x = 1,
    y = 2;
var [x, y] = [y, x];
console.log(x); //2
console.log(y); //1

//字符串解构
var str = 'love';
var [a, b, c, d] = str;
console.log(a);//l
console.log(b);//o
console.log(c);//v
console.log(d);//e
```
### 9：短路求值简写方式
```javascript
if (variable1 !== null || variable1 !== undefined || variable1 !== '') {
    let variable2 = variable1;
}
const variable2 = variable1 || 'new';
```

### 10： if存在条件简写方法
```javascript
if (likeJavaScript === true) {}
//简写：
if (likeJavaScript) {}
let a;
if (a !== true) {
    // do something...
}
//简写：
let a;
if (!a) {
    // do something...
}
```
### 11： 默认参数值
```javascript
function volume(l, w, h) {
    if (w === undefined)
        w = 3;
    if (h === undefined)
        h = 4;
    return l * w * h;
}
//简写：
volume = (l, w = 3, h = 4) => (l * w * h);
volume(2) //output: 24
```
### 12：模板字符串
```javascript
const welcome = 'You have logged in as ' + first + ' ' + last + '.'
const db = 'http://' + host + ':' + port + '/' + database;
//推荐
const welcome = `You have logged in as ${first} ${last}`;

const db = `http://${host}:${port}/${database}`;
```
### 13：扩展运算符简写
```javascript
// joining arrays
const odd = [1, 3, 5];
const nums = [2, 4, 6].concat(odd);

// cloning arrays
const arr = [1, 2, 3, 4];
const arr2 = arr.slice()
    //简写：
    // joining arrays
const odd = [1, 3, 5];
const nums = [2, 4, 6, ...odd];
console.log(nums); // [ 2, 4, 6, 1, 3, 5 ]

// cloning arrays
const arr = [1, 2, 3, 4];
const arr2 = [...arr];
//不像concat()函数，可以使用扩展运算符来在一个数组中任意处插入另一个数组。
const odd = [1, 3, 5];
const nums = [2, ...odd, 4, 6];
//也可以使用扩展运算符解构：
const { a, b, ...z } = { a: 1, b: 2, c: 3, d: 4 };
console.log(a) // 1
console.log(b) // 2
console.log(z) // { c: 3, d: 4 }
```
### 14 ：强制参数简写
```javascript
function foo(bar) {
    if (bar === undefined) {
        throw new Error('Missing parameter!');
    }
    return bar;
}
//简写：
mandatory = () => {
    throw new Error('Missing parameter!');
}

foo = (bar = mandatory()) => {
    return bar;
}
```

### 15： Array.find简写
```javascript
const pets = [
    { type: 'Dog', name: 'Max' },
    { type: 'Cat', name: 'Karl' },
    { type: 'Dog', name: 'Tommy' },
]

function findDog(name) {
    for (let i = 0; i < pets.length; ++i) {
        if (pets[i].type === 'Dog' && pets[i].name === name) {
            return pets[i];
        }
    }
}

//简写：
pet = pets.find(pet => pet.type === 'Dog' && pet.name === 'Tommy');
```

### 16 ：Object[key]简写
```javascript
//考虑一个验证函数
function validate(values) {
    if (!values.first)
        return false;
    if (!values.last)
        return false;
    return true;
}

console.log(validate({ first: 'Bruce', last: 'Wayne' })); // true
//假设当需要不同域和规则来验证，能否编写一个通用函数在运行时确认？
// 对象验证规则
const schema = {
    first: {
        required: true
    },
    last: {
        required: true
    }
}

// 通用验证函数
const validate = (schema, values) => {
    for (field in schema) {
        if (schema[field].required) {
            if (!values[field]) {
                return false;
            }
        }
    }
    return true;
}


console.log(validate(schema, { first: 'Bruce' })); // false
console.log(validate(schema, { first: 'Bruce', last: 'Wayne' })); // true

```