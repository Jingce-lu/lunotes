深入浅出节流函数 throttle
===
<!-- TOC -->

- [定义及解读](#定义及解读)
- [原理及实现](#原理及实现)
- [underscore 源码解读](#underscore-源码解读)
- [小结](#小结)

<!-- /TOC -->

## 定义及解读
函数节流指的是某个函数在一定时间间隔内（例如 3 秒）只执行一次，在这 3 秒内 **无视后来产生的函数调用请求**，也不会延长时间间隔。3 秒间隔结束后第一次遇到新的函数调用会触发执行，然后在这新的 3 秒内依旧无视后来产生的函数调用请求，以此类推。


## 原理及实现
函数节流非常适用于函数被频繁调用的场景，例如：`window.onresize()` 事件、`mousemove` 事件、上传进度等情况。使用 throttle API 很简单，那应该如何实现 throttle 这个函数呢？

实现方案有以下两种

- 第一种是用时间戳来判断是否已到执行时间，记录上次执行的时间戳，然后每次触发事件执行回调，回调中判断当前时间戳距离上次执行时间戳的间隔是否已经达到时间差（Xms） ，如果是则执行，并更新上次执行的时间戳，如此循环。
- 第二种方法是使用定时器，比如当 scroll 事件刚触发时，打印一个 hello world，然后设置个 1000ms 的定时器，此后每次触发 scroll 事件触发回调，如果已经存在定时器，则回调不执行方法，直到定时器触发，handler 被清除，然后重新设置定时器。

这里我们采用第一种方案来实现，通过闭包保存一个 previous 变量，每次触发 throttle 函数时判断当前时间和 previous 的时间差，如果这段时间差小于等待时间，那就忽略本次事件触发。如果大于等待时间就把 previous 设置为当前时间并执行函数 fn。

我们来一步步实现，首先实现用闭包保存 previous 变量。

```js
const throttle = (fn, wait) => {
	// 上一次执行该函数的时间
  let previous = 0
  return function(...args) {
    console.log(previous)
    ...
  }
}
```

执行 throttle 函数后会返回一个新的 function，我们命名为 betterFn。

```js
const betterFn = function(...args) {
  console.log(previous)
    ...
}
```

betterFn 函数中可以获取到 `previous` 变量值也可以修改，在回调监听或事件触发时就会执行 betterFn，即 `betterFn()`，所以在这个新函数内判断当前时间和 previous 的时间差即可。

```js
const betterFn = function(...args) {
  let now = +new Date();
  if (now - previous > wait) {
    previous = now
    // 执行 fn 函数
    fn.apply(this, args)
  }
}
```

结合上面两段代码就实现了节流函数，所以完整的实现如下。

```js
// fn 是需要执行的函数
// wait 是时间间隔
const throttle = (fn, wait = 50) => {
  // 上一次执行 fn 的时间
  let previous = 0
  // 将 throttle 处理结果当作函数返回
  return function(...args) {
    // 获取当前时间，转换成时间戳，单位毫秒
    let now = +new Date()
    // 将当前时间和上一次执行函数的时间进行对比
    // 大于等待时间就把 previous 设置为当前时间并执行函数 fn
    if (now - previous > wait) {
      previous = now
      fn.apply(this, args)
    }
  }
}

// DEMO
// 执行 throttle 函数返回新函数
const betterFn = throttle(() => console.log('fn 函数执行了'), 1000)
// 每 10 毫秒执行一次 betterFn 函数，但是只有时间差大于 1000 时才会执行 fn
setInterval(betterFn, 10)
```

## underscore 源码解读

上述代码实现了一个简单的节流函数，不过 `underscore` 实现了更高级的功能，即新增了两个功能

1. 配置是否需要响应事件刚开始的那次回调（ leading 参数，false 时忽略）
2. 配置是否需要响应事件结束后的那次回调（ trailing 参数，false 时忽略）

配置 `{ leading: false }` 时，事件刚开始的那次回调不执行；配置 `{ trailing: false }` 时，事件结束后的那次回调不执行，不过需要注意的是，这两者不能同时配置。

所以在 underscore 中的节流函数有 3 种调用方式，默认的（有头有尾），设置 { leading: false } 的，以及设置 { trailing: false } 的。上面说过实现 throttle 的方案有 2 种，一种是通过时间戳判断，另一种是通过定时器创建和销毁来控制。

第一种方案实现这 3 种调用方式存在一个问题，即事件停止触发时无法响应回调，所以 { trailing: true } 时无法生效。

第二种方案来实现也存在一个问题，因为定时器是延迟执行的，所以事件停止触发时必然会响应回调，所以 { trailing: false } 时无法生效。

underscore 采用的方案是两种方案搭配使用来实现这个功能。

```js
const throttle = function(func, wait, options) {
  var timeout, context, args, result;
  
  // 上一次执行回调的时间戳
  var previous = 0;
  
  // 无传入参数时，初始化 options 为空对象
  if (!options) options = {};

  var later = function() {
    // 当设置 { leading: false } 时
    // 每次触发回调函数后设置 previous 为 0
    // 不然为当前时间
    previous = options.leading === false ? 0 : _.now();
    
    // 防止内存泄漏，置为 null 便于后面根据 !timeout 设置新的 timeout
    timeout = null;
    
    // 执行函数
    result = func.apply(context, args);
    if (!timeout) context = args = null;
  };

  // 每次触发事件回调都执行这个函数
  // 函数内判断是否执行 func
  // func 才是我们业务层代码想要执行的函数
  var throttled = function() {
    
    // 记录当前时间
    var now = _.now();
    
    // 第一次执行时（此时 previous 为 0，之后为上一次时间戳）
    // 并且设置了 { leading: false }（表示第一次回调不执行）
    // 此时设置 previous 为当前值，表示刚执行过，本次就不执行了
    if (!previous && options.leading === false) previous = now;
    
    // 距离下次触发 func 还需要等待的时间
    var remaining = wait - (now - previous);
    context = this;
    args = arguments;
    
    // 要么是到了间隔时间了，随即触发方法（remaining <= 0）
    // 要么是没有传入 {leading: false}，且第一次触发回调，即立即触发
    // 此时 previous 为 0，wait - (now - previous) 也满足 <= 0
    // 之后便会把 previous 值迅速置为 now
    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout);
        
        // clearTimeout(timeout) 并不会把 timeout 设为 null
        // 手动设置，便于后续判断
        timeout = null;
      }
      
      // 设置 previous 为当前时间
      previous = now;
      
      // 执行 func 函数
      result = func.apply(context, args);
      if (!timeout) context = args = null;
    } else if (!timeout && options.trailing !== false) {
      // 最后一次需要触发的情况
      // 如果已经存在一个定时器，则不会进入该 if 分支
      // 如果 {trailing: false}，即最后一次不需要触发了，也不会进入这个分支
      // 间隔 remaining milliseconds 后触发 later 方法
      timeout = setTimeout(later, remaining);
    }
    return result;
  };

  // 手动取消
  throttled.cancel = function() {
    clearTimeout(timeout);
    previous = 0;
    timeout = context = args = null;
  };

  // 执行 _.throttle 返回 throttled 函数
  return throttled;
};
```

## 小结
- 函数节流指的是某个函数在一定时间间隔内（例如 3 秒）只执行一次，在这 3 秒内 **无视后来产生的函数调用请求**

- 节流可以理解为养金鱼时拧紧水龙头放水，3 秒一滴
    * 「管道中的水」就是我们频繁操作事件而不断涌入的回调任务，它需要接受「水龙头」安排
    * 「水龙头」就是节流阀，控制水的流速，过滤无效的回调任务
    * 「滴水」就是每隔一段时间执行一次函数
    * 「3 秒」就是间隔时间，它是「水龙头」决定「滴水」的依据

- 节流实现方案有 2 种
    * 第一种是用时间戳来判断是否已到执行时间，记录上次执行的时间戳，然后每次触发事件执行回调，回调中判断当前时间戳距离上次执行时间戳的间隔是否已经达到时间差（Xms） ，如果是则执行，并更新上次执行的时间戳，如此循环。
    * 第二种方法是使用定时器，比如当 scroll 事件刚触发时，打印一个 hello world，然后设置个 1000ms 的定时器，此后每次触发 scroll 事件触发回调，如果已经存在定时器，则回调不执行方法，直到定时器触发，handler 被清除，然后重新设置定时器。