# 一篇看懂 React Hooks

<!-- TOC -->

- [一篇看懂 React Hooks](#一篇看懂-react-hooks)
- [什么是 React Hooks](#什么是-react-hooks)
  - [React Hooks 的特点](#react-hooks-的特点)
    - [利用 useState 创建 Redux](#利用-usestate-创建-redux)
    - [利用 useEffect 代替一些生命周期](#利用-useeffect-代替一些生命周期)
  - [React Hooks 将带来什么变化](#react-hooks-将带来什么变化)
    - [Hooks 带来的约定](#hooks-带来的约定)
    - [状态与 UI 的界限会越来越清晰](#状态与-ui-的界限会越来越清晰)
- [React Hooks 实践](#react-hooks-实践)
  - [DOM 副作用修改 / 监听](#dom-副作用修改--监听)
    - [修改页面 title](#修改页面-title)
    - [监听页面大小变化，网络是否断开](#监听页面大小变化网络是否断开)
    - [动态注入 css](#动态注入-css)
  - [组件辅助](#组件辅助)
    - [获取组件宽高](#获取组件宽高)
    - [拿到组件 onChange 抛出的值](#拿到组件-onchange-抛出的值)
  - [做动画](#做动画)
    - [在某个时间段内获取 0-1 之间的值](#在某个时间段内获取-0-1-之间的值)
    - [弹性动画](#弹性动画)
    - [Tween 动画](#tween-动画)
  - [发请求](#发请求)
    - [通用 Http 封装](#通用-http-封装)
    - [Request Service](#request-service)
  - [填表单](#填表单)
    - [Hooks 思维的表单组件](#hooks-思维的表单组件)
  - [模拟生命周期](#模拟生命周期)
    - [componentDidMount](#componentdidmount)
    - [componentWillUnmount](#componentwillunmount)
    - [componentDidUpdate](#componentdidupdate)
    - [Force Update](#force-update)
    - [isMounted](#ismounted)
  - [存数据](#存数据)
    - [全局 Store](#全局-store)
  - [封装原有库](#封装原有库)
    - [RenderProps to Hooks](#renderprops-to-hooks)
    - [Hooks to RenderProps](#hooks-to-renderprops)
    - [封装原本对 setState 增强的库](#封装原本对-setstate-增强的库)
- [总结](#总结)

<!-- /TOC -->

将之前对 React Hooks 的总结整理在一篇文章，带你从认识到使用 React Hooks。

# 什么是 React Hooks
React Hooks 是 React `16.7.0-alpha` 版本推出的新特性，想尝试的同学安装此版本即可。

**React Hooks 要解决的问题是状态共享**，是继 [render-props](https://reactjs.org/docs/render-props.html) 和 [higher-order components](https://reactjs.org/docs/higher-order-components.html) 之后的第三种状态共享方案，不会产生 JSX 嵌套地狱问题。

这个状态指的是状态逻辑，所以称为**状态逻辑复用**会更恰当，因为只共享数据处理逻辑，不会共享数据本身。

> 不久前精读分享过的一篇 [Epitath 源码 - renderProps 新用法](https://github.com/dt-fe/weekly/blob/master/75.%E7%B2%BE%E8%AF%BB%E3%80%8AEpitath%20%E6%BA%90%E7%A0%81%20-%20renderProps%20%E6%96%B0%E7%94%A8%E6%B3%95%E3%80%8B.md) 就是解决 JSX 嵌套问题，有了 React Hooks 之后，这个问题就被官方正式解决了。

为了更快理解 React Hooks 是什么，先看笔者引用的下面一段 renderProps 代码：

```ts
function App() {
  return (
    <Toggle initial={false}>
      {({ on, toggle }) => (
        <Button type="primary" onClick={toggle}> Open Modal </Button>
        <Modal visible={on} onOk={toggle} onCancel={toggle} />
      )}
    </Toggle>
  )
}
```

恰巧，React Hooks 解决的也是这个问题：

```ts
function App() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button type="primary" onClick={() => setOpen(true)}>
        Open Modal
      </Button>
      <Modal
        visible={open}
        onOk={() => setOpen(false)}
        onCancel={() => setOpen(false)}
      />
    </>
  );
}
```

可以看到，React Hooks 就像一个内置的打平 renderProps 库，我们可以随时创建一个值，与修改这个值的方法。看上去像 function 形式的 setState，其实这等价于依赖注入，与使用 setState 相比，**这个组件是没有状态的**。

## React Hooks 的特点
React Hooks 带来的好处不仅是 “更 FP，更新粒度更细，代码更清晰”，还有如下三个特性：

1. 多个状态不会产生嵌套，写法还是平铺的（renderProps 可以通过 compose 解决，可不但使用略为繁琐，而且因为强制封装一个新对象而增加了实体数量）。
2. Hooks 可以引用其他 Hooks。
3. 更容易将组件的 UI 与状态分离。

第二点展开说一下：Hooks 可以引用其他 Hooks，我们可以这么做：

```ts
import { useState, useEffect } from "react";

// 底层 Hooks, 返回布尔值：是否在线
function useFriendStatusBoolean(friendID) {
  const [isOnline, setIsOnline] = useState(null);

  function handleStatusChange(status) {
    setIsOnline(status.isOnline);
  }

  useEffect(() => {
    ChatAPI.subscribeToFriendStatus(friendID, handleStatusChange);
    return () => {
      ChatAPI.unsubscribeFromFriendStatus(friendID, handleStatusChange);
    };
  });

  return isOnline;
}

// 上层 Hooks，根据在线状态返回字符串：Loading... or Online or Offline
function useFriendStatusString(props) {
  const isOnline = useFriendStatusBoolean(props.friend.id);

  if (isOnline === null) {
    return "Loading...";
  }
  return isOnline ? "Online" : "Offline";
}

// 使用了底层 Hooks 的 UI
function FriendListItem(props) {
  const isOnline = useFriendStatusBoolean(props.friend.id);

  return (
    <li style={{ color: isOnline ? "green" : "black" }}>{props.friend.name}</li>
  );
}

// 使用了上层 Hooks 的 UI
function FriendListStatus(props) {
  const statu = useFriendStatusString(props.friend.id);

  return <li>{statu}</li>;
}
```

这个例子中，有两个 Hooks：`useFriendStatusBoolean` 与 `useFriendStatusString`, `useFriendStatusString` 是利用 `useFriendStatusBoolean` 生成的新 Hook，这两个 Hook 可以给不同的 UI：`FriendListItem`、`FriendListStatus` 使用，而因为两个 Hooks 数据是联动的，因此两个 UI 的状态也是联动的。

顺带一提，这个例子也可以用来理解 [对 React Hooks 的一些思考](https://zhuanlan.zhihu.com/p/48264713) 一文的那句话：**“有状态的组件没有渲染，有渲染的组件没有状态”**：

* `useFriendStatusBoolean` 与 `useFriendStatusString` 是有状态的组件（使用 `useState`），没有渲染（返回非 UI 的值），这样就可以作为 **Custom Hooks** 被任何 UI 组件调用。
* `FriendListItem` 与 `FriendListStatus` 是有渲染的组件（返回了 JSX），没有状态（没有使用 `useState`），这就是一个纯函数 UI 组件，

### 利用 useState 创建 Redux
Redux 的精髓就是 Reducer，而利用 React Hooks 可以轻松创建一个 Redux 机制：

```ts
// 这就是 Redux
function useReducer(reducer, initialState) {
  const [state, setState] = useState(initialState);

  function dispatch(action) {
    const nextState = reducer(state, action);
    setState(nextState);
  }

  return [state, dispatch];
}
```

这个自定义 Hook 的 value 部分当作 redux 的 state，setValue 部分当作 redux 的 dispatch，合起来就是一个 redux。而 react-redux 的 connect 部分做的事情与 Hook 调用一样：

```ts
// 一个 Action
function useTodos() {
  const [todos, dispatch] = useReducer(todosReducer, []);

  function handleAddClick(text) {
    dispatch({ type: "add", text });
  }

  return [todos, { handleAddClick }];
}

// 绑定 Todos 的 UI
function TodosUI() {
  const [todos, actions] = useTodos();
  return (
    <>
      {todos.map((todo, index) => (
        <div>{todo.text}</div>
      ))}
      <button onClick={actions.handleAddClick}>Add Todo</button>
    </>
  );
}
```

`useReducer` 已经作为一个内置 Hooks 了，在这里可以查阅所有 [内置 Hooks](https://reactjs.org/docs/hooks-reference.html)。

不过这里需要注意的是，每次 `useReducer` 或者自己的 Custom Hooks 都不会持久化数据，所以比如我们创建两个 App，App1 与 App2:

```ts
function App1() {
  const [todos, actions] = useTodos();

  return <span>todo count: {todos.length}</span>;
}

function App2() {
  const [todos, actions] = useTodos();

  return <span>todo count: {todos.length}</span>;
}

function All() {
  return (
    <>
      <App1 />
      <App2 />
    </>
  );
}
```

这两个实例同时渲染时，并不是共享一个 todos 列表，而是分别存在两个独立 todos 列表。也就是 React Hooks 只提供状态处理方法，不会持久化状态。

如果要真正实现一个 Redux 功能，也就是全局维持一个状态，任何组件 `useReducer` 都会访问到同一份数据，可以和 [useContext](https://reactjs.org/docs/hooks-reference.html#usecontext) 一起使用。

大体思路是利用 `useContext` 共享一份数据，作为 Custom Hooks 的数据源。具体实现可以参考 [redux-react-hook](https://github.com/facebookincubator/redux-react-hook/blob/master/src/index.ts)。

### 利用 useEffect 代替一些生命周期
在 useState 位置附近，可以使用 useEffect 处理副作用：

```ts
useEffect(() => {
  const subscription = props.source.subscribe();
  return () => {
    // Clean up the subscription
    subscription.unsubscribe();
  };
});
```

`useEffect` 的代码既会在初始化时候执行，也会在后续每次 rerender 时执行，而返回值在析构时执行。这个更多带来的是便利，对比一下 React 版 G2 调用流程：

```ts
class Component extends React.PureComponent<Props, State> {
  private chart: G2.Chart = null;
  private rootDomRef: React.ReactInstance = null;

  componentDidMount() {
    this.rootDom = ReactDOM.findDOMNode(this.rootDomRef) as HTMLDivElement;

    this.chart = new G2.Chart({
      container: document.getElementById("chart"),
      forceFit: true,
      height: 300
    });
    this.freshChart(this.props);
  }

  componentWillReceiveProps(nextProps: Props) {
    this.freshChart(nextProps);
  }

  componentWillUnmount() {
    this.chart.destroy();
  }

  freshChart(props: Props) {
    // do something
    this.chart.render();
  }

  render() {
    return <div ref={ref => (this.rootDomRef = ref)} />;
  }
}
```

用 React Hooks 可以这么做：

```ts
function App() {
  const ref = React.useRef(null);
  let chart: G2.Chart = null;

  React.useEffect(() => {
    if (!chart) {
      chart = new G2.Chart({
        container: ReactDOM.findDOMNode(ref.current) as HTMLDivElement,
        width: 500,
        height: 500
      });
    }

    // do something
    chart.render();

    return () => chart.destroy();
  });

  return <div ref={ref} />;
}
```

可以看到将细碎的代码片段结合成了一个完整的代码块，更维护。

现在介绍了 `useState` `useContext` `useEffect` `useRef` 等常用 hooks，更多可以查阅：[内置 Hooks](https://reactjs.org/docs/hooks-reference.html)，相信不久的未来，这些 API 又会成为一套新的前端规范。

## React Hooks 将带来什么变化
### Hooks 带来的约定
Hook 函数必须以 "use" 命名开头，因为这样才方便 eslint 做检查，防止用 condition 判断包裹 useHook 语句。

为什么不能用 condition 包裹 useHook 语句，详情可以见 [官方文档](https://reactjs.org/docs/hooks-rules.html#explanation)，这里简单介绍一下。

React Hooks 并不是通过 Proxy 或者 getters 实现的（具体可以看这篇文章 [React hooks: not magic, just arrays](https://medium.com/@ryardley/react-hooks-not-magic-just-arrays-cd4f1857236e)），而是通过数组实现的，每次 `useState` 都会改变下标，如果 `useState` 被包裹在 condition 中，那每次执行的下标就可能对不上，导致 `useState` 导出的 `setter` 更新错数据。

虽然有 [eslint-plugin-react-hooks](https://www.npmjs.com/package/eslint-plugin-react-hooks) 插件保驾护航，但这第一次将 “约定优先” 理念引入了 React 框架中，带来了前所未有的**代码命名和顺序限制**（函数命名遭到官方限制，JS 自由主义者也许会暴跳如雷），但带来的便利也是前所未有的（没有比 React Hooks 更好的状态共享方案了，约定带来提效，自由的代价就是回到 renderProps or HOC，各团队可以自行评估）。

笔者认为，React Hooks 的诞生，也许来自于这个灵感：“不如通过增加一些约定，彻底解决状态共享问题吧！”

> React 约定大于配置脚手架 [nextjs](https://github.com/zeit/next.js) [umi](https://github.com/umijs/umi) 以及笔者的 [pri](https://github.com/prijs/pri) 都通过有 “约定路由” 的功能，大大降低了路由配置复杂度，**那么 React Hooks 就像代码级别的约定**，大大降低了代码复杂度。

### 状态与 UI 的界限会越来越清晰
因为 React Hooks 的特性，如果一个 Hook 不产生 UI，那么它可以永远被其他 Hook 封装，虽然允许有副作用，但是被包裹在 `useEffect` 里，总体来说还是挺函数式的。而 Hooks 要集中在 UI 函数顶部写，也很容易养成书写无状态 UI 组件的好习惯，践行 “状态与 UI 分开” 这个理念会更容易。

不过这个理念稍微有点蹩脚的地方，那就是 “状态” 到底是什么。

```ts
function App() {
  const [count, setCount] = useCount();
  return <span>{count}</span>;
}
```

我们知道 `useCount` 算是无状态的，因为 React Hooks 本质就是 renderProps 或者 HOC 的另一种写法，换成 renderProps 就好理解了：

```ts
<Count>{(count, setCount) => <App count={count} setCount={setCount} />}</Count>;

function App(props) {
  return <span>{props.count}</span>;
}
```

可以看到 App 组件是无状态的，输出完全由输入（Props）决定。

那么有状态无 UI 的组件就是 `useCount` 了：

```ts
function useCount() {
  const [count, setCount] = useState(0);
  return [count, setCount];
}
```

有状态的地方应该指 `useState(0)` 这句，不过这句和无状态 UI 组件 App 的 `useCount()` 很像，既然 React 把 `useCount` 成为自定义 Hook，那么 `useState` 就是官方 Hook，具有一样的定义，因此可以认为 `useCount` 是无状态的，`useState` 也是一层 renderProps，最终的状态其实是 `useState` 这个 React 内置的组件。

我们看 renderProps 嵌套的表达：

```ts
<UseState>
  {(count, setCount) => (
    <UseCount>
      {" "}
      {/**虽然是透传，但给 count 做了去重，不可谓没有作用 */}
      {(count, setCount) => <App count={count} setCount={setCount} />}
    </UseCount>
  )}
</UseState>
```

能确定的是，App 一定有 UI，而上面两层父级组件一定没有 UI。为了最佳实践，我们尽量避免 App 自己维护状态，而其父级的 RenderProps 组件可以维护状态（也可以不维护状态，做个二传手）。因此可以考虑在 “有状态的组件没有渲染，有渲染的组件没有状态” 这句话后面加一句：没渲染的组件也可以没状态。

# React Hooks 实践
通过上面的理解，你已经对 React Hooks 有了基本理解，也许你也看了 React Hooks 基本实现剖析（就是数组），但理解实现原理就可以用好了吗？学的是知识，而用的是技能，看别人的用法就像刷抖音一样（哇，饭还可以这样吃？），你总会有新的收获。

首先，站在使用角度，要理解 React Hooks 的特点是 “非常方便的 Connect 一切”，所以无论是数据流、Network，或者是定时器都可以监听，有一点 RXJS 的意味，也就是你可以利用 React Hooks，将 React 组件打造成：任何事物的变化都是输入源，当这些源变化时会重新触发 React 组件的 render，你只需要挑选组件绑定哪些数据源（use 哪些 Hooks），然后只管写 render 函数就行了！

## DOM 副作用修改 / 监听
做一个网页，总有一些看上去和组件关系不大的麻烦事，比如修改页面标题（切换页面记得改成默认标题）、监听页面大小变化（组件销毁记得取消监听）、断网时提示（一层层装饰器要堆成小山了）。而 React Hooks 特别擅长做这些事，造这种轮子，大小皆宜。

> 由于 React Hooks 降低了高阶组件使用成本，那么一套生命周期才能完成的 “杂耍” 将变得非常简单。

下面举几个例子：

### 修改页面 title
效果：在组件里调用 `useDocumentTitle` 函数即可设置页面标题，且切换页面时，页面标题重置为默认标题 “前端精读”。

```ts
useDocumentTitle("个人中心");
```

实现：直接用 `document.title` 赋值，不能再简单。在销毁时再次给一个默认标题即可，这个简单的函数可以抽象在项目工具函数里，每个页面组件都需要调用。

```ts
function useDocumentTitle(title) {
  useEffect(
    () => {
      document.title = title;
      return () => (document.title = "前端精读");
    },
    [title]
  );
}
```

[在线 Demo](https://codesandbox.io/s/lrnvnx866l)

### 监听页面大小变化，网络是否断开
效果：在组件调用 `useWindowSize` 时，可以拿到页面大小，并且在浏览器缩放时自动触发组件更新。

```ts
const windowSize = useWindowSize();
return <div>页面高度：{windowSize.innerWidth}</div>;
```

实现：和标题思路基本一致，这次从 `window.innerHeight` 等 API 直接拿到页面宽高即可，注意此时可以用 `window.addEventListener('resize')` 监听页面大小变化，此时调用 `setValue` 将会触发调用自身的 UI 组件 rerender，就是这么简单！

最后注意在销毁时，`removeEventListener` 注销监听。

```ts
function getSize() {
  return {
    innerHeight: window.innerHeight,
    innerWidth: window.innerWidth,
    outerHeight: window.outerHeight,
    outerWidth: window.outerWidth
  };
}

function useWindowSize() {
  let [windowSize, setWindowSize] = useState(getSize());

  function handleResize() {
    setWindowSize(getSize());
  }

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return windowSize;
}
```

[在线 Demo](https://codesandbox.io/s/j2rz2mj83)

### 动态注入 css
效果：在页面注入一段 class，并且当组件销毁时，移除这个 class。

```ts
const className = useCss({
  color: "red"
});

return <div className={className}>Text.</div>;
```

实现：可以看到，Hooks 方便的地方是在组件销毁时移除副作用，所以我们可以安心的利用 Hooks 做一些副作用。注入 css 自然不必说了，而销毁 css 只要找到注入的那段引用进行销毁即可，具体可以看这个 [代码片段](https://github.com/streamich/nano-css/blob/c21413ddbed233777886f7c9aa1375af8a221f7b/addon/pipe.js#L51)。

> DOM 副作用修改 / 监听场景有一些现成的库了，从名字上就能看出来用法：[document-visibility](https://github.com/rehooks/document-visibility)、[network-status](https://github.com/rehooks/network-status)、[online-status](https://github.com/rehooks/online-status)、[window-scroll-position](https://github.com/rehooks/window-scroll-position)、[window-size](https://github.com/rehooks/window-size)、[document-title](https://github.com/rehooks/document-title)。

## 组件辅助
Hooks 还可以增强组件能力，比如拿到并监听组件运行时宽高等。

### 获取组件宽高
效果：通过调用 `useComponentSize` 拿到某个组件 ref 实例的宽高，并且在宽高变化时，rerender 并拿到最新的宽高。

```ts
const ref = useRef(null);
let componentSize = useComponentSize(ref);

return (
  <>
    {componentSize.width}
    <textArea ref={ref} />
  </>
);
```

实现：和 DOM 监听类似，这次换成了利用 `ResizeObserver` 对组件 ref 进行监听，同时在组件销毁时，销毁监听。

其本质还是监听一些副作用，但通过 ref 的传递，我们可以对组件粒度进行监听和操作了。

```ts
useLayoutEffect(() => {
  handleResize();

  let resizeObserver = new ResizeObserver(() => handleResize());
  resizeObserver.observe(ref.current);

  return () => {
    resizeObserver.disconnect(ref.current);
    resizeObserver = null;
  };
}, []);
```

[在线 Demo](https://codesandbox.io/s/zqxp3l9yrm)，对应组件 [component-size](https://github.com/rehooks/component-size)。

### 拿到组件 onChange 抛出的值
效果：通过 `useInputValue()` 拿到 Input 框当前用户输入的值，而不是手动监听 onChange 再腾一个 `otherInputValue` 和一个回调函数把这一堆逻辑写在无关的地方。

```ts
let name = useInputValue("Jamie");
// name = { value: 'Jamie', onChange: [Function] }
return <input {...name} />;
```

可以看到，这样不仅没有占用组件自己的 state，也不需要手写 onChange 回调函数进行处理，这些处理都压缩成了一行 use hook。

实现：读到这里应该大致可以猜到了，利用 `useState` 存储组件的值，并抛出 `value` 与 `onChange`，监听 `onChange` 并通过 `setValue` 修改 `value`, 就可以在每次 `onChange` 时触发调用组件的 rerender 了。

```ts
function useInputValue(initialValue) {
  let [value, setValue] = useState(initialValue);
  let onChange = useCallback(function(event) {
    setValue(event.currentTarget.value);
  }, []);

  return {
    value,
    onChange
  };
}
```

这里要注意的是，我们对组件增强时，**组件的回调一般不需要销毁监听，而且仅需监听一次，这与 DOM 监听不同**，因此大部分场景，我们需要利用 `useCallback` 包裹，并传一个空数组，来保证永远只监听一次，而且不需要在组件销毁时注销这个 callback。

[在线 Demo](https://codesandbox.io/s/0xlk250l5l)，对应组件 [input-value](https://github.com/rehooks/input-value)。

## 做动画
利用 React Hooks 做动画，一般是拿到一些具有弹性变化的值，我们可以将值赋给进度条之类的组件，这样其进度变化就符合某种动画曲线。

### 在某个时间段内获取 0-1 之间的值
这个是动画最基本的概念，某个时间内拿到一个线性增长的值。

效果：通过 `useRaf(t)` 拿到 t 毫秒内不断刷新的 0-1 之间的数字，期间组件会不断刷新，但刷新频率由 requestAnimationFrame 控制（不会卡顿 UI）。

```ts
const value = useRaf(1000);
```

实现：写起来比较冗长，这里简单描述一下。利用 `requestAnimationFrame` 在给定时间内给出 0-1 之间的值，那每次刷新时，只要判断当前刷新的时间点占总时间的比例是多少，然后做分母，分子是 1 即可。

[在线 Demo](https://codesandbox.io/s/n745x9pyy4)，对应组件 [use-raf](https://github.com/streamich/react-use/blob/master/docs/useRaf.md)。

### 弹性动画
效果：通过 `useSpring` 拿到动画值，组件以固定频率刷新，而这个动画值以弹性函数进行增减。

实际调用方式一般是，先通过 `useState` 拿到一个值，再通过动画函数包住这个值，这样组件就会从原本的刷新一次，变成刷新 N 次，拿到的值也随着动画函数的规则变化，最后这个值会稳定到最终的输入值（如例子中的 `50`）。

```ts
const [target, setTarget] = useState(50);
const value = useSpring(target);

return <div onClick={() => setTarget(100)}>{value}</div>;
```

实现：为了实现动画效果，需要依赖 `rebound` 库，它可以实现将一个目标值拆解为符合弹性动画函数过程的功能，那我们需要利用 React Hooks 做的就是在第一次接收到目标值是，调用 `spring.setEndValue` 来触发动画事件，并在 `useEffect` 里做一次性监听，再值变时重新 `setValue` 即可。

最神奇的 `setTarget` 联动 `useSpring` 重新计算弹性动画部分，是通过 `useEffect` 第二个参数实现的：

```ts
useEffect(
  () => {
    if (spring) {
      spring.setEndValue(targetValue);
    }
  },
  [targetValue]
);
```

也就是当目标值变化后，才会进行新的一轮 rerender，所以 `useSpring` 并不需要监听调用处的 `setTarget`，它只需要监听 `target` 的变化即可，而巧妙利用 `useEffect` 的第二个参数可以事半功倍。

[在线 Demo](https://codesandbox.io/s/yq0moqo8mv)

### Tween 动画
明白了弹性动画原理，Tween 动画就更简单了。

效果：通过 `useTween` 拿到一个从 0 变化到 1 的值，这个值的动画曲线是 `tween`。可以看到，由于取值范围是固定的，所以我们不需要给初始值了。

```ts
const value = useTween();
```

实现：通过 `useRaf` 拿到一个线性增长的值（区间也是 0 ～ 1），再通过 `easing` 库将其映射到 0 ～ 1 到值即可。这里用到了 hook 调用 hook 的联动（通过 `useRaf` 驱动 `useTween`），还可以在其他地方举一反三。

```ts
const fn: Easing = easing[easingName];
const t = useRaf(ms, delay);

return fn(t);
```

## 发请求
利用 Hooks，可以将任意请求 Promise 封装为带有标准状态的对象：loading、error、result。

### 通用 Http 封装
效果：通过 `useAsync` 将一个 Promise 拆解为 loading、error、result 三个对象。

```ts
const { loading, error, result } = useAsync(fetchUser, [id]);
```

实现：在 Promise 的初期设置 loading，结束后设置 result，如果出错则设置 error，这里可以将请求对象包装成 `useAsyncState` 来处理，这里就不放出来了。

```ts
export function useAsync(asyncFunction) {
  const asyncState = useAsyncState(options);

  useEffect(() => {
    const promise = asyncFunction();
    asyncState.setLoading();
    promise.then(
      result => asyncState.setResult(result);,
      error => asyncState.setError(error);
    );
  }, params);
}
```

具体代码可以参考 [react-async-hook](https://github.com/slorber/react-async-hook/blob/master/src/index.js)，这个功能建议仅了解原理，具体实现因为有一些边界情况需要考虑，比如组件 isMounted 后才能相应请求结果。

### Request Service
业务层一般会抽象一个 `request service` 做统一取数的抽象（比如统一 url，或者可以统一换 socket 实现等等）。假如以前比较 low 的做法是：

```ts
async componentDidMount() {
  // setState: 改 isLoading state
  try {
    const data = await fetchUser()
    // setState: 改 isLoading、error、data
  } catch (error) {
    // setState: 改 isLoading、error
  }
}
```

后来把请求放在 redux 里，通过 connect 注入的方式会稍微有些改观：

```ts
@Connect(...)
class App extends React.PureComponent {
  public componentDidMount() {
    this.props.fetchUser()
  }

  public render() {
    // this.props.userData.isLoading | error | data
  }
}
```

最后会发现还是 Hooks 简洁明了：

```ts
function App() {
  const { isLoading, error, data } = useFetchUser();
}
```

而 `useFetchUser` 利用上面封装的 `useAsync` 可以很容易编写：

```ts
const fetchUser = id =>
  fetch(`xxx`).then(result => {
    if (result.status !== 200) {
      throw new Error("bad status = " + result.status);
    }
    return result.json();
  });

function useFetchUser(id) {
  const asyncFetchUser = useAsync(fetchUser, id);
  return asyncUser;
}
```

## 填表单
React Hooks 特别适合做表单，尤其是 [antd form](https://ant.design/components/form-cn/) 如果支持 Hooks 版，那用起来会方便许多：

```ts
function App() {
  const { getFieldDecorator } = useAntdForm();

  return (
    <Form onSubmit={this.handleSubmit} className="login-form">
      <FormItem>
        {getFieldDecorator("userName", {
          rules: [{ required: true, message: "Please input your username!" }]
        })(
          <Input
            prefix={<Icon type="user" style={{ color: "rgba(0,0,0,.25)" }} />}
            placeholder="Username"
          />
        )}
      </FormItem>
      <FormItem>
        <Button type="primary" htmlType="submit" className="login-form-button">
          Log in
        </Button>
        Or <a href="">register now!</a>
      </FormItem>
    </Form>
  );
}
```

不过虽然如此，`getFieldDecorator` 还是基于 RenderProps 思路的，彻底的 Hooks 思路是利用之前说的 **组件辅助方式，提供一个组件方法集，用解构方式传给组件**。

### Hooks 思维的表单组件
效果：通过 `useFormState` 拿到表单值，并且提供一系列 **组件辅助** 方法控制组件状态。

```ts
const [formState, { text, password }] = useFormState();
return (
  <form>
    <input {...text("username")} required />
    <input {...password("password")} required minLength={8} />
  </form>
);
```

上面可以通过 `formState` 随时拿到表单值，和一些校验信息，通过 `password("pwd")` 传给 `input` 组件，让这个组件达到受控状态，且输入类型是 `password` 类型，表单 key 是 `pwd`。而且可以看到使用的 `form` 是原生标签，这种表单增强是相当解耦的。

实现：仔细观察一下结构，不难发现，我们只要结合 **组件辅助 小节说的 “拿到组件 onChange 抛出的值” 一节的思路，就能轻松理解 `text`、`password` 是如何作用于 `input` 组件，并拿到其输入状态**。

往简单的来说，只要把这些状态 Merge 起来，通过 `useReducer` 聚合到 `formState` 就可以实现了。

为了简化，我们只考虑对 `input` 的增强，源码仅需 30 几行：

```ts
export function useFormState(initialState) {
  const [state, setState] = useReducer(stateReducer, initialState || {});

  const createPropsGetter = type => (name, ownValue) => {
    const hasOwnValue = !!ownValue;
    const hasValueInState = state[name] !== undefined;

    function setInitialValue() {
      let value = "";
      setState({ [name]: value });
    }

    const inputProps = {
      name, // 给 input 添加 type: text or password
      get value() {
        if (!hasValueInState) {
          setInitialValue(); // 给初始化值
        }
        return hasValueInState ? state[name] : ""; // 赋值
      },
      onChange(e) {
        let { value } = e.target;
        setState({ [name]: value }); // 修改对应 Key 的值
      }
    };

    return inputProps;
  };

  const inputPropsCreators = ["text", "password"].reduce(
    (methods, type) => ({ ...methods, [type]: createPropsGetter(type) }),
    {}
  );

  return [
    { values: state }, // formState
    inputPropsCreators
  ];
}
```

上面 30 行代码实现了对 `input` 标签类型的设置，监听 `value` `onChange`，最终聚合到大的 `values` 作为 `formState` 返回。读到这里应该发现对 React Hooks 的应用都是万变不离其宗的，特别是对组件信息的获取，通过解构方式来做，Hooks 内部再做一下聚合，就完成表单组件基本功能了。

实际上一个完整的轮子还需要考虑 `checkbox` `radio` 的兼容，以及校验问题，这些思路大同小异，具体源码可以看 [react-use-form-state](https://github.com/wsmd/react-use-form-state)。

## 模拟生命周期
有的时候 React15 的 API 还是挺有用的，利用 React Hooks 几乎可以模拟出全套。

### componentDidMount
效果：通过 `useMount` 拿到 mount 周期才执行的回调函数。

```ts
useMount(() => {
  // quite similar to `componentDidMount`
});
```

实现：`componentDidMount` 等价于 `useEffect` 的回调（仅执行一次时），因此直接把回调函数抛出来即可。

```ts
useEffect(() => void fn(), []);
```

### componentWillUnmount
效果：通过 `useUnmount` 拿到 unmount 周期才执行的回调函数。

```ts
useUnmount(() => {
  // quite similar to `componentWillUnmount`
});
```

实现：`componentWillUnmount` 等价于 `useEffect` 的回调函数返回值（仅执行一次时），因此直接把回调函数返回值抛出来即可。

```ts
useEffect(() => fn, []);
```

### componentDidUpdate
效果：通过 `useUpdate` 拿到 didUpdate 周期才执行的回调函数。

```ts
useUpdate(() => {
  // quite similar to `componentDidUpdate`
});
```

实现：`componentDidUpdate` 等价于 `useMount` 的逻辑每次执行，除了初始化第一次。因此采用 mouting flag（判断初始状态）+ 不加限制参数确保每次 rerender 都会执行即可。

```ts
const mounting = useRef(true);
useEffect(() => {
  if (mounting.current) {
    mounting.current = false;
  } else {
    fn();
  }
});
```

### Force Update
效果：这个最有意思了，我希望拿到一个函数 `update`，每次调用就强制刷新当前组件。

```ts
const update = useUpdate();
```

实现：我们知道 `useState` 下标为 1 的项是用来更新数据的，而且就算数据没有变化，调用了也会刷新组件，所以我们可以把返回一个没有修改数值的 `setValue`，这样它的功能就仅剩下刷新组件了。

```ts
const useUpdate = () => useState(0)[1];
```

> 对于 `getSnapshotBeforeUpdate`, `getDerivedStateFromError`, `componentDidCatch` 目前 Hooks 是无法模拟的。

### isMounted
很久以前 React 是提供过这个 API 的，后来移除了，原因是可以通过 `componentWillMount` 和 `componentWillUnmount` 推导。自从有了 React Hooks，支持 isMount 简直是分分钟的事。

效果：通过 `useIsMounted` 拿到 `isMounted` 状态。

```ts
const isMounted = useIsMounted();
```

实现：看到这里的话，应该已经很熟悉这个套路了，`useEffect` 第一次调用时赋值为 true，组件销毁时返回 false，注意这里可以加第二个参数为空数组来优化性能。

```ts
const [isMount, setIsMount] = useState(false);
useEffect(() => {
  if (!isMount) {
    setIsMount(true);
  }
  return () => setIsMount(false);
}, []);
return isMount;
```

[在线 Demo](https://codesandbox.io/s/5zwr1l1o1n)

## 存数据
上一篇提到过 React Hooks 内置的 `useReducer` 可以模拟 Redux 的 reducer 行为，那唯一需要补充的就是将数据持久化。我们考虑最小实现，也就是全局 Store + Provider 部分。

### 全局 Store
效果：通过 `createStore` 创建一个全局 Store，再通过 `StoreProvider` 将 `store` 注入到子组件的 `context` 中，最终通过两个 Hooks 进行获取与操作：`useStore` 与 `useAction`：

```ts
const store = createStore({
  user: {
    name: "小明",
    setName: (state, payload) => {
      state.name = payload;
    }
  }
});

const App = () => (
  <StoreProvider store={store}>
    <YourApp />
  </StoreProvider>
);

function YourApp() {
  const userName = useStore(state => state.user.name);
  const setName = userAction(dispatch => dispatch.user.setName);
}
```

实现：这个例子的实现可以单独拎出一篇文章了，所以笔者从存数据的角度剖析一下 `StoreProvider` 的实现。

对，Hooks 并不解决 Provider 的问题，所以全局状态必须有 Provider，但这个 Provider 可以利用 React 内置的 `createContext` 简单搞定：

```ts
const StoreContext = createContext();

const StoreProvider = ({ children, store }) => (
  <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
);
```

剩下就是 `useStore` 怎么取到持久化 Store 的问题了，这里利用 `useContext` 和刚才创建的 Context 对象：

```ts
const store = useContext(StoreContext);
return store;
```

更多源码可以参考 [easy-peasy](https://github.com/ctrlplusb/easy-peasy)，这个库基于 redux 编写，提供了一套 Hooks API。

## 封装原有库
是不是 React Hooks 出现后，所有的库都要重写一次？当然不是，我们看看其他库如何做改造。

### RenderProps to Hooks
这里拿 [react-powerplug](https://github.com/renatorib/react-powerplug) 举例。

比如有一个 renderProps 库，希望改造成 Hooks 的用法：

```ts
import { Toggle } from 'react-powerplug'

function App() {
  return (
    <Toggle initial={true}>
      {({ on, toggle }) => (
        <Checkbox checked={on} onChange={toggle} />
      )}
    </Toggle>
  )
}
↓ ↓ ↓ ↓ ↓ ↓
import { useToggle } from 'react-powerhooks'

function App() {
  const [on, toggle] = useToggle()
  return <Checkbox checked={on} onChange={toggle} />
}
```

效果：假如我是 `react-powerplug` 的维护者，怎么样最小成本支持 React Hook? 说实话这个没办法一步做到，但可以通过两步实现。

```ts
export function Toggle() {
  // 这是 Toggle 的源码
  // balabalabala..
}

const App = wrap(() => {
  // 第一步：包 wrap
  const [on, toggle] = useRenderProps(Toggle); // 第二步：包 useRenderProps
});
```

实现：首先解释一下为什么要包两层，首先 Hooks 必须遵循 React 的规范，我们必须写一个 `useRenderProps` 函数以符合 Hooks 的格式，**那问题是如何拿到 Toggle 给 render 的 `on` 与 `toggle`？**正常方式应该拿不到，所以退而求其次，将 `useRenderProps` 拿到的 Toggle 传给 `wrap`，**让 `wrap` 构造 RenderProps 执行环境拿到 `on` 与 `toggle` 后，调用 `useRenderProps` 内部的 `setArgs` 函数，让 `const [on, toggle] = useRenderProps(Toggle)` 实现曲线救国。**

```ts
const wrappers = []; // 全局存储 wrappers

export const useRenderProps = (WrapperComponent, wrapperProps) => {
  const [args, setArgs] = useState([]);
  const ref = useRef({});
  if (!ref.current.initialized) {
    wrappers.push({
      WrapperComponent,
      wrapperProps,
      setArgs
    });
  }
  useEffect(() => {
    ref.current.initialized = true;
  }, []);
  return args; // 通过下面 wrap 调用 setArgs 获取值。
};
```

由于 `useRenderProps` 会先于 `wrap` 执行，所以 wrappers 会先拿到 Toggle，`wrap` 执行时直接调用 `wrappers.pop()` 即可拿到 Toggle 对象。然后构造出 RenderProps 的执行环境即可：

```ts
export const wrap = FunctionComponent => props => {
  const element = FunctionComponent(props);
  const ref = useRef({ wrapper: wrappers.pop() }); // 拿到 useRenderProps 提供的 Toggle
  const { WrapperComponent, wrapperProps } = ref.current.wrapper;
  return createElement(WrapperComponent, wrapperProps, (...args) => {
    // WrapperComponent => Toggle，这一步是在构造 RenderProps 执行环境
    if (!ref.current.processed) {
      ref.current.wrapper.setArgs(args); // 拿到 on、toggle 后，通过 setArgs 传给上面的 args。
      ref.current.processed = true;
    } else {
      ref.current.processed = false;
    }
    return element;
  });
};
```

以上实现方案参考 [react-hooks-render-props](https://github.com/dai-shi/react-hooks-render-props)，有需求要可以拿过来直接用，不过实现思路可以参考，作者的脑洞挺大。

### Hooks to RenderProps
好吧，如果希望 Hooks 支持 RenderProps，那一定是希望同时支持这两套语法。

效果：一套代码同时支持 Hooks 和 RenderProps。

实现：其实 Hooks 封装为 RenderProps 最方便，因此我们使用 Hooks 写核心的代码，假设我们写一个最简单的 `Toggle`：

```ts
const useToggle = initialValue => {
  const [on, setOn] = useState(initialValue);
  return {
    on,
    toggle: () => setOn(!on)
  };
};
```

[在线 Demo](https://codesandbox.io/s/ppvrpnz80m)

然后通过 `render-props` 这个库可以轻松封装出 RenderProps 组件：

```ts
const Toggle = ({ initialValue, children, render = children }) =>
  renderProps(render, useToggle(initialValue));
```

[在线 Demo](https://codesandbox.io/s/249n3n4r30)

其实 `renderProps` 这个组件的第二个参数，在 Class 形式 React 组件时，接收的是 `this.state`，现在我们改成 `useToggle` 返回的对象，也可以理解为 `state`，利用 Hooks 机制驱动 Toggle 组件 rerender，从而让子组件 rerender。

### 封装原本对 setState 增强的库
Hooks 也特别适合封装原本就作用于 setState 的库，比如 [immer](https://github.com/mweststrate/immer)。

`useState` 虽然不是 `setState`，但却可以理解为控制高阶组件的 `setState`，我们完全可以封装一个自定义的 `useState`，然后内置对 `setState` 的优化。

比如 immer 的语法是通过 `produce` 包装，将 mutable 代码通过 Proxy 代理为 immutable：

```ts
const nextState = produce(baseState, draftState => {
  draftState.push({ todo: "Tweet about it" });
  draftState[1].done = true;
});
```

那这个 `produce` 就可以通过封装一个 `useImmer` 来隐藏掉：

```ts
function useImmer(initialValue) {
  const [val, updateValue] = React.useState(initialValue);
  return [
    val,
    updater => {
      updateValue(produce(updater));
    }
  ];
}
```

使用方式：

```ts
const [value, setValue] = useImmer({ a: 1 });

value(obj => (obj.a = 2)); // immutable
```

# 总结
把 React Hooks 当作更便捷的 RenderProps 去用吧，虽然写法看上去是内部维护了一个状态，但其实等价于注入、Connect、HOC、或者 renderProps，那么如此一来，使用 renderProps 的门槛会大大降低，因为 Hooks 用起来实在是太方便了，我们可以抽象大量 Custom Hooks，让代码更加 FP，同时也不会增加嵌套层级。






