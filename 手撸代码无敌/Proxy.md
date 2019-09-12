Proxy
===

Proxy 是 ES6 中新增的功能，可以用来自定义对象中的操作

```js
let p = new Proxy(target, handler);
// `target` 代表需要添加代理的对象
// `handler` 用来自定义对象中的操作
```

可以很方便的使用 Proxy 来实现一个数据绑定和监听

```js
let onWatch = (obj, setBind, getLogger) => {
  let handler = {
    get(target, property, receiver) {
      getLogger(target, property)
      return Reflect.get(target, property, receiver);
    },
    set(target, property, value, receiver) {
      setBind(value);
      return Reflect.set(target, property, value);
    }
  };
  return new Proxy(obj, handler);
};

let obj = { a: 1 }
let value
let p = onWatch(obj, (v) => {
  value = v
}, (target, property) => {
  console.log(`Get '${property}' = ${target[property]}`);
})
p.a = 2 // bind `value` to `2`
p.a // -> Get 'a' = 2
```


**proxy.html**

```html
<html>
  <head>
    <meta charset="UTF-8" />
    <meta
      name="viewport"
      content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0"
    />
    <meta http-equiv="X-UA-Compatible" content="ie=edge" />
    <title>Vue 双向绑定</title>
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
      <input type="text" id="input" />
      <div>您输入的是： <span id="title"></span></div>
      <button type="button" name="button" id="btn">添加到Todolist</button>
      <ul id="list"></ul>
    </div>
  </body>

  <script>
    const obj = {};
    const arr = [];
    const input = document.getElementById("input");
    const title = document.getElementById("title");
    const list = document.getElementById("list");
    const btn = document.getElementById("btn");
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
    // 监听对象
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
    input.addEventListener("keyup", function(e) {
        newObj.text = e.target.value;
    });
    btn.addEventListener("click", function() {
      newArr.push(parseInt(newObj.text));
    });
  </script>
</html>
```