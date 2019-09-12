摒弃Object.defineProperty，基于 Proxy 的观察者机制探索
===
<!-- TOC -->

- [摒弃Object.defineProperty，基于 Proxy 的观察者机制探索](#摒弃objectdefineproperty基于-proxy-的观察者机制探索)
  - [一.为什么要取代Object.defineProperty](#一为什么要取代objectdefineproperty)
  - [二.什么是Proxy](#二什么是proxy)
    - [1.含义：](#1含义)
    - [2.基本用法：](#2基本用法)
    - [3.示例：](#3示例)
  - [三.基于Proxy来实现双向绑定](#三基于proxy来实现双向绑定)
  - [四.基于Proxy来实现vue的观察者机制](#四基于proxy来实现vue的观察者机制)
    - [1.Proxy实现observe](#1proxy实现observe)
    - [2.compile和watcher](#2compile和watcher)
  - [基于proxy的简易版vue](#基于proxy的简易版vue)

<!-- /TOC -->

## 一.为什么要取代Object.defineProperty

既然要取代Object.defineProperty，那它肯定是有一些明显的缺点，总结起来大概是下面两个：
1. `Object.defineProperty`无法监控到数组下标的变化，导致直接通过数组的下标给数组设置值，不能实时响应。 为了解决这个问题，经过vue内部处理后可以使用以下几种方法来监听数组
    - push()
    - pop()
    - shift()
    - unshift()
    - splice()
    - sort()
    - reverse()  
  
    由于只针对了以上八种方法进行了hack处理,所以其他数组的属性也是检测不到的，还是具有一定的局限性。
2. Object.defineProperty只能劫持对象的属性,因此我们需要对每个对象的每个属性进行遍历。Vue 2.x里，是通过 **递归 + 遍历** data 对象来实现对数据的监控的，如果属性值也是对象那么需要深度遍历,显然如果能劫持一个完整的对象是才是更好的选择。

而要取代它的Proxy有以下两个优点;
1. 可以劫持整个对象，并返回一个新对象
2. 有13种劫持操作


## 二.什么是Proxy
### 1.含义：
- Proxy是 ES6 中新增的一个特性，翻译过来意思是"代理"，用在这里表示由它来“代理”某些操作。
- Proxy 让我们能够以简洁易懂的方式控制外部对对象的访问。其功能非常类似于设计模式中的代理模式。
- Proxy 可以理解成，在目标对象之前架设一层“拦截”，外界对该对象的访问，都必须先通过这层拦截，因此提供了一种机制，可以对外界的访问进行过滤和改写。
- 使用 Proxy 的核心优点是可以交由它来处理一些非核心逻辑（如：读取或设置对象的某些属性前记录日志；设置对象的某些属性值前，需要验证；某些属性的访问控制等）。 从而可以让对象只需关注于核心逻辑，达到关注点分离，降低对象复杂度等目的。

### 2.基本用法：
```js
let p = new Proxy(target, handler);
```

参数：
- **target** 是用Proxy包装的被代理对象（可以是任何类型的对象，包括原生数组，函数，甚至另一个代理）。
- **handler** 是一个对象，其声明了代理target 的一些操作，其属性是当执行一个操作时定义代理的行为的函数。
- **p** 是代理后的对象。当外界每次对 **p** 进行操作时，就会执行 handler 对象上的一些方法。Proxy共有13种劫持操作，handler代理的一些常用的方法有如下几个：
    1. get：读取
    2. set：修改
    3. has：判断对象是否有该属性
    4. construct：构造函数

### 3.示例：
下面就用Proxy来定义一个对象的get和set，作为一个基础demo
```js
let obj = {};
let handler = {
  get(target, property) {
    console.log(`${property} 被读取`);
    return property in target ? target[property] : 3;
  },
  set(target, property, value) {
    console.log(`${property} 被设置为 ${value}`);
    target[property] = value;
  }
}

let p = new Proxy(obj, handler);
p.name = 'tom' //name 被设置为 tom
p.age; //age 被读取 3
```

- **p** 读取属性的值时，实际上执行的是 `handler.get()` ：在控制台输出信息，并且读取被代理对象 obj 的属性。
- **p** 设置属性值时，实际上执行的是 `handler.set()` ：在控制台输出信息，并且设置被代理对象 obj 的属性的值。


## 三.基于Proxy来实现双向绑定
用Proxy来实现一个经典的双向绑定todolist，首先简单的写一点html结构：
```html
<div id="app">
  <input type="text" id="input" />
  <div>您输入的是： <span id="title"></span></div>
  <button type="button" name="button" id="btn">添加到todolist</button>
  <ul id="list"></ul>
</div>
```

先来一个Proxy，实现输入框的双向绑定显示：

```js
const obj = {};
const input = document.getElementById("input");
const title = document.getElementById("title");

const newObj = new Proxy(obj, {
  get: function(target, key, receiver) {
    console.log(`getting ${key}!`);
    return Reflect.get(target, key, receiver);
  },
  set: function(target, key, value, receiver) {
    console.log(target, key, value, receiver);
    if (key === "text") {
      input.value = value;
      title.innerHTML = value;
    }
    return Reflect.set(target, key, value, receiver);
  }
});

input.addEventListener("keyup", function(e) {
  newObj.text = e.target.value;
});
```

这里代码涉及到`Reflect`属性，这也是一个es6的新特性

接下来就是添加todolist列表，先把数组渲染到页面上去：

```js
// 渲染todolist列表
const Render = {
  // 初始化
  init: function(arr) {
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < arr.length; i++) {
      const li = document.createElement("li");
      li.textContent = arr[i];
      fragment.appendChild(li);
    }
    list.appendChild(fragment);
  },
  addList: function(val) {
    const li = document.createElement("li");
    li.textContent = val;
    list.appendChild(li);
  }
};
```

再来一个Proxy，实现Todolist的添加：

```js
const arr = [];
// 监听数组
const newArr = new Proxy(arr, {
  get: function(target, key, receiver) {
    return Reflect.get(target, key, receiver);
  },
  set: function(target, key, value, receiver) {
    console.log(target, key, value, receiver);
    if (key !== "length") {
      Render.addList(value);
    }
    return Reflect.set(target, key, value, receiver);
  }
});

// 初始化
window.onload = function() {
  Render.init(arr);
};

btn.addEventListener("click", function() {
  newArr.push(parseInt(newObj.text));
});
```

这样就用 Proxy实现了一个简单的双向绑定Todolist,具体代码可参考proxy.html


## 四.基于Proxy来实现vue的观察者机制
### 1.Proxy实现observe

```js
observe(data) {
  const that = this;
  let handler = {
    get(target, property) {
      return target[property];
    },
    set(target, key, value) {
      let res = Reflect.set(target, key, value);
      that.subscribe[key].map(item => {
        item.update();
      });
      return res;
    }
  };
  this.$data = new Proxy(data, handler);
}
```

这段代码里把代理器返回的对象代理到`this.$data`，即`this.$data`是代理后的对象，外部每次对`this.$data`进行操作时，实际上执行的是这段代码里`handler`对象上的方法。


### 2.compile和watcher


## 基于proxy的简易版vue
```html
<html>
  <head>
    <meta charset="UTF-8" />
    <meta
      name="viewport"
      content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0"
    />
    <meta http-equiv="X-UA-Compatible" content="ie=edge" />
    <title>proxyVue</title>
    <style>
        #app {
            margin: 100px auto 0 auto;
            width: 300px;
        }
        #btn {
            margin: 10px auto;
        }
    </style>
  </head>
  <body>
    <div id="app">
      <input type="text" v-model="num" />
      <input id="btn" type="button" value="添加到Todolist" v-click="addList" /><br/>
      <span>您输入的是：</span><span v-bind="num"></span>
      <ul id="list"></ul>
    </div>
  </body>

  <script>
    class proxyVue {
      constructor(options) {
        this.$options = options || {};
        this.$methods = this._methods = this.$options.methods;
        const data = (this._data = this.$options.data);
        this.subscribe = {};
        this.observe(data);
        this.compile(options.el);
      }
      publish(watcher) {
        if (!this.subscribe[watcher.property])
          this.subscribe[watcher.property] = [];
        this.subscribe[watcher.property].push(watcher);
      }
      observe(data) {
        const that = this;
        let handler = {
          get(target, property) {
            return target[property];
          },
          set(target, property, value) {
            let res = Reflect.set(target, property, value);
            that.subscribe[property].map(item => {
              item.update();
            });
            return res;
          }
        };
        this.$data = new Proxy(data, handler);
      }
      compile(el) {
        const nodes = Array.prototype.slice.call(
          document.querySelector(el).children
        );
        let data = this.$data;
        nodes.map(node => {
          if (node.children.length > 0) this._complie(node);
          if (node.hasAttribute("v-bind")) {
            let property = node.getAttribute("v-bind");
            this.publish(new Watcher(node, "innerHTML", data, property));
          }
          if (node.hasAttribute("v-model")) {
            let property = node.getAttribute("v-model");
            this.publish(new Watcher(node, "value", data, property));
            node.addEventListener("input", () => {
              data[property] = node.value;
            });
          }
          if (node.hasAttribute("v-click")) {
            let methodName = node.getAttribute("v-click");
            let mothod = this.$methods[methodName].bind(data);
            node.addEventListener("click", mothod);
          }
        });
      }
    }
    class Watcher {
      constructor(node, attr, data, property) {
        this.node = node;
        this.attr = attr;
        this.data = data;
        this.property = property;
      }
      update() {
        this.node[this.attr] = this.data[this.property];
      }
    }
    // 渲染todolist列表
    const Render = {
      // 初始化
      init: function(arr) {
        const fragment = document.createDocumentFragment();
        for (let i = 0; i < arr.length; i++) {
          const li = document.createElement("li");
          li.textContent = arr[i];
          fragment.appendChild(li);
        }
        list.appendChild(fragment);
      },
      addList: function(val) {
        const li = document.createElement("li");
        li.textContent = val;
        list.appendChild(li);
      }
    };
    // 实例化一个proxyVue
    window.onload = function() {
      let vm = new proxyVue({
        el: "#app",
        data: {
          num: 0,
          arr: []
        },
        methods: {
          addList() {
            this.arr.push(this.num);
            Render.addList(this.num);
          }
        }
      });
    };
  </script>
</html>
```