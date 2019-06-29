# 从头实现一个简易版React
<!-- TOC -->

- [从头实现一个简易版React](#从头实现一个简易版React)
  - [1. 从头实现一个简易版React（一）](#1-从头实现一个简易版React一)
    - [1.1 Virtual DOM的实现](#11-Virtual-DOM的实现)
    - [1.2 ReactComponent的实现](#12-ReactComponent的实现)
    - [1.3 入口的实现](#13-入口的实现)
  - [2. 从头实现一个简易版React（二）](#2-从头实现一个简易版React二)
    - [2.1 ReactTextComponent](#21-ReactTextComponent)
    - [2.2 ReactDomComponent](#22-ReactDomComponent)
    - [2.3 ReactCompositComponent](#23-ReactCompositComponent)
    - [2.4 总结](#24-总结)
  - [3. 从头实现一个简易版React（三）](#3-从头实现一个简易版React三)
    - [3.1 ReactCompositeComponent](#31-ReactCompositeComponent)
    - [3.2 ReactTextComponent](#32-ReactTextComponent)
    - [3.3 ReactDomComponent](#33-ReactDomComponent)
    - [总结](#总结)
  - [仓库](#仓库)

<!-- /TOC -->

第一节介绍下实现的思路以及结构，第二节讲渲染，第三节讲更新。

## 1. 从头实现一个简易版React（一）

### 1.1 Virtual DOM的实现
`React`的一切都基于`Virtual DOM`,我们第一步自然先实现它,如下：
```js
/**
 * @param type :代表当前的节点属性
 * @param key :用来标识element,用于优化以后的更新
 * @param props:节点的属性
 */
function VDom(type, key, props) {
  this.type = type
  this.key = key
  this.props = props
}
// 代码地址：src/react/reactElement.js  
```

实现了vDom后，理所需要一个方法来将我们写的元素转化为vDom。一般我们都是JSX来创建元素的，但它只不过是`React.createElment`的语法糖。所以，接下来，我们要实现的就是`createElement`方法：
```js
function createElement(type, config, ...children) {
  const props = {}

  config = config || {}
  // 获取key，用来标识element，方便以后高效的更新
  const { key = null } = config
 
  let propName = ''

  // 复制config里的内容到props
  for (propName in config) {
    if (config.hasOwnProperty(propName) && propName !== 'key') {
      props[propName] = config[propName]
    }
  }

  // 转化children
  if (children.length === 1 && Array.isArray(children[0])) {
    props.children = children[0]
  } else {
    props.children = children
  }

  return new VDom(type, key, props)
}
// 代码地址：src/react/reactElement.js  
```

这段代码也非常简单，根据我们传入的参数，生成对应的vDom

### 1.2 ReactComponent的实现
我们所创建的VDom类型分为3种：
1. 文本类型
2. 原生DOM类型
3. 自定义类型

不同的类型，肯定有不同的渲染和更新逻辑，我们把这些逻辑与vDom一起，封装成对应的`ReactComponent`类，通过`ReactComponent`类控制vDom,这里我把它们命名为`ReactTextComponent`,`ReactDomComponent`,`ReactCompositeComponent`,分别对应三种类型。

首先是基类ReactComponet：
```js
// component基类，用来处理不同的虚拟dom更新，渲染
class Component {
  constructor(element) {
    this._vDom = element
    // 用来标识当前component
    this._rootNodeId = null
  }
}
// 代码地址：src/react/component/ReactComponent.js  
```

接着再让不同类型的component继承这个基类，每种component类型都有mount和update两个方法，用来执行渲染和更新
```js
class ReactDomComponent extends ReactComponent {
    // 渲染
  mountComponent() {}

  // 更新
  updateComponent() {}
}
```

```js
class ReactCompositeComponent extends ReactComponent {
    // 渲染
  mountComponent() {}

  // 更新
  updateComponent() {}
}
```

```js
class ReactTextComponent extends ReactComponent {
    // 渲染
  mountComponent() {}

  // 更新
  updateComponent() {}
}
```

### 1.3 入口的实现
实现了ReactComponent后，我们自然需要一个入口去得到ReactComponent并调用它的mount。在使用React时，通常都是通过
```js
import React from 'react'
import ReactDOM from 'react-dom'

class App extends React.Component {
}

ReactDOM.render(<App />, document.getElementById('root'))
```

这段代码来充当渲染的入口，下面我们来实现这个入口，（为了方便说明，我把render方法也放在了React对象中）
```js
import Component from './Component'
import createElement from './ReactElement'
import instantiateReactComponent from './component/util'
import $ from 'jquery'

const React = {
  nextReactRootIndex: 0, // 标识id，确定每个vDom的唯一性
  Component, // 所有自定义组件的父类
  createElement, // 创建vdom

  render(vDom, container) { // 入口
    var componentInstance = instantiateReactComponent(vDom) //通过vDom生成Component
    var markup = componentInstance.mountComponent(this.nextReactRootIndex++)

    container.innerHTML = markup
    $(document).trigger('mountReady')
  }
}
// 代码地址：src/react/index.js  
```

由于渲染和更新都已经封装在不同的ReactComponent里，所以，这里也需要一个方法，根据不同的vDom类型生成对应的ReactComponent，下面我们就来实现这个方法：
```js
// component工厂，用来返回一个component实例
function instantiateReactComponent(node) {
  // 文本节点的情况
  if (typeof node === 'string' || typeof node === 'number') {
    return new ReactTextComponent(node)
  }

  // 浏览器默认节点的情况
  if (typeof node === 'object' && typeof node.type === 'string') {
    return new ReactDomComponent(node)
  }

  // 自定义的元素节点
  if (typeof node === 'object' && typeof node.type === 'function') {
    return new ReactCompositeComponent(node)
  }
}
```

然后再调用入口ReactComponent的mount方法，获取渲染内容，再将其渲染出来就行。

<div align="center"><img src="../../resource/assets/react/041301.png" /></div>


## 2. 从头实现一个简易版React（二）
我们把React元素分为`text`，`basic`，`custom`三种，并分别封装了三种vDom的ReactComponent，用来处理各自的渲染和更新，在这里，我们将重心放在各自`ReactComponet`的`mount`方法上。

### 2.1 ReactTextComponent
ReactTextComponent用来处理文本节点，为了标识方便，在返回的内容上加了span标签。
```js

// 用来表示文本节点在渲染，更新，删除时应该做的事情
class ReactTextComponent extends ReactComponent {
  // 渲染
  mountComponent(rootId) {
    this._rootNodeId = rootId
    return `<span data-reactid="${rootId}">${this._vDom}</span>`
  }
}
//代码地址：src/react/component/ReactTextComponent.js
```

ReactTextComponent的mount方法非常简单，打上标识符，将内容插入标签内，并把标签内容返回就可以了。

### 2.2 ReactDomComponent
这个类用来处理原生节点的vDom，在将vDom渲染为原生DOM时，要考虑3点：
1. 元素类型
2. 拼凑属性，包含普通属性及事件的处理
3. 子节点的递归渲染

代码如下：
```js
// 用来表示原生节点在渲染，更新，删除时应该做的事情
class ReactDomComponent extends ReactComponent {
  constructor(vDom) {
    super(vDom)
    this._renderedChildComponents = null
  }

  // 渲染
  mountComponent(rootId) {
    this._rootNodeId = rootId

    const { props, type, props: { children = [] } } = this._vDom,
      childComponents = []

    // 设置tag，加上标识
    let tagOpen = `${type} data-reactid=${this._rootNodeId}`,
      tagClose = `/${type}`,
      content = ''

    // 拼凑属性
    for (let propKey in props) {
      // 事件
      if (/^on[A-Za-z]/.test(propKey)) {
        const eventType = propKey.replace('on', '')
        $(document).delegate(`[data-reactid="${this._rootNodeId}"]`, `${eventType}.${this._rootNodeId}`, props[propKey])
      }

      // 普通属性，排除children与事件
      if (props[propKey] && propKey !== 'children' && !/^on[A-Za-z]/.test(propKey)) {
        tagOpen += ` ${propKey}=${props[propKey]}`
      }
    }

    // 获取子节点渲染出的内容
    children.forEach((item, index) => {
      // 再次使用工厂方法实例化子节点的component，拼接好返回
      const childComponent = instantiateReactComponent(item)
      childComponent._mountIndex = index

      childComponents.push(childComponent)

      // 子节点的rootId是父节点的rootId加上索引拼接的值
      const curRootId = `${this._rootNodeId}.${index}`
      // 得到子节点的渲染内容
      const childMarkup = childComponent.mountComponent(curRootId)
      // 拼接
      content += childMarkup

      // 保存所有子节点的component
      this._renderedChildComponents = childComponents
    })

    return `<${tagOpen}>${content}<${tagClose}>`
  }
}
//代码地址：src/react/component/ReactDomComponent.js
```

在React的官方实现中，自己实现了一套事件系统，这里用了jQuery的事件代替。

在样式上，需要基于传入的style对象创建样式，这里也暂时忽略了。


### 2.3 ReactCompositComponent
在创建自定义组件时，通常会这样创建
```js
import React from 'react'

class App extends React.Component {
  render() {
    return (
       
    )
  }
}
```

所以，第一步，我们先实现`Component`这个父类
```js
// 所有自定义组件的父类
class Component {
  constructor(props) {
    this.props = props
  }

  setState(newState) {
    this._reactInternalInstance.updateComponent(null, newState)
  }
}
//代码地址：src/react/Component.js
```

Component类上我们主要实现了setState方法，至于有什么用，我们放在更新里说。

在自定义组件的vDom中，type保存的是我们创建的Component的引用，所以在`ReactCompositeComponent`的`mount`方法中。我们首先根据vDom的type创建组件的实例，在以此调用它初始渲染的生命周期方法，render方法。

在render方法中，返回了组件渲染内容的vDom，我们根据这个vDom创建它的`ReactComponent`并调用`mount()`,就得到了真实的渲染内容。

贴代码：
```js
export default class extends ReactComponent {
  constructor(element) {
    super(element)
    // 存放对应的组件实例
    this._instance = null
    this._renderedComponent = null
  }

  // 渲染
  mountComponent(rootId) {
    this._rootNodeId = rootId
    const { type: Component, props } = this._vDom

    // 获取自定义组件的实例
    const inst = new Component(props)
    this._instance = inst

    // 保留对当前component的引用，下面更新时会用到
    inst._reactInternalInstance = this

    inst.componentWillMount && inst.componentWillMount()

    // 调用自定义组件的render方法，返回一个Vdom
    const renderedVdom = inst.render()

    // 获取renderedComponent的component
    const renderedComponent = instantiateReactComponent(renderedVdom)
    this._renderedComponent = renderedComponent

    // 得到渲染之后的内容
    const renderMarkup = renderedComponent.mountComponent(this._rootNodeId)

    // 在React.render方法最后触发了mountReady事件，所在在这里监听，在渲染完成后触发
    $(document).on('mountReady', () => {
      inst.componentDidMount && inst.componentDidMount()
    })

    return renderMarkup
  }
}
// 代码地址：src/react/component/ReactCompositeComponent.js
```

从这里可以看出，自定义组件的`mount`方法并不负责具体的渲染，这些都交给了它的`render`，它把重心放在了创建对象和调用生命周期上。

### 2.4 总结
文章到这，我们的简易版react已经初步实现了`虚拟DOM的创建`，`生命周期的调用`，`虚拟DOM的递归渲染`和`事件处理`。

总结一下，每一个vDom都有ReactComponent相对应，递归渲染的本质无非就是获取每个vDom的ReactComponent,并调用它的mount方法。


## 3. 从头实现一个简易版React（三）
在这一节我们将着重实现 diff算法以及更新

同样，我们会实现三种`ReactComponent`的`update`方法。不过在这之前，我们先想想，该如何触发React的更新呢？没错，就是`setState`方法。
```js
// 所有自定义组件的父类
class Component {
  constructor(props) {
    this.props = props
  }

  setState(newState) {
    this._reactInternalInstance.updateComponent(null, newState)
  }
}
//代码地址：src/react/Component.js
```

这里的`reactInternalInstance`就是我们在渲染`ReactCompositeComponent`时保存下的自身的实例，通过它调用了`ReactCompositeComponent`的`update`方法，接下来，我们就先实现这个`update`方法。

### 3.1 ReactCompositeComponent
这里的update方法同mount有点类似，都是调用生命周期和render方法，先上代码：
```js
class ReactCompositeComponent extends ReactComponent {
  constructor(element) {
    super(element)
    // 存放对应的组件实例
    this._instance = null
    this._renderedComponent = null
  }
  
 mountComponent(rootId) {
  //内容略
  }

  // 更新
  updateComponent(nextVDom, newState) {
    // 如果有新的vDom,就使用新的
    this._vDom = nextVDom || this._vDom
    const inst = this._instance
    // 获取新的state,props
    const nextState = { ...inst.state, ...newState }
    const nextProps = this._vDom.props

    // 判断shouldComponentUpdate
    if (inst.shouldComponentUpdate && (inst.shouldComponentUpdate(nextProps, nextState) === false)) return

    inst.componentWillUpdate && inst.componentWillUpdate(nextProps, nextState)

    // 更改state,props
    inst.state = nextState
    inst.props = nextProps

    const prevComponent = this._renderedComponent

    // 获取render新旧的vDom
    const prevRenderVDom = prevComponent._vDom
    const nextRenderVDom = inst.render()

    // 判断是需要更新还是重新渲染
    if (shouldUpdateReactComponent(prevRenderVDom, nextRenderVDom)) {
      // 更新
      prevComponent.updateComponent(nextRenderVDom)
      inst.componentDidUpdate && inst.componentDidUpdate()
    } else {
      // 重新渲染
      this._renderedComponent = instantiateReactComponent(nextRenderVDom)
      // 重新生成对应的元素内容
      const nextMarkUp = this._renderedComponent.mountComponent(this._rootNodeId)
      // 替换整个节点
      $(`[data-reactid="${this._rootNodeId}"]`).replaceWith(nextMarkUp)
    }
  }
}
//代码地址：src/react/component/ReactCompositeComponent.js
```

有两点要说明：
1. 熟悉React的都知道，很多时候组件的更新，vDom并没有变化，我们可以通过`shouldComponentUpdate`这个生命周期来优化这点，当`shouldComponentUpdate`为false时，直接return，不执行下面的代码。
2. 当调用render获取到新的vDom时，将会比较新旧的vDom类型是否相同，这也属于diff算法优化的一部分，如果类型相同，则执行更新，反之，就重新渲染。

```js
// 判断是更新还是渲染
function shouldUpdateReactComponent(prevVDom, nextVDom) {
  if (prevVDom != null && nextVDom != null) {
    const prevType = typeof prevVDom
    const nextType = typeof nextVDom

    if (prevType === 'string' || prevType === 'number') {
      return nextType === 'string' || nextType === 'number'
    } else {
      return nextType === 'object' && prevVDom.type === nextVDom.type && prevVDom.key === nextVDom.key
    }
  }
}
//代码地址：src/react/component/util.js
```

注意，这里我们使用到了key，当type相同时使用key可以快速准确得出两个vDom是否相同，这是为什么React要求我们在循环渲染时必须添加key这个props。

### 3.2 ReactTextComponent
ReactTextComponent的update方法非常简单，判断新旧文本是否相同，不同则更新内容，直接贴代码：
```js
class ReactTextComponent extends ReactComponent {
  mountComponent(rootId) {
  //省略
  }

  // 更新
  updateComponent(nextVDom) {
    const nextText = '' + nextVDom

    if (nextText !== this._vDom) {
      this._vDom = nextText
    }
    // 替换整个节点
    $(`[data-reactid="${this._rootNodeId}"]`).html(this._vDom)
  }
// 代码地址：src/react/component/ReactTextComponent.js
}
```

### 3.3 ReactDomComponent
`ReactDomComponent`的`update`最复杂，可以说`diff的核心`都在这里，本文的重心也就放在这。

整个update分为两块，`props的更新`和`children的更新`。
```js
class ReactDomComponent extends ReactComponent {
  mountComponent(rootId) {
  //省略
  }

  // 更新
  updateComponent(nextVDom) {
    const lastProps = this._vDom.props
    const nextProps = nextVDom.props

    this._vDom = nextVDom

    // 更新属性
    this._updateDOMProperties(lastProps, nextProps)
    // 再更新子节点
    this._updateDOMChildren(nextVDom.props.children)
  }
// 代码地址：src/react/component/ReactDomComponent.js
}
```

props的更新非常简单，无非就是遍历新旧props，删除不在新props里的老props，添加不在老props里的新props，更新新旧都有的props，事件特殊处理。
```js
  _updateDOMProperties(lastProps, nextProps) {
    let propKey = ''

    // 遍历，删除已不在新属性集合里的老属性
    for (propKey in lastProps) {
      // 属性在原型上或者新属性里有，直接跳过
      if (nextProps.hasOwnProperty(propKey) || !lastProps.hasOwnProperty(propKey)) {
        continue
      }

      // 对于事件等特殊属性，需要单独处理
      if (/^on[A-Za-z]/.test(propKey)) {
        const eventType = propKey.replace('on', '')
        // 针对当前的节点取消事件代理
        $(document).undelegate(`[data-reactid="${this._rootNodeId}"]`, eventType, lastProps[propKey])
        continue
      }
      
    }

    // 对于新的属性，需要写到dom节点上
    for (propKey in nextProps) {
      // 更新事件属性
      if (/^on[A-Za-z]/.test(propKey)) {
        var eventType = propKey.replace('on', '')

        // 以前如果已经有，需要先去掉
        lastProps[propKey] && $(document).undelegate(`[data-reactid="${this._rootNodeId}"]`, eventType, lastProps[propKey])

        // 针对当前的节点添加事件代理
        $(document).delegate(`[data-reactid="${this._rootNodeId}"]`, `${eventType}.${this._rootNodeId}`, nextProps[propKey])
        continue
      }

      if (propKey === 'children') continue

      // 更新普通属性
      $(`[data-reactid="${this._rootNodeId}"]`).prop(propKey, nextProps[propKey])
    }
  }
// 代码地址：src/react/component/ReactDomComponent.js
```

children的更新则相对复杂了很多，陈屹老师的《深入React技术栈》中提到，diff算法分为3块，分别是
1. **tree diff**
2. **component diff**
3. **element diff**

上文中的`shouldUpdateReactComponent`就属于`component diff`，接下来，让我们依据这三种diff实现updateChildren。
```js
// 全局的更新深度标识，用来判定触发patch的时机
let updateDepth = 0
// 全局的更新队列
let diffQueue = []

 _updateDOMChildren(nextChildVDoms) {
    updateDepth++

    // diff用来递归查找差异，组装差异对象，并添加到diffQueue中
    this._diff(diffQueue, nextChildVDoms)
    updateDepth--

    if (updateDepth === 0) {
      // 具体的dom渲染
      this._patch(diffQueue)
      diffQueue = []
    }
    
```

这里通过updateDepth对vDom树进行层级控制，只会对相同层级的DOM节点进行比较，只有当一棵DOM树全部遍历完，才会调用patch处理差异。也就是所谓的tree diff。

确保了同层次后，我们要实现_diff方法。

已经渲染过的子ReactComponents在这里是数组，我们要遍历出里面的vDom进行比较，这里就牵扯到上文中的key，在有key时，我们优先用key来获取vDom，所以，我们首先遍历数组，将其转为map(这里先用object代替，以后会更改成es6的map)，如果有key值的，就用key值作标识，无key的，就用index。

下面是array到map的代码：
```js

// 将children数组转化为map
export function arrayToMap(array) {
  array = array || []
  const childMap = {}

  array.forEach((item, index) => {
    const name = item && item._vDom && item._vDom.key ? item._vDom.key : index.toString(36)
    childMap[name] = item
  })
  return childMap
}
```

部分diff方法:
```js
// 将之前子节点的component数组转化为map
const prevChildComponents = arrayToMap(this._renderedChildComponents)
// 生成新的子节点的component对象集合
const nextChildComponents = generateComponentsMap(prevChildComponents, nextChildVDoms)
```

将ReactComponent数组转化为map后，用老的ReactComponents集合和新vDoms数组生成新的ReactComponents集合，这里会使用shouldUpdateReactComponent进行component diff，如果相同，则直接更新即可，反之，就重新生成ReactComponent
```js
/**
 * 用来生成子节点的component
 * 如果是更新，就会继续使用以前的component，调用对应的updateComponent
 * 如果是新的节点，就会重新生成一个新的componentInstance
 */
function generateComponentsMap(prevChildComponents, nextChildVDoms = []) {
  const nextChildComponents = {}

  nextChildVDoms.forEach((item, index) => {
    const name = item.key ? item.key : index.toString(36)
    const prevChildComponent = prevChildComponents && prevChildComponents[name]

    const prevVdom = prevChildComponent && prevChildComponent._vDom
    const nextVdom = item

    // 判断是更新还是重新渲染
    if (shouldUpdateReactComponent(prevVdom, nextVdom)) {
      // 更新的话直接递归调用子节点的updateComponent
      prevChildComponent.updateComponent(nextVdom)
      nextChildComponents[name] = prevChildComponent
    } else {
      // 重新渲染的话重新生成component
      const nextChildComponent = instantiateReactComponent(nextVdom)
      nextChildComponents[name] = nextChildComponent
    }
  })
  return nextChildComponents
}
```

经历了以上两步，我们已经获得了新旧同层级的ReactComponents集合。需要做的，只是遍历这两个集合，进行比较，同属性的更新一样，进行移动，新增，和删除，当然，在这个过程中，我会包含我们的第三种优化，element diff。它的策略是这样的：首先对新集合的节点进行循环遍历，通过唯一标识可以判断新老集合中是否存在相同的节点，如果存在相同节点，则进行移动操作，但在移动前需要将当前节点在老集合中的位置与 lastIndex 进行比较，if (prevChildComponent._mountIndex < lastIndex)，则进行节点移动操作，否则不执行该操作。这是一种顺序优化手段，lastIndex 一直在更新，表示访问过的节点在老集合中最右的位置（即最大的位置），如果新集合中当前访问的节点比 lastIndex 大，说明当前访问节点在老集合中就比上一个节点位置靠后，则该节点不会影响其他节点的位置，因此不用添加到差异队列中，即不执行移动操作，只有当访问的节点比 lastIndex 小时，才需要进行移动操作。

上完整的diff方法代码：
```js
// 差异更新的几种类型
const UPDATE_TYPES = {
  MOVE_EXISTING: 1,
  REMOVE_NODE: 2,
  INSERT_MARKUP: 3
}

   // 追踪差异
  _diff(diffQueue, nextChildVDoms) {
    // 将之前子节点的component数组转化为map
    const prevChildComponents = arrayToMap(this._renderedChildComponents)
    // 生成新的子节点的component对象集合
    const nextChildComponents = generateComponentsMap(prevChildComponents, nextChildVDoms)

    // 重新复制_renderChildComponents
    this._renderedChildComponents = []
    for (let name in nextChildComponents) {
      nextChildComponents.hasOwnProperty(name) && this._renderedChildComponents.push(nextChildComponents[name])
    }

    let lastIndex = 0 // 代表访问的最后一次老的集合位置
    let nextIndex = 0 // 代表到达的新的节点的index

    // 通过对比两个集合的差异，将差异节点添加到队列中
    for (let name in nextChildComponents) {
      if (!nextChildComponents.hasOwnProperty(name)) continue

      const prevChildComponent = prevChildComponents && prevChildComponents[name]
      const nextChildComponent = nextChildComponents[name]

      // 相同的话，说明是使用的同一个component，需要移动
      if (prevChildComponent === nextChildComponent) {
        // 添加差异对象，类型：MOVE_EXISTING
        prevChildComponent._mountIndex < lastIndex && diffQueue.push({
          parentId: this._rootNodeId,
          parentNode: $(`[data-reactid="${this._rootNodeId}"]`),
          type: UPDATE_TYPES.MOVE_EXISTING,
          fromIndex: prevChildComponent._mountIndex,
          toIndex: nextIndex
        })

        lastIndex = Math.max(prevChildComponent._mountIndex, lastIndex)
      } else {
        // 如果不相同，说明是新增的节点
        // 如果老的component在，需要把老的component删除
        if (prevChildComponent) {
          diffQueue.push({
            parentId: this._rootNodeId,
            parentNode: $(`[data-reactid="${this._rootNodeId}"]`),
            type: UPDATE_TYPES.REMOVE_NODE,
            fromIndex: prevChildComponent._mountIndex,
            toIndex: null
          })

          // 去掉事件监听
          if (prevChildComponent._rootNodeId) {
            $(document).undelegate(`.${prevChildComponent._rootNodeId}`)
          }

          lastIndex = Math.max(prevChildComponent._mountIndex, lastIndex)
        }

        // 新增加的节点
        diffQueue.push({
          parentId: this._rootNodeId,
          parentNode: $(`[data-reactid="${this._rootNodeId}"]`),
          type: UPDATE_TYPES.INSERT_MARKUP,
          fromIndex: null,
          toIndex: nextIndex,
          markup: nextChildComponent.mountComponent(`${this._rootNodeId}.${name}`)
        })
      }

      // 更新_mountIndex
      nextChildComponent._mountIndex = nextIndex
      nextIndex++
    }

    // 对于老的节点里有，新的节点里没有的，全部删除
    for (let name in prevChildComponents) {
      const prevChildComponent = prevChildComponents[name]

      if (prevChildComponents.hasOwnProperty(name) && !(nextChildComponents && nextChildComponents.hasOwnProperty(name))) {
        diffQueue.push({
          parentId: this._rootNodeId,
          parentNode: $(`[data-reactid="${this._rootNodeId}"]`),
          type: UPDATE_TYPES.REMOVE_NODE,
          fromIndex: prevChildComponent._mountIndex,
          toIndex: null
        })

        // 如果渲染过，去掉事件监听
        if (prevChildComponent._rootNodeId) {
          $(document).undelegate(`.${prevChildComponent._rootNodeId}`)
        }
      }
    }
  }
//  代码地址：src/react/component/ReactDomCompoent.js
```

调用diff方法后，会回到tree diff那一步，当一整棵树遍历完后，就需要通过Patch将更新的内容渲染出来了，patch方法相对比较简单，由于我们把更新的内容都放入了diffQueue中，只要遍历这个数组，根据不同的类型进行相应的操作就行。

```js
  // 渲染
  _patch(updates) {
    // 处理移动和删除的
    updates.forEach(({ type, fromIndex, toIndex, parentNode, parentId, markup }) => {
      const updatedChild = $(parentNode.children().get(fromIndex))

      switch (type) {
        case UPDATE_TYPES.INSERT_MARKUP:
          insertChildAt(parentNode, $(markup), toIndex) // 插入
          break
        case UPDATE_TYPES.MOVE_EXISTING:
          deleteChild(updatedChild) // 删除
          insertChildAt(parentNode, updatedChild, toIndex)
          break
        case UPDATE_TYPES.REMOVE_NODE:
          deleteChild(updatedChild)
          break
        default:
          break
      }
    })
  }
// 代码地址：src/react/component/ReactDomComponent.js
```

### 总结
总结下更新：
- **ReactCompositeComponent**：负责调用生命周期，通过component diff将更新都交给了子ReactComponet
- **ReactTextComponent**：直接更新内容
- **ReactDomComponent**：先更新props，在更新children，更新children分为三步，tree diff保证同层级比较，使用- shouldUpdateReactComponent进行component diff,最后在element diff通过lastIndex顺序优化

## 仓库
[仓库地址](https://github.com/Jingce-lu/lu-react)