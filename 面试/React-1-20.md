React 1-20
===

## 1. react什么时候使用状态管理器？
通过提升单个组件的复杂度,实现组件通讯


## 2. [react] render函数中return如果没有使用()会有什么问题？
我们在使用JSX语法书写react代码时，babel会将JSX语法编译成js，同时会在每行自动添加`分号（；）`，如果return后换行了，那么就会变成 `return；` 一般情况下会报错：

> Nothing was returned from render. This usually means a return statement is missing. Or, to render nothing, return null.

上面这段英文翻译成中文：
- 渲染没有返回任何内容。这通常意味着缺少return语句。或者，为了不渲染，返回null。

为了代码可读性我们一般会在return后面添加括号这样代码可以折行书写，否则就在return 后面紧跟着语句，这样也是可以的。

举两个正确的书写例子：
```js
const Nav = () => {
  return (
    <nav className="c_navbar">
      { some jsx magic here }
    </nav>
  )
}

const Nav = () => {
 return <nav className="c_navbar">
    { some jsx magic here }
  </nav>
}
```

错误的写法：
```js
const Nav = () => {
  return
    <nav className="c_navbar">
      { some jsx magic here }
    </nav>
}
```

## 3. [react] componentWillUpdate可以直接修改state的值吗？
1. 不行，这样会导致无限循环报错。
2. 在react中直接修改state，render函数不会重新执行渲染，应使用setState方法进行修改

react组件在每次需要重新渲染时候都会调用`componentWillUpdate()`,

例如，我们调用 `this.setState()`时候

在这个函数中我们之所以不调用`this.setState()`是因为该方法会触发另一个`componentWillUpdate()`,如果我们`componentWillUpdate()`中触发状态更改,我们将以无限循环结束.


## 4.什么渲染劫持？
首先，**什么是渲染劫持**：渲染劫持的概念是控制组件从另一个组件输出的能力，当然这个概念一般和react中的高阶组件（HOC）放在一起解释比较有明了。

**高阶组件可以在render函数中做非常多的操作，从而控制原组件的渲染输出，只要改变了原组件的渲染，我们都将它称之为一种渲染劫持**。

实际上，在高阶组件中，组合渲染和条件渲染都是渲染劫持的一种，通过反向继承，不仅可以实现以上两点，还可以增强由原组件render函数产生的React元素。

实际的操作中 通过 操作 state、props 都可以实现渲染劫持

## 5.React15和16别支持IE几以上？
React15 版本不直接支持IE8 浏览器的，官方文档中说React16 中依赖于集合类型Map 和 Set 因此不再支持IE 11 以下的浏览器，如果想要支持，需要使用全局的 polyfill


## 6.你有用过React的插槽(Portals)吗？怎么用？
1. 首先简单的介绍下react中的插槽（Portals），通过`ReactDOM.createPortal(child, container)`创建，是ReactDOM提供的接口，可以实现将子节点渲染到父组件DOM层次结构之外的DOM节点。
2. 第一个参数（child）是任何可渲染的 React 子元素，例如一个元素，字符串或 片段(fragment)。第二个参数（container）则是一个 DOM 元素。
3. 对于 portal 的一个典型用例是当父组件有 overflow: hidden 或 z-index 样式，但你需要子组件能够在视觉上 “跳出(break out)” 其容器。例如，对话框、hovercards以及提示框。所以一般react组件里的模态框，就是这样实现的。


## 7.举例说明React的插槽有哪些运用场景？
对于 `portal` 的一个典型用例是当父组件有 `overflow: hidden` 或 `z-index` 样式，但你需要子组件能够在视觉上 “`跳出(break out)`” 其容器。例如，对话框、hovercards以及提示框。所以一般react组件里的模态框，就是这样实现的


## 8.React如何进行代码拆分？拆分的原则是什么？
这里我认为react的拆分前提是代码目录设计规范，模块定义规范，代码设计规范，符合程序设计的一般原则，例如高内聚、低耦合等等。

在我们的react项目中：
1. 在 api 层面我们单独封装，对外暴露http请求的结果。
2. 数据层我们使用的react-redux 异步中间件使用的是redux-thunk 分装处理异步请求，合业务逻辑处理。
3. 试图层，尽量使用 redux 层面的传递过来的数据，修改逻辑 也是重新触发action 更改props。
4. 静态类型的资源单独放置
5. 公共组件、高阶组件、插件单独放置
6. 工具类文件单独放置

## 9.React组件的构造函数有什么作用？
在react的新的写法中，每一个组件都是一个类，这个很符合es6的语法规范，在es6中要想创建一个对象，就要调用相应的构造函数,一般来说，我们声明构造函数 是为了初始化组件内部的state 状态和绑定一些函数的this指向


## 10.React组件的构造函数是必须的吗？
构造函数并不是必须的,对于无状态组件，内部没有维护自己的state，只接收外部传入的props 是不需要声明构造函数的


## 11.React中在哪捕获错误？
在react 15 极其以前的版本中,组件内的UI异常将中断组件内部状态，导致下一次渲染时触发隐藏异常。React并未提供友好的异常捕获和处理方式，一旦发生异常，应用将不能很好的运行。而React 16版本有所改进。

组件内异常，也就是异常边界组件能够捕获的异常，主要包括：

- 1、渲染过程中异常；
- 2、生命周期方法中的异常；
- 3、子组件树中各组件的constructor构造函数中异常。

当然异常边界也有一些无法捕获的异常，主要是异步及服务端触发异常：

- 1、事件处理器中的异常；
- 2、异步任务异常，如setTiemout，ajax请求异常等；
- 3、服务端渲染异常；
- 4、异常边界组件自身内的异常；

## 12.在React中你有经常使用常量吗？
在写react应用的时候，在结合redux 处理react 应用层中的数据层的时候, 会单独写一个actionType文件，这个文件中定义的都是常量，这样写的好处是，单纯的引入字符串内容，容易出错且很难排查，中间做这个文件做一个过渡，就是这种引用常量的方式


## 13.为什么说React中的props是只读的？
react官方文档中说道，组件无论是使用函数声明还是通过class声明，都绝不能修改自身的props，props 作为组件对外通信的一个接口，为了保证组件像纯函数一样没有响应的副作用，所有的组件都必须像纯函数一样保护它们的props不被修改


## 14.React-Router怎么获取URL的参数？
- 在之前的版本中，可以通过 `this.props.location.query.bar` 进行获取
- 在 v4 中，通过 `this.props.location.search` 获取，不过需要进行处理


## 15.`super()`和`super(props)`有什么区别？
`super()` 可以让我们使用this来调用各种东西，
而`super(props)`可以让我们在this的基础上使用构造函数里面的东西， 或者从父元素那边传过来的一些属性

如果只调用了`super()`，那么`this.props`在`super()`和构造函数结束之间仍是`undefined`。
```js
class Button extends React.Component {
  constructor(props) {
    super(); // 没有传 props
    console.log(props);      // {}
    console.log(this.props); // undefined 
  }
  // ...
}
```


## 16.需要把keys设置为全局唯一吗？
**不需要**,key是用来进行diff算法的时候进行同层比较,准备的说key只需要在兄弟节点之间唯一,一般情况key选取是后端定义的id.万不得已的时候可以选择index(选择index是万不得已的选择,因为选择了index后,一些操作会改变index的值,违背了唯一不变,在进行diff算法的时候出现问题)

## 17.在history模式中push和replace有什么区别？
pushState会增加一条新的历史记录，而replaceState则会替换当前的历史记录，因此不会增加History.length。


## 18.React-Router 3和React-Router 4有什么变化？添加了什么好的特性？ 
React-Router 4 从设计思想上进行改变，引入动态路由，将路由进行了拆分，将其放到了各自的模块中，不再有单独的 router 模块，充分体现了组件化的思想，更加贴合 React 的思想。

具体表现：
- 包含式路由与exact
    * 在之前的版本中，在 Route 中写入的 path，在路由匹配时是独一无二的，路由的嵌套体现在 `<Route>` 组件的嵌套规则上
    * v4 版本则有了一个包含的关系：如匹配 path="/users" 的路由会匹配 path="/"的路由，在页面中这两个模块会同时进行渲染。
    * v4中多了 `exact` 关键词，表示只对当前的路由进行匹配。
- 独立路由：`Switch`（排他性路由）
    * 采用 `<Switch>`，只有一个路由会被渲染，并且总是渲染第一个匹配到的组件
    * 配合使用 `exact`
- "Index Routes" 和 "Not Found"
    * 废弃了 `<IndexRoute>`，而该用 `<Route exact>` 的方式进行代替
    * 如果没有匹配的路由，也可通过 `<Redirect>` 来进行重定向到默认页面或合理的路径。
- 嵌套布局
- 授权路由
- `<Link>` vs `<NavLink>`
- URL 查询字符串


## 19.React-Router的实现原理是什么？
依赖 history 库，保证视图和 URL 的同步

用户可以通过手动输入或者与页面进行交互来改变 URL，然后向服务端发送请求获取资源，成功后重新绘制 UI。


## 20.React-Router 4的switch有什么用？
Switch排他性路由，采用 `<Switch>`，只有一个路由会被渲染，并且总是渲染第一个匹配到的组件，更好进行路由匹配。