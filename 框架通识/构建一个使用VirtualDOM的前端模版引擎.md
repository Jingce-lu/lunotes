构建一个使用 Virtual-DOM 的前端模版引擎
===
<!-- TOC -->

- [构建一个使用 Virtual-DOM 的前端模版引擎](#构建一个使用-virtual-dom-的前端模版引擎)
  - [1. 前言](#1-前言)
  - [2. 模板引擎和 Virtual-DOM 结合 —— Virtual-Template](#2-模板引擎和-virtual-dom-结合--virtual-template)
  - [3. Virtual-Template 的实现](#3-virtual-template-的实现)
    - [3.1 编译原理相关](#31-编译原理相关)

<!-- /TOC -->

## 1. 前言
本文尝试构建一个 Web 前端模板引擎，并且把这个引擎和 Virtual-DOM 进行结合。把传统模板引擎编译成 HTML 字符串的方式改进为编译成 Virtual-DOM 的 render 函数，可以有效地结合模板引擎的便利性和 Virtual-DOM 的性能。类似 ReactJS 中的 JSX。

## 2. 模板引擎和 Virtual-DOM 结合 —— Virtual-Template
考虑以下模板语法：
```js
<div>
  <h1>{title}</h1>
  <ul>
    {each users as user i}
    <li class="user-item">
      <img src="/avatars/{user.id}" />
      <span>NO.{i + 1} - {user.name}</span>
      {if user.isAdmin}
        I am admin
      {elseif user.isAuthor}
        I am author
      {else}
        I am nobody
      {/if}
    </li>
    {/each}
  </ul>
</div>
```

这只一个普通的模板引擎语法（类似 artTemplate），支持循环语句（each）、条件语句（if elseif else ..）、和文本填充（{...}）， 应该比较容易看懂，这里就不解释。当用下面数据渲染该模板的时候：

```js
var data = {
  title: 'Users List',
  users: [
    {id: 'user0', name: 'Jerry', isAdmin: true},
    {id: 'user1', name: 'Lucy', isAuthor: true},
    {id: 'user2', name: 'Tomy'}
  ]
}
```

会得到下面的 HTML 字符串：
```html
<div>
  <h1>Users List</h1>
  <ul>
    <li class="user-item">
       <img src="/avatars/user0" />
       <span>NO.1 - Jerry</span>
       I am admin
    </li>
    <li class="user-item">
       <img src="/avatars/user1" />
       <span>NO.2 - Lucy</span>
       I am author
    </li>
    <li class="user-item">
       <img src="/avatars/user2" />
       <span>NO.3 - Tomy</span>
       I am nobody
    </li>
  </ul>
</div>
```

把这个字符串塞入文档当中就可以生成 DOM 。但是问题是如果数据变更了，例如`data.title`由`Users List`修改成Users，你只能用 jQuery 修改 DOM 或者直接重新渲染一个新的字符串塞入文档当中。

然而我们可以参考 ReactJS 的 JSX 的做法，不把模板编译成 HTML， 而是把模板编译成一个返回 Virtual-DOM 的 render 函数。render 函数会根据传入的 state 不同返回不一样的 Virtual-DOM ，然后就可以根据 Virtual-DOM 算法进行 diff 和 patch：

```js
// setup codes
// ...

var render = template(tplString) // template 把模板编译成 render 函数而不是 HTML 字符串
var root1 = render(state1) // 根据初始状态返回的 virtual-dom

var dom = root.render() // 根据 virtual-dom 构建一个真正的 dom 元素
document.body.appendChild(dom)

var root2 = render(state2) // 状态变更，重新渲染另外一个 virtual-dom
var patches = diff(root1, root2) // virtual-dom 的 diff 算法
patch(dom, patches) // 更新真正的 dom 元素
```

这样做好处就是：既保留了原来模板引擎的语法，又结合了 Virtual-DOM 特性：当状态改变的时候不再需要 jQuery 了，而是跑一遍 Virtual-DOM 算法把真正的 DOM 给patch了，达到了 one-way data-binding 的效果，总结流程就是：
1. 先把模板编译成一个 render 函数，这个函数会根据数据状态返回 Virtual-DOM
2. 用 render 函数构建 Virtual-DOM；并根据这个 Virtual-DOM 构建真正的 DOM 元素，塞入文档当中
3. 当数据变更的时候，再用 render 函数渲染一个新的 Virtual-DOM
4. 新旧的 Virtual-DOM 进行 diff，然后 patch 已经在文档中的 DOM 元素

这里重点就是，如何能把模板语法编译成一个能够返回 Virtual-DOM 的 render 函数？例如上面的模板引擎，不再返回 HTML 字符串了，而是返回一个像下面那样的 render 函数：
```js
function render (state) {
  return el('div', {}, [
    el('h1', {}, [state.title]),
    el('ul', {}, state.users.map(function (user, i) {
       return el('li', {"class": "user-item"}, [
         el('img', {"src": "/avatars/" + user.id}, []),
         el('span', {}, ['No.' + (i + 1) + ' - ' + user.name]),
         (user.isAdmin 
           ? 'I am admin'
           : uesr.isAuthor 
             ? 'I am author'
             : '')
       ])
    }))
  ])
}
```

前面的模板和这个 render 函数在语义上是一样的，只要能够实现“模板 -> render 函数”这个转换，就可以跑上面所说的 Virtual-DOM 的算法流程，这样就把模板引擎和 Virtual-DOM结合起来。为了方便起见，这里把这个结合体称为 Virtual-Template 。


## 3. Virtual-Template 的实现
网上关于模板引擎的实现原理介绍非常多。如果语法不是太复杂的话，可以直接通过对语法标签和代码片段进行分割，识别语法标签内的内容（循环、条件语句）然后拼装代码，具体可以参考[这篇博客](http://www.cnblogs.com/hustskyking/p/principle-of-javascript-template.html)。其实就是正则表达式使用和字符串的操作，不需要对语法标签以外的内容做识别。

但是对于和 HTML 语法已经差别较大的模板语法（例如 Jade ），单纯的正则和字符串操作已经不够用了，因为其语法标签以外的代码片段根本不是合法的 HTML 。这种情况下一般需要编译器相关知识发挥用途：模板引擎本质上就是把一种语言编译成另外一种语言。

而对于 Virtual-Template 的情况，虽然其除了语法标签以外的代码都是合法的 HTML 字符串，但是我们的目的是把它编译成返回 Virtual-DOM 的 render 函数，在构建 Virtual-DOM 的时候，你需要知道元素的 tagName、属性等信息，所以就需要对 HTML 元素本身做识别。

因此 Virtual-Template 也需要借助编译原理（编译器前端）相关的知识，把一种语言（模板语法）编译成另外一种语言（一个叫 render 的 JavaScript 函数）。


### 3.1 编译原理相关
CS 本科都教过编译原理，本文会用到编译器前端的一些概念。在实现模板到 render 函数的过程中，要经过几个步骤：
1. 词法分析：把输入的模板分割成词法单元（tokens stream）
2. 语法分析：读入 tokens stream ，根据文法规则转化成抽象语法树（Abstract Syntax Tree）
3. 代码生成：遍历 AST，生成 render 函数体代码


