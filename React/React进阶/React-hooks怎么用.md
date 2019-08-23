React Hooks 该怎么用
====
<!-- TOC -->

- [React Hooks 该怎么用](#react-hooks-该怎么用)
  - [为什么要用 Hooks](#为什么要用-hooks)
    - [组件嵌套问题](#组件嵌套问题)
    - [class 组件的问题](#class-组件的问题)
  - [Hooks 怎么用](#hooks-怎么用)
    - [useState](#usestate)
    - [useEffect](#useeffect)
  - [总结](#总结)

<!-- /TOC -->

## 为什么要用 Hooks
### 组件嵌套问题
之前如果我们需要抽离一些重复的逻辑，就会选择 HOC 或者 render props 的方式。但是通过这样的方式去实现组件，你打开 React DevTools 就会发现组件被各种其他组件包裹在里面。这种方式首先提高了 debug 的难度，并且也很难实现共享状态。

但是通过 Hooks 的方式去抽离重复逻辑的话，一是不会增加组件的嵌套，二是可以实现状态的共享。


### class 组件的问题
如果我们需要一个管理状态的组件，那么就必须使用 class 的方式去创建一个组件。但是一旦 class 组件变得复杂，那么四散的代码就很不容易维护。另外 class 组件通过 Babel 编译出来的代码也相比函数组件多得多。

Hooks 能够让我们通过函数组件的方式去管理状态，并且也能将四散的业务逻辑写成一个个 Hooks 便于复用以及维护。

## Hooks 怎么用
前面说了一些 Hooks 的好处，接下来我们就进入正题，通过实现一个计数器来学习几个常用的 Hooks。

### useState
`useState` 的用法很简单，传入一个初始 `state`，返回一个 `state` 以及修改 `state` 的函数。

```js
// useState 返回的 state 是个常量
// 每次组件重新渲染之后，当前 state 和之前的 state 都不相同
// 即使这个 state 是个对象
const [count, setCount] = useState(1)
```

`setCount` 用法是和 `setState` 一样的，可以传入一个新的状态或者函数。

```js
setCount(2)
setCount(prevCount => prevCount + 1)
```

`useState` 的用法是不是很简单。假如现在需要我们实现一个计数器，按照之前的方式只能通过 class 的方式去写，但是现在我们可以通过**函数组件 + Hooks** 的方式去实现这个功能。

```js
function Counter() {
	const [count, setCount] = React.useState(0)
	return (
		<div>
			Count: {count}
			<button onClick={() => setCount(prevCount => prevCount + 1)}>+</button>
			<button onClick={() => setCount(prevCount => prevCount - 1)}>-</button>
		</div>
	);
}
```

### useEffect
现在我们的计时器需求又升级了，需要在**组件更新**以后打印出当前的计数，这时候我们可以通过 `useEffect` 来实现

```js
function Counter() {
	const [count, setCount] = React.useState(0)
	
	React.useEffect(() => {
		console.log(count)
	})
	
	return (
		<div>
			Count: {count}
			<button onClick={() => setCount(prevCount => prevCount + 1)}>+</button>
			<button onClick={() => setCount(prevCount => prevCount - 1)}>-</button>
		</div>
	);
}
```

以上代码当我们改变计数的时候，就会打印出正确的计数，我们其实基本可以把 `useEffect` 看成是 `componentDidUpdate`，它们的区别我们可以在下一个例子中看到。

另外 `useEffect` 还可以返回一个函数，功能类似于 `componentWillUnmount`

```js
function Counter() {
	const [count, setCount] = React.useState(0)
	
	React.useEffect(() => {
		console.log(count)
		return () => console.log('clean', count)
	})
	
	// ...
}
```

当我们每次更新计数时，都会先打印 `clean` 这行 log

现在我们的需求再次升级了，需要我们在计数器更新以后延时两秒打印出计数。实现这个再简单不过了，我们改造下 `useEffect` 内部的代码即可

```js
React.useEffect(() => {
  setTimeout(() => {
  	console.log(count)
  }, 2000)
})
```

当我们快速点击按钮后，可以在两秒延时以后看到正确的计数。但是如果我们将这段代码写到 `componentDidUpdate` 中，事情就变得不一样了。

```js
componentDidUpdate() {
	setTimeout(() => {
		console.log(this.state.count)
	}, 2000)
}
```

对于这段代码来说，如果我们快速点击按钮，你会在延时两秒后看到打印出了相同的几个计数。这是因为在 `useEffect` 中我们通过闭包的方式每次都捕获到了正确的计数。但是在 `componentDidUpdate` 中，通过 `this.state.count` 的方式只能拿到最新的状态，因为这是一个对象。

当然如果你只想拿到最新的 `state` 的话，你可以使用 `useRef` 来实现。

```js
function Counter() {
	const [count, setCount] = React.useState(0)
	const ref = React.useRef(count)
	
	React.useEffect(() => {
		ref.current = count
		setTimeout(() => {
				console.log(ref.current)
		}, 2000)
	})
	
	//...
}
```

`useRef` 可以用来存储任何会改变的值，解决了在函数组件上不能通过实例去存储数据的问题。另外你还可以 `useRef` 来访问到改变之前的数据。

```js
function Counter() {
	const [count, setCount] = React.useState(0)
	const ref = React.useRef()
	
	React.useEffect(() => {
		// 可以在重新赋值之前判断先前存储的数据和当前数据的区别
		ref.current = count
	})
	
	<div>
			Count: {count}
			PreCount: {ref.current}
			<button onClick={() => setCount(prevCount => prevCount + 1)}>+</button>
			<button onClick={() => setCount(prevCount => prevCount - 1)}>-</button>
	</div>
	
	//...
}
```

现在需求再次升级，我们需要通过接口来获取初始计数，我们通过 `setTimeout` 来模拟这个行为。

```js
function Counter() {
	const [count, setCount] = React.useState();
	const [loading, setLoading] = React.useState(true);

	React.useEffect(() => {
		setLoading(true);
		setTimeout(() => {
			setCount(1);
			setLoading(false);
		}, 2000);
	});
	return (
		<div>
			{!loading ? (
				<div>
					Count: {count}
					<button onClick={() => setCount(pre => pre + 1)}>+</button>
					<button onClick={() => setCount(pre => pre - 1)}>-</button>
				</div>
			) : (
				<div>loading</div>
			)}
		</div>
	);
}
```

如果你去执行这段代码，会发现 `useEffect` 无限执行。这是因为在 `useEffect` 内部再次触发了状态更新，因此 `useEffect` 会再次执行。

解决这个问题我们可以通过 `useEffect` 的第二个参数解决

```js
React.useEffect(() => {
		setLoading(true);
		setTimeout(() => {
			setCount(1);
			setLoading(false);
		}, 2000);
}, []);
```

第二个参数传入一个依赖数组，只有依赖的属性变更了，才会再次触发 `useEffect` 的执行。在上述例子中，我们传入一个空数组就代表这个 `useEffect` 只会执行一次。

现在我们的代码有点丑陋了，可以将请求的这部分代码单独抽离成一个函数，你可能会这样写

```js
const fetch = () => {
		setLoading(true);
		setTimeout(() => {
			setCount(1);
			setLoading(false);
		}, 2000);
}

React.useEffect(() => {
		fetch()
}, [fetch]);
```

但是这段代码出现的问题和一开始的是一样的，还是会无限执行。这是因为虽然你传入了依赖，但是每次组件更新的时候 `fetch` 都会重新创建，因此 `useEffect` 认为依赖已经更新了，所以再次执行回调。

解决这个问题我们需要使用到一个新的 `Hooks useCallback`。这个 Hooks 可以生成一个不随着组件更新而再次创建的 callback，接下来我们通过这个 Hooks 再次改造下代码

```js
const fetch = React.useCallback(() => {
		setLoading(true);
		setTimeout(() => {
			setCount(1);
			setLoading(false);
		}, 2000);
}, [])

React.useEffect(() => {
		fetch()
}, [fetch]);
```

大功告成，我们已经通过几个 Hooks + 函数组件完美实现了原本需要 class 组件才能完成的事情。

## 总结
通过几个计数器的需求我们学习了一些常用的 Hooks，接下来总结一下这部分的内容。
- useState：传入我们所需的初始状态，返回一个**常量**状态以及改变状态的函数
- useEffect：第一个参数接受一个 callback，每次组件更新都会执行这个 callback，并且 callback 可以返回一个函数，该函数会在每次组件销毁前执行。如果 useEffect 内部有依赖外部的属性，并且希望依赖属性不改变就不重复执行 useEffect 的话，可以传入一个依赖数组作为第二个参数
- useRef：如果你需要有一个地方来存储变化的数据
- useCallback：如果你需要一个不会随着组件更新而重新创建的 callback


![hook-flow](../../resource/assets/react/hook-flow.png)