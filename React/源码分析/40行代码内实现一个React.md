# 40 行代码内实现一个 React.js
<!-- TOC -->

- [40 行代码内实现一个 React.js](#40-行代码内实现一个-reactjs)
  - [1. 前言](#1-前言)
  - [2. 一切从点赞说起](#2-一切从点赞说起)
  - [3. 实现可复用性](#3-实现可复用性)
    - [3.1 结构复用](#31-结构复用)
    - [3.2 生成 DOM 元素并且添加事件](#32-生成-dom-元素并且添加事件)
  - [4. 为什么不暴力一点？](#4-为什么不暴力一点)
    - [4.1 状态改变 -> 构建新的 DOM 元素](#41-状态改变---构建新的-dom-元素)
    - [4.2 重新插入新的 DOM 元素](#42-重新插入新的-dom-元素)
  - [5. 抽象出 Component 类](#5-抽象出-component-类)
  - [6. 总结](#6-总结)
  - [7. 实现代码](#7-实现代码)

<!-- /TOC -->

## 1. 前言
50 行代码内，不依赖任何第三方的库，用纯 JavaScript 实现一个 React.js 。

## 2. 一切从点赞说起
假设现在我们需要实现一个点赞、取消点赞的功能。

HTML:
```html
<body>
  <div class='wrapper'>
    <button class='like-btn'>
      <span class='like-text'>点赞</span>
      <span>?</span>
    </button>
  </div>
</body>
```

为了现实当中的实际情况，所以这里特易把这个 `button` 的 `HTML` 结构搞得稍微复杂一些。有了这个 `HTML` 结构，现在就给它加入一些 `JavaScript` 的行为：
```js
const button = document.querySelector('.like-btn');
const buttonText = button.querySelector('.like-text');
let isLiked = false;

button.addEventListener('click', function () {
  isLiked = !isLiked
  if (isLiked) {
    buttonText.innerHTML = '取消'
  } else {
    buttonText.innerHTML = '点赞'
  }
}, false)
```

## 3. 实现可复用性
### 3.1 结构复用
现在我们来重新编写这个点赞功能。这次我们先写一个类，这个类有 render 方法，这个方法里面直接返回一个表示 HTML 结构的字符串：
```js
class LikeButton {
  render () {
    return `
      <button id='like-btn'>
        <span class='like-text'>赞</span>
        <span>?</span>
      </button>
    `
  }
}
```

然后可以用这个类来构建不同的点赞功能的实例，然后把它们插到页面中。
```js
const wrapper = document.querySelector('.wrapper')
const likeButton1 = new LikeButton()
wrapper.innerHTML = likeButton1.render()

const likeButton2 = new LikeButton()
wrapper.innerHTML += likeButton2.render()
```

这里非常暴力地使用了 innerHTML ，把两个按钮粗鲁地插入了 wrapper 当中。虽然你可能会对这种实现方式非常不满意，但我们还是勉强了实现了结构的复用。我们后面再来优化它。

### 3.2 生成 DOM 元素并且添加事件
你一定会发现，现在的按钮是死的，你点击它它根本不会有什么反应。因为根本没有往上面添加事件。但是问题来了，`LikeButton` 类里面是虽然说有一个 `button`，但是这玩意根本就是在字符串里面的。你怎么能往一个字符串里面添加事件呢？DOM 事件的 API 只有 DOM 结构才能用。

我们需要 DOM 结构，准确地来说：我们需要这个点赞功能的 HTML 字符串代表的 DOM 结构。假设我们现在有一个函数 `createDOMFromString` ，你往这个函数传入 HTML 字符串，但是它会把相应的 DOM 元素返回给你。这个问题就可以额解决了。
```js
// ::String => ::Document
const createDOMFromString = (domString) => {
  // TODO 
}
```

先不用管这个函数应该怎么实现，先知道它是干嘛的。拿来用就好，这时候用它来改写一下 `LikeButton` 类：
```js
class LikeButton {
  render () {
    this.el = createDOMFromString(`
      <button class='like-button'>
        <span class='like-text'>点赞</span>
        <span>?</span>
      </button>
    `)
    this.el.addEventListener('click', () => console.log('click'), false)
    return this.el
  }
}
```

现在 `render(`) 返回的不是一个 `html` 字符串了，而是一个由这个 `html` 字符串所生成的 `DOM`。在返回 `DOM` 元素之前会先给这个 `DOM` 元素上添加事件在返回。

因为现在 `render` 返回的是 `DOM` 元素，所以不能用 `innerHTML` 暴力地插入 wrapper。而是要用 DOM API 插进去。
```js
const wrapper = document.querySelector('.wrapper')

const likeButton1 = new LikeButton()
wrapper.appendChild(likeButton1.render())

const likeButton2 = new LikeButton()
wrapper.appendChild(likeButton2.render())
```

现在你点击这两个按钮，每个按钮都会在控制台打印 `click`，说明事件绑定成功了。但是按钮上的文本还是没有发生改变，只要稍微改动一下 `LikeButton` 的代码就可以完成完整的功能：
```js
class LikeButton {
  constructor () {
    this.state = { isLiked: false }
  }

  changeLikeText () {
    const likeText = this.el.querySelector('.like-text')
    this.state.isLiked = !this.state.isLiked
    if (this.state.isLiked) {
      likeText.innerHTML = '取消'
    } else {
      likeText.innerHTML = '点赞'
    }
  }

  render () {
    this.el = createDOMFromString(`
      <button class='like-button'>
        <span class='like-text'>点赞</span>
        <span>?</span>
      </button>
    `)
    this.el.addEventListener('click', this.changeLikeText.bind(this), false)
    return this.el
  }
}
```

这里的代码稍微长了一些，但是还是很好理解。只不过是在给 `LikeButton` 类添加了构造函数，这个构造函数会给每一个 `LikeButton` 的实例添加一个对象 `state`，`state` 里面保存了每个按钮自己是否点赞的状态。还改写了原来的事件绑定函数：原来只打印 `click`，现在点击的按钮的时候会调用 `changeLikeText` 方法，这个方法会根据 `this.state` 的状态改变点赞按钮的文本。

如果你现在还能跟得上文章的思路，那么你留意下，现在的代码已经和 React.js 的组件代码有点类似了。但其实我们根本没有讲 React.js 的任何内容，我们一心一意只想怎么做好“组件化”。

现在这个组件的可复用性已经很不错了，只要实例化一下然后插入到 DOM 里面去就好了。

## 4. 为什么不暴力一点？
仔细留意一下 `changeLikeText` 函数，这个函数包含了 DOM 操作，现在看起来比较简单，那是因为现在只有 `isLiked` 一个状态。但想一下，因为你的数据状态改变了你就需要去更新页面的内容，所以如果你的组件包含了很多状态，那么你的组件基本全部都是 DOM 操作。一个组件包含很多状态的情况非常常见，所以这里还有优化的空间：如何尽量减少这种手动 DOM 操作？

### 4.1 状态改变 -> 构建新的 DOM 元素
这里要提出的一种解决方案：一旦状态发生改变，就重新调用 `render` 方法，构建一个新的 DOM 元素。这样做的好处是什么呢？好处就是你可以在 `render` 方法里面使用最新的 `this.state` 来构造不同 HTML 结构的字符串，并且通过这个字符串构造不同的 DOM 元素。页面就更新了！听起来有点绕，看看代码怎么写：
```js
class LikeButton {
  constructor () {
    this.state = { isLiked: false }
  }

  setState (state) {
    this.state = state
    this.el = this.render()
  }

  changeLikeText () {
    this.setState({
      isLiked: !this.state.isLiked
    })
  }

  render () {
    this.el = createDOMFromString(`
      <button class='like-btn'>
        <span class='like-text'>${this.state.isLiked ? '取消' : '点赞'}</span>
        <span>?</span>
      </button>
    `)
    this.el.addEventListener('click', this.changeLikeText.bind(this), false)
    return this.el
  }
}
```

其实只是改了几个小地方：
1. `render` 函数里面的 HTML 字符串会根据 `this.state` 不同而不同（这里是用了 ES6 的字符串特性，做这种事情很方便）。
2. 新增一个 `setState` 函数，这个函数接受一个对象作为参数；它会设置实例的 `state`，然后重新调用一下 `render` 方法。
3. 当用户点击按钮的时候， `changeLikeText` 会构建新的 `state` 对象，这个新的 `state` ，传入 `setState` 函数当中。

这样的结果就是，用户每次点击，`changeLikeText` 都会调用改变组件状态然后调用 `setState` ；`setState` 会调用 `render` 方法重新构建新的 DOM 元素；`render` 方法会根据 `state` 的不同构建不同的 DOM 元素。

也就是说，你只要调用 `setState`，组件就会重新渲染。我们顺利地消除了没必要的 DOM 操作。

### 4.2 重新插入新的 DOM 元素
上面的改进不会有什么效果，因为你仔细看一下就会发现，其实重新渲染的 DOM 元素并没有插入到页面当中。所以这个组件之外，你需要知道这个组件发生了改变，并且把新的 DOM 元素更新到页面当中。

重新修改一下 setState 方法：
```js
...
    setState (state) {
        const oldEl = this.el
      this.state = state
      this.el = this.render()
        if (this.onStateChange) this.onStateChange(oldEl, this.el)
    }
...
```

使用这个组件的时候：
```js
const likeButton = new LikeButton()
wrapper.appendChild(likeButton.render()) // 第一次插入 DOM 元素
component.onStateChange = (oldEl, newEl) => {
  wrapper.insertBefore(newEl, oldEl) // 插入新的元素
  wrapper.removeChild(oldEl) // 删除旧的元素
}
```

这里每次 `setState` 都会调用 `onStateChange` 方法，而这个方法是实例化以后时候被设置的，所以你可以自定义 `onStateChange` 的行为。这里做的事是，每当 `setState` 的时候，就会把插入新的 DOM 元素，然后删除旧的元素，页面就更新了。这里已经做到了进一步的优化了：现在不需要再手动更新页面了。

非一般的暴力。不过没有关系，这种暴力行为可以被 Virtual-DOM 的 diff 策略规避掉，但这不是本文章所讨论的范围。

这个版本的点赞功能很不错，我可以继续往上面加功能，而且还不需要手动操作DOM。但是有一个不好的地方，如果我要重新另外做一个新组件，譬如说评论组件，那么里面的这些 `setState` 方法要重新写一遍，其实这些东西都可以抽出来。

## 5. 抽象出 Component 类

为了让代码更灵活，可以写更多的组件，我把这种模式抽象出来，放到一个 Component 类当中：
```js
class Component {
  constructor (props = {}) {
    this.props = props
  }

  setState (state) {
    const oldEl = this.el
    this.state = state
    this.el = this.renderDOM()
    if (this.onStateChange) this.onStateChange(oldEl, this.el)
  }

  renderDOM () {
    this.el = createDOMFromString(this.render())
    if (this.onClick) {
      this.el.addEventListener('click', this.onClick.bind(this), false)
    }
    return this.el
  }
}
```

还有一个额外的 `mount` 的方法，其实就是把组件的 DOM 元素插入页面，并且在 `setState` 的时候更新页面：
```js
const mount = (wrapper, component) => {
  wrapper.appendChild(component.renderDOM())
  component.onStateChange = (oldEl, newEl) => {
    wrapper.insertBefore(newEl, oldEl)
    wrapper.removeChild(oldEl)
  }
}
```

这样的话我们重新写点赞组件就会变成：
```js
class LikeButton extends Component {
  constructor (props) {
    super(props)
    this.state = { isLiked: false }
  }

  onClick () {
    this.setState({
      isLiked: !this.state.isLiked
    })
  }

  render () {
    return `
      <button class='like-btn'>
        <span class='like-text'>${this.props.word || ''} ${this.state.isLiked ? '取消' : '点赞'}</span>
        <span>?</span>
      </button>
    `
  }
}

mount(wrapper, new LikeButton({ word: 'hello' }))
```

有没有发现你写的代码已经和 React.js 的组件写法很相似了？而且还是可以正常运作的代码，而且我们从头到尾都是用纯的 JavaScript，没有依赖任何第三方库。（注意这里加入了上面没有提到过点 `props`，可以给组件传入配置属性，跟 React.js 一样）。

只要有了上面那个 `Component` 类和 `mount` 方法加起来不足40行代码就可以做到组件化。如果我们需要写另外一个组件，只需要像上面那样，简单地继承一下 `Component` 类就好了：
```js
  class RedBlueButton extends Component {
    constructor (props) {
      super(props)
      this.state = {
        color: 'red'
      }
    }

    onClick () {
      this.setState({
        color: 'blue'
      })
    }

    render () {
      return `
        <div style='color: ${this.state.color};'>${this.state.color}</div>
      `
    }
  }
```

还有一个神秘的 `createDOMFromString`，其实它更简单：
```js
  const createDOMFromString = (domString) => {
    const div = document.createElement('div')
    div.innerHTML = domString
    return div
  }
```

## 6. 总结 
这个 40 行不到的代码其实是一个残废而且智障版的 React.js，没有 JSX ，没有组件嵌套等等。它只是 React.js 组件化表现形式的一种实现而已。它根本没有触碰到 React.js 的精髓。

React.js 的最最精髓的地方可能就在于它的 Virtual DOM 算法，而它的 setState 、props 等等都只不过是一种形式

## 7. 实现代码
```html
<!DOCTYPE html>
<html>

  <head>
    <meta charset="utf-8">
    <title>Reactjs in 40 </title>
    <style media="screen">
      .like-btn { font-size: 50px; }
    </style>
  </head>

  <body>
    <div class='wrapper'></div>
  </body>

  <script type="text/javascript">
    /* Component */
    class Component {
      constructor (props = {}) {
        this.props = props
      }
      setState (state) {
        const oldEl = this.el
        this.state = state
        this.el = this.renderDOM()
        if (this.onStateChange) this.onStateChange(oldEl, this.el)
      }
      renderDOM () {
        this.el = createDOMFromString(this.render())
        if (this.onClick) {
          this.el.addEventListener('click', this.onClick.bind(this), false)
        }
        return this.el
      }
    }
    const createDOMFromString = (domString) => {
      const div = document.createElement('div')
      div.innerHTML = domString
      return div
    }
    const mount = (component, wrapper) => {
      wrapper.appendChild(component.renderDOM())
      component.onStateChange = (oldEl, newEl) => {
        wrapper.insertBefore(newEl, oldEl)
        wrapper.removeChild(oldEl)
      }
    }
    /* ========================================= */
    class LikeButton extends Component {
      constructor (props) {
        super(props)
        this.state = { isLiked: false }
      }
      onClick () {
        this.setState({
          isLiked: !this.state.isLiked
        })
      }
      render () {
        return `
          <button class='like-btn' style="background-color: ${this.props.bgColor}">
            <span class='like-text'>
              ${this.state.isLiked ? '取消' : '点赞'}
            </span>
            <span>👍</span>
          </button>
        `
      }
    }
    class RedBlueButton extends Component {
      constructor (props) {
        super(props)
        this.state = {
          color: 'red'
        }
      }
      onClick () {
        this.setState({
          color: 'blue'
        })
      }
      render () {
        return `
          <div style='color: ${this.state.color};'>${this.state.color}</div>
        `
      }
    }
    const wrapper = document.querySelector('.wrapper')
    mount(new LikeButton({ bgColor: 'red' }), wrapper)
    mount(new LikeButton(), wrapper)
    mount(new RedBlueButton(), wrapper)
  </script>
</html>
````