# 简易版react
<!-- TOC -->

- [简易版react](#简易版react)
  - [实现一个“react”](#实现一个react)
    - [vdom](#vdom)
    - [jsx](#jsx)
    - [component](#component)
    - [state/props](#stateprops)
    - [组件通讯](#组件通讯)

<!-- /TOC -->

## 实现一个“react”
实现一个组件（component），它能够监听数据的变化，动态地维护视图，处理UI与用户的交互。

我们先创造一个对象component：
```js
var component = {}
```

我们给这个component设置一些本地数据data：
```js
var component = {
  data: {
    name: 'Jack'
  }
}
```

OK，有了数据，我们赋予它操作数据的能力，给它加一个`setData`方法：
```js
var component = {
  data: {
    name: 'Jack'
  },
  setData: function (key, val) {
    var _t = this
    _t.data[key] = val
  }
}
```

好啦，现在它既有数据又有操作数据的方法，接着我们给它一个`render`方法，让它渲染一段html到页面中，当然，它得先有个根元素作为根节点，我们也给它一个`root`的属性，指向一个节点：
```js
var component = {
  root: document.getElementById('root'),
  data: {
    name: 'Jack'
  },
  setData: function (key, val) {
    var _t = this
    _t.data[key] = val
  },
  render: function () {
    var _t = this
    var template = `<div>hello, world!</div>`
    _t.root.innerHTML = template
  }
}
```

OK，我们直接调用render函数来看看效果：
```js
var component = {
  root: document.getElementById('root'),
  data: {
    name: 'Jack'
  },
  setData: function (key, val) {
    var _t = this
    _t.data[key] = val
  },
  render: function () {
    var _t = this
    var template = `<div>hello, world!</div>`
    _t.root.innerHTML = template
  }
}

component.render()  // 调用render
```

对应页面效果如下：
```html
<!DOCTYPE html>
<html>
<head>
  <title>index</title>
</head>
<body>
  <div id="root">
    <h1>hello, world!</h1>
  </div>
</body>
</html>
```

不过，我们是希望这个component能够根据我们的数据来渲染页面，实现模板引擎的效果。  
这里我们需要思考一下，怎么样才能把数据映射到字符串模板中去？  
我们可以在模板里面用一些变量限制符（variables controls）来特殊标识一个变量，比如在需要插入变量`name`的地方，我们用`{name}`来表示，那么原来的模板就变成`var template = <h1>hello, {name}!</h1>`，然后我们再用正则替换的方式，去寻找这些特殊标识，然后对应替换成变量的值。  
所以我们来使用正则改进一下：
```js
var component = {
  root: document.getElementById('root'),
  data: {
    name: 'Jack'
  },
  setData: function (key, val) {
    var _t = this
    _t.data[key] = val
  },
  render: function () {
    var _t = this
    var template = `<h1>hello, {name}!</h1>`
    var html = template.replace(/\{.*\}/g, function (res) {  // 正则替换
      var key = res.substr(1, res.length - 2)  // 除去花括号，拿到key
      return _t.data[key]  // 返回key在data中对应的val
    })
    _t.root.innerHTML = html  // 注意，这里是html，不是template了
  }
}

component.render()
```

可以看到，我们只是简单粗暴地使用正则来替换相对于的字符串而已，实际上这里你完全可以使用现成的 **js模板引擎** 来帮助实现，会更加强大专业。

现在我们调用render就可以看到`<h1>hello, Jack!</h1>`了。OK，为了使我们修改数据的同时，视图也自动更新，我们需要在setData的时候同时调用render以更新视图。
```js
var component = {
  ...
  setData: function (key, val) {
    var _t = this
    _t.data[key] = val
    _t.render()  // 修改完数据之后，调用render更新视图
  }
  ...
}
```

现在我们试试，调用setData来改变数据：
```js
var component = {
  ...
}

component.render()

setTimeout(function () {
  component.setData('name', 'React')
}, 2000)
```

棒！现在这个“react”算是开发完成了！ 

不过，还有点小问题我们可以改进的：
1. 默认调用一次render来启动component，感觉不是很好，体现不出启动的含义；
2. 现在所有的业务都写在了component体外，我们还是希望能够汇聚一点，把属于component本身的业务都包揽进去。

我们还是希望它能够有个比较正式的启动方式，我们给它一个start方法（这逼装的给满分）：
```js
var component = {
  root: document.getElementById('root'),
  data: {
    name: 'Jack'
  },
  setData: function (key, val) {
    var _t = this
    _t.data[key] = val
    _t.render()
  },
  render: function () {
    var _t = this
    var template = `<h1>hello, {name}!</h1>`
    var html = template.replace(/\{.*\}/g, function (res) {
      var key = res.substr(1, res.length - 2)
      return _t.data[key]
    })
    root.innerHTML = html
  },
  start: function () {
    var _t = this
    _t.render()
  }
}

component.start()  // 注意，这里不再是执行render，而是执行start了
```

那么，什么时候开始执行业务？至少要等我的dom ready吧！那dom什么时候ready？至少要render之后吧！ok，那么我们先来给component加一个ready方法，顺手把之前写的setTimeout给搬进去：
```js
var component = {
  root: document.getElementById('root'),
  data: {
    name: 'Jack'
  },
  setData: function (key, val) {
    var _t = this
    _t.data[key] = val
    _t.render()
  },
  render: function () {
    var _t = this
    var template = `<h1>hello, {name}!</h1>`
    var html = template.replace(/\{.*\}/g, function (res) {
      var key = res.substr(1, res.length - 2)
      return _t.data[key]
    })
    root.innerHTML = html
  },
  start: function () {
    var _t = this
    _t.render()
    _t.ready()  // 注意这里，在render之后，就可以执行ready了
  },
  ready: function () {
    var _t = this

    setTimeout(function () {
      _t.setData('name', 'React')
    }, 2000)
  }
}

component.start()
```

ok，现在看起来舒服多了。

这里我们稍微停顿一下，我们可以看到，这个component在运作的时候，ready的含义明显与其他方法有区别，如果我们不需要任何业务实现的话，那ready本身是没有也不需要任何内容的。它仅仅表示的是这时候组件已经渲染到页面上了，**你处在一个可以安全的进行dom操作的阶段** ，而如果你愿意，你设置可以多设置几个这样子的方法，比如`beforeReady`等等，只需要在start中，把它的调用放在`_t.ready()`之前即可，当然，举例的这个方法没有太大意义就是了。这样的设计我们称为 **生命周期** ，这些方法我们称为 **生命周期函数** ，react提供了几个非常关键且实用的生命周期函数，使得我们能够更加合理地设计我们的component，初步学习我们只需要了解与`ready`相对应的`componentDidMount`就可以了，下面会演示到。

那么，假设我们需要给dom加事件，应该怎么做？

理论上来说，最好的做法是能够把模板转换为实实在在的dom对象，然后通过js给这些对象添加事件；另一种方法简单粗暴，那就是我直接在模板元素的行间写事件绑定，然后等整个html插入root之后，这些行内属性会自动生效。

这还用想吗？我们直接写行间：
```js
var component = {
  ...
  render: function () {
    var _t = this
    var template = `<h1 onclick="_react_.changeName()">hello, {name}!</h1>`
    var html = template.replace(/\{.*\}/g, function (res) {
      var key = res.substr(1, res.length - 2)
      return _t.data[key]
    })
    root.innerHTML = html
  },
  changeName: function () {
    var _t = this
    _t.setData('name', '山里育')
  }
  ...
}

component.start()
```

这里剧透一下，react在这一步采用的是 `jsx` 的做法，这是一种对dom的抽象，原理是把用html标签表示的闭合元素转换为js对象，也就是说，你看到的代码中的`<h1>hello, Jack</h1>`其实在编译之后并不是html片段，而是一个js对象，然后自然而然地，写在行内的属性也就相对应变成了该对象的属性，这里我们不必对实现方式太过深入理解。

不信？在jsx中直接`console.log(<div>hello, Jack</div>)`试试？

我们直接在`onclick`里执行`_react_.changeName()`是没有作用的，而且还会报错，因为component不是全局可以访问的，所以我们要把component挂在window下，暴露到全局：
```js
var component = window._react_ = {  // 注意，在这里把_react_挂在window下
  root: document.getElementById('root'),
  data: {
    name: 'Jack'
  },
  setData: function (key, val) {
    var _t = this
    _t.data[key] = val
    _t.render()
  },
  render: function () {
    var _t = this
    var template = `<h1 onclick="_react_.changeName">hello, {name}!</h1>`
    var html = template.replace(/\{.*\}/g, function (res) {
      var key = res.substr(1, res.length - 2)
      return _t.data[key]
    })
    root.innerHTML = html
  },
  start: function () {
    var _t = this
    _t.render()
    _t.ready()
  },
  ready: function () {
    var _t = this

    setTimeout(function () {
      _t.setData('name', 'React')
    }, 2000)
  },
  changeName: function () {
    var _t = this
    _t.setData('name', '山里育')
  }
}

component.start()
```

熟悉react或者vue的童鞋肯定会觉得熟悉，我们可以一一对应一下（看注释）：
```js
var component = window._react_ = {
  root: document.getElementById('root'),
  data: {  // react -> getInitialState; vue -> data
    name: 'Jack'
  },
  setData: function (key, val) {  // react -> setState; vue -> 劫持对象的getter和setter
    var _t = this
    _t.data[key] = val
    _t.render()
  },
  render: function () {  // react -> render; vue -> <template />
    var _t = this
    var template = `<h1 onclick="_react_.changeName">hello, {name}!</h1>`
    var html = template.replace(/\{.*\}/g, function (res) {
      var key = res.substr(1, res.length - 2)
      return _t.data[key]
    })
    root.innerHTML = html
  },
  start: function () {  // react -> React.createClass; vue -> new Vue
    var _t = this
    _t.render()
    _t.ready()
  },
  ready: function () {  // react -> componentDidMount; vue -> ready(1.x)\mounted(2.x)
    var _t = this

    setTimeout(function () {
      _t.setData('name', 'React')
    }, 2000)
  },
  changeName: function () {  // react -> changeName; vue -> methods.changeName
    var _t = this
    _t.setData('name', '山里育')
  }
}

component.start()
```

不过，我们的`react`并不能真正投入生产，因为render方法使用全局刷新dom的方式，对性能消耗太大。我们知道dom操作是很昂贵的。相比之下，我们传统的针对某个元素进行修改的方式反倒是性能更优。

### vdom
vdom即virtual dom，其实vdom就是为了填上面这个坑才被创造出来的。我们知道，如果每次有点小改动就全局刷新dom，那性能的消耗就太大了，没办法愉快工作下去。但是，如果在渲染之前，我们能够通过对比，计算出需要修改的部分，有针对性地去更新这一部分dom，那就可以避免这样的性能消耗了。

vdom就是帮我们干这事的！

vdom保存着真实dom树的所有信息，并保持同步。我们在render的时候不是直接渲染dom，而是渲染vdom，这时的vdom会通过一系列的算法比对（diff），得到最终需要修改的部分dom，然后再作用到真实的dom上：
```js
我们家react：render -> dom

别人家react：render -> vdom -> (diff) -> dom
```

我们可以尝试猜一下vdom（的一个单元）大概是什么样的结构：
```js
var vdom = {
  tagName: 'H1',
  className: '',
  innerHTML: 'hello, Jack!',
  onClick: function () {
    // do something...
  },
  children: [
    // 子元素
  ]
  ...
}
```

所以vdom其实就是一个普通的对象，不是什么神奇的东西，真正有讲究的是diff算法，这关系到vdom的准确度和更新效率，我们在这里就不作深入探讨了。

### jsx
完成了一个简单的react之后，我们来真正写react的时候就容易理解多了：
```js
// App.jsx
import React from 'react'
import ReactDOM from 'react-dom'

var App = React.createClass({
  getInitialState: function() {
    return {
      name: 'world'
    }
  },
  componentDidMount: function() {
    var _t = this

    if (_t.isMounted()) {
      setTimeout(function() {
        _t.setState({
          name: 'Jack'
        })
      }, 2000)
    }
  },
  render: function() {
    var _t = this

    return (
      <h1 onClick={_t.changeName}>hello, {_t.state.name}!</h1>
    )
  },
  changeName: function() {
    var _t = this

    _t.setState({
      name: 'React'
    })
  }
})

ReactDOM.render(<App />, document.getElementById('root'))
```

上面的代码是react的实现，功能跟我们刚刚自己写的component是等效的（不要脸）。而且我们也可以看到，其实整个结构和工作流程也是跟我们的“React”很相近（真不要脸）。唯一差别比较大的，那就是直接在javascript中写html的方式了，这可能是大部分初学者都比较难接受的一点。

这种js和html混编的方式，就叫做jsx。

jsx使你可以在js中方便地组织你的html，想想，如果我们的html都要像之前我们写的那样，变成字符串的方式来写，那感觉很糟糕，连换行都不自在，因为你总会感觉你的思路在html和js之间来回切换，你总要考虑这里的换行有没有问题，那里的字符有没有歧义，需不需要转义等等的问题，强制把html给parse为js中的字符串，既不方便书写，又难以维护。所以为了消除这种麻烦，react干脆就把html当作一个可辨别的js代码片段来使用。其原理很简单，只是经过babel处理后，把js中的html标签内容变成js对象就可以了。

所以，如果我们把所有标签都当成一个js对象来看，那就很好理解了，一个`<h1 onClick={_t.changeName}>hello, Jack!</h1>`在js中应该就相当于（以下是真实例子拷贝）：
```js
{
  $$typeof: Symbol(react.element),
  _owner: null,
  _self: null,
  _source: null,
  _store: Object,
  key: null,
  props:{
    children: "hello, Jack!",
    onClick: _t.changeName // 这是我自己补的
  },
  ref:null,
  type:"h1",
  __proto__:Object
}
```

当然，以上应该说是一个组件的调用，真实的组件本身应该是lazy的，或者是functional的，你可以试试直接console.log(App)（以下依旧为真实例子拷贝）：
```js
function App(props) {
  _classCallCheck(this, App);

  var _this = _possibleConstructorReturn(this, (App.__proto__ || Object.getPrototypeOf(App)).call(this, props));

  _this.state = {
   …
  }
}
```

是不是验证了之前说的，jsx中的html片段其实是编译成js可识别的对象（函数）。

### component
component顾名思义，就是组件的意思。**组件化** 的目的是实现代码复用，这跟 **模块化** 很相似。简单来说，我们可以认为组件化，就是把一个个独立的代码块进行封装，然后在需要使用的时候，再一个个组装起来，构建最终的页面。

打个比方，我们的首页一般会有一个导航栏，这个导航栏就是一个功能完整并且相对独立的模块，我们可以把它拆出来，封装成组件，然后在代码中引用。这样的话，除了首页以外的其他页面，也都可以引用这个组件，这样我们就不必为每个页面都写一个导航栏，也不必在导航栏有变动的时候，去把所有页面都修改一遍，而只需要修改导航栏这个组件就可以了。

假设我们有一个页面index，这个页面上有一个logo、一个导航栏、一个新闻列表的板块，还有一个页脚，那么我们可以这么来写：
```html
<div class="g-index">
  <div class="m-logo">
    logo
  </div>
  <div class="m-nav">
    nav
  </div>
  <div class="news">
    <div class="m-news_item">
      item
    </div>
    <div class="m-news_item">
      item
    </div>
    <div class="m-news_item">
      item
    </div>
  </div>
  <div class="m-footer">
    copy right
  </div>
</div>
```

在react中，我们可以很容易地实现组件化，实现上面需求只需要这么写：
```js
// App.jsx
import React from 'react'
import ReactDOM from 'react-dom'

var Logo = React.createClass({
  render: function() {
    return <div className="m-logo">
      logo
    </div>
  }
})

var Nav = React.createClass({
  render: function() {
    return <div className="m-nav">
      <a href="#">index</a> <a href="#">about</a> <a href="#">product</a>
    </div>
  }
})

var NewsItem = React.createClass({
  render: function() {
    return <div className="m-news_item">
      item
    </div>
  }
})

var Footer = React.createClass({
  render: function() {
    return <div className="m-footer">
      copy right
    </div>
  }
})

var App = React.createClass({
  render: function() {
    return <div className="g-index">
      <Logo />
      <Nav />
      <div className="news">
        <NewsItem />
        <NewsItem />
        <NewsItem />
      </div>
      <Footer />
    </div>
  }
})

ReactDOM.render(<App />, document.getElementById('root'))
```

这样，我们就实现了对页面的拆分，彼此隔离的组件大大缓解了我们在一个作用域里书写大片的代码而引起污染的情况，使得调试变得更加方便。

看过react文档的小伙伴可能会说，咦？怎么是`createClass`的方式，而不是直接`extends React.Component`？其实官方提供了好几种声明一个组件的方式，并不限于以上两种，后者也是借助于es2015（es6）的class来实现的，在这里，我们为了让重点更加集中，就不使用class的方式了，有兴趣的小伙伴可以自行了解。

为了实现代码的跨页面复用，我们还可以把以上的组件分别封装到独立的文件当中，然后使用es6提供的`import`方式来引入：
```js
// App.jsx
import React from 'react'
import ReactDOM from 'react-dom'

import Logo from './components/Logo'
import Nav from './components/Nav'
import NewsItem from './components/NewsItem'
import Footer from './components/Footer'

var App = React.createClass({
  render: function() {
    return <div className="g-index">
      <Logo />
      <Nav />
      <div className="news">
        <NewsItem />
        <NewsItem />
        <NewsItem />
      </div>
      <Footer />
    </div>
  }
})

ReactDOM.render(<App />, document.getElementById('root'))
```

注意，为了使组件能够被import，在编写组件的时候，你需要对应地把它export出来：
```js
// Logo.jsx
import React from 'react'

var Logo = React.createClass({
  render: function() {
    return <div className="m-logo">
      logo
    </div>
  }
})

export default Logo
```

这里我们要强调一点，`import`和`export`是es6的语法，与react本身没有关系，不管你用不用es6，react都是能正常运作的，只不过我们借助于es6，能提高我们的编程体验以及更好地实现组件化的工程。

### state/props
讲到component，就不得不讲 `state` 和 `props` 这两个属性，`state`是一个组件的本地数据，也就是它的私有数据，可以理解为`local model`，而props则是组件由外部接收的属性。
有点混乱，我们简单区别一下，假设我们有一个时钟组件`clock`，它平时都是自己运行，那么它可以自己管理自己的时间，所以它的`time`就可以由`state`来管理；除了显示时间之外，它还需要展示自己所在的城市，我们希望它的城市可以订制，也就是地点是需要“被告知”的，所以它的`city`就需要由props传入。
```js
var Clock = React.createClass({
  getInitialState: function() {
    return {
      time: new Date().toString()
    }
  },
  render: function() {
    var _t = this

    return <div className="m-clock">
      {_t.props.city}: {_t.state.time}
    </div>
  },
  componentDidMount: function() {
    var _t = this

    var timer = setInterval(function () {
      if (_t.isMounted()) {
        _t.setState({
          time: new Date().toString()
        })
      } else {
        clearInterval(timer)
      }
    }, 1000)
  }
})
```

我们可以在App组件里这样调用：
```js
var App = React.createClass({
  render: function() {
    return <div className="g-index">
      <Logo />
      <Nav />
      <Clock city="广州" />
      <Clock city="北京" />
      <div className="news">
        <NewsItem />
        <NewsItem />
        <NewsItem />
      </div>
      <Footer />
    </div>
  }
})
```

这里为了突出可订制的性质，我特地放了两个时钟，标识了两个地点。虽然这个例子还是有点奇怪，但是我们以理解为主，不要去纠结这些细节，因为我一时也没想到什么比较好的例子。

一般来说，如果你能确定一个数据它只属于组件自己，完全不需要外部来管理，那么它就可以放在state中，如果这个数据（属性）可能来自外部，或者它需要被外部定制，或者它可能需要参考外界因素，或者它需要跟外部相互作用，那么它应该由props传入。

留意我们以上Clock组件中，出现了一个isMounted方法，这个方法是干嘛用的呢？

isMounted是判断当前组件是否挂载的状态，也就是说，如果isMounted()返回的是true那么说明这个组件目前是挂载在页面上的，正常运作；如果返回false，说明这个组件已经被卸载了，那么你不应该再对它做任何操作，比如setState而引起组件重新渲染。

组件被卸载的情况是很常见的，假设页面上有三个列表，那么这三个列表就是三个组件，而我们一次只显示一个列表，点击tab可以切换显示不同列表，那么我们切换列表实际就是对列表组件的加载和卸载过程，这时候，如果一个列表已经被卸载，那么对它的一切操作都应该被停止。

另一种情况是使用了`router`来实现`SPA`的时候，这也是很常见的，更应该用好`isMounted`，不然页面切换的时候很有可能会报错。

还有一点就是，state是可以由组件自己自由操作的，但是传入的props，需要依靠外部才能更新，换句话说，props对接收的组件来说，是只读不可写的！

那如果我们确实需要更新自己的props该怎么办？我们需要以某种方式来通知外界，让外界来更新状态，这就涉及到组件之间的通讯了。


### 组件通讯
很多时候，我们的组件都不可避免的要跟组件外的环境，或者其他的组件互相作用，我们称为 **组件之间的通讯** 。

组件之间的通讯分为：父组件与子组件之间通讯、子组件与子组件之间通讯，以及跨了好几代的通讯（不好意思我不知道怎么一本正经地描述这种关系）。

最后一种通讯其实可以通过第一种来一步步传递实现，也可以借助于redux这样的插件来实现，后者已经超出了题纲，我们不作展开。

来个典型点的例子，假设我们要写一个模拟alert的弹窗组件，也就是web开发中非常非常常见的 **模态弹窗** ，我们来分析一下需求：
* 窗口的状态（激活/关闭）
* 激活窗口的方法
* 关闭窗口的方法
* 可订制的弹窗内容