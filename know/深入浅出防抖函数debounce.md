深入浅出防抖函数 debounce
===
<!-- TOC -->

- [深入浅出防抖函数 debounce](#深入浅出防抖函数-debounce)
  - [定义及解读](#定义及解读)
  - [原理及实现](#原理及实现)
    - [实现 1](#实现-1)
    - [实现 2](#实现-2)
  - [加强版 throttle](#加强版-throttle)
  - [underscore 源码解析](#underscore-源码解析)
  - [小结](#小结)

<!-- /TOC -->

## 定义及解读
防抖函数 debounce 指的是某个函数在某段时间内，无论触发了多少次回调，**都只执行最后一次**。假如我们设置了一个等待时间 3 秒的函数，在这 3 秒内如果遇到函数调用请求就重新计时 3 秒，直至新的 3 秒内没有函数调用请求，此时执行函数，不然就以此类推重新计时。

举一个小例子：假定在做公交车时，司机需等待最后一个人进入后再关门，每次新进一个人，司机就会把计时器清零并重新开始计时，重新等待 1 分钟再关门，如果后续 1 分钟内都没有乘客上车，司机会认为乘客都上来了，将关门发车。

此时「上车的乘客」就是我们频繁操作事件而不断涌入的回调任务；「1 分钟」就是计时器，它是司机决定「关门」的依据，如果有新的「乘客」上车，将清零并重新计时；「关门」就是最后需要执行的函数。

## 原理及实现
实现原理就是利用定时器，函数第一次执行时设定一个定时器，之后调用时发现已经设定过定时器就清空之前的定时器，并重新设定一个新的定时器，如果存在没有被清空的定时器，当定时器计时结束后触发函数执行。

### 实现 1
```js
// 实现 1
// fn 是需要防抖处理的函数
// wait 是时间间隔
function debounce(fn, wait = 50) {
    // 通过闭包缓存一个定时器 id
    let timer = null
    // 将 debounce 处理结果当作函数返回
    // 触发事件回调时执行这个返回函数
    return function(...args) {
      	// 如果已经设定过定时器就清空上一次的定时器
        if (timer) clearTimeout(timer)
      
      	// 开始设定一个新的定时器，定时器结束后执行传入的函数 fn
        timer = setTimeout(() => {
            fn.apply(this, args)
        }, wait)
    }
}

// DEMO
// 执行 debounce 函数返回新函数
const betterFn = debounce(() => console.log('fn 防抖执行了'), 1000)
// 停止滑动 1 秒后执行函数 () => console.log('fn 防抖执行了')
document.addEventListener('scroll', betterFn)
```

### 实现 2
上述实现方案已经可以解决大部分使用场景了，不过想要实现第一次触发回调事件就执行 fn 有点力不从心了，这时候我们来改写下 debounce 函数，加上第一次触发立即执行的功能。

```js
// 实现 2
// immediate 表示第一次是否立即执行
function debounce(fn, wait = 50, immediate) {
    let timer = null
    return function(...args) {
        if (timer) clearTimeout(timer)
      
      	// ------ 新增部分 start ------ 
      	// immediate 为 true 表示第一次触发后执行
      	// timer 为空表示首次触发
        if (immediate && !timer) {
            fn.apply(this, args)
        }
      	// ------ 新增部分 end ------ 
      	
        timer = setTimeout(() => {
            fn.apply(this, args)
        }, wait)
    }
}

// DEMO
// 执行 debounce 函数返回新函数
const betterFn = debounce(() => console.log('fn 防抖执行了'), 1000, true)
// 第一次触发 scroll 执行一次 fn，后续只有在停止滑动 1 秒后才执行函数 fn
document.addEventListener('scroll', betterFn)
```

实现原理比较简单，判断传入的 immediate 是否为 true，另外需要额外判断是否是第一次执行防抖函数，判断依旧就是 timer 是否为空，所以只要 `immediate && !timer` 返回 true 就执行 fn 函数，即 `fn.apply(this, args)`。


## 加强版 throttle
现在考虑一种情况，如果用户的操作非常频繁，不等设置的延迟时间结束就进行下次操作，会频繁的清除计时器并重新生成，所以函数 fn 一直都没办法执行，导致用户操作迟迟得不到响应。

有一种思想是将「节流」和「防抖」合二为一，变成加强版的节流函数，关键点在于「 wait 时间内，可以重新生成定时器，但只要 wait 的时间到了，必须给用户一个响应」。这种合体思路恰好可以解决上面提出的问题。

给出合二为一的代码之前先来回顾下 throttle 函数，上一小节中有详细的介绍。

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
```

结合 throttle 和 debounce 代码，加强版节流函数 throttle 如下，新增逻辑在于当前触发时间和上次触发的时间差小于时间间隔时，设立一个新的定时器，相当于把 debounce 代码放在了小于时间间隔部分。

```js
// fn 是需要节流处理的函数
// wait 是时间间隔
function throttle(fn, wait) {
  
  // previous 是上一次执行 fn 的时间
  // timer 是定时器
  let previous = 0, timer = null
  
  // 将 throttle 处理结果当作函数返回
  return function (...args) {
    
    // 获取当前时间，转换成时间戳，单位毫秒
    let now = +new Date()
    
    // ------ 新增部分 start ------ 
    // 判断上次触发的时间和本次触发的时间差是否小于时间间隔
    if (now - previous < wait) {
    	 // 如果小于，则为本次触发操作设立一个新的定时器
       // 定时器时间结束后执行函数 fn 
       if (timer) clearTimeout(timer)
       timer = setTimeout(() => {
          previous = now
        	fn.apply(this, args)
        }, wait)
    // ------ 新增部分 end ------ 
      
    } else {
       // 第一次执行
       // 或者时间间隔超出了设定的时间间隔，执行函数 fn
       previous = now
       fn.apply(this, args)
    }
  }
}

// DEMO
// 执行 throttle 函数返回新函数
const betterFn = throttle(() => console.log('fn 节流执行了'), 1000)
// 第一次触发 scroll 执行一次 fn，每隔 1 秒后执行一次函数 fn，停止滑动 1 秒后再执行函数 fn
document.addEventListener('scroll', betterFn)
```

## underscore 源码解析
看完了上文的基本版代码，感觉还是比较轻松的，现在来学习下 underscore 是如何实现 debounce 函数的，学习一下优秀的思想，直接上代码和注释，本源码解析依赖于 underscore 1.9.1 版本实现。

```js
// 此处的三个参数上文都有解释
_.debounce = function(func, wait, immediate) {
  // timeout 表示定时器
  // result 表示 func 执行返回值
  var timeout, result;

  // 定时器计时结束后
  // 1、清空计时器，使之不影响下次连续事件的触发
  // 2、触发执行 func
  var later = function(context, args) {
    timeout = null;
    // if (args) 判断是为了过滤立即触发的
    // 关联在于 _.delay 和 restArguments
    if (args) result = func.apply(context, args);
  };

  // 将 debounce 处理结果当作函数返回
  var debounced = restArguments(function(args) {
    if (timeout) clearTimeout(timeout);
    if (immediate) {
      // 第一次触发后会设置 timeout，
      // 根据 timeout 是否为空可以判断是否是首次触发
      var callNow = !timeout;
      timeout = setTimeout(later, wait);
      if (callNow) result = func.apply(this, args);
    } else {
    	// 设置定时器
      timeout = _.delay(later, wait, this, args);
    }

    return result;
  });

  // 新增 手动取消
  debounced.cancel = function() {
    clearTimeout(timeout);
    timeout = null;
  };

  return debounced;
};

// 根据给定的毫秒 wait 延迟执行函数 func
_.delay = restArguments(function(func, wait, args) {
  return setTimeout(function() {
    return func.apply(null, args);
  }, wait);
});
```

相比上文的基本版实现，underscore 多了以下几点功能。
1. 函数 func 的执行结束后返回结果值 result
2. 定时器计时结束后清除 timeout，使之不影响下次连续事件的触发
3. 新增了手动取消功能 cancel
4. immediate 为 true 后只会在第一次触发时执行，频繁触发回调结束后不会再执行


## 小结
- 函数节流和防抖都是「闭包」、「高阶函数」的应用

- 函数节流 throttle 指的是某个函数在一定时间间隔内（例如 3 秒）执行一次，在这 3 秒内 **无视后来产生的函数调用请求**
    * 节流可以理解为养金鱼时拧紧水龙头放水，3 秒一滴
        - 「管道中的水」就是我们频繁操作事件而不断涌入的回调任务，它需要接受「水龙头」安排
        - 「水龙头」就是节流阀，控制水的流速，过滤无效的回调任务
        - 「滴水」就是每隔一段时间执行一次函数
        - 「3 秒」就是间隔时间，它是「水龙头」决定「滴水」的依据
    * 应用：监听滚动事件添加节流函数后，每隔固定的一段时间执行一次
    * 实现方案 1：用时间戳来判断是否已到执行时间，记录上次执行的时间戳，然后每次触发后执行回调，判断当前时间距离上次执行时间的间隔是否已经达到时间差（Xms） ，如果是则执行，并更新上次执行的时间戳，如此循环
    * 实现方案 2：使用定时器，比如当 scroll 事件刚触发时，打印一个 hello world，然后设置个 1000ms 的定时器，此后每次触发 scroll 事件触发回调，如果已经存在定时器，则回调不执行方法，直到定时器触发，handler 被清除，然后重新设置定时器

- 函数防抖 debounce 指的是某个函数在某段时间内，无论触发了多少次回调，**都只执行最后一次**
    * 防抖可以理解为司机等待最后一个人进入后再关门，每次新进一个人，司机就会把计时器清零并重新开始计时
        - 「上车的乘客」就是我们频繁操作事件而不断涌入的回调任务
        - 「1 分钟」就是计时器，它是司机决定「关门」的依据，如果有新的「乘客」上车，将清零并重新计时
        - 「关门」就是最后需要执行的函数
    * 应用：input 输入回调事件添加防抖函数后，只会在停止输入后触发一次
    * 实现方案：使用定时器，函数第一次执行时设定一个定时器，之后调用时发现已经设定过定时器就清空之前的定时器，并重新设定一个新的定时器，如果存在没有被清空的定时器，当定时器计时结束后触发函数执行
