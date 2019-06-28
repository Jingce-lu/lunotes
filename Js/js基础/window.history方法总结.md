# window.history 方法总结

### 一、历史记录概览

```js
window.history.back();
window.history.forward();

window.history.go(-1);
window.history.go(1);

var numberOfEntries = window.history.length;
```

### 二、添加和修改历史记录条目：

```js
1、history.pushState();               
2、history.replaceState();
```

两种方法都允许我们添加和更新历史记录，它们的工作原理相同并且可以添加数量相同的参数。

除了方法之外，还有popstate事件。在后文中将介绍怎么使用和什么时候使用popstate事件。

pushState()和replaceState()参数一样，参数说明如下：

> 1、state：存储JSON字符串，可以用在popstate事件中。

> 2、title：现在大多数浏览器不支持或者忽略这个参数，最好用null代替

> 3、url：任意有效的URL，用于更新浏览器的地址栏，并不在乎URL是否已经存在地址列表中。更重要的是，它不会重新加载页面。

两个方法的主要区别就是：pushState()是在history栈中添加一个新的条目，replaceState()是替换当前的记录值。

使用方法：

1. onpopstate

```js
window.onpopstate = function(event) {
  alert("location: " + document.location + ", state: " + JSON.stringify(event.state));
};
//绑定事件处理函数. 
history.pushState({page: 1}, "title 1", "?page=1");    
//添加并激活一个历史记录条目 http://example.com/example.html?page=1,条目索引为1


history.pushState({page: 2}, "title 2", "?page=2");    
//添加并激活一个历史记录条目 http://example.com/example.html?page=2,条目索引为2


history.replaceState({page: 3}, "title 3", "?page=3"); 
//修改当前激活的历史记录条目 http://ex..?page=2 变为 http://ex..?page=3,条目索引为3


history.back(); // 弹出 "location: http://example.com/example.html?page=1, state: {"page":1}"
history.back(); // 弹出 "location: http://example.com/example.html, state: null
history.go(2);  // 弹出 "location: http://example.com/example.html?page=3, state: {"page":3}
```

2. pushState

在history栈中添加一个新的条目

```js
var stateObj = { foo: "bar" };
history.pushState(stateObj, "page 2", "bar.html");
```

3. replaceState

替换当前的记录值

```js
history.replaceState(stateObj, "page 2", "bar.html");
```

4. 读取当前状态

在页面加载时，可能会包含一个非空的状态对象。这种情况是会发生的，例如，如果页面中使用pushState()或replaceState()方法设置了一个状态对象，然后用户重启了浏览器。当页面重新加载时，页面会触发onload事件，但不会触发popstate事件。但是，如果你读取 history.state 属性，你会得到一个与  popstate 事件触发时得到的一样的状态对象。

你可以直接读取当前历史记录条目的状态，而不需要等待popstate事件：

```js
var currentState = history.state;
```

---------------

## 微信中打开头条新闻， 返回却到头条webApp首页源码，实现PV回流增长！

这种提高网站流量的方式，各大门户网站都在使用，包括通过App推送push的一些消息，通过浏览器打开的详情页面都做了这种措施。

实现并不困难，重点就在监听了浏览器返回的历史记录。

具体代码：

```js
function Goback(url){
    setTimeout(function () {
        if (history.length < 3) {   
            //注意这里 历史列表中URL的数量,满足条件说明这个页面是首次打开，而不是从首页或者其他页面跳转过来的。
            
            var state = {title: "index",url: url};
            window.history.pushState(state, "index", location.href);
            state = {title: "index",url: ""};
            window.history.pushState(state, "index", "");
        }
        window.addEventListener("popstate", function (e) {
            if (window.history.state != null && window.history.state.url != "") {
            location.href = window.history.state.url
            }
        });
    }, 1500);  
}
Goback("http://wwww.baidu.com");//你想返回的页面
```