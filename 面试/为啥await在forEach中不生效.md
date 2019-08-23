为啥 await 在 forEach 中不生效 
====

<!-- TOC -->

- [为啥 await 在 forEach 中不生效](#为啥-await-在-foreach-中不生效)
  - [start](#start)
  - [为什么？](#为什么)
  - [怎么解决？](#怎么解决)

<!-- /TOC -->

## start
不知道你有没有写过类似的代码，反正以前我是写过
```js
function test() {
	let arr = [3, 2, 1]
	arr.forEach(async item => {
		const res = await fetch(item)
		console.log(res)
	})
	console.log('end')
}

function fetch(x) {
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			resolve(x)
		}, 500 * x)
	})
}

test()
```

我当时期望的打印顺序是
```js
3
2
1
end
```

结果现实与我开了个玩笑，打印顺序居然是
```js
end
1
2
3
```

## 为什么？
其实原因很简单，那就是 `forEach` 只支持同步代码。

我们可以参考下 Polyfill 版本的 `forEach`，简化以后类似就是这样的伪代码
```js
while (index < arr.length) {
		// 也就是我们传入的回调函数
		callback(item, index)
}
```

从上述代码中我们可以发现，`forEach` 只是简单的执行了下回调函数而已，并不会去处理异步的情况。并且你在 `callback` 中即使使用 `break` 也并不能结束遍历。

## 怎么解决？
一般来说解决的办法有两种。

A. 第一种是使用 `Promise.all` 的方式

```js
async function test() {
	let arr = [3, 2, 1]
	await Promise.all(
		arr.map(async item => {
			const res = await fetch(item)
			console.log(res)
		})
	)
	console.log('end')
}
```

这样可以生效的原因是 `async` 函数肯定会返回一个 `Promise` 对象，调用 `map` 以后返回值就是一个存放了 `Promise` 的数组了，这样我们把数组传入 `Promise.all` 中就可以解决问题了。但是这种方式其实并不能达成我们要的效果，如果你希望内部的 `fetch` 是顺序完成的，可以选择第二种方式。

B. 另一种方法是使用 for...of

```js
async function test() {
	let arr = [3, 2, 1]
	for (const item of arr) {
		const res = await fetch(item)
		console.log(res)
	}
	console.log('end')
}
```

这种方式相比 `Promise.all` 要简洁的多，并且也可以实现开头我想要的输出顺序。

但是这时候你是否又多了一个疑问？为啥 `for...of` 内部就能让 `await` 生效呢。

因为 `for...of` 内部处理的机制和 `forEach` `不同，forEach` 是直接调用回调函数，`for...of` 是通过迭代器的方式去遍历。

```js
async function test() {
	let arr = [3, 2, 1]
	const iterator = arr[Symbol.iterator]()
	let res = iterator.next()
	while (!res.done) {
		const value = res.value
		const res1 = await fetch(value)
		console.log(res1)
		res = iterator.next()
	}
	console.log('end')
}
```

以上代码等价于 `for...of`，可以看成 `for...of` 是以上代码的语法糖。
