动手实现 React-redux
====
<!-- TOC -->

- [动手实现 React-redux](#动手实现-React-redux)
- [动手实现 React-redux（一）：初始化工程](#动手实现-React-redux一初始化工程)
- [动手实现 React-redux（二）：结合 context 和 store](#动手实现-React-redux二结合-context-和-store)
- [动手实现 React-redux（三）：connect 和 mapStateToProps](#动手实现-React-redux三connect-和-mapStateToProps)
- [动手实现 React-redux（四）：mapDispatchToProps](#动手实现-React-redux四mapDispatchToProps)
- [动手实现 React-redux（五）：Provider](#动手实现-React-redux五Provider)
- [动手实现 React-redux（六）：React-redux 总结](#动手实现-React-redux六React-redux-总结)

<!-- /TOC -->

# 动手实现 React-redux（一）：初始化工程
可以看到 Redux 并不复杂，它那些看起来匪夷所思的设定其实都是为了解决特定的问题而存在的，我们把问题想清楚以后就不难理解它的那些奇怪的设定了。这节开始我们来看看如何把 Redux 和 React.js 结合起来，你会发现其实它们也并不复杂。

回顾一下，我们在 [前端应用状态管理 —— 状态提升](http://react.huziketang.com/blog/lesson17) 中提过，前端中应用的状态存在的问题：一个状态可能被多个组件*依赖*或者*影响*，而 React.js 并没有提供好的解决方案，我们只能把状态提升到*依赖*或者*影响*这个状态的所有组件的公共父组件上，我们把这种行为叫做状态提升。但是需求不停变化，共享状态没完没了地提升也不是办法。

后来我们在 [React.js 的 context](http://react.huziketang.com/blog/lesson29) 中提出，我们可用把共享状态放到父组件的 context 上，这个父组件下所有的组件都可以从 context 中直接获取到状态而不需要一层层地进行传递了。但是直接从 context 里面存放、获取数据增强了组件的耦合性；并且所有组件都可以修改 context 里面的状态就像谁都可以修改共享状态一样，导致程序运行的不可预料。

既然这样，为什么不把 context 和 store 结合起来？毕竟 store 的数据不是谁都能修改，而是约定只能通过 `dispatch` 来进行修改，这样的话每个组件既可以去 context 里面获取 store 从而获取状态，又不用担心它们乱改数据了。

听起来不错，我们动手试一下。我们还是拿“主题色”这个例子做讲解，假设我们现在需要做下面这样的组件树：

<a href="http://huzidaha.github.io/static/assets/img/posts/9271BF94-6599-4F73-A814-0DDA20B634D9.png" target="_blank">![实例图片](http://huzidaha.github.io/static/assets/img/posts/9271BF94-6599-4F73-A814-0DDA20B634D9.png)</a>

`Header` 和 `Content` 的组件的文本内容会随着主题色的变化而变化，而 `Content` 下的子组件 `ThemeSwitch` 有两个按钮，可以切换红色和蓝色两种主题，按钮的颜色也会随着主题色的变化而变化。

用 `create-react-app` 新建一个工程，然后安装一个 React 提供的第三方库 `prop-types`：

```
npm install --save prop-types
```

安装好后在 `src/` 目录下新增三个文件：`Header.js`、`Content.js`、`ThemeSwitch.js`。

修改 `src/Header.js`：

```javascript
import React, { Component } from 'react'
import PropTypes from 'prop-types'

class Header extends Component {
  render () {
    return (
      <h1>React.js 小书</h1>
    )
  }
}

export default Header
```

修改 `src/ThemeSwitch.js`：

```javascript
import React, { Component } from 'react'
import PropTypes from 'prop-types'

class ThemeSwitch extends Component {
  render () {
    return (
      <div>
        <button>Red</button>
        <button>Blue</button>
      </div>
    )
  }
}

export default ThemeSwitch
```

修改 `src/Content.js`：

```javascript
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import ThemeSwitch from './ThemeSwitch'

class Content extends Component {
  render () {
    return (
      <div>
        <p>React.js 小书内容</p>
        <ThemeSwitch />
      </div>
    )
  }
}

export default Content
```

修改 `src/index.js`：

```javascript
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import ReactDOM from 'react-dom'
import Header from './Header'
import Content from './Content'
import './index.css'

class Index extends Component {
  render () {
    return (
      <div>
        <Header />
        <Content />
      </div>
    )
  }
}

ReactDOM.render(
  <Index />,
  document.getElementById('root')
)
```

这样我们就简单地把整个组件树搭建起来了，用 `npm start` 启动工程，然后可以看到页面上显示：

<a href="http://huzidaha.github.io/static/assets/img/posts/6BF5EA6C-4B5E-48C8-96CF-F8B858AE6AB4.png" target="_blank">![实例图片](http://huzidaha.github.io/static/assets/img/posts/6BF5EA6C-4B5E-48C8-96CF-F8B858AE6AB4.png)</a>

当然现在文本都没有颜色，而且点击按钮也不会有什么反应，我们还没有加入表示主题色的状态和相关的业务逻辑，下一节我们就把相关的逻辑加进去。



# 动手实现 React-redux（二）：结合 context 和 store
既然要把 store 和 context 结合起来，我们就先构建 store。在 `src/index.js` 加入之前创建的 `createStore` 函数，并且构建一个 `themeReducer` 来生成一个 `store`：

```javascript
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import ReactDOM from 'react-dom'
import Header from './Header'
import Content from './Content'
import './index.css'

function createStore (reducer) {
  let state = null
  const listeners = []
  const subscribe = (listener) => listeners.push(listener)
  const getState = () => state
  const dispatch = (action) => {
    state = reducer(state, action)
    listeners.forEach((listener) => listener())
  }
  dispatch({}) // 初始化 state
  return { getState, dispatch, subscribe }
}

const themeReducer = (state, action) => {
  if (!state) return {
    themeColor: 'red'
  }
  switch (action.type) {
    case 'CHANGE_COLOR':
      return { ...state, themeColor: action.themeColor }
    default:
      return state
  }
}

const store = createStore(themeReducer)
...
```

`themeReducer` 定义了一个表示主题色的状态 `themeColor`，并且规定了一种操作 `CHNAGE_COLOR`，只能通过这种操作修改颜色。现在我们把 `store` 放到 `Index` 的 context 里面，这样每个子组件都可以获取到 `store` 了，修改 `src/index.js` 里面的 `Index`：

```javascript
class Index extends Component {
  static childContextTypes = {
    store: PropTypes.object
  }

  getChildContext () {
    return { store }
  }

  render () {
    return (
      <div>
        <Header />
        <Content />
      </div>
    )
  }
}
```

如果有些同学已经忘记了 context 的用法，可以参考之前的章节： [React.js 的 context](http://react.huziketang.com/blog/lesson29) 。

然后修改 `src/Header.js`，让它从 `Index` 的 context 里面获取 `store`，并且获取里面的 `themeColor` 状态来设置自己的颜色：

```javascript
class Header extends Component {
  static contextTypes = {
    store: PropTypes.object
  }

  constructor () {
    super()
    this.state = { themeColor: '' }
  }

  componentWillMount () {
    this._updateThemeColor()
  }

  _updateThemeColor () {
    const { store } = this.context
    const state = store.getState()
    this.setState({ themeColor: state.themeColor })
  }

  render () {
    return (
      <h1 style={{ color: this.state.themeColor }}>React.js 小书</h1>
    )
  }
}
```

其实也很简单，我们在 `constructor` 里面初始化了组件自己的 `themeColor` 状态。然后在生命周期中 `componentWillMount` 调用 `_updateThemeColor`，`_updateThemeColor` 会从 context 里面把 `store` 取出来，然后通过 `store.getState()` 获取状态对象，并且用里面的 `themeColor` 字段设置组件的 `state.themeColor`。

然后在 `render` 函数里面获取了 `state.themeColor` 来设置标题的样式，页面上就会显示：

<a href="http://huzidaha.github.io/static/assets/img/posts/6AFDE773-1A0B-476B-B5CB-E11767607EE4.png" target="_blank">![实例图片](http://huzidaha.github.io/static/assets/img/posts/6AFDE773-1A0B-476B-B5CB-E11767607EE4.png)</a>

如法炮制 `Content.js`：

```javascript
class Content extends Component {
  static contextTypes = {
    store: PropTypes.object
  }

  constructor () {
    super()
    this.state = { themeColor: '' }
  }

  componentWillMount () {
    this._updateThemeColor()
  }

  _updateThemeColor () {
    const { store } = this.context
    const state = store.getState()
    this.setState({ themeColor: state.themeColor })
  }

  render () {
    return (
      <div>
        <p style={{ color: this.state.themeColor }}>React.js 小书内容</p>
        <ThemeSwitch />
      </div>
    )
  }
}
```

还有 `src/ThemeSwitch.js`：

```javascript
class ThemeSwitch extends Component {
  static contextTypes = {
    store: PropTypes.object
  }

  constructor () {
    super()
    this.state = { themeColor: '' }
  }

  componentWillMount () {
    this._updateThemeColor()
  }

  _updateThemeColor () {
    const { store } = this.context
    const state = store.getState()
    this.setState({ themeColor: state.themeColor })
  }

  render () {
    return (
      <div>
        <button style={{ color: this.state.themeColor }}>Red</button>
        <button style={{ color: this.state.themeColor }}>Blue</button>
      </div>
    )
  }
}
```

这时候，主题已经完全生效了，整个页面都是红色的：

<a href="http://huzidaha.github.io/static/assets/img/posts/8821A86C-BFC2-47AE-9B93-88F577D44715.png" target="_blank">![实例图片](http://huzidaha.github.io/static/assets/img/posts/8821A86C-BFC2-47AE-9B93-88F577D44715.png)</a>

当然现在点按钮还是没什么效果，我们接下来给按钮添加事件。其实也很简单，监听 `onClick` 事件然后 `store.dispatch` 一个 `action` 就好了，修改 `src/ThemeSwitch.js`：

```javascript
class ThemeSwitch extends Component {
  static contextTypes = {
    store: PropTypes.object
  }

  constructor () {
    super()
    this.state = { themeColor: '' }
  }

  componentWillMount () {
    this._updateThemeColor()
  }

  _updateThemeColor () {
    const { store } = this.context
    const state = store.getState()
    this.setState({ themeColor: state.themeColor })
  }

  // dispatch action 去改变颜色
  handleSwitchColor (color) {
    const { store } = this.context
    store.dispatch({
      type: 'CHANGE_COLOR',
      themeColor: color
    })
  }

  render () {
    return (
      <div>
        <button
          style={{ color: this.state.themeColor }}
          onClick={this.handleSwitchColor.bind(this, 'red')}>Red</button>
        <button
          style={{ color: this.state.themeColor }}
          onClick={this.handleSwitchColor.bind(this, 'blue')}>Blue</button>
      </div>
    )
  }
}
```

我们给两个按钮都加上了 `onClick` 事件监听，并绑定到了 `handleSwitchColor` 方法上，两个按钮分别给这个方法传入不同的颜色 `red` 和 `blue`，`handleSwitchColor` 会根据传入的颜色 `store.dispatch` 一个 `action` 去修改颜色。

当然你现在点击按钮还是没有反应的。因为点击按钮的时候，只是更新 `store` 里面的 `state`，而并没有在 `store.state` 更新以后去重新渲染数据，我们其实就是忘了 `store.subscribe` 了。

给 `Header.js`、`Content.js`、`ThemeSwitch.js` 的 `componentWillMount` 生命周期都加上监听数据变化重新渲染的代码：

```javascript
...
  componentWillMount () {
    const { store } = this.context
    this._updateThemeColor()
    store.subscribe(() => this._updateThemeColor())
  }
...
```

通过 `store.subscribe`，在数据变化的时候重新调用 `_updateThemeColor`，而 `_updateThemeColor` 会去 `store` 里面取最新的 `themeColor` 然后通过 `setState` 重新渲染组件，这时候组件就更新了。现在可以自由切换主题色了：

<a href="http://huzidaha.github.io/static/assets/img/posts/F102EAC1-409F-40E5-8134-B37F401E6883.png" target="_blank">![实例图片](http://huzidaha.github.io/static/assets/img/posts/F102EAC1-409F-40E5-8134-B37F401E6883.png)</a>

我们顺利地把 store 和 context 结合起来，这是 Redux 和 React.js 的第一次胜利会师，当然还有很多需要优化的地方。




# 动手实现 React-redux（三）：connect 和 mapStateToProps
我们来观察一下刚写下的这几个组件，可以轻易地发现它们有两个重大的问题：

1. *有大量重复的逻辑*：它们基本的逻辑都是，取出 context，取出里面的 store，然后用里面的状态设置自己的状态，这些代码逻辑其实都是相同的。
2. *对 context 依赖性过强*：这些组件都要依赖 context 来取数据，使得这个组件复用性基本为零。想一下，如果别人需要用到里面的 `ThemeSwitch` 组件，但是他们的组件树并没有 context 也没有 store，他们没法用这个组件了。

对于第一个问题，我们在 [高阶组件](http://huziketang.com/books/react/lesson28) 的章节说过，可以把一些可复用的逻辑放在高阶组件当中，高阶组件包装的新组件和原来组件之间通过 `props` 传递信息，减少代码的重复程度。

对于第二个问题，我们得弄清楚一件事情，到底什么样的组件才叫复用性强的组件。如果一个组件对外界的依赖过于强，那么这个组件的移植性会很差，就像这些严重依赖 context 的组件一样。

如果一个组件的渲染只依赖于外界传进去的 `props` 和自己的 `state`，而并不依赖于其他的外界的任何数据，也就是说像纯函数一样，给它什么，它就吐出（渲染）什么出来。这种组件的复用性是最强的，别人使用的时候根本不用担心任何事情，只要看看 `PropTypes` 它能接受什么参数，然后把参数传进去控制它就行了。

我们把这种组件叫做 Pure Component，因为它就像纯函数一样，可预测性非常强，对参数（`props`）以外的数据零依赖，也不产生副作用。这种组件也叫 Dumb Component，因为它们呆呆的，让它干啥就干啥。写组件的时候尽量写 Dumb Component 会提高我们的组件的可复用性。

到这里思路慢慢地变得清晰了，我们需要高阶组件帮助我们从 context 取数据，我们也需要写 Dumb 组件帮助我们提高组件的复用性。所以我们尽量多地写 Dumb 组件，然后用高阶组件把它们包装一层，高阶组件和 context 打交道，把里面数据取出来通过 `props` 传给 Dumb 组件。

<a href="http://huzidaha.github.io/static/assets/img/posts/ED7B72E6-73BE-429F-AE3C-F9C15C3BE35E.png" target="_blank">![实例图片](http://huzidaha.github.io/static/assets/img/posts/ED7B72E6-73BE-429F-AE3C-F9C15C3BE35E.png)</a>

我们把这个高阶组件起名字叫 `connect`，因为它把 Dumb 组件和 context 连接（connect）起来了：

```javascript
import React, { Component } from 'react'
import PropTypes from 'prop-types'

export connect = (WrappedComponent) => {
  class Connect extends Component {
    static contextTypes = {
      store: PropTypes.object
    }

    // TODO: 如何从 store 取数据？

    render () {
      return <WrappedComponent />
    }
  }

  return Connect
}
```

`connect` 函数接受一个组件 `WrappedComponent` 作为参数，把这个组件包含在一个新的组件 `Connect` 里面，`Connect` 会去 context 里面取出 store。现在要把 store 里面的数据取出来通过 `props` 传给 `WrappedComponent`。

但是每个传进去的组件需要 store 里面的数据都不一样的，所以除了给高阶组件传入 Dumb 组件以外，还需要告诉高级组件我们需要什么数据，高阶组件才能正确地去取数据。为了解决这个问题，我们可以给高阶组件传入类似下面这样的函数：

```javascript
const mapStateToProps = (state) => {
  return {
    themeColor: state.themeColor,
    themeName: state.themeName,
    fullName: `${state.firstName} ${state.lastName}`
    ...
  }
}
```

这个函数会接受 `store.getState()` 的结果作为参数，然后返回一个对象，这个对象是根据 `state` 生成的。`mapStateTopProps` 相当于告知了 `Connect` 应该如何去 store 里面取数据，然后可以把这个函数的返回结果传给被包装的组件：

```javascript
import React, { Component } from 'react'
import PropTypes from 'prop-types'

export const connect = (mapStateToProps) => (WrappedComponent) => {
  class Connect extends Component {
    static contextTypes = {
      store: PropTypes.object
    }

    render () {
      const { store } = this.context
      let stateProps = mapStateToProps(store.getState())
      // {...stateProps} 意思是把这个对象里面的属性全部通过 `props` 方式传递进去
      return <WrappedComponent {...stateProps} />
    }
  }

  return Connect
}
```

`connect` 现在是接受一个参数 `mapStateToProps`，然后返回一个函数，这个返回的函数才是高阶组件。它会接受一个组件作为参数，然后用 `Connect` 把组件包装以后再返回。 `connect` 的用法是：

```javascript
...
const mapStateToProps = (state) => {
  return {
    themeColor: state.themeColor
  }
}
Header = connect(mapStateToProps)(Header)
...
```

> 有些朋友可能会问为什么不直接 `const connect = (mapStateToProps, WrappedComponent)`，而是要额外返回一个函数。这是因为 React-redux 就是这么设计的，而个人观点认为这是一个 React-redux 设计上的缺陷，这里有机会会在关于函数编程的章节再给大家科普，这里暂时不深究了。

我们把上面 `connect` 的函数代码单独分离到一个模块当中，在 `src/` 目录下新建一个 `react-redux.js`，把上面的 `connect` 函数的代码复制进去，然后就可以在 `src/Header.js` 里面使用了：

```javascript
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from './react-redux'

class Header extends Component {
  static propTypes = {
    themeColor: PropTypes.string
  }

  render () {
    return (
      <h1 style={{ color: this.props.themeColor }}>React.js 小书</h1>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    themeColor: state.themeColor
  }
}
Header = connect(mapStateToProps)(Header)

export default Header
```

可以看到 `Header` 删掉了大部分关于 context 的代码，它除了 `props` 什么也不依赖，它是一个 Pure Component，然后通过 `connect` 取得数据。我们不需要知道 `connect` 是怎么和 context 打交道的，只要传一个 `mapStateToProps` 告诉它应该怎么取数据就可以了。同样的方式修改 `src/Content.js`：

```javascript
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import ThemeSwitch from './ThemeSwitch'
import { connect } from './react-redux'

class Content extends Component {
  static propTypes = {
    themeColor: PropTypes.string
  }

  render () {
    return (
      <div>
        <p style={{ color: this.props.themeColor }}>React.js 小书内容</p>
        <ThemeSwitch />
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    themeColor: state.themeColor
  }
}
Content = connect(mapStateToProps)(Content)

export default Content
```

`connect` 还没有监听数据变化然后重新渲染，所以现在点击按钮只有按钮会变颜色。我们给 `connect` 的高阶组件增加监听数据变化重新渲染的逻辑，稍微重构一下 `connect`：

```javascript
export const connect = (mapStateToProps) => (WrappedComponent) => {
  class Connect extends Component {
    static contextTypes = {
      store: PropTypes.object
    }

    constructor () {
      super()
      this.state = { allProps: {} }
    }

    componentWillMount () {
      const { store } = this.context
      this._updateProps()
      store.subscribe(() => this._updateProps())
    }

    _updateProps () {
      const { store } = this.context
      let stateProps = mapStateToProps(store.getState(), this.props) // 额外传入 props，让获取数据更加灵活方便
      this.setState({
        allProps: { // 整合普通的 props 和从 state 生成的 props
          ...stateProps,
          ...this.props
        }
      })
    }

    render () {
      return <WrappedComponent {...this.state.allProps} />
    }
  }

  return Connect
}
```

我们在 `Connect` 组件的 `constructor` 里面初始化了 `state.allProps`，它是一个对象，用来保存需要传给被包装组件的所有的参数。生命周期 `componentWillMount` 会调用调用 `_updateProps` 进行初始化，然后通过 `store.subscribe` 监听数据变化重新调用 `_updateProps`。

为了让 connect 返回新组件和被包装的组件使用参数保持一致，我们会把所有传给 `Connect` 的 `props` 原封不动地传给 `WrappedComponent`。所以在 `_updateProps` 里面会把 `stateProps` 和 `this.props` 合并到 `this.state.allProps` 里面，再通过 `render` 方法把所有参数都传给 `WrappedComponent`。

`mapStateToProps` 也发生点变化，它现在可以接受两个参数了，我们会把传给 `Connect` 组件的 `props` 参数也传给它，那么它生成的对象配置性就更强了，我们可以根据 `store` 里面的 `state` 和外界传入的 `props` 生成我们想传给被包装组件的参数。

现在已经很不错了，`Header.js` 和 `Content.js` 的代码都大大减少了，并且这两个组件 connect  之前都是 Dumb 组件。接下来会继续重构 `ThemeSwitch`。





# 动手实现 React-redux（四）：mapDispatchToProps
在重构 `ThemeSwitch` 的时候我们发现，`ThemeSwitch` 除了需要 `store` 里面的数据以外，还需要 `store` 来 `dispatch`：

```javascript
...
  // dispatch action 去改变颜色
  handleSwitchColor (color) {
    const { store } = this.context
    store.dispatch({
      type: 'CHANGE_COLOR',
      themeColor: color
    })
  }
...
```

目前版本的 `connect` 是达不到这个效果的，我们需要改进它。

想一下，既然可以通过给 `connect` 函数传入 `mapStateToProps` 来告诉它如何获取、整合状态，我们也可以想到，可以给它传入另外一个参数来告诉它我们的组件需要如何触发 `dispatch`。我们把这个参数叫 `mapDispatchToProps`：

```javascript
const mapDispatchToProps = (dispatch) => {
  return {
    onSwitchColor: (color) => {
      dispatch({ type: 'CHANGE_COLOR', themeColor: color })
    }
  }
}
```

和 `mapStateToProps` 一样，它返回一个对象，这个对象内容会同样被 `connect` 当作是 `props` 参数传给被包装的组件。不一样的是，这个函数不是接受 `state` 作为参数，而是 `dispatch`，你可以在返回的对象内部定义一些函数，这些函数会用到 `dispatch` 来触发特定的 `action`。

调整 `connect` 让它能接受这样的 `mapDispatchToProps`：

```javascript
export const connect = (mapStateToProps, mapDispatchToProps) => (WrappedComponent) => {
  class Connect extends Component {
    static contextTypes = {
      store: PropTypes.object
    }

    constructor () {
      super()
      this.state = {
        allProps: {}
      }
    }

    componentWillMount () {
      const { store } = this.context
      this._updateProps()
      store.subscribe(() => this._updateProps())
    }

    _updateProps () {
      const { store } = this.context
      let stateProps = mapStateToProps
        ? mapStateToProps(store.getState(), this.props)
        : {} // 防止 mapStateToProps 没有传入
      let dispatchProps = mapDispatchToProps
        ? mapDispatchToProps(store.dispatch, this.props)
        : {} // 防止 mapDispatchToProps 没有传入
      this.setState({
        allProps: {
          ...stateProps,
          ...dispatchProps,
          ...this.props
        }
      })
    }

    render () {
      return <WrappedComponent {...this.state.allProps} />
    }
  }
  return Connect
}
```

在 `_updateProps` 内部，我们把`store.dispatch` 作为参数传给 `mapDispatchToProps`  ，它会返回一个对象 `dispatchProps`。接着把 `stateProps`、`dispatchProps`、`this.props` 三者合并到 `this.state.allProps` 里面去，这三者的内容都会在 `render` 函数内全部传给被包装的组件。

另外，我们稍微调整了一下，在调用 `mapStateToProps` 和 `mapDispatchToProps` 之前做判断，让这两个参数都是可以缺省的，这样即使不传这两个参数程序也不会报错。

这时候我们就可以重构 `ThemeSwitch`，让它摆脱 `store.dispatch`：

```javascript
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from './react-redux'

class ThemeSwitch extends Component {
  static propTypes = {
    themeColor: PropTypes.string,
    onSwitchColor: PropTypes.func
  }

  handleSwitchColor (color) {
    if (this.props.onSwitchColor) {
      this.props.onSwitchColor(color)
    }
  }

  render () {
    return (
      <div>
        <button
          style={{ color: this.props.themeColor }}
          onClick={this.handleSwitchColor.bind(this, 'red')}>Red</button>
        <button
          style={{ color: this.props.themeColor }}
          onClick={this.handleSwitchColor.bind(this, 'blue')}>Blue</button>
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    themeColor: state.themeColor
  }
}
const mapDispatchToProps = (dispatch) => {
  return {
    onSwitchColor: (color) => {
      dispatch({ type: 'CHANGE_COLOR', themeColor: color })
    }
  }
}
ThemeSwitch = connect(mapStateToProps, mapDispatchToProps)(ThemeSwitch)

export default ThemeSwitch
```

光看 `ThemeSwitch` 内部，是非常清爽干净的，只依赖外界传进来的 `themeColor` 和 `onSwitchColor`。但是 `ThemeSwitch` 内部并不知道这两个参数其实都是我们去 `store` 里面取的，它是 Dumb 的。这时候这三个组件的重构都已经完成了，代码大大减少、不依赖 context，并且功能和原来一样。




# 动手实现 React-redux（五）：Provider
我们要把 context 相关的代码从所有业务组件中清除出去，现在的代码里面还有一个地方是被污染的。那就是 `src/index.js`  里面的 `Index`：

```javascript
...
class Index extends Component {
  static childContextTypes = {
    store: PropTypes.object
  }

  getChildContext () {
    return { store }
  }

  render () {
    return (
      <div>
        <Header />
        <Content />
      </div>
    )
  }
}
...
```

其实它要用 context 就是因为要把 `store` 存放到里面，好让子组件 `connect` 的时候能够取到 `store`。我们可以额外构建一个组件来做这种脏活，然后让这个组件成为组件树的根节点，那么它的子组件都可以获取到 context 了。

我们把这个组件叫 `Provider`，因为它提供（provide）了 `store`：

<a href="http://huzidaha.github.io/static/assets/img/posts/B5DD0B85-6119-4BC3-9626-59E564B45275.png" target="_blank">![实例图片](http://huzidaha.github.io/static/assets/img/posts/B5DD0B85-6119-4BC3-9626-59E564B45275.png)</a>

在 `src/react-redux.js` 新增代码：

```javascript
export class Provider extends Component {
  static propTypes = {
    store: PropTypes.object,
    children: PropTypes.any
  }

  static childContextTypes = {
    store: PropTypes.object
  }

  getChildContext () {
    return {
      store: this.props.store
    }
  }

  render () {
    return (
      <div>{this.props.children}</div>
    )
  }
}
```

`Provider` 做的事情也很简单，它就是一个容器组件，会把嵌套的内容原封不动作为自己的子组件渲染出来。它还会把外界传给它的 `props.store` 放到 context，这样子组件 `connect` 的时候都可以获取到。

可以用它来重构我们的 `src/index.js`：

```javascript
...
// 头部引入 Provider
import { Provider } from './react-redux'
...

// 删除 Index 里面所有关于 context 的代码
class Index extends Component {
  render () {
    return (
      <div>
        <Header />
        <Content />
      </div>
    )
  }
}

// 把 Provider 作为组件树的根节点
ReactDOM.render(
  <Provider store={store}>
    <Index />
  </Provider>,
  document.getElementById('root')
)
```

这样我们就把所有关于 context 的代码从组件里面删除了。





# 动手实现 React-redux（六）：React-redux 总结

到这里大家已经掌握了 React-redux 的基本用法和概念，并且自己动手实现了一个 React-redux，我们回顾一下这几节都干了什么事情。

React.js 除了状态提升以外并没有更好的办法帮我们解决组件之间共享状态的问题，而使用 context 全局变量让程序不可预测。通过 Redux 的章节，我们知道 store 里面的内容是不可以随意修改的，而是通过 dispatch 才能变更里面的 state。所以我们尝试把 store 和 context 结合起来使用，可以兼顾组件之间共享状态问题和共享状态可能被任意修改的问题。

第一个版本的 store 和 context 结合有诸多缺陷，有大量的重复逻辑和对 context 的依赖性过强。我们尝试通过构建一个高阶组件 `connect` 函数的方式，把所有的重复逻辑和对 context 的依赖放在里面 `connect` 函数里面，而其他组件保持 Pure（Dumb） 的状态，让 `connect` 跟 context 打交道，然后通过 `props` 把参数传给普通的组件。

而每个组件需要的数据和需要触发的 action 都不一样，所以调整 `connect`，让它可以接受两个参数 `mapStateToProps` 和 `mapDispatchToProps`，分别用于告诉 `connect` 这个组件需要什么数据和需要触发什么 action。

最后为了把所有关于 context 的代码完全从我们业务逻辑里面清除掉，我们构建了一个 `Provider` 组件。`Provider` 作为所有组件树的根节点，外界可以通过 `props` 给它提供 store，它会把 store 放到自己的 context 里面，好让子组件 connect 的时候都能够获取到。

这几节的成果就是 `react-redux.js` 这个文件里面的两个内容：`connect` 函数和 `Provider` 容器组件。这就是 React-redux 的基本内容，当然它是一个残疾版本的 React-redux，很多地方需要完善。例如上几节提到的性能问题，现在不相关的数据变化的时候其实所有组件都会重新渲染的，这个性能优化留给读者做练习。

通过这种方式大家不仅仅知道了 React-redux 的基础概念和用法，而且还知道这些概念到底是解决什么问题，为什么 React-redux 这么奇怪，为什么要 connect，为什么要 mapStateToProps 和 mapDispatchToProps，什么是 Provider，我们通过解决一个个问题就知道它们到底为什么要这么设计的了。
