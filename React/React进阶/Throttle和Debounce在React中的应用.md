Throttle 和 Debounce 在 React 中的应用
===
<!-- TOC -->

- [引言](#引言)
- [从一个例子开始](#从一个例子开始)
  - [例子 1](#例子-1)
  - [例子 2](#例子-2)
- [节流 Throttle](#节流-throttle)
  - [使用 underscore](#使用-underscore)
  - [使用 lodash](#使用-lodash)
  - [使用 RxJS](#使用-rxjs)
  - [使用自定义实现](#使用自定义实现)
- [防抖 Debounce](#防抖-debounce)
  - [使用 underscore](#使用-underscore-1)
  - [使用 lodash](#使用-lodash-1)
  - [使用 RxJS](#使用-rxjs-1)
- [重要领域：游戏](#重要领域游戏)

<!-- /TOC -->

## 引言
使用 React 构建应用程序时，我们总是会遇到一些限制问题，比如大量的调用、异步网络请求和 DOM 更新等，我们可以使用 React 提供的功能来检查这些。

- `shouldComponentUpdate(...)` 生命周期钩子
- `React.PureComponent`
- `React.memo`
- Windowing and Virtualization
- Memoization
- Hydration
- Hooks (`useState`, `useMemo`, `useContext`, `useReducer`, 等)

在这篇文章中，我们将研究如何在不使用 React 提供的功能下来改进 React 应用程序性能，我们将使用一种不仅仅适用于 React 的技术：节流（**Throttle**）和防抖（**Debounce**）。

## 从一个例子开始
### 例子 1

下面这个例子可以很好的解释节流和防抖带给我们的好处，假设我们有一个 `autocomp` 组件

```js
import React from 'react';
import './autocomp.css';
```

```js
class autocomp extends React.Component {
    constructor(props) {
        super(props);
        this.state= {
            results: []
        }
    }

    handleInput = evt => {
        const value = evt.target.value
        fetch(`/api/users`)
            .then(res => res.json())
            .then(result => this.setState({ results: result.users }))
    }

    render() {
        let { results } = this.state;
        return (
            <div className='autocomp_wrapper'>
            <input placeholder="Enter your search.." onChange={this.handleInput} />
            <div>
                {results.map(item=>{item})}
            </div>
            </div>
        );
    }
}

export default autocomp;
```

在我们的 `autocomp` 组件中，一旦我们在输入框中输入一个单词，它就会请求 `api/users` 获取要显示的用户列表。 在每个字母输入后，触发异步网络请求，并且成功后通过 `this.setState` 更新DOM。

现在，想象一下输入 `fidudusola` 尝试搜索结果 `fidudusolanke`，将有许多名称与 `fidudusola` 一起出现。

```js
1.  f
2.  fi
3.  fid
4.  fidu
5.  fidud
6.  fidudu
7.  fidudus
8.  fiduduso
9.  fidudusol
10. fidudusola
```

这个名字有 10 个字母，所以我们将有 10 次 API 请求和 10 次 DOM 更新，这只是一个用户而已!! 输入完成后最终看到我们预期的名字 `fidudusolanke` 和其他结果一起出现。

即使 `autocomp` 可以在没有网络请求的情况下完成（例如，内存中有一个本地“数据库”），仍然需要为输入的每个字符/单词进行昂贵的 DOM 更新。

```js
const data = [
    {
        name: 'nnamdi'
    },
    {
        name: 'fidudusola'
    },
    {
        name: 'fashola'
    },
    {
        name: 'fidudusolanke'
    },
    // ... up to 10,000 records
]


class autocomp extends React.Component {
    constructor(props) {
        super(props);
        this.state= {
            results: []
        }
    }
    handleInput = evt => {
        const value = evt.target.value
        const filteredRes = data.filter((item)=> {
            // algorithm to search through the `data` array
        })
        this.setState({ results: filteredRes })
    }
    render() {
        let { results } = this.state;
        return (
            <div className='autocomp_wrapper'>
                <input 
                    placeholder="Enter your search.."
                    onChange={this.handleInput} 
                />
                <div>
                    {results.map(result=>{result})}
                </div>
            </div>
        );
    }
}
```

### 例子 2
另一个例子是使用 `resize` 和 `scroll` 等事件。大多数情况下，网站每秒滚动 1000 次，想象一下在 `scroll` 事件中添加一个事件处理。
```js
document.body.addEventListener('scroll', ()=> {
    console.log('Scrolled !!!')
})
```

你会发现这个函数每秒被执行 1000 次！如果这个事件处理函数执行大量计算或大量 DOM 操作，将面临最坏的情况。

```js
function longOp(ms) {
    var now = Date.now()
    var end = now + ms
    while(now < end) {
        now = Date.now()
    }
}

document.body.addEventListener('scroll', ()=> {
    // simulating a heavy operation
    longOp(9000)
    console.log('Scrolled !!!')
})
```

我们有一个需要 9 秒才能完成的操作，最后输出 `Scrolled !!!`，假设我们滚动 5000 像素会有 200 多个事件被触发。 因此，需要 9 秒才能完成一次的事件，大约需要 9 * 200 = 1800s 来运行全部的 200 个事件。 因此，全部完成需要 30 分钟（半小时）。

所以肯定会发现一个滞后且无响应的浏览器，因此编写的事件处理函数最好在较短的时间内执行完成。

我们发现这会在我们的应用程序中产生巨大的性能瓶颈，我们不需要在输入的每个字母上执行 API 请求和 DOM 更新，我们需要等到用户停止输入或者输入一段时间之后，等到用户停止滚动或者滚动一段时间之后，再去执行事件处理函数。

所有这些确保我们的应用程序有良好性能，让我们看看如何使用节流和防抖来避免这种性能瓶颈。


## 节流 Throttle
> 节流强制一个函数在一段时间内可以调用的最大次数，例如每 100 毫秒最多执行一次函数。

节流是指在指定的时间内执行一次给定的函数。这限制了函数被调用的次数，所以重复的函数调用不会重置任何数据。

假设我们通常以 1000 次 / 20 秒的速度调用函数。 如果我们使用节流将它限制为每 500 毫秒执行一次，我们会看到函数在 20 秒内将执行 40 次。

```js
1000 * 20 secs = 20,000ms
20,000ms / 500ms = 40 times
```

这是从 1000 次到 40 次的极大优化。

下面将介绍在 React 中使用节流的例子，将分别使用 underscore 、 lodash 、RxJS 以及自定义实现。

### 使用 underscore

我们将使用 `underscore` 提供的节流函数处理我们的 `autocomp` 组件。

先安装依赖。
```js
npm i underscore
```

然后在组件中导入它：

```js
// ...
import * as _ from underscore;
class autocomp extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            results: []
        }
       this.handleInputThrottled = _.throttle(this.handleInput, 1000)
    }
    handleInput = evt => {
        const value = evt.target.value
        const filteredRes = data.filter((item)=> {
            // algorithm to search through the `data` array
        })
        this.setState({ results: filteredRes })
    }
    render() {
        let { results } = this.state;
        return (
            <div className='autocomp_wrapper'>
                <input 
                    placeholder="Enter your search.." 
                    onChange={this.handleInputThrottled} 
                />
                <div>
                    {results.map(result=>{result})}
                </div>
            </div>
        );
    }
}
```

节流函数接收两个参数，分别是需要被限制的函数和时间差，返回一个节流处理后的函数。 在我们的例子中，`handleInput` 方法被传递给 `throttle` 函数，时间差为 1000ms。

现在，假设我们以每 200ms 1 个字母的正常速度输入 `fidudusola`，输入完成需要10 * 200ms =（2000ms）2s，这时 `handleInput` 方法将只调用 2（2000ms / 1000ms = 2）次而不是最初的 10 次。


### 使用 lodash
`lodash` 也提供了一个 `throttle` 函数，我们可以在 JS 程序中使用它。

首先，我们需要安装依赖。
```js
npm i lodash
```

使用 lodash，我们的 autocomp 将是这样的。

```js
// ...
import { throttle } from lodash;

class autocomp extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            results: []
        }
       this.handleInputThrottled = throttle(this.handleInput, 100)
    }

    handleInput = evt => {
        const value = evt.target.value
        const filteredRes = data.filter((item)=> {
            // algorithm to search through the `data` array
        })
        this.setState({ results: filteredRes })
    }

    render() {
        let { results } = this.state;
        return (
            <div className='autocomp_wrapper'>
                <input 
                    placeholder="Enter your search.." 
                    onChange={this.handleInputThrottled} 
                />
                <div>
                    {results.map(result=>{result})}
                </div>
            </div>
        );
    }
}
```

和 `underscore` 一样的效果，没有其他区别。


### 使用 RxJS
JS 中的 `Reactive Extensions` 提供了一个节流运算符，我们可以使用它来实现功能。

首先，我们安装 `rxjs` 。
```js
npm i rxjs
```

我们从 rxjs 库导入 throttle

```js
// ...
import { BehaviorSubject } from 'rxjs';
import { throttle } from 'rxjs/operators';

class autocomp extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            results: []
        }
        this.inputStream = new BehaviorSubject()
    }

    componentDidMount() {
        this.inputStream
            .pipe(
                throttle(1000)
            )
            .subscribe(v => {
                const filteredRes = data.filter((item)=> {
                    // algorithm to search through the `data` array
                })
                this.setState({ results: filteredRes })
        })
    }

    render() {
        let { results } = this.state;
        return (
            <div className='autocomp_wrapper'>
                <input 
                    placeholder="Enter your search.." 
                    onChange={e => this.inputStream.next(e.target.value)} 
                />
                <div>
                    {results.map(result => { result })}
                </div>
            </div>
        );
    }
}
```

我们从 `rxjs` 中导入了 `throttle` 和 `BehaviorSubject`，初始化了一个 `BehaviorSubject` 实例保存在 `inputStream` 属性，在 `componentDidMount` 中，我们将 `inputStream` 流传递给节流操作符，传入 1000，表示 `RxJS` 节流控制为 1000ms，节流操作返回的流被订阅以获得流值。

因为在组件加载时订阅了 `inputStream`，所以我们开始输入时，输入的内容就被发送到 `inputStream` 流中。 刚开始时，由于 `throttle` 操作符 1000ms 内不会发送内容，在这之后发送最新值， 发送之后就开始计算得到结果。

如果我们以 200ms 1 个字母的速度输入 `fidudusola` ，该组件将重新渲染 2000ms / 1000ms = 2次。


### 使用自定义实现
我们实现自己的节流函数，方便更好的理解节流如何工作。

我们知道在一个节流控制的函数中，它会根据指定的时间间隔调用，我们将使用 setTimeout 函数实现这一点。

```js
function throttle(fn, ms) {
    let timeout
    function exec() {
        fn.apply()
    }
    function clear() {
        timeout == undefined ? null : clearTimeout(timeout)
    }
    if(fn !== undefined && ms !== undefined) {
        timeout = setTimeout(exec, ms)
    } else {
        console.error('callback function and the timeout must be supplied')
    }
    // API to clear the timeout
    throttle.clearTimeout = function() {
        clear();
    }
}
```

注：原文自定义实现的节流函数有问题，节流函数的详细实现和解析可以查看我的另一篇文章，点击查看

我的实现如下：

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

上面的实现非常简单，在 React 项目中使用方式如下。

```js
// ...
class autocomp extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            results: []
        }
       this.handleInputThrottled = throttle(this.handleInput, 100)
    }

    handleInput = evt => {
        const value = evt.target.value
        const filteredRes = data.filter((item)=> {
            // algorithm to search through the `data` array
        })
        this.setState({ results: filteredRes })
    }

    render() {
        let { results } = this.state;
        return (
            <div className='autocomp_wrapper'>
                <input 
                    placeholder="Enter your search.." 
                    onChange={this.handleInputThrottled} 
                />
                <div>
                    {results.map(result=>{result})}
                </div>
            </div>
        );
    }
}
```


## 防抖 Debounce
> 防抖会强制自上次调用后经过一定时间才会再次调用函数，例如只有在没有被调用的情况下经过一段时间之后（例如100毫秒）才执行该函数。

在防抖时，它忽略对函数的所有调用，直到函数停止调用一段时间之后才会再次执行。

下面将介绍在项目中使用 debounce 的例子。

### 使用 underscore

```js
// ...
import * as _ from 'underscore';
class autocomp extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            results: []
        }
       this.handleInputThrottled = _.debounce(this.handleInput, 100)
    }
    handleInput = evt => {
        const value = evt.target.value
        const filteredRes = data.filter((item)=> {
            // algorithm to search through the `data` array
        })
        this.setState({ results: filteredRes })
    }
    render() {
        let { results } = this.state;
        return (
            <div className='autocomp_wrapper'>
                <input 
                    placeholder="Enter your search.." 
                    onChange={this.handleInputThrottled} 
                />
                <div>
                    {results.map(result=>{result})}
                </div>
            </div>
        );
    }
}
```


### 使用 lodash
```js
// ...
import { debounce } from 'lodash';
class autocomp extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            results: []
        }
       this.handleInputThrottled = debounce(this.handleInput, 100)
    }
    handleInput = evt => {
        const value = evt.target.value
        const filteredRes = data.filter((item)=> {
            // algorithm to search through the `data` array
        })
        this.setState({ results: filteredRes })
    }
    render() {
        let { results } = this.state;
        return (
            <div className='autocomp_wrapper'>
                <input 
                    placeholder="Enter your search.." 
                    onChange={this.handleInputThrottled} 
                />
                <div>
                    {results.map(result=>{result})}
                </div>
            </div>
        );
    }
}
```


### 使用 RxJS
```js
// ...
import { BehaviorSubject } from 'rxjs';
import { debounce } from 'rxjs/operators';
class autocomp extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            results: []
        }
        this.inputStream = new BehaviorSubject()
    }
    componentDidMount() {
        this.inputStream
            .pipe(
                debounce(100)
            )
            .subscribe(v => {
                const filteredRes = data.filter((item)=> {
                    // algorithm to search through the `data` array
                })
                this.setState({ results: filteredRes })
        })
    }
    render() {
        let { results } = this.state;
        return (
            <div className='autocomp_wrapper'>
                <input 
                    placeholder="Enter your search.." 
                    onChange={e => this.inputStream.next(e.target.value)} 
                />
                <div>
                    {results.map(result => { result })}
                </div>
            </div>
        );
    }
}
```

## 重要领域：游戏
有很多情况需要使用节流和防抖，其中最需要的领域是游戏。游戏中最常用的动作是在电脑键盘或者游戏手柄中按键，玩家可能经常按同一个键多次（每 20 秒 40 次，即每秒 2 次）例如射击、加速这样的动作，但无论玩家按下射击键的次数有多少，它只会发射一次（比如说每秒）。 所以使用节流控制为 1 秒，这样第二次按下按钮将被忽略。