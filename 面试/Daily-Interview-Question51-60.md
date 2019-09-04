Daily-Interview-Question 51-60
===
<!-- TOC -->

- [Daily-Interview-Question 51-60](#daily-interview-question-51-60)
  - [第 51 题：Vue 的响应式原理中 Object.defineProperty 有什么缺陷？](#第-51-题vue-的响应式原理中-objectdefineproperty-有什么缺陷)
  - [第 52 题：怎么让一个 div 水平垂直居中](#第-52-题怎么让一个-div-水平垂直居中)
  - [第 53 题：输出以下代码的执行结果并解释为什么](#第-53-题输出以下代码的执行结果并解释为什么)
  - [第 54 题：冒泡排序如何实现，时间复杂度是多少， 还可以如何改进？](#第-54-题冒泡排序如何实现时间复杂度是多少-还可以如何改进)
  - [第 55 题：某公司 1 到 12 月份的销售额存在一个对象里面](#第-55-题某公司-1-到-12-月份的销售额存在一个对象里面)
  - [第 56 题：要求设计 LazyMan 类，实现以下功能。](#第-56-题要求设计-lazyman-类实现以下功能)
  - [第 57 题：分析比较 opacity: 0、visibility: hidden、display: none 优劣和适用场景。](#第-57-题分析比较-opacity-0visibility-hiddendisplay-none-优劣和适用场景)
  - [第 58 题：箭头函数与普通函数（function）的区别是什么？构造函数（function）可以使用 new 生成实例，那么箭头函数可以吗？为什么？](#第-58-题箭头函数与普通函数function的区别是什么构造函数function可以使用-new-生成实例那么箭头函数可以吗为什么)
  - [第 59 题：给定两个数组，写一个方法来计算它们的交集。](#第-59-题给定两个数组写一个方法来计算它们的交集)
  - [第 60 题：已知如下代码，如何修改才能让图片宽度为 300px ？注意下面代码不可修改。](#第-60-题已知如下代码如何修改才能让图片宽度为-300px-注意下面代码不可修改)

<!-- /TOC -->

## 第 51 题：Vue 的响应式原理中 Object.defineProperty 有什么缺陷？
> 为什么在 Vue3.0 采用了 Proxy，抛弃了 Object.defineProperty？

1. Object.defineProperty无法监控到数组下标的变化，导致通过数组下标添加元素，不能实时响应；
2. Object.defineProperty只能劫持对象的属性，从而需要对每个对象，每个属性进行遍历，如果，属性值是对象，还需要深度遍历。Proxy可以劫持整个对象，并返回一个新的对象。
3. Proxy不仅可以代理对象，还可以代理数组。还可以代理动态增加的属性。


## 第 52 题：怎么让一个 div 水平垂直居中
```html
<div class="parent">
  <div class="child"></div>
</div>
```

1、
```css
div.parent {
    display: flex;
    justify-content: center;
    align-items: center;
}
```

2、
```css
div.parent {
    position: relative; 
}
div.child {
    position: absolute; 
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);  
}
/* 或者 */
div.child {
    width: 50px;
    height: 10px;
    position: absolute;
    top: 50%;
    left: 50%;
    margin-left: -25px;
    margin-top: -5px;
}
/* 或 */
div.child {
    width: 50px;
    height: 10px;
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    margin: auto;
}
```

3、
```css
div.parent {
    display: grid;
}
div.child {
    justify-self: center;
    align-self: center;
}
```

4、
```css
div.parent {
    font-size: 0;
    text-align: center;
    &::before {
        content: "";
        display: inline-block;
        width: 0;
        height: 100%;
        vertical-align: middle;
    }
}
div.child{
  display: inline-block;
  vertical-align: middle;
}
```

5、
```css
div.parent{
  display:flex; 
  /* display: grid; */
}
div.child{
  margin:auto;
}
```

6、 table-cell 
```css
.parent {
  display: table-cell;
  height: 200px;
  width: 200px;
  background-color: orange;
  text-align: center;
  vertical-align: middle;
}
 .child {
  display: inline-block;
  width: 100px;
  height: 100px;
  background-color: blue;
}
```



## 第 53 题：输出以下代码的执行结果并解释为什么
```js
var a = {n: 1};
var b = a;
a.x = a = {n: 2};

console.log(a.x) 	
console.log(b.x)
```

```js
var a = {n: 1};
var b = a;
a.x = a = {n: 2};

a.x 	// --> undefined
b.x 	// --> {n: 2}
```
答案已经写上面了，这道题的关键在于

1. 优先级。`.` 的优先级高于`=`，所以先执行`a.x`，堆内存中的`{n: 1}`就会变成`{n: 1, x: undefined}`，改变之后相应的`b.x`也变化了，因为指向的是同一个对象。
2. **赋值操作是从右到左**，所以先执行`a = {n: 2}`，a的引用就被改变了，然后这个返回值又赋值给了`a.x`，**需要注意**的是这时候`a.x`是第一步中的`{n: 1, x: undefined}`那个对象，其实就是`b.x`，相当于`b.x = {n: 2}`

**连续赋值**
1. a 赋值，a 指向堆内存 {n:1}
    ```js
    a = { n : 1 }
    ```
2. b 赋值，b 也指向对内存 {n:1}
    ```js
    b = a
    ```
3. `.`的优先级大于`=`，所以优先赋值。ps：此时a.x已经绑定到了{n: 1 , x: undefined}被等待赋值
    ```js
    a.x = undefined

    a // {n: 1 , x: undefined}
    b // 也指向上行的堆内存
    ```
4. 同等级赋值运算从右到左，a改变堆内存指向地址，所以a = {n: 2},
    ```js
    a.x = a = {n: 2};
    ```
5. 因为a.x已经绑定到了{n: 1 , x: undefined}这个内存地址，所以相当于
    ```js
    {n: 1 , x: undefined}.x = {n: 2}
    ```
6. 结果
    ```js
    a = {n: 2}
    b = {
      n: 1,
      x: {
        n: 2
      }
    }
    ```



## 第 54 题：冒泡排序如何实现，时间复杂度是多少， 还可以如何改进？
时间复杂度： n^2
```js
// 生成从l到r的数量为n的随机数组
function randomArr (n, l, r) {
    let arr = [];
    for (let i = 0; i < n; i++) {
        let _random = Math.round(l + Math.random() * (r - l));
        arr.push(_random)
    } 
    return arr;
}
function buddleSort (arr) {
    let len = arr.length;
    for (let i = len;  i >= 2;  i-- ) {
        for (let j = 0;  j < i - 1;  j++) {
             if (arr[j] > arr[j+1]) {
                  [arr[j], arr[j+1]] = [arr[j+1], arr[j]];
             }
        }
    }
    return arr;
}
console.log(buddleSort(randomArr(10, 5, 100)));
```

```js
function bubbleSort(arr) {
    for (let i = 0; i < arr.length; i++) {
        for (let j = 0; j < arr.length - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                const temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
            }
        }
    }
    console.log(arr);
}

// 改进冒泡排序
function bubbleSort1(arr) {
    let i = arr.length - 1;

    while (i > 0) {
        let pos = 0;
        for (let j = 0; j < i; j++) {
            if (arr[j] > arr[j + 1]) {
                pos = j;
                const temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
            }
        }
        i = pos;
    }
    console.log(arr);
}

function bubbleSort2(arr) {
    let low = 0;
    let high = arr.length - 1;
    let temp, j;

    while (low < high) {
        // 正排找最大
        for (j = low; j < high; ++j) {
            if (arr[j] > arr[j + 1]) {
                temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
            }
        }
        --high;

        // 反排找最小
        for (j = high; j > low; --j) {
            if (arr[j] < arr[j - 1]) {
                temp = arr[j];
                arr[j] = arr[j - 1];
                arr[j - 1] = temp;
            }
        }
        ++low;
    }
    console.log(arr);
}
```



## 第 55 题：某公司 1 到 12 月份的销售额存在一个对象里面
> 如下：{1:222, 2:123, 5:888}，请把数据处理为如下结构：[222, 123, null, null, 888, null, null, null, null, null, null, null]。




## 第 56 题：要求设计 LazyMan 类，实现以下功能。
```js
LazyMan('Tony');
// Hi I am Tony

LazyMan('Tony').sleep(10).eat('lunch');
// Hi I am Tony
// 等待了10秒...
// I am eating lunch

LazyMan('Tony').eat('lunch').sleep(10).eat('dinner');
// Hi I am Tony
// I am eating lunch
// 等待了10秒...
// I am eating diner

LazyMan('Tony').eat('lunch').eat('dinner').sleepFirst(5).sleep(10).eat('junk food');
// Hi I am Tony
// 等待了5秒...
// I am eating lunch
// I am eating dinner
// 等待了10秒...
// I am eating junk food
```

Answer

```js
class LazyManClass {
  constructor(name) {
    this.name = name
    this.queue = []
    console.log(`Hi I am ${name}`)
    setTimeout(() => {
      this.next()
    },0)
  }

  sleepFirst(time) {
    const fn = () => {
      setTimeout(() => {
        console.log(`等待了${time}秒...`)
        this.next()
      }, time)
    }
    this.queue.unshift(fn)
    return this
  }

  sleep(time) {
    const fn = () => {
      setTimeout(() => {
        console.log(`等待了${time}秒...`)
        this.next()
      },time)
    }
    this.queue.push(fn)
    return this
  }

  eat(food) {
    const fn = () => {
      console.log(`I am eating ${food}`)
      this.next()
    }
    this.queue.push(fn)
    return this
  }

  next() {
    const fn = this.queue.shift()
    fn && fn()
  }
}

function LazyMan(name) {
  return new LazyManClass(name)
}

LazyMan('Tony').eat('lunch').eat('dinner').sleepFirst(5).sleep(4).eat('junk food');
```

**Proxy 版本**
```js
function LazyMan(username) {
  console.log(' Hi I am ' + username);

  var temp = {
    taskList: [],
    sleepFirst(timeout) {
      return () => {
        setTimeout(() => {
          console.log(`等待了${timeout}秒...`);
          this.next();
        }, timeout * 1000);
      };
    },
    sleep(timeout) {
      return () => {
        setTimeout(() => {
          console.log(`等待了${timeout}秒...`);
          this.next();
        }, timeout * 1000);
      };
    },
    eat(type) {
      return () => {
        console.log(`I am eating ${type}`);
        this.next();
      };
    },
    next() {
      var fn = this.taskList.shift();
      fn && fn();
    }
  };

  var proxy = new Proxy(temp, {
    get(target, key, receiver) {
      return function(...rest) {
        if (key === 'sleepFirst') {
          target.taskList.unshift(target[key](rest));
        } else {
          target.taskList.push(target[key](rest));
        }
        return receiver;
      };
    }
  });

  setTimeout(() => {
    temp.next();
  }, 0);
  return proxy;
}
LazyMan('Tony').eat('lunch').eat('dinner').sleepFirst(5).sleep(10).eat('junk food');
// Hi I am Tony
// 等待了5秒...
// I am eating lunch
// I am eating dinner
// 等待了10秒...
// I am eating junk food
```



## 第 57 题：分析比较 opacity: 0、visibility: hidden、display: none 优劣和适用场景。
1. display: none (不占空间，不能点击)（场景，显示出原来这里不存在的结构）
2. visibility: hidden（占据空间，不能点击）（场景：显示不会导致页面结构发生变动，不会撑开）
3. opacity: 0（占据空间，可以点击）（场景：可以跟transition搭配）

结构：
1. display:none: 会让元素完全从渲染树中消失，渲染的时候不占据任何空间, 不能点击，
2. visibility: hidden:不会让元素从渲染树消失，渲染元素继续占据空间，只是内容不可见，不能点击
3. opacity: 0: 不会让元素从渲染树消失，渲染元素继续占据空间，只是内容不可见，可以点击

继承：
1. display: none和opacity: 0：是非继承属性，子孙节点消失由于元素从渲染树消失造成，通过修改子孙节点属性无法显示。
2. visibility: hidden：是继承属性，子孙节点消失由于继承了hidden，通过设置visibility: visible;可以让子孙节点显式。

性能：
1. displaynone : 修改元素会造成文档回流,读屏器不会读取display: none元素内容，性能消耗较大
2. visibility:hidden: 修改元素只会造成本元素的重绘,性能消耗较少读屏器读取visibility: hidden元素内容
3. opacity: 0 ： 修改元素会造成重绘，性能消耗较少

联系：
- 它们都能让元素不可见

## 第 58 题：箭头函数与普通函数（function）的区别是什么？构造函数（function）可以使用 new 生成实例，那么箭头函数可以吗？为什么？
箭头函数是普通函数的简写，可以更优雅的定义一个函数，和普通函数相比，有以下几点差异：

1. 函数体内的 this 对象，就是定义时所在的作用域中的 this 值，因为 JS 的静态作用域的机制，this 相当于一个普通变量会向作用域链中查询结果，同时定义时所在对象也并不等于所在对象中的 this 值。
2. 不可以使用 arguments 对象，该对象在函数体内不存在。如果要用，可以用 rest 参数代替。
3. 不可以使用 yield 命令，因此箭头函数不能用作 Generator 函数。
4. 不可以使用 new 命令，因为：
      - 没有自己的 this，无法调用 call，apply。
      - 没有 prototype 属性 ，而 new 命令在执行时需要将构造函数的 prototype 赋值给新的对象的 __proto__

new 过程大致是这样的：
```js
function newFunc(father, ...rest) {
  var result = {};
  result.__proto__ = father.prototype;
  var result2 = father.apply(result, rest);
  if (
    (typeof result2 === 'object' || typeof result2 === 'function') &&
    result2 !== null
  ) {
    return result2;
  }
  return result;
}
```


## 第 59 题：给定两个数组，写一个方法来计算它们的交集。
> 例如：给定 nums1 = [1, 2, 2, 1]，nums2 = [2, 2]，返回 [2, 2]。

哈希表，时间复杂度O(m + n) m为nums1长度，n为nums2长度
```js
const intersect = (nums1, nums2) => {
  const map = {}
  const res = []
  for (let n of nums1) {
    if (map[n]) {
      map[n]++
    } else {
      map[n] = 1
    }
  }
  for (let n of nums2) {
    if (map[n] > 0) {
      res.push(n)
      map[n]--
    }
  }
  return res
}
```

```js
let insertSection = (...args) => {
  let [ first, second ] = args
  let res = []
  while (first.length) {
    let item = first.pop()  
    let index = second.indexOf (item)
    if (index > -1) {
      second.splice(index, 1)
      res.push(item)
    }
  }
  return res
}

// test
var nums1 = [1]
var nums2 = [1,1]

var res = insertSection(nums1, nums2)
console.log(res) // [1]

var nums1 = [2, 2, 1], nums2 = [1 , 2, 2, 3, 4];

var res2 = insertSection(nums1, nums2)
console.log(res2) // [1, 2, 2]
```


## 第 60 题：已知如下代码，如何修改才能让图片宽度为 300px ？注意下面代码不可修改。
> `<img src="1.jpg" style="width:480px!important;”>`


1. `<img src="1.jpg" style="width:480px!important; max-width: 300px">`
2. `<img src="1.jpg" style="width:480px!important; transform: scale(0.625, 1);" >`
3. `<img src="1.jpg" style="width:480px!important; width:300px!important;">`
4. js: `document.getElementsByTagName("img")[0].setAttribute("style","width:300px!important;")`