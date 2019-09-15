React高频面试题
===
<!-- TOC -->

- [1.React生命周期有哪些，16版本生命周期发生了哪些变化？](#1react生命周期有哪些16版本生命周期发生了哪些变化)
  - [15生命周期](#15生命周期)
  - [16生命周期](#16生命周期)
- [2.setState是同步的还是异步的？](#2setstate是同步的还是异步的)
  - [生命周期和合成事件中](#生命周期和合成事件中)
  - [异步代码和原生事件中](#异步代码和原生事件中)
  - [最佳实践](#最佳实践)
- [3.为什么有时连续多次setState只有一次生效？](#3为什么有时连续多次setstate只有一次生效)

<!-- /TOC -->

## 1.React生命周期有哪些，16版本生命周期发生了哪些变化？
### 15生命周期

![1909151.jpg](../resource/assets/other/1909151.jpg)

* 初始化阶段
    - `constructor` 构造函数
    - `getDefaultProps props`默认值
    - `getInitialState state`默认值

* 挂载阶段
    - `componentWillMount` 组件初始化渲染前调用
    - `render` 组件渲染
    - `componentDidMount`组件挂载到 `DOM`后调用

* 更新阶段
    - `componentWillReceiveProps` 组件将要接收新 props前调用
    - `shouldComponentUpdate` 组件是否需要更新
    - `componentWillUpdate` 组件更新前调用
    - `render` 组件渲染
    - `componentDidUpdate` 组件更新后调用

* 卸载阶段
    - `componentWillUnmount` 组件卸载前调用

### 16生命周期
![1909152.jpg](../resource/assets/other/1909152.jpg)

* 初始化阶段
    - `constructor` 构造函数
    - `getDefaultProps props`默认值
    - `getInitialState state`默认值

* 挂载阶段
    - `staticgetDerivedStateFromProps(props,state)`
    - `render`
    - `componentDidMount`

    > `getDerivedStateFromProps`：组件每次被 `rerender`的时候，包括在组件构建之后(虚拟 `dom`之后，实际 `dom`挂载之前)，每次获取新的 `props`或 `state`之后；每次接收新的`props`之后都会返回一个对象作为新的 `state`，返回null则说明不需要更新 `state`；配合 `componentDidUpdate`，可以覆盖 `componentWillReceiveProps`的所有用法

* 更新阶段
    - `staticgetDerivedStateFromProps(props,state)`
    - `shouldComponentUpdate`
    - `render`
    - `getSnapshotBeforeUpdate(prevProps,prevState)`
    - `componentDidUpdate`

    > `getSnapshotBeforeUpdate`：触发时间: `update`发生的时候，在 `render`之后，在组件 `dom`渲染之前；返回一个值，作为 `componentDidUpdate`的第三个参数；配合 `componentDidUpdate`, 可以覆盖 `componentWillUpdate`的所有用法

* 卸载阶段
    - componentWillUnmount

* 错误处理
    - componentDidCatch

**React16**新的生命周期弃用了 `componentWillMount`、`componentWillReceivePorps`，`componentWillUpdate`新增了 `getDerivedStateFromProps`、`getSnapshotBeforeUpdate`来代替弃用的三个钩子函数。

> **React16**并没有删除这三个钩子函数，但是不能和新增的钩子函数混用， **React17**将会删除这三个钩子函数，新增了对错误的处理（ `componentDidCatch`）


## 2.setState是同步的还是异步的？
### 生命周期和合成事件中
在 React的生命周期和合成事件中， React仍然处于他的更新机制中，这时无论调用多少次 setState，都不会立即执行更新，而是将要更新的`·`存入 `_pendingStateQueue`，将要更新的组件存入 `dirtyComponent`。

当上一次更新机制执行完毕，以生命周期为例，所有组件，即最顶层组件 `didmount`后会将批处理标志设置为 false。这时将取出 `dirtyComponent`中的组件以及 `_pendingStateQueue`中的 `state`进行更新。这样就可以确保组件不会被重新渲染多次。

```js
componentDidMount(){
	this.setState({
		index: this.state.index + 1
	});

	console.log('state', this.state.index);
}
```

所以，如上面的代码，当我们在执行 setState后立即**去获取 state，这时是获取不到更新后的 state的，因为处于 React的批处理机制中， state被暂存起来，待批处理机制完成之后，统一进行更新**。

所以。**setState本身并不是异步的，而是 React的批处理机制给人一种异步的假象**。

### 异步代码和原生事件中
```js
componentDidMount () {
  setTimeout(() => {
    console.log('调用setState');
    this.setState({
      index: this.state.index + 1
    });
    console.log("state", this.state.index);
  }, 0)
}
```

如上面的代码，当我们在异步代码中调用 `setState`时，根据 `JavaScript`的异步机制，会将异步代码先暂存，等所有同步代码执行完毕后在执行，这时 `React`的批处理机制已经走完，处理标志设被设置为 `false`，这时再调用 `setState`即可立即执行更新，拿到更新后的结果。

**在原生事件中调用 `setState`并不会出发 React的批处理机制，所以立即能拿到最新结果**。

### 最佳实践
`setState`的第二个参数接收一个函数，该函数会在 `React`的批处理机制完成之后调用，所以你想在调用 `setState`后立即获取更新后的值，请在该回调函数中获取。

```js
this.setState({
  index: this.state.index + 1 
}, () => {
  console.log(this.state.index);    
})
```  

## 3.为什么有时连续多次setState只有一次生效？
例如下面的代码，两次打印出的结果是相同的：
