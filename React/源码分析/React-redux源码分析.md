# react-redux 源码分析
<!-- TOC -->

- [react-redux 源码分析](#react-redux-源码分析)
  - [开始](#开始)
  - [react-redux API](#react-redux-api)
    - [Provider](#provider)
    - [一个简单的 Connect](#一个简单的-connect)
    - [Connect 的优化](#connect-的优化)

<!-- /TOC -->

## 开始
Redux 本身是一个 standalone library，不依托于任何框架，但是由于 React 本身是一个函数式的视图框架，它的理念是 f(state) => view，所以 Redux 大多配合 React 一起使用。这二者的结合点就是 react-redux 这个库。

为了能最直观的体会这个库的思想，我们不看最近的 release，而是选择 16 年 2 月 [V4.2.0](http://link.zhihu.com/?target=https%3A//github.com/reactjs/react-redux/releases/tag/v4.2.0)这个版本进行分析。

## react-redux API
1. `<Provider />` ，使每个 react 组件都能拿到 store
2. `connect` 函数，使一个 react 组件变成 container component

### Provider

Provider 本身是一个 react 组件，这一点首先要搞清楚。`它的实现原理非常简单，利用了 React 的 context 这一特性`。文档 [Context - React](http://link.zhihu.com/?target=https%3A//reactjs.org/docs/context.html)。 只要在最外层的组件实现一个 `getChildContext` 这个方法，返回一个对象，内部的组件都可以通过 `this.context` 拿到这个对象。所以一个简单的 `Provider` 实现是这样的：

```js
class Provider extends React.Component {
  getChildContext() {
    return { store: this.props.store }    
  }

  render() {
    return this.props.children
  }
}

// usage
const store = createStore();
ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>
, document.querySelector('#root'));
```
现在，App 下所有的组件都能通过 `this.context.store` 拿到 store 了

<b style="color: red">必须要说明的是</b> **context 不建议作为日常开发使用，官方文档的第一段也是“Why Not to Use Context”。首先，这是一个实验性的 API，之后不一定有什么变化。其次，它破坏了 react 的单向数据流。如果你不是一个很有经验的 react 开发者，或者库、框架作者，请尽量不要用 context 这个特性**


### 一个简单的 Connect

我们先看一下 connect 一般情况下是怎么使用的。
```js
export default connect(mapStateToProps, mapDispatchToProps)(MyComponent)
```

首先，export 出去的是一个增强过的 react 组件，也就是说 **connect(mapStateToProps, mapDispatchToProps)** 第一步首先返回了一个 HOC Component。

> HOC（High Order Component）？一个函数，接受一个 React 组件，并返回一个增强的 React 组件，这个函数就叫做 HOC Component。

我们注意到 `connect()()` 之后一共有两次执行，那么 connect 第二步具体做了什么呢？通过之前阅读 API 文档我们知道，被这样包裹了一层之后，相应的组件变成了 `Container / Smart Component`，可以通过 `this.props` 来获取 `store` 里的 `state`，以及 `dispatch` 这个方法。

这样一来，store.state 的更新也就触发了 this.props 的更新，继而触发了容器组件的 re-render。

所以，**connect 第二步就是把 mapStateToProps 和 mapDispatchToProps 里的返回的属性，以及本身的 props 一起，作为 props 传递给了被包裹的组件**。

明确了这一点后，只剩下一个问题了：connect 是怎么做到监听 store 变化的呢？答案是用到了 `Redux store 的 subscribe 这个 API`。下面我们来实现一个简单的 connect：
```js
function connect(mapStateToProps, mapDispatchToProps) {
  return function createHOC(WrappedComponent) {
    class Connect extends React.Component {
      constructor(props, context) {
        this.store = context.store // <Provider /> 提供
      }
      componentDidMount() {
        this.unsubscribe = this.store.subscribe(this.handleChange.bind(this))
      }
      componentWillUnmount() {
        this.unsubscribe()
      }
      handleChange() {
        this.forceUpdate()
      }
      render() {
        return (
          <WrappedComponent 
            {...this.props}
            {...mapStateToProps(this.store.getState(), this.props)}
            {...mapDispatchToProps(this.store.dispatch, this.props)}
          />
        )
      }
    }
    Connect.displayName = `Connect(${WrappedComponent.name 
                              || WrappedComponent.displayName})`
    return Connect
  }
}
```

### Connect 的优化
如果你能理解到这里，那么你已经了解了 react-redux 这个库的核心思想。但是你应该也注意到了以上代码的最大的一个缺点：**那就是只要 store 一变化，组件就会 forceUpdate，即使更新的状态并没有被该组件用到**。

剩下的工作就是优化。优化的方向主要有以下几个：
1. 通过 mapStateToProps 和 mapDispatchToProps 计算出组件自己需要的 props。每当 store 变化时，首先计算出这部分 props 有没有变动，仅当这部分变动的时候才重新渲染组件。
2. 缓存上次渲染的组件。这样当第一步计算后的结果不需要重新绘制时，可以直接返回上次缓存的组件。
3. 注意 connect 还有第三个参数 mergeProps，用来将 mapStateToProps 和 mapDispatchToProps 计算出的 props 合并成一个 object。这一点在实现的时候也要一起考虑进去。
4. mapStateToProps 和 mapDispatchToProps 都可以接受 ownProps 这个参数，所以在源码中我们看到 doStatePropsDependOnOwnProps 和 doDispatchPropsDependOnOwnProps 这两个属性。


我们分别对应来看 react-redux 是怎么解决这几个性能问题的。

1. 对于第一个问题，在 subscribe 后，我们首先计算 store 本身的 state 是不是改变了。
    ```js
    handleChange() {
      const prevStoreState = this.state.storeState
      const storeState = this.store.getState()

      // 这里用 reference check 做初步检查，因为可能有的 action 没有被处理
      // 导致 subscribe 触发，而 store 本身没有改变引用
      if (prevStoreState !== storeState) {
        this.hasStoreStateChanged = true
        this.setState({ storeState })  // 触发 render
      }
    }
    ```
2. 通过 compute 函数来计算 组件自身从 store 需要的属性：
    ```js
    const doStatePropsDependOnOwnProps = finalMapStateToProps.length !== 1
    const doDispatchPropsDependOnOwnProps = finalMapDispatchToProps.length !== 1

    function computeStateProps(store, props) {
      const state = store.getState()
      const stateProps = doStatePropsDependOnOwnProps ?
        finalMapStateToProps(state, props) :
        finalMapStateToProps(state)

      return stateProps
    }

    function computeDispatchProps(store, props) {
      const { dispatch } = store
      const dispatchProps = doDispatchPropsDependOnOwnProps ?
        finalMapDispatchToProps(dispatch, props) :
        finalMapDispatchToProps(dispatch)

      return dispatchProps
    }

    function computeMergedProps(stateProps, dispatchProps, parentProps) {
      const mergedProps = finalMergeProps(stateProps, dispatchProps, parentProps)
      return mergedProps
    }
    ```
3. 通过 shallowEqual 对比之前缓存的组件 props 和新计算出的属性，来决定是否需要更新组件：
    ```js
    updateStatePropsIfNeeded() {
      const nextStateProps = computeStateProps(this.store, this.props)
      if (this.stateProps && shallowEqual(nextStateProps, this.stateProps)) {
        return false
      }

      this.stateProps = nextStateProps // 缓存
      return true
    }

    updateDispatchPropsIfNeeded() {
      const nextDispatchProps = computeDispatchProps(this.store, this.props)
      if (this.dispatchProps && shallowEqual(nextDispatchProps, this.dispatchProps)) {
        return false
      }

      this.dispatchProps = nextDispatchProps  // 缓存
      return true
    }

    updateMergedProps() {
      this.mergedProps = computeMergedProps(
        this.stateProps,
        this.dispatchProps,
        this.props
      )
    }
    ```
4. 最终在 render 函数中进行最终的判断（这里有一个问题需要澄清：为什么不把计算放在 shouldComponentUpdate 里面呢？因为 react 会 batch update，在这个函数里拿到的 props 并不能保证得到及时的更新）：
    ```js
    render() {
      const {
        haveOwnPropsChanged,
        hasStoreStateChanged,
        renderedElement  // 上次缓存的 render 结果
      } = this

      // 清空 flags
      this.haveOwnPropsChanged = false
      this.hasStoreStateChanged = false

      // 假设要重新渲染
      let shouldUpdateStateProps = true
      let shouldUpdateDispatchProps = true

      if (renderedElement) {
        shouldUpdateStateProps = hasStoreStateChanged || (
          haveOwnPropsChanged && doStatePropsDependOnOwnProps
        )
        shouldUpdateDispatchProps =
          haveOwnPropsChanged && doDispatchPropsDependOnOwnProps
      }

      let haveStatePropsChanged = false
      let haveDispatchPropsChanged = false
      if (shouldUpdateStateProps) {
        // 重新计算 StateProps
        haveStatePropsChanged = this.updateStatePropsIfNeeded()
      }
      if (shouldUpdateDispatchProps) {
        // 重新计算 DispatchProps
        haveDispatchPropsChanged = this.updateDispatchPropsIfNeeded()
      }

      let haveMergedPropsChanged = true
      if (
        haveStatePropsChanged ||
        haveDispatchPropsChanged ||
        haveOwnPropsChanged
      ) {
        this.updateMergedProps()
      } else {
        haveMergedPropsChanged = false
      }

      if (!haveMergedPropsChanged && renderedElement) {
        return renderedElement
      }
      
      // 这里是一个 connect 额外的配置项，不怎么用到，可以要求 connect 的时候把 refs
      // 一起作为 props 传下去
      if (withRef) {
        // 缓存渲染结果
        this.renderedElement = createElement(WrappedComponent, {
          ...this.mergedProps,
          ref: 'wrappedInstance'
        })
      } else {
        this.renderedElement = createElement(WrappedComponent,
          this.mergedProps
        )
      }
      return this.renderedElement
    }
    ```
5. 最后返回这个 HOC 组件：
    ```js
    Connect.displayName = `Connect(${getDisplayName(WrappedComponent)})`
    // Copies non-react specific statics from WrappedComponent
    // to the Connect component
    return hoistStatics(Connect, WrappedComponent)
    ```

可以看到，大部分 if-else 都集中在 render 这个函数里。由于这里作为判断是否重绘的 flags 比较多，所以可能显得比较乱。每当你感觉乱的时候，一定不要忘了，这一切只是代替了以前的 forceUpdate，回头看一下我们之前的优化方向会很有帮助。
