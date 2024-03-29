深入篇 | 阿里 P6 必会 Lodash 防抖节流函数实现原理
===
<!-- TOC -->

- [深入篇 | 阿里 P6 必会 Lodash 防抖节流函数实现原理](#深入篇--阿里-p6-必会-lodash-防抖节流函数实现原理)
- [防抖函数 debounce](#防抖函数-debounce)
  - [代码结构](#代码结构)
  - [入口函数](#入口函数)
  - [开闭定时器](#开闭定时器)
    - [startTimer](#starttimer)
    - [cancelTimer](#canceltimer)
    - [timerExpired](#timerexpired)
    - [remainingWait](#remainingwait)
  - [执行传入函数](#执行传入函数)
    - [leadingEdge](#leadingedge)
    - [trailingEdge](#trailingedge)
    - [invokeFunc](#invokefunc)
    - [shouldInvoke](#shouldinvoke)
  - [对外 3 个方法](#对外-3-个方法)
    - [cancel](#cancel)
    - [flush](#flush)
    - [pending](#pending)
- [节流函数 throttle](#节流函数-throttle)
  - [throttle](#throttle)
  - [isObject()](#isobject)

<!-- /TOC -->

# 防抖函数 debounce
Lodash 中节流函数比较简单，直接调用防抖函数，传入一些配置就摇身一变成了节流函数，所以我们先来看看其中防抖函数是如何实现的，弄懂了防抖，那节流自然就容易理解了。

进入正文，我们看下 debounce 源码，源码不多，总共 100 多行，为了方便理解就先列出代码结构，然后再从入口函数着手一个一个的介绍。

## 代码结构
```js
function debounce(func, wait, options) {
  // 通过闭包保存一些变量
  let lastArgs, // 上一次执行 debounced 的 arguments，
      					// 起一个标记位的作用，用于 trailingEdge 方法中，invokeFunc 后清空
    lastThis, // 保存上一次 this
    maxWait, // 最大等待时间，数据来源于 options，实现节流效果，保证大于一定时间后一定能执行
    result, // 函数 func 执行后的返回值，多次触发但未满足执行 func 条件时，返回 result
    timerId, // setTimeout 生成的定时器句柄
    lastCallTime // 上一次调用 debounce 的时间

  let lastInvokeTime = 0 // 上一次执行 func 的时间，配合 maxWait 多用于节流相关
  let leading = false // 是否响应事件刚开始的那次回调，即第一次触发，false 时忽略
  let maxing = false // 是否有最大等待时间，配合 maxWait 多用于节流相关
  let trailing = true // 是否响应事件结束后的那次回调，即最后一次触发，false 时忽略

  // 没传 wait 时调用 window.requestAnimationFrame()
  // window.requestAnimationFrame() 告诉浏览器希望执行动画并请求浏览器在下一次重绘之前调用指定的函数来更新动画，差不多 16ms 执行一次
  const useRAF = (!wait && wait !== 0 && typeof root.requestAnimationFrame === 'function')

  // 保证输入的 func 是函数，否则报错
  if (typeof func !== 'function') {
    throw new TypeError('Expected a function')
  }
  
  // 转成 Number 类型
  wait = +wait || 0
  
  // 获取用户传入的配置 options
  if (isObject(options)) {
    leading = !!options.leading
    // options 中是否有 maxWait 属性，节流函数预留
    maxing = 'maxWait' in options
    // maxWait 为设置的 maxWait 和 wait 中最大的，如果 maxWait 小于 wait，那 maxWait 就没有意义了
    maxWait = maxing ? Math.max(+options.maxWait || 0, wait) : maxWait
    trailing = 'trailing' in options ? !!options.trailing : trailing
  }
  
  // ----------- 开闭定时器 -----------
  // 开启定时器
  function startTimer(pendingFunc, wait) {}

  // 取消定时器
  function cancelTimer(id) {}

  // 定时器回调函数，表示定时结束后的操作
  function timerExpired() {}
  
  // 计算仍需等待的时间
  function remainingWait(time) {}
  
  // ----------- 执行传入函数 -----------
	// 执行连续事件刚开始的那次回调
  function leadingEdge(time) {}
  
  // 执行连续事件结束后的那次回调
  function trailingEdge(time) {}

  // 执行 func 函数
  function invokeFunc(time) {}

  // 判断此时是否应该执行 func 函数
  function shouldInvoke(time) {}

  // ----------- 对外 3 个方法 -----------
  // 取消函数延迟执行
  function cancel() {}

  // 立即执行 func
  function flush() {}

  // 检查当前是否在计时中
  function pending() {}

  // ----------- 入口函数 -----------
  function debounced(...args) {}
  
  // 绑定方法
  debounced.cancel = cancel
  debounced.flush = flush
  debounced.pending = pending
  
  // 返回入口函数 
  return debounced
}
```

`debounce(func, wait, options)` 方法提供了 3 个参数，第一个是我们想要执行的函数，为方便理解文中统一称为传入函数 `func`，第二个是超时时间 `wait`，第三个是可选参数，分别是 `leading`、`trailing` 和 `maxWait`。

## 入口函数
`debounce` 函数最终返回了 `debounced`，返回的这个函数就是入口函数了，事件每次触发后都会执行 `debounced` 函数，而且会频繁的执行，所以在这个方法里需要 「判断是否应该执行传入函数 func」，然后根据条件开启定时器，`debounced` 函数做的就是这件事。

```js
// 入口函数，返回此函数
function debounced(...args) {
  // 获取当前时间
  const time = Date.now()
  // 判断此时是否应该执行 func 函数
  const isInvoking = shouldInvoke(time)

  // 赋值给闭包，用于其他函数调用
  lastArgs = args
  lastThis = this
  lastCallTime = time

  // 执行
  if (isInvoking) {
    // 无 timerId 的情况有两种：
    // 1、首次调用 
    // 2、trailingEdge 执行过函数
    if (timerId === undefined) {
      return leadingEdge(lastCallTime)
    }
    
    // 如果设置了最大等待时间，则立即执行 func
    // 1、开启定时器，到时间后触发 trailingEdge 这个函数。
    // 2、执行 func，并返回结果
    if (maxing) {
      // 循环定时器中处理调用
      timerId = startTimer(timerExpired, wait)
      return invokeFunc(lastCallTime)
    }
  }
  // 一种特殊情况，trailing 设置为 true 时，前一个 wait 的 trailingEdge 已经执行了函数
  // 此时函数被调用时 shouldInvoke 返回 false，所以要开启定时器
  if (timerId === undefined) {
    timerId = startTimer(timerExpired, wait)
  }
  // 不需要执行时，返回结果
  return result
}
```

## 开闭定时器
入口函数中多次使用了 `startTimer`、`timerExpired` 这些方法，都是和定时器以及时间计算相关的，除了这两个方法外还有 `cancelTimer` 和 `remainingWai`t。

### startTimer
这个就是开启定时器了，防抖和节流的核心还是使用定时器，当事件触发时，设置一个指定超时时间的定时器，并传入回调函数，此时的回调函数 `pendingFunc` 其实就是 `timerExpired`。这里区分两种情况，一种是使用 `requestAnimationFrame`，另一种是使用 `setTimeout`。

```js
// 开启定时器
function startTimer(pendingFunc, wait) {
  // 没传 wait 时调用 window.requestAnimationFrame()
  if (useRAF) {
    // 若想在浏览器下次重绘之前继续更新下一帧动画
    // 那么回调函数自身必须再次调用 window.requestAnimationFrame()
    root.cancelAnimationFrame(timerId);
    return root.requestAnimationFrame(pendingFunc)
  }
  // 不使用 RAF 时开启定时器
  return setTimeout(pendingFunc, wait)
}
```

### cancelTimer
定时器有开启自然就需要关闭，关闭很简单，只要区分好 RAF 和非 RAF 时的情况即可，取消时传入时间 id。

```js
// 取消定时器
function cancelTimer(id) {
  if (useRAF) {
    return root.cancelAnimationFrame(id)
  }
  clearTimeout(id)
}
```

### timerExpired

`startTimer` 函数中传入的回调函数 `pendingFunc` 其实就是定时器回调函数 `timerExpired`，表示定时结束后的操作。

定时结束后无非两种情况，一种是执行传入函数 func，另一种就是不执行。对于第一种需要判断下是否需要执行传入函数 func，需要的时候执行最后一次回调。对于第二种计算剩余等待时间并重启定时器，保证下一次时延的末尾触发。

```js
// 定时器回调函数，表示定时结束后的操作
function timerExpired() {
  const time = Date.now()
  // 1、是否需要执行
  // 执行事件结束后的那次回调，否则重启定时器
  if (shouldInvoke(time)) {
    return trailingEdge(time)
  }
  // 2、否则 计算剩余等待时间，重启定时器，保证下一次时延的末尾触发
  timerId = startTimer(timerExpired, remainingWait(time))
}
```

### remainingWait

这里计算仍然需要等待的时间，使用的变量有点多，足足有 9 个，我们先看看各个变量的含义。

- time 当前时间戳
- lastCallTime 上一次调用 debounce 的时间
- timeSinceLastCall 当前时间距离上一次调用 debounce 的时间差
- lastInvokeTime 上一次执行 func 的时间
- timeSinceLastInvoke 当前时间距离上一次执行 func 的时间差
- wait 输入的等待时间
- timeWaiting 剩余等待时间
- maxWait 最大等待时间，数据来源于 options，为了节流函数预留
- maxing 是否设置了最大等待时间，判断依据是 maxWait in options
- `maxWait - timeSinceLastInvoke` 距上次执行 func 的剩余等待时间

变量是真的多，没看明白建议再看一遍，当然核心是下面这部分，根据 maxing 判断具体应该返回的剩余等待时间。

```js
// 是否设置了 maxing
// 是（节流）：返回「剩余等待时间」和「距上次执行 func 的剩余等待时间」中的最小值
// 否：返回 剩余等待时间
return maxing
  ? Math.min(timeWaiting, maxWait - timeSinceLastInvoke)
  : timeWaiting
```

这部分比较核心，完整的代码注释如下。

```js
// 计算仍需等待的时间
function remainingWait(time) {
  // 当前时间距离上一次调用 debounce 的时间差
  const timeSinceLastCall = time - lastCallTime
  // 当前时间距离上一次执行 func 的时间差
  const timeSinceLastInvoke = time - lastInvokeTime
  // 剩余等待时间
  const timeWaiting = wait - timeSinceLastCall

  // 是否设置了最大等待时间
	// 是（节流）：返回「剩余等待时间」和「距上次执行 func 的剩余等待时间」中的最小值
	// 否：返回剩余等待时间
  return maxing
    ? Math.min(timeWaiting, maxWait - timeSinceLastInvoke)
  	: timeWaiting
}
```

## 执行传入函数
聊完定时器和时间相关的函数后，这部分源码解析已经进行了大半，接下来我们看一下执行传入函数 func 的逻辑，分为执行刚开始的那次回调 `leadingEdge`，执行结束后的那次回调 `trailingEdge`，正常执行 func 函数 `invokeFunc`，以及判断是否应该执行 func 函数 `shouldInvoke`。

### leadingEdge

执行事件刚开始的那次回调，即事件刚触发就执行，不再等待 wait 时间之后，在这个方法里主要有三步。

- 设置上一次执行 func 的时间 `lastInvokeTime`
- 开启定时器
- 执行传入函数 func

```js
// 执行连续事件刚开始的那次回调
function leadingEdge(time) {
  // 1、设置上一次执行 func 的时间
  lastInvokeTime = time
  // 2、开启定时器，为了事件结束后的那次回调
  timerId = startTimer(timerExpired, wait)
  // 3、如果配置了 leading 执行传入函数 func
  // leading 来源自 !!options.leading
  return leading ? invokeFunc(time) : result
}
```

### trailingEdge
这里就是执行事件结束后的回调了，这里做的事情很简单，就是执行 func 函数，以及清空参数。

```js
// 执行连续事件结束后的那次回调
function trailingEdge(time) {
  // 清空定时器
  timerId = undefined

  // trailing 和 lastArgs 两者同时存在时执行
  // trailing 来源自 'trailing' in options ? !!options.trailing : trailing
  // lastArgs 标记位的作用，意味着 debounce 至少执行过一次
  if (trailing && lastArgs) {
    return invokeFunc(time)
  }
  // 清空参数
  lastArgs = lastThis = undefined
  return result
}
```

### invokeFunc
说了那么多次执行 func 函数，那么具体是如何执行的呢？真的很简单，就是 `func.apply(thisArg, args)`，除此之外需要重置部分参数。

```js
// 执行 Func 函数
function invokeFunc(time) {
  // 获取上一次执行 debounced 的参数
  const args = lastArgs
  // 获取上一次的 this
  const thisArg = lastThis

  // 重置
  lastArgs = lastThis = undefined
  lastInvokeTime = time
  result = func.apply(thisArg, args)
  return result
}
```

### shouldInvoke
在入口函数中执行 `invokeFunc` 时会先判断下是否应该执行，我们来详细看下具体逻辑，和 `remainingWait` 中类似，变量有点多，先来回顾下这些变量。

- time 当前时间戳
- lastCallTime 上一次调用 debounce 的时间
- timeSinceLastCall 当前时间距离上一次调用 debounce 的时间差
- lastInvokeTime 上一次执行 func 的时间
- timeSinceLastInvoke 当前时间距离上一次执行 func 的时间差
- wait 输入的等待时间
- maxWait 最大等待时间，数据来源于 options，为了节流函数预留
- maxing 是否设置了最大等待时间，判断依据是 maxWait in options

我们来一步一步看下判断的核心代码，总共有 4 种逻辑。

```js
return ( lastCallTime === undefined || 
       (timeSinceLastCall >= wait) ||
       (timeSinceLastCall < 0) || 
       (maxing && timeSinceLastInvoke >= maxWait) )
```

会发现一共有 4 种情况返回 true，区分开看也比较理解。

- `lastCallTime === undefined` 第一次调用时
- `timeSinceLastCall >= wait` 超过超时时间 wait，处理事件结束后的那次回调
- `timeSinceLastCall < 0` 当前时间 - 上次调用时间小于 0，即更改了系统时间
- `maxing && timeSinceLastInvoke >= maxWait` 超过最大等待时间

```js
// 判断此时是否应该执行 func 函数
function shouldInvoke(time) {
  // 当前时间距离上一次调用 debounce 的时间差
  const timeSinceLastCall = time - lastCallTime
  // 当前时间距离上一次执行 func 的时间差
  const timeSinceLastInvoke = time - lastInvokeTime

  // 上述 4 种情况返回 true
  return (lastCallTime === undefined || (timeSinceLastCall >= wait) ||
          (timeSinceLastCall < 0) || (maxing && timeSinceLastInvoke >= maxWait))
}
```

## 对外 3 个方法

debounced 函数提供了 3 个方法，分别是`cancel`、`flush` 和 `pending`，通过如下方式提供属性进行绑定。

```js
// 绑定方法
debounced.cancel = cancel
debounced.flush = flush
debounced.pending = pending
```

### cancel
这个就是取消执行，取消主要做的就是清除定时器，然后清除必要的闭包变量，回归初始状态。
```js
// 取消函数延迟执行
function cancel() {
  // 清除定时器
  if (timerId !== undefined) {
    cancelTimer(timerId)
  }
  // 清除闭包变量
  lastInvokeTime = 0
  lastArgs = lastCallTime = lastThis = timerId = undefined
}
```

### flush
这个是对外提供的立即执行方法，方便需要的时候调用。

- 如果不存在定时器，意味着还没有触发事件或者事件已经执行完成，则此时返回 `result` 结果
- 如果存在定时器，立即执行 `trailingEdge`，执行完成后会清空定时器id，`lastArgs` 和 `lastThis`

```js
// 立即执行 func
function flush() {
  return timerId === undefined ? result : trailingEdge(Date.now())
}
```

### pending
获取当前状态，检查当前是否在计时中，存在定时器 id timerId 意味着正在计时中。
```js
// 检查当前是否在计时中
function pending() {
  return timerId !== undefined
}
```


# 节流函数 throttle

## throttle
这部分源码比较简单，相比防抖来说只是触发条件不同，说白了就是 `maxWait` 为 `wait` 的防抖函数。

```js
function throttle(func, wait, options) {
  // 首尾调用默认为 true
  let leading = true
  let trailing = true

  if (typeof func !== 'function') {
    throw new TypeError('Expected a function')
  }
  // options 是否是对象
  if (isObject(options)) {
    leading = 'leading' in options ? !!options.leading : leading
    trailing = 'trailing' in options ? !!options.trailing : trailing
  }
  // maxWait 为 wait 的防抖函数
  return debounce(func, wait, {
    leading,
    trailing,
    'maxWait': wait,
  })
}
```

## isObject()
上面使用了 `isObject` 判断是否是一个对象，原理就是 `typeof value`，如果是 `object` 或者 `function` 时返回 true。

```js
function isObject(value) {
  const type = typeof value
  return value != null && (type == 'object' || type == 'function')
}
```

举几个小例子说明下

```js
isObject({})
// => true

isObject([1, 2, 3])
// => true

isObject(Function)
// => true

isObject(null)
// => false
```
