JavaScript模板引擎原理，几行代码的事儿
===
<!-- TOC -->

- [JavaScript模板引擎原理，几行代码的事儿](#javascript模板引擎原理几行代码的事儿)
  - [一、前言](#一前言)

<!-- /TOC -->

## 一、前言
什么是模板引擎，说的简单点，就是一个字符串中有几个变量待定。比如：
```js
var tpl = 'Hei, my name is <%name%>, and I\'m <%age%> years old.';
```

通过模板引擎函数把数据塞进去，
```js
var data = {
    "name": "Barret Lee",
    "age": "20"
};

var result = tplEngine(tpl, data);
//Hei, my name is Barret Lee, and I'm 20 years old.
```

那这玩意儿有什么作用呢？其实他就是一个预处理器（preprocessor），搞php开发的童鞋对Smarty必然是十分熟悉，Smarty是一个php模板引擎，tpl中待处理的字符通过数据匹配然后输出相应的html代码，加之比较给力的缓存技术，其速度和易用性是非常给力的！JS Template也是一样的，我们的数据库里保存着数以千万计的数据，而每一条数据都是通过同一种方式输入，就拿上面的例子来说，我们不可能在数据库里存几千条"Hei, my name..."，而是只保存对应的name和age，通过模板输出结果。

JS模板引擎应该做哪些事情？看看下面一串代码：

```js
var tpl = '<% for(var i = 0; i < this.posts.length; i++) {' +　
    'var post = posts[i]; %>' +
    '<% if(!post.expert){ %>' +
        '<span>post is null</span>' +
    '<% } else { %>' +
        '<a href="#"><% post.expert %> at <% post.time %></a>' +
    '<% } %>' +
'<% } %>';
```

一个基本的模板引擎至少可以保证上面的代码可以正常解析。如送入的数据是：

```js
var data = {
    "posts": [{
        "expert": "content 1",
        "time": "yesterday"
    },{
        "expert": "content 2",
        "time": "today"
    },{
        "expert": "content 3",
        "time": "tomorrow"
    },{
        "expert": "",
        "time": "eee"
    }]
};
```

 可以输出：
 ```html
<a href="#">content 1 at yesterday</a>
<a href="#">content 2 at today</a>
<a href="#">content 3 at tomorrow</a>
<span>post is null</span>
```

## 二、JS模板引擎的实现原理
### 1.正则抠出要匹配的内容
针对这一串代码，通过正则获取内容

```js
var tpl = 'Hei, my name is <%name%>, and I\'m <%age%> years old.';
var data = {
    "name": "Barret Lee",
    "age": "20"
};
```

最简单的方式就是通过replace函数了：

```js
var result = tpl.replace(/<%([^%>]+)?%>/g, function(s0, s1){
    return data[s1];
});
```

通过正则替换，我们很轻松的拿到了result，你可以去试一试，他正式我们想要的结果。但是这里又有了一个问题，改一下data和tpl，

```js
var tpl = 'Hei, my name is <%name%>, and I\'m <%info.age%> years old.';
var data = {
    "name": "Barret Lee",
    "info": { age": "20"}
};
```

再用上面的方式去获取结果，呵呵，不行了吧~ 这里data["info.age"]本身就是undefined，所以我们需要换一种方式来处理这个问题，那就是将它转换成真正的JS代码。如：

```js
return 'Hei, my name is ' + data.name + ', and I\'m ' + data.info.age' + ' years old.'
```

但是接着又有一个问题来了，当我们的代码中出现for循环和if的时候，上面的转换明显是不起作用的，如：
```js
var tpl = 'Posts: ' + 
          '<% for(var i = 0; i < post.length; i++) {'+
            '<a href="#"><% post[i].expert %></a>' + 
          '<% } %>'
```

如果继续采用上面的方式，得到的结果便是：

```js
return 'Posts: ' + 
       for(var i = 0; i < post.length; i++) { +
         '<a href="#">' + post[i].exper + '</a>' +
       }
```

这显然不是我们愿意看到的，稍微观察一下上面的结构，如果可以返回一个这样的结果也挺不错哦：

```js
'Posts: ' 
for(var i = 0; i < post.length; i++) {
    '<a href="#">' + post[i].exper + '</a>'
}
```

但是我们需要得到的是一个字符串，而不是上面这样零散的片段，因此可以把这些东西装入数组中。

### 2.装入数组
```js
var r = [];
r.push('Posts: ' );
r.push(for(var i = 0; i < post.length; i++) {);
r.push('<a href="#">');
r.push(post[i].exper);
r.push('</a>');
r.push(});
```

有人看到上面的代码就要笑了，第三行和最后一行代码的逻辑明显是不正确的嘛，那肿么办呢？呵呵，很简单，不放进去就行了呗，

```js
var r = [];
r.push('Posts: ' );
for(var i = 0; i < post.length; i++) {
    r.push('<a href="#">');
    r.push(post[i].exper);
    r.push('</a>');
}
```

这样的逻辑就十分完善了，不存在太多的漏洞，但是这个转化的过程是如何实现的？我们必须还是要写一个解析的模板函数出来。


### 3.分辨js逻辑部分
```js
var r = [];
tpl.replace(/<%([^%>]+)?%>/g, function(s0, s1){
    //完蛋了，这里貌似又要回到上面那可笑的逻辑有错误的一步啦... 该怎么处理比较好？
});
```

完蛋了，这里貌似又要回到上面那可笑的逻辑有错误的一步啦... 该怎么处理比较好？我们知道，JS给我们提供了构造函数的“类”，
```js
var fn = new Function("data", 
    "var r = []; for(var i in data){ r.push(data[i]); } return r.join(' ')");
fn({"name": "barretlee", "age": "20"}); // barretlee 20
```

知道了这个就好办了，我们可以把逻辑部分和非逻辑部分的代码链接成一个字符串，然后利用类似fn的函数直接编译代码。而/<%([^%>]+)?%>/g，这一个正则只能把逻辑部分匹配出来，要想把所有的代码都组合到一起，必须还得匹配非逻辑部分代码。replace函数虽然很强大，他也可以完成这个任务，但是实现的逻辑比较晦涩，所以我们换另外一种方式来处理。

先看一个简单的例子：
```js
var reg = /<%([^%>]+)?%>/g;
var tpl = 'Hei, my name is <%name%>, and I\'m <%age%> years old.';
var match = reg.exec(tpl);
console.log(match);
```

看到的是：
```js
[
    0: "<%name%>",
    1: name,
    index: 16,
    input: "Hei, my name is <%name%>, and I'm <%age%> years old."
    length: 2
]
```

这。。。我们可是想得到所有的匹配啊，他竟然只获取了name而忽略了后面的age，好吧，对正则稍微熟悉点的童鞋一定会知道应该这样处理：
```js
var reg = /<%([^%>]+)?%>/g;
while(match = reg.exec(tpl)) {
    console.log(match);
}
```

关于正则表达式的内容就不在这里细说了，有兴趣的同学可以多去了解下match,exec,search等正则的相关函数。这里主要是靠match的index属性来定位遍历位置，然后利用while循环获取所有的内容。


### 4.引擎函数
所以我们的引擎函数雏形差不多就出来了：

```js
var tplEngine = function(tpl, data){
    var reg = /<%([^%>]+)?%>/g,
            code = 'var r=[];\n',
            cursor = 0;  //主要的作用是定位代码最后一截
    var add = function(line) {
        code += 'r.push("' + line.replace(/"/g, '\\"') + '");\n';
    };

    while(match = reg.exec(tpl)) {
        add(tpl.slice(cursor, match.index)); //添加非逻辑部分
        add(match[1]);  //添加逻辑部分 match[0] = "<%" + match[1] + "%>";
        cursor = match.index + match[0].length;
    }

    add(tpl.substr(cursor, tpl.length - cursor)); //代码的最后一截 如:" years old."

    code += 'return r.join("");'; // 返回结果，在这里我们就拿到了装入数组后的代码
    console.log(code);

    return tpl;
};
```

这样一来，测试一个小demo:
```js
var tpl = '<% for(var i = 0; i < this.posts.length; i++) {' +　
        'var post = posts[i]; %>' +
        '<% if(!post.expert){ %>' +
            '<span>post is null</span>' +
        '<% } else { %>' +
            '<a href="#"><% post.expert %> at <% post.time %></a>' +
        '<% } %>' +
    '<% } %>';

tplEngine(tpl, data);
```

返回的结果让人很满意：

```js
var r=[];
r.push("");
r.push(" for(var i = 0; i < this.posts.length; i++) {var post = posts[i]; ");
r.push("");
r.push(" if(!post.expert){ ");
r.push("<span>post is null</span>");
r.push(" } else { ");
r.push("<a href=\"#\">");
r.push(" post.expert ");
r.push(" at ");
r.push(" post.time ");
r.push("</a>");
r.push(" } ");
r.push("");
r.push(" } ");
r.push("");
return r.join(""); 
```

不过我们并需要for，if，switch等这些东西也push到r数组中去，所以呢，还得改善下上面的代码，如果在line中发现了包含js逻辑的代码，我们就不应该让他进门：

```js
regOut = /(^( )?(if|for|else|switch|case|break|{|}))(.*)?/g;
var add = function(line, js) {
    js? code += line.match(regOut) ? line + '\n' : 'r.push(' + line + ');\n' :
        code += 'r.push("' + line.replace(/"/g, '\\"') + '");\n';
};
```

所以我们只剩下最后一步工作了，把data扔进去！


### 5.把data扔进去
没有比完成这东西更简单的事情啦，通过上面对Function这个函数的讲解，大家应该也知道怎么做了。

```js
return new Function(code).apply(data);
```

使用apply的作用就是让code中的一些变量作用域绑定到data上，不然作用域就会跑到global上，这样得到的数据索引就会出问题啦~ 当然我们可以再优化一下：

```js
return new Function(code.replace(/[\r\t\n]/g, '')).apply(data);
```

把回车换行以及tab键都给匹配掉，让代码更加干净一点。那么最终的代码就是：

```js
var tplEngine = function(tpl, data) {
    var reg = /<%([^%>]+)?%>/g, 
        regOut = /(^( )?(if|for|else|switch|case|break|{|}))(.*)?/g, 
        code = 'var r=[];\n', 
        cursor = 0;

    var add = function(line, js) {
        js? (code += line.match(regOut) ? line + '\n' : 'r.push(' + line + ');\n') :
            (code += line != '' ? 'r.push("' + line.replace(/"/g, '\\"') + '");\n' : '');
        return add;
    }
    while(match = reg.exec(tpl)) {
        add(tpl.slice(cursor, match.index))(match[1], true);
        cursor = match.index + match[0].length;
    }
    add(tpl.substr(cursor, tpl.length - cursor));
    code += 'return r.join("");';
    return new Function(code.replace(/[\r\t\n]/g, '')).apply(data);
};
```


## 三、应用场景
毕竟是前端代码，所以写出来是要为前端服务的，平时我们处理的一般是一个html的模板，通常的情况下，模板代码是放在script标签或者textarea中，所以首先是要获取到这里头的东西，然后再来做解析。

```js
var barretTpl = function(str, data) {

    //获取元素
    var element = document.getElementById(str);
    if (element) {
        //textarea或input则取value，其它情况取innerHTML
        var html = /^(textarea|input)$/i.test(element.nodeName) ? element.value : element.innerHTML;
        return tplEngine(html, data);
    } else {
        //是模板字符串，则生成一个函数
        //如果直接传入字符串作为模板，则可能变化过多，因此不考虑缓存
        return tplEngine(str, data);
    }
    var tplEngine = function(tpl, data) {
        // content above
    };
};
```
