# 从0实现一个tiny react
<!-- TOC -->

- [从0实现一个tiny react](#从0实现一个tiny-react)
  - [从0实现一个tiny react(一)](#从0实现一个tiny-react一)
    - [支持JSX](#支持JSX)
    - [渲染](#渲染)
      - [总结一下：](#总结一下)
    - [props 和 state](#props-和-state)
      - [总结一下：](#总结一下-1)
  - [从0实现一个tiny react（二）](#从0实现一个tiny-react二)
    - [复用DOM](#复用DOM)
      - [更新属性](#更新属性)
      - [操作子节点](#操作子节点)
      - [复用子节点 - **key**](#复用子节点---key)
    - [总结](#总结)
  - [从0实现一个tiny react（三）生命周期](#从0实现一个tiny-react三生命周期)
    - [复用组件实例](#复用组件实例)
    - [生命周期](#生命周期)
      - [componentWillMount, componentDidMount, componentDidUpdate](#componentWillMount-componentDidMount-componentDidUpdate)
      - [componentWillReceiveProps， shouldComponentUpdate， componentWillUpdate](#componentWillReceiveProps-shouldComponentUpdate-componentWillUpdate)
      - [componentWillUnmount](#componentWillUnmount)
    - [其他](#其他)

<!-- /TOC -->

## 从0实现一个tiny react(一)

### 支持JSX
react组件可以完全不用JSX， 用纯js来写。 JSX语法经过babel转化就是纯js代码， 譬如：
```js
const hw = <div>Hello World</div>

const hw = React.createElement('div', null, "Hello World")
```

这两种是等效的。 babel 通过[babylon](https://github.com/babel/babylon) 来把JSX转化为js

配置如下([transform-react-jsx](http://babeljs.io/docs/plugins/transform-react-jsx/))：
```js
{
  "presets": [
    "es2015"
  ],
  "plugins": [
    ["transform-react-jsx", {
      "pragma":  "createElement" // default pragma is React.createElement
    }]
  ]
}
```

所以对于react库本身的， 是不需要关心jsx语法的

### 渲染
react 中`virtual-dom`的概念， 使用一个 js的结构vnode来描述DOM 节点。 然后， 从vnode渲染出DOM树。 

这个 vnode由3个属性描述：`nodeName(div, Son...)`, `props`, `children(vnode 组成的数组)`, 所以 `createElement`的最简实现
```js
function createElement(type, props, ...args) {
    let children = []
    for(let i = 0; i< args.length;i++){
        if(args[i] instanceof Array) {
            children = children.concat(args[i])
        } else {
            children.push(args[i])
        }
    }
    return {
        nodeName: type,
        props: props || {},
        children
    }
}
```

从vnode 怎么渲染到dom? 先想一下我们在react里面书写下面的组件的时候
```js
class Father extends Component {
    render() {
        return (<Son/>) // React.createElement(Son)  --> {nodeName: Son, props:{}, children:[]}
    }
}

class Son extends Component {
    render() {
        return (<Grandson/>) // React.createElement(Grandson) --> {nodeName: Grandson, props:{}, children:[]}
    }
}

/**
*React.createElement(
*                "div",
*                null,
*                "i",
*                React.createElement(
*                    "div",
*                    null,
*                    "am"
*                ),
*                React.createElement(GrandText, null)
*            );
*/
class Grandson extends Component { 
    render() {
        return (
            <div>
                i
                <div>am</div>
                <GrandText/>
            </div>
        ) 
    }
}

class GrandText extends  Component {
    render() {
        return (
            <div>grandson</div> // React.createElement(Grandson) 
        )
    }
}


render(<Father/>, document.getElementById('root'))
```

在react里， 最终渲染出来的就是一个i am grandson。

渲染的过程就是: `渲染Father的Vnode` -> `渲染Son的Vnode` -> `渲染Grandson的Vnode` ->` 渲染div` -> `渲染i` -> `渲染<div>am</div>` -> `渲染GrandText`。

显然这是一个`递归`的过程：**递归的中止条件是 渲染html标签**。
1. 当 nodeName 是 html标签， 直接操作dom
2. 当 nodeName 是 react组件 递归操作 组件render返回的vnode

暂时先不考虑 dom操作， 只考虑这个递归方法， 代码如下：
```js
function renderVDOM(vnode) {
    if(typeof vnode == "string") { // 字符串 "i an grandson"
        return vnode
    } else if(typeof vnode.nodeName == "string") {
        let result = {
            nodeName: vnode.nodeName,
            props: vnode.props,
            children: []
        }
        for(let i = 0; i < vnode.children.length; i++) {   
            result.children.push(renderVDOM(vnode.children[i]))
        }
        return result
    } else if (typeof vnode.nodeName == "function") { // 如果是function
        let func = vnode.nodeName
        let inst = new func(vnode.props)
        let innerVnode = inst.render()
        return renderVDOM(innerVnode)
    }
}
```

执行上面的结构将返回
```js
{
    "nodeName": "div",
    "props": {},
    "children": ["i", {"nodeName": "div", "props": {}, "children": ["am"]}, {
        "nodeName": "div",
        "props": {},
        "children": ["grandson"]
    }]
}
```

加入实际DOM操作， 代码如下：
```js
function render(vnode, parent) {
    let dom
    if(typeof vnode == "string") {
        dom = document.createTextNode(vnode)
        parent.appendChild(dom)
    } else if(typeof vnode.nodeName == "string") {
        dom = document.createElement(vnode.nodeName)
        setAttrs(dom, vnode.props)
        parent.appendChild(dom)

        for(let i = 0; i < vnode.children.length; i++) {
            render(vnode.children[i], dom)
        }
    } else if (typeof vnode.nodeName == "function") {
        let func = vnode.nodeName
        
        let inst = new func(vnode.props)
        let innerVnode = inst.render()
        render(innerVnode, parent)
    }
}
function setAttrs(dom, props) {
    const allKeys = Object.keys(props)
    allKeys.forEach(k => {
        const v = props[k]

        if(k == "className") {
            dom.setAttribute("class", v)
            return
        }

        if(k == "style") {
            if(typeof v == "string") {
                dom.style.cssText = v
            }

            if(typeof v == "object") {
                for (let i in v) {
                    dom.style[i] =  v[i]
                }
            }
            return

        }

        if(k[0] == "o" && k[1] == "n") {
            const capture = (k.indexOf("Capture") != -1)
            dom.addEventListener(k.substring(2).toLowerCase(), v, capture)
            return
        }

        dom.setAttribute(k, v)
    })
}
```

#### 总结一下：
1. createElement 方法负责创建 vnode
2. render 方法负责根据生成的vnode， 渲染到实际的dom的一个递归方法 (由于组件 最终一定会render html的标签。 所以这个递归一定是能够正常返回的)
    - vnode是字符串的是， 创建textNode节点
    - 当vnode.nodeName是 字符串的时候， 创建dom节点， 根据props设置节点属性， 遍历render children
    - 当vnode.nodeName是 function的时候， 获取render方法的返回值 vnode'， 执行render(vnode')


### props 和 state
`v = f(props, state)`。 组件的渲染结果由 `render方法`，` props`， `state`共同决定，之前只是讨论了render， 现在引入 props， state。

对于`props`， 父组件传递过来， 不可变。 设置到属性上面。 由基类Component 设置props
```js
class Component {
    constructor(props) {
        this.props = props
    }
}
```

对于 `state`, 在组件的生命期内是可以修改的，当调用组件的`setState`方法的时候, **其实就是重新渲染 用一个新DOM树替换老的DOM**:
```js
parent.replaceChild (newdom, olddom )
```

比如当我在 GrandText 上调用setState。 就是父div 把GrandText渲染出来的dom 替换一下。   
所以
  1. 组件实例 必须有机制获取到 olddom
  2. 同时 render方法的第二个参数是 parent。 组件实例必须有机制获取到 parentDOM

这2个问题其实是一个问题。 `parent = olddom.parentNode`, 所以 `olddom.parentNode.replaceChild (newdom, olddom )` 。 现在的关键就是获取到olddom，

这里采用的机制是 每个组件实例 记住 直接渲染出的组件实例／DOM（通过__rendered属性）。 下图：

<div align="center"><img src="../../resource/assets/react/041401.png" /></div>

代码实现：
```js
function render (vnode, parent, comp) {
    let dom
    if(typeof vnode == "string") {
        const dom = ...  // 创建文本节点
        comp && (comp.__rendered = dom)
        ...  // other op
    } else if(typeof vnode.nodeName == "string") {
        const dom = ... // 创建 dom节点
        comp && (comp.__rendered = dom)
        ... // other op
    } else if (typeof vnode.nodeName == "function") {
        const inst = ... // 创建 组件实例
        comp && (comp.__rendered = inst)
        ... // other op
    }
}
```

其中 `comp` 参数代表 "`我是被谁渲染的`"。 获取olddom的代码实现：
```js
function getDOM(comp) {
    let rendered = comp.__rendered
    while (rendered instanceof Component) { //判断对象是否是dom
        rendered = rendered.__rendered
    }
    return rendered
}
```

调用 setState 使用olddom替换老的dom 代码如下：
```js
function render(vnode, parent, comp, olddom) {
    let dom
    if(typeof vnode == "string") {
        ...
        if(olddom) {
            parent.replaceChild(dom, olddom)
        } else {
            parent.appendChild(dom)
        }
        ...
    } else if(typeof vnode.nodeName == "string") {
        ...
        if(olddom) {
            parent.replaceChild(dom, olddom)
        } else {
            parent.appendChild(dom)
        }
        ...
    } else if (typeof vnode.nodeName == "function") {
        ...
        render(innerVnode, parent, inst, olddom)
    }
}
```

拼凑一下以上功能， 完整代码实现：
```js
///Component
class Component {
    constructor(props) {
        this.props = props
    }

    setState(state) {
        setTimeout(() => {
            this.state = state
            const vnode = this.render()
            let olddom = getDOM(this)
            render(vnode, olddom.parentNode, this, olddom)
        }, 0)
    }
}


function getDOM(comp) {
    let rendered = comp.__rendered
    while (rendered instanceof Component) { //判断对象是否是dom
        rendered = rendered.__rendered
    }
    return rendered
}

///render
function render (vnode, parent, comp, olddom) {
    let dom
    if(typeof vnode == "string" || typeof vnode == "number") {
        dom = document.createTextNode(vnode)
        comp && (comp.__rendered = dom)
        parent.appendChild(dom)

        if(olddom) {
            parent.replaceChild(dom, olddom)
        } else {
            parent.appendChild(dom)
        }
    } else if(typeof vnode.nodeName == "string") {
        dom = document.createElement(vnode.nodeName)

        comp && (comp.__rendered = dom)
        setAttrs(dom, vnode.props)

        if(olddom) {
            parent.replaceChild(dom, olddom)
        } else {
            parent.appendChild(dom)
        }

        for(let i = 0; i < vnode.children.length; i++) {
            render(vnode.children[i], dom, null, null)
        }
    } else if (typeof vnode.nodeName == "function") {
        let func = vnode.nodeName
        let inst = new func(vnode.props)

        comp && (comp.__rendered = inst)

        let innerVnode = inst.render(inst)
        render(innerVnode, parent, inst, olddom)
    }
}
```

#### 总结一下： 
render方法负责把vnode渲染到实际的DOM， 如果组件渲染的DOM已经存在， 就替换， 并且保持一个 __rendered的引用链


## 从0实现一个tiny react（二）
ui = f(d)！ 这是react考虑ui的方式，开发者可以把重心放到d 数据上面来了。 从开发者的角度来讲 d一旦改变，react将会把ui重新渲染，使其再次满足
ui = f(d), 开发者没有任何dom操作， 交给react就好！！

怎么重新渲染呢？ (一)文 中我们实现了一种方式， state改变的时候，用新的dom树替换一下老的dom树， 这是完全可行的。

```js
class AppWithNoVDOM extends Component {
    constructor(props) {
        super(props)
    }

    testApp3() {
        let result = []
        for(let i = 0; i < 10000 ; i++) {
            result.push(<div style={{
                width: '30px',
                color: 'red',
                fontSize: '12px',
                fontWeight: 600,
                height: '20px',
                textAlign: 'center',
                margin:'5px',
                padding: '5px',
                border:'1px solid red',
                position: 'relative',
                left: '10px',
                top: '10px',
            }} title={i} >{i}</div>)
        }
        return result
    }

    render() {
        return (
            <div
                width={100}>
                <a  onClick={e => {
                    this.setState({})
                }}>click me</a>
                {this.testApp3()}
            </div>
        )
    }
}

const startTime = new Date().getTime()
render(<App/>, document.getElementById("root"))
console.log("duration:", new Date().getTime() - startTime)


...
setState(state) {
    setTimeout(() => {
        this.state = state
        const vnode = this.render()
        let olddom = getDOM(this)
        const startTime = new Date().getTime()
        render(vnode, olddom.parentNode, this, olddom)
        console.log("duration:", new Date().getTime() - startTime)
    }, 0)
}
...

```

我们在 render, setState 设置下时间点。 在10000万个div的情况下， 第一次render和setState触发的render 耗时大概在180ms （可能跟机器配置有关）
当点击的时候， 由于调用`this.setState({})`, 页面将会重新渲染， 再次建立10000万个div， 但是实际上这里的DOM一点也没改。
应用越复杂， 无用功越多，卡顿越明显

为了解决这个问题， react提出了virtual-dom的概念：vnode(纯js对象) '代表' dom， 在渲染之前， 先比较出oldvnode和newvode的 区别。 然后增量的
更新dom。 virtual-dom 使得ui=f(d) 得以在实际项目上使用。 
（注意： virtual-dom 并不会加快应用速度， 只是让应用在不直接操作dom的情况下，通过暴力的比较，增量更新 让应用没有那么慢）

如何增量更新呢？

### 复用DOM
回想一下, 在  render函数 里面对于每一个判定为 dom类型的VDOM， 是直接创建一个新的DOM：
```javascript 1.7
...
else if(typeof vnode.nodeName == "string") {
    dom = document.createElement(vnode.nodeName)
    ...
} 
...
```

一定要创建一个  新的DOM 结构吗？<br/>
考虑这种情况：假如一个组件， 初次渲染为 renderBefore， 调用setState再次渲染为 renderAfter  调用setState再再次渲染为 renderAfterAfter。 VNODE如下
```javascript 1.7
const renderBefore = {
    tagName: 'div',
    props: {
        width: '20px',
        className: 'xx'
    },
    children:[vnode1, vnode2, vnode3]
}
const renderAfter = {
    tagName: 'div',
    props: {
        width: '30px',
        title: 'yy'
    },
    children:[vnode1, vnode2]
}
const renderAfterAfter = {
    tagName: 'span',
    props: {
        className: 'xx'
    },
    children:[vnode1, vnode2, vnode3]
}
```
renderBefore 和renderAfter 都是div， 只不过props和children有部分区别，那我们是不是可以通过修改DOM属性， 修改DOM子节点，把 rederBefore 变化为renderAfter呢？， 这样就避开了DOM创建。 而 renderAfter和renderAfterAfter
属于不同的DOM类型， 浏览器还没提供修改DOM类型的Api，是无法复用的， 是一定要创建新的DOM的。

原则如下： 
  * 不同元素类型是无法复用的， span 是无法变成 div的。  
  * 对于相同元素: 
     * 更新属性， 
     * 复用子节点。

所以，现在的代码可能是这样的：
```javascript 1.7
...
else if(typeof vnode.nodeName == "string") {
    if(!olddom || olddom.nodeName != vnode.nodeName.toUpperCase()) {
        createNewDom(vnode, parent, comp, olddom)
    } else {
        diffDOM(vnode, parent, comp, olddom) // 包括 更新属性， 子节点复用
    }
}
...
``` 

#### 更新属性
对于 renderBefore => renderAfter 。 属性部分需要做3件事情。 
1. renderBefore 和 renderAfter 的属性交集  如果值不同， 更新值 updateAttr
2. renderBefore 和 renderAfter 的属性差集  置空  removeAttr
3. renderAfter 和 renderBefore 的属性差集  设置新值 setAttr
```javascript 1.7
const {onlyInLeft, bothIn, onlyInRight} = diffObject(newProps, oldProps)
setAttrs(olddom, onlyInLeft)
removeAttrs(olddom, onlyInRight)
diffAttrs(olddom, bothIn.left, bothIn.right)

function diffObject(leftProps, rightProps) {
    const onlyInLeft = {}
    const bothLeft = {}
    const bothRight = {}
    const onlyInRight = {}

    for(let key in leftProps) {
        if(rightProps[key] === undefined) {
            onlyInLeft[key] = leftProps[key]
        } else {
            bothLeft[key] = leftProps[key]
            bothRight[key] = rightProps[key]
        }
    }

    for(let key in rightProps) {
        if(leftProps[key] === undefined) {
            onlyInRight[key] = rightProps[key]
        }
    }

    return {
        onlyInRight,
        onlyInLeft,
        bothIn: {
            left: bothLeft,
            right: bothRight
        }
    }
}

function setAttrs(dom, props) {
    const allKeys = Object.keys(props)
    allKeys.forEach(k => {
        const v = props[k]

        if(k == "className") {
            dom.setAttribute("class", v)
            return
        }

        if(k == "style") {
            if(typeof v == "string") {
                dom.style.cssText = v //IE
            }

            if(typeof v == "object") {
                for (let i in v) {
                    dom.style[i] =  v[i]
                }
            }
            return

        }

        if(k[0] == "o" && k[1] == "n") {
            const capture = (k.indexOf("Capture") != -1)
            dom.addEventListener(k.substring(2).toLowerCase(), v, capture)
            return
        }

        dom.setAttribute(k, v)
    })
}

function removeAttrs(dom, props) {
    for(let k in props) {
        if(k == "className") {
            dom.removeAttribute("class")
            continue
        }

        if(k == "style") {
            dom.style.cssText = "" //IE
            continue
        }


        if(k[0] == "o" && k[1] == "n") {
            const capture = (k.indexOf("Capture") != -1)
            const v = props[k]
            dom.removeEventListener(k.substring(2).toLowerCase(), v, capture)
            continue
        }

        dom.removeAttribute(k)
    }
}

/**
 *  调用者保证newProps 与 oldProps 的keys是相同的
 * @param dom
 * @param newProps
 * @param oldProps
 */
function diffAttrs(dom, newProps, oldProps) {
    for(let k in newProps) {
        let v = newProps[k]
        let ov = oldProps[k]
        if(v === ov) continue

        if(k == "className") {
            dom.setAttribute("class", v)
            continue
        }

        if(k == "style") {
            if(typeof v == "string") {
                dom.style.cssText = v
            } else if( typeof v == "object" && typeof ov == "object") {
                for(let vk in v) {
                    if(v[vk] !== ov[vk]) {
                        dom.style[vk] = v[vk]
                    }
                }

                for(let ovk in ov) {
                    if(v[ovk] === undefined){
                        dom.style[ovk] = ""
                    }
                }
            } else {  //typeof v == "object" && typeof ov == "string"
                dom.style = {}
                for(let vk in v) {
                    dom.style[vk] = v[vk]
                }
            }
            continue
        }

        if(k[0] == "o" && k[1] == "n") {
            const capture = (k.indexOf("Capture") != -1)
            let eventKey = k.substring(2).toLowerCase()
            dom.removeEventListener(eventKey, ov, capture)
            dom.addEventListener(eventKey, v, capture)
            continue
        }

        dom.setAttribute(k, v)
    }
}
```
'新'的dom结构 属性和  renderAfter对应了。<br/>
但是 children部分 还是之前的
#### 操作子节点
之前 操作子节点的代码： 
```javascript 1.7
for(let i = 0; i < vnode.children.length; i++) {
    render(vnode.children[i], dom, null, null)
}
```
render 的第3个参数comp '谁渲染了我'， 第4个参数olddom '之前的旧dom元素'。现在复用旧的dom， 所以第4个参数可能是有值的 代码如下： 
```javascript 1.7
let olddomChild = olddom.firstChild
for(let i = 0; i < vnode.children.length; i++) {
    render(vnode.children[i], olddom, null, olddomChild)
    olddomChild = olddomChild && olddomChild.nextSibling
}

//删除多余的子节点
while (olddomChild) {
    let next = olddomChild.nextSibling
    olddom.removeChild(olddomChild)
    olddomChild = next
}
```

综上所述  完整的diffDOM 如下：
```javascript 1.7
function diffDOM(vnode, parent, comp, olddom) {
    const {onlyInLeft, bothIn, onlyInRight} = diffObject(vnode.props, olddom.__vnode.props)
    setAttrs(olddom, onlyInLeft)
    removeAttrs(olddom, onlyInRight)
    diffAttrs(olddom, bothIn.left, bothIn.right)


    let olddomChild = olddom.firstChild
    for(let i = 0; i < vnode.children.length; i++) {
        render(vnode.children[i], olddom, null, olddomChild)
        olddomChild = olddomChild && olddomChild.nextSibling
    }

    while (olddomChild) { //删除多余的子节点
        let next = olddomChild.nextSibling
        olddom.removeChild(olddomChild)
        olddomChild = next
    }
    olddom.__vnode = vnode  
}
```
由于需要在diffDOM的时候 从olddom获取 oldVNODE（即 diffObject(vnode.props, olddom.__vnode.props)）。 所以：
```javascript 1.7
// 在创建的时候
...
let dom = document.createElement(vnode.nodeName)
dom.__vnode = vnode
...


// diffDOM
...
const {onlyInLeft, bothIn, onlyInRight} = diffObject(vnode.props, olddom.__vnode.props)
...
olddom.__vnode = vnode  // 更新完之后， 需要把__vnode的指向 更新
...
```
另外 对于 TextNode的复用:
```javascript 1.7
...
if(typeof vnode == "string" || typeof vnode == "number") {
        if(olddom && olddom.splitText) {
            if(olddom.nodeValue !== vnode) {
                olddom.nodeValue = vnode
            }
        } else {
            dom = document.createTextNode(vnode)
            if(olddom) {
                parent.replaceChild(dom, olddom)
            } else {
                parent.appendChild(dom)
            }
        }
    }
...
```

重新 跑一下开头 的例子 setState后渲染时间变成了 20ms 左右。 从 180ms 到20ms 差不多快有一个数量级的差距了。 
到底快了多少，取决于前后结构的相似程度， 如果前后结构基本相同，diff是有意义的减少了DOM操作。

#### 复用子节点 - **key**
```javascript 1.7
初始渲染
...
render() {
    return (
        <div>
            <WeightCompA/>
            <WeightCompB/>
            <WeightCompC/>
        </div>
    )
}
...

setState再次渲染
...
render() {
    return (
        <div>
            <span>hi</span>
            <WeightCompA/>
            <WeightCompB/>
            <WeightCompC/>
        </div>
    )
}
...
```
我们之前的子节点复用顺序就是按照DOM顺序， 显然这里如果这样处理的话， 可能导致组件都复用不了。 针对这个问题， React是通过给每一个子组件提供一个 "key"属性来解决的
对于拥有 同样key的节点， 认为结构相同。 所以问题变成了：
```
f([{key: 'wca'}, {key: 'wcb}, {key: 'wcc}]) = [{key:'spanhi'}, {key: 'wca'}, {key: 'wcb}, {key: 'wcc}]
```
函数f 通过删除， 插入操作，把olddom的children顺序， 改为和 newProps里面的children一样 （按照key值一样）。类似与 [字符串距离](https://en.wikipedia.org/wiki/Edit_distance),

### 总结
通过 diff 比较渲染前后 DOM的差别来复用实际的， 我们的性能得到了提高。现在 render方法的描述： <br/>
render 方法是根据的vnode， 渲染到实际的dom，如果存在olddom会先尝试复用的 一个递归方法 (由于组件 最终一定会render html的标签。 所以这个递归一定是能够正常返回的)
   * vnode是字符串， 如果存在olddom， 且可以复用， 复用之。否则创建textNode节点
   * 当vnode.nodeName是 字符串的时候， 如果存在olddom， 且可以复用， 复用之。否则创建dom节点， 根据props设置节点属性， 遍历render children
   * 当vnode.nodeName是 function的时候， 获取render方法的返回值 vnode'， 执行render(vnode')


## 从0实现一个tiny react（三）生命周期
在给tinyreact加生命周期之前，先考虑 组件实例的复用 这个前置问题

### 复用组件实例
render函数 只能返回一个根
```jsx harmony
class A extends Component{
    render() {
        return (<B>...</B>)  
    }
}
class C extends Component {
    render() {
        return (
            <div>
               <C1>...</C1>
               <C2>...</C2>
               <C3>...</C3>
            </div>
        )
    }
}
```
所以 最终的组件树一定是类似这种的 (首字母大写的代表组件， div／span／a...代表原生DOM类型)

<div align="center"><img src="../../resource/assets/react/041402.png" /></div>

是绝对不可能 出现下图这种树结构 (与render函数返回单根的特性矛盾)

<div align="center"><img src="../../resource/assets/react/041403.png" /></div>

注意 __rendered引用 指向了一个inst／dom。 所以可以通过__rendered来复用实例。 
<br/>下面我们讨论怎么根据__rendered 复用inst

假如在 Father里面调用 setState？ 按照现在render 函数的做法:
```javascript 1.7
else if (typeof vnode.nodeName == "function") {
    let func = vnode.nodeName
    let inst = new func(vnode.props)
    ...
}
```

1. 新建 Son 实例
2. 新建 Grandson 实例
3. diff 渲染 div

再次setState呢? 好吧， 再来一次：
1. 新建 Son 实例
2. 新建 Grandson 实例
3. diff 渲染 div

第 3步 就是 (二) 讨论的内容， 会用"最少"的dom操作， 来更新dom到最新的状态。   
对于1， 2 每次setState的时候都会新建inst， 在这里是可以复用之前创建好的inst实例的。 

但是如果一个组件 初始渲染为 '\<A/\>', setState 之后渲染为 '\<B/\>' 这种情况呢？ 那inst就不能复用了， 类比一下 DOM 里的 div --> span
。 把render 第四个参数 old ---> olddomOrComp ， 通过这个参数来判断 dom 或者inst 是否可以复用：
```jsx harmony
//inst 是否可以复用
function render (vnode, parent, comp, olddomOrComp) {
    ...
    } else if(typeof vnode.nodeName === "string") {
        if(!olddomOrComp || olddomOrComp.nodeName !== vnode.nodeName.toUpperCase()) { // <--- dom 可以复用
             createNewDom(vnode, parent, comp, olddomOrComp, myIndex)
         }
    ...     
    } else if (typeof vnode.nodeName == "function") {
        let func = vnode.nodeName
        let inst
        if(olddomOrComp && olddomOrComp instanceof func) { // <--- inst 可以复用 
            inst = olddomOrComp
            olddomOrComp.props = vnode.props 
        }
        ....
        
        render(innerVnode, parent, inst, inst.__rendered)
```
这里 在最后的 render(innerVnode, parent, inst, olddom) 被改为了： render(innerVnode, parent, inst, inst.__rendered)。 这样是符合 olddomOrComp定义的。
但是 olddom 其实是有2个作用的
1. 判断dom是否可以复用
2. parent.replaceChild(dom, olddom), olddom确定了新的dom的位置
而 olddomOrComp 是做不到第二点。 即使： parent.replaceChild(dom, getDOM(olddomOrComp)) 也是不行的。 原因是：
假如初始 CompA --> <Sub1/>  setState后  CompA --> <Sub2/>， 那么inst 不可以复用， inst.__rendered 是undefined， 就从replaceChild变成了appendChild

怎么解决呢？ 引入第5个参数 myIndex: dom的位置问题都交给这个变量。 olddomOrComp只负责决定 复用的问题

so, 加入myIndex的代码如下： 
```javascript 1.7
/**
 * 替换新的Dom， 如果没有在最后插入
 * @param parent
 * @param newDom
 * @param myIndex
 */
function setNewDom(parent, newDom, myIndex) {
    const old =  parent.childNodes[myIndex]
    if (old) {
        parent.replaceChild(newDom, old)
    } else {
        parent.appendChild(newDom)
    }
}

function render(vnode, parent, comp, olddomOrComp, myIndex) {
    let dom
    if(typeof vnode === "string" || typeof vnode === "number" ) {
        ...
        } else {
           
            dom = document.createTextNode(vnode)
            setNewDom(parent, dom, myIndex)              // <--- 根据myIndex设置 dom
        }
    } else if(typeof vnode.nodeName === "string") {
        if(!olddomOrComp || olddomOrComp.nodeName !== vnode.nodeName.toUpperCase()) {
            createNewDom(vnode, parent, comp, olddomOrComp, myIndex)
        } else {
            diffDOM(vnode, parent, comp, olddomOrComp, myIndex)
        }
    } else if (typeof vnode.nodeName === "function") {
        ...
        let innerVnode = inst.render()
        render(innerVnode, parent, inst, inst.__rendered, myIndex) // <--- 传递 myIndex
    }
}

function createNewDom(vnode, parent, comp, olddomOrComp, myIndex) {
    ...
    setAttrs(dom, vnode.props)

    setNewDom(parent, dom, myIndex)         // <--- 根据myIndex设置 dom

    for(let i = 0; i < vnode.children.length; i++) {
        render(vnode.children[i], dom, null, null, i)  // <--- i 就是myIndex
    }
}

function diffDOM(vnode, parent, comp, olddom) {
    ...
    for(let i = 0; i < vnode.children.length; i++) {
        render(vnode.children[i], olddom, null, renderedArr[i], i)  // <--- i 就是myIndex
    }
    ...
}

```

重新考虑 Father里面调用 setState。 此时已经不会创建新实例了。

那么 假如现在对 Grandson调用setState呢？ 很不幸， 我们需要创建Granssonson1, Granssonson2, Granssonson3， 调用几次， 我们就得跟着新建几次。 
上面的复用方式 并没有解决这个问题, 之前 __rendered 引用链 到 dom就结束了。
<br/>把__rendered这条链 完善吧！！

首先 对__rendered 重新定义如下:
1. 当X 是组件实例的时候， __rendered 为X渲染出的 组件实例 或者 dom元素
2. 当X 是dom元素的时候， __rendered 为一个数组， 是X的子组件实例 或者 子dom元素
```
Father --__rendered--> Son  --__rendered--> Grandson --__rendered--> div --__rendered--> [Granssonson1,  Granssonson2, Granssonson3,]
```

在dom 下创建 "直接子节点" 的时候。 需要把这个纪录到dom.__rendered 数组中。 或者说， 如果新建的一个dom元素／组件实例  是dom的 "直接子节点"， 那么需要把它纪录到
parent.__rendered 数组中。 那怎么判断 创建出来的是 "直接子节点" 呢？ 答案是render 第3个参数 comp为null的， 很好理解， comp的意思是 "谁渲染了我"
很明显， 只有 dom下的 "直接子节点" comp才是null， 其他的情况， comp肯定不是null， 比如 Son的comp是Father， Gsss1
的comp是Grandsonson1。。。

并且当setState重新渲染的时候， 如果老的dom／inst没有被复用， 则应该用新的dom／inst 替换
<br/> 
1. 创建dom的时候。
```javascript 1.7
function createNewDom(vnode, parent, comp, olddomOrComp, myIndex) {
    ...
    if (comp) {
        comp.__rendered = dom
    } else {
        parent.__rendered[myIndex] = dom
    }
    ...
}
```
2. 组件实例
```javascript 1.7
else if (typeof vnode.nodeName == "function") {
    ...
    if(olddomOrComp && olddomOrComp instanceof func) {
        inst = olddomOrComp
    } else {
        inst = new func(vnode.props)

        if (comp) {
            comp.__rendered = inst
        } else {
            parent.__rendered[myIndex] = inst
        }
    }
    ...
}
```
3. diffDOM 的时候： a. remove多余的节点； b. render子节点的时候olddomOrComp = olddom.__rendered[i]
```javascript 1.7
function diffDOM(vnode, parent, comp, olddom) {
    ...
    olddom.__rendered.slice(vnode.children.length)  // <--- 移除多余 子节点
        .forEach(element => {
            olddom.removeChild(getDOM(element))
        })

    olddom.__rendered = olddom.__rendered.slice(0, vnode.children.length)
    for(let i = 0; i < vnode.children.length; i++) {
        render(vnode.children[i], olddom, null, olddom.__rendered[i], i)
    }
    olddom.__vnode = vnode
}
```

所以完整的代码：
```jsx harmony
function render(vnode, parent, comp, olddomOrComp, myIndex) {
    let dom
    if(typeof vnode === "string" || typeof vnode === "number" ) {
        if(olddomOrComp && olddomOrComp.splitText) {
            if(olddomOrComp.nodeValue !== vnode) {
                olddomOrComp.nodeValue = vnode
            }
        } else {
            dom = document.createTextNode(vnode)
            parent.__rendered[myIndex] = dom //comp 一定是null

            setNewDom(parent, dom, myIndex) 
        }
    } else if(typeof vnode.nodeName === "string") {
        if(!olddomOrComp || olddomOrComp.nodeName !== vnode.nodeName.toUpperCase()) {
            createNewDom(vnode, parent, comp, olddomOrComp, myIndex)
        } else {
            diffDOM(vnode, parent, comp, olddomOrComp)
        }
    } else if (typeof vnode.nodeName === "function") {
        let func = vnode.nodeName
        let inst
        if(olddomOrComp && olddomOrComp instanceof func) {
            inst = olddomOrComp
            inst.props = vnode.props
        } else {
            inst = new func(vnode.props)

            if (comp) {
                comp.__rendered = inst
            } else {
                parent.__rendered[myIndex] = inst    
            }
        }

        let innerVnode = inst.render()
        render(innerVnode, parent, inst, inst.__rendered, myIndex)
    }
}

function createNewDom(vnode, parent, comp, olddomOrComp, myIndex) {
    let dom = document.createElement(vnode.nodeName)

    dom.__rendered = []  // 创建dom的 设置 __rendered 引用
    dom.__vnode = vnode

    if (comp) {
        comp.__rendered = dom
    } else {
        parent.__rendered[myIndex] = dom
    }

    setAttrs(dom, vnode.props)

    setNewDom(parent, dom, myIndex) 
            
    for(let i = 0; i < vnode.children.length; i++) {
        render(vnode.children[i], dom, null, null, i)
    }
}

function diffDOM(vnode, parent, comp, olddom) {
    const {onlyInLeft, bothIn, onlyInRight} = diffObject(vnode.props, olddom.__vnode.props)
    setAttrs(olddom, onlyInLeft)
    removeAttrs(olddom, onlyInRight)
    diffAttrs(olddom, bothIn.left, bothIn.right)


    olddom.__rendered.slice(vnode.children.length)
        .forEach(element => {
            olddom.removeChild(getDOM(element))
        })

    const __renderedArr = olddom.__rendered.slice(0, vnode.children.length)
    olddom.__rendered = __renderedArr
    for(let i = 0; i < vnode.children.length; i++) {
        render(vnode.children[i], olddom, null, __renderedArr[i], i) 
    }
    olddom.__vnode = vnode
}

class Component {
    constructor(props) {
        this.props = props
    }

    setState(state) {
        setTimeout(() => {
            this.state = state

          
            const vnode = this.render()
            let olddom = getDOM(this)
            const myIndex = getDOMIndex(olddom)
            render(vnode, olddom.parentNode, this, this.__rendered, myIndex)
        }, 0)
    }
}
function getDOMIndex(dom) {
    const cn = dom.parentNode.childNodes
    for(let i= 0; i < cn.length; i++) {
        if (cn[i] === dom ) {
            return i
        }
    }
}
```

<div align="center"><img src="../../resource/assets/react/041404.png" /></div>

现在 __rendered链 完善了， setState触发的渲染, 都会先去尝试复用 组件实例。

### 生命周期
前面讨论的__rendered 和生命周期有 什么关系呢？ 生命周期是组件实例的生命周期， 之前的工作起码保证了一点: constructor 只会被调用一次了吧。。。
后面讨论的生命周期 都是基于 "组件实例"的 复用才有意义。tinyreact 将实现以下的生命周期：

1. componentWillMount
2. componentDidMount
3. componentWillReceiveProps
4. shouldComponentUpdate
5. componentWillUpdate
6. componentDidUpdate
7. componentWillUnmount
他们 和 react同名函数 含义相同

#### componentWillMount, componentDidMount, componentDidUpdate
这三个生命周期 是如此之简单： componentWillMount紧接着 创建实例的时候调用； 渲染完成之后，如果
组件是新建的componentDidMount ， 否则：componentDidUpdate
```jsx harmony
else if (typeof vnode.nodeName === "function") {
        let func = vnode.nodeName
        let inst
        if(olddomOrComp && olddomOrComp instanceof func) {
            inst = olddomOrComp
            inst.props = vnode.props
        } else {
            inst = new func(vnode.props)
            inst.componentWillMount && inst.componentWillMount()


            if (comp) {
                comp.__rendered = inst
            } else {
                parent.__rendered[myIndex] = inst
            }
        }

        let innerVnode = inst.render()
        render(innerVnode, parent, inst, inst.__rendered, myIndex)

        if(olddomOrComp && olddomOrComp instanceof func) {
            inst.componentDidUpdate && inst.componentDidUpdate()
        } else {
            inst.componentDidMount && inst.componentDidMount()
        }
    }
```

#### componentWillReceiveProps， shouldComponentUpdate， componentWillUpdate
当组件 获取新的props的时候， 会调用componentWillReceiveProps， 参数为newProps， 并且在这个方法内部this.props 还是值向oldProps,
由于  props的改变 由 只能由 父组件 触发。 所以只用在 render函数里面处理就ok。不过 要在 inst.props = vnode.props 之前调用componentWillReceiveProps:
```jsx harmony
else if (typeof vnode.nodeName === "function") {
        let func = vnode.nodeName
        let inst
        if(olddomOrComp && olddomOrComp instanceof func) {
            inst = olddomOrComp
            inst.componentWillReceiveProps && inst.componentWillReceiveProps(vnode.props) // <-- 在 inst.props = vnode.props 之前调用
            
            inst.props = vnode.props
        } else {
            ...
        }
    }
```

当 组件的 props或者state发生改变的时候，组件一定会渲染吗？shouldComponentUpdate说了算！！ 如果组件没有shouldComponentUpdate这个方法， 默认是渲染的。 
否则是基于 shouldComponentUpdate的返回值。 这个方法接受两个参数 newProps, newState 。 
另外由于 props和 state(setState) 改变都会引起 shouldComponentUpdate调用， 所以: 
```jsx harmony
function render(vnode, parent, comp, olddomOrComp, myIndex) {
    ...
    else if (typeof vnode.nodeName === "function") {
            let func = vnode.nodeName
            let inst
            if(olddomOrComp && olddomOrComp instanceof func) {
                inst = olddomOrComp
                inst.componentWillReceiveProps && inst.componentWillReceiveProps(vnode.props) // <-- 在 inst.props = vnode.props 之前调用
                
                let shoudUpdate
                if(inst.shouldComponentUpdate) {
                    shoudUpdate = inst.shouldComponentUpdate(vnode.props, olddomOrComp.state) // <-- 在 inst.props = vnode.props 之前调用
                } else {
                    shoudUpdate = true
                }
    
                inst.props = vnode.props   
                if (!shoudUpdate) {   // <-- 在 inst.props = vnode.props  之后
                    return // do nothing just return
                }
                

            } else {
                ...
            }
        }
     ...
}


setState(state) {
    setTimeout(() => {
        let shoudUpdate
        if(this.shouldComponentUpdate) {
            shoudUpdate = this.shouldComponentUpdate(this.props, state)
        } else {
            shoudUpdate = true
        }
        this.state = state
        if (!shoudUpdate) {  // <-- 在  this.state = state  之后
            return // do nothing just return
        }

        const vnode = this.render()
        let olddom = getDOM(this)
        const myIndex = getDOMIndex(olddom)
        render(vnode, olddom.parentNode, this, this.__rendered, myIndex)
        this.componentDidUpdate && this.componentDidUpdate() // <-- 需要调用下： componentDidUpdate
    }, 0)
}
```
当 shoudUpdate 为false的时候呢， 直接return 就ok了， 但是shoudUpdate 为false 只是表明 不渲染， 但是在 return之前， newProps和newState一定要设置到组件实例上。
<br/>**注** setState render之后 也是需要调用： componentDidUpdate

当 shoudUpdate == true 的时候。 会调用： componentWillUpdate， 参数为newProps和newState。 这个函数调用之后，就会把nextProps和nextState分别设置到this.props和this.state中。
```jsx harmony
function render(vnode, parent, comp, olddomOrComp, myIndex) {
    ...
    else if (typeof vnode.nodeName === "function") {
    ...
    let shoudUpdate
    if(inst.shouldComponentUpdate) {
        shoudUpdate = inst.shouldComponentUpdate(vnode.props, olddomOrComp.state) // <-- 在 inst.props = vnode.props 之前调用
    } else {
        shoudUpdate = true
    }
    shoudUpdate && inst.componentWillUpdate && inst.componentWillUpdate(vnode.props, olddomOrComp.state)   // <-- 在 inst.props = vnode.props 之前调用   
    inst.props = vnode.props   
    if (!shoudUpdate) {   // <-- 在 inst.props = vnode.props  之后
        return // do nothing just return
    }
                
    ...
}


setState(state) {
    setTimeout(() => {
        ...
        shoudUpdate && this.componentWillUpdate && this.componentWillUpdate(this.props, state) // <-- 在 this.state = state 之前调用
        this.state = state
        if (!shoudUpdate) {  // <-- 在  this.state = state  之后
            return // do nothing just return
        }
        ...
}
```

#### componentWillUnmount
当组件要被销毁的时候， 调用组件的componentWillUnmount。 inst没有被复用的时候， 要销毁。 dom没有被复用的时候， 也要销毁， 而且是树形结构
的递归操作。 有点像 render的递归， 直接看代码： 
```jsx harmony
function recoveryComp(comp) {
    if (comp instanceof Component) {  // <--- component
        comp.componentWillUnmount && comp.componentWillUnmount()
        recoveryComp(comp.__rendered)
    } else if (comp.__rendered instanceof Array) { // <--- dom like div/span
        comp.__rendered.forEach(element => {
            recoveryComp(element)
        })
    } else {       // <--- TextNode
        // do nothing
    }
}
```
recoveryComp 是这样的一个 递归函数： 
   * 当domOrComp 为组件实例的时候， 首先调用：componentWillUnmount， 然后 recoveryDomOrComp(inst.__rendered) 。 这里的先后顺序关系很重要
   * 当domOrComp 为DOM节点 （非文本 TextNode）, 遍历 recoveryDomOrComp(子节点) 
   * 当domOrComp 为TextNode，nothing...
与render一样， 由于组件 最终一定会render html的标签。 所以这个递归一定是能够正常返回的。
<br/> 哪些地方需要调用recoveryComp ？ 
1. 所有olddomOrComp 没有被复用的地方。 因为一旦olddomOrComp 不被复用， 一定有一个新的取得它， 它就要被销毁
2. 多余的 子节点。 div 起初有3个子节点， setState之后变成了2个。 多出来的要被销毁
```jsx harmony
function diffDOM(vnode, parent, comp, olddom) {
    const {onlyInLeft, bothIn, onlyInRight} = diffObject(vnode.props, olddom.__vnode.props)
    setAttrs(olddom, onlyInLeft)
    removeAttrs(olddom, onlyInRight)
    diffAttrs(olddom, bothIn.left, bothIn.right)


    const willRemoveArr = olddom.__rendered.slice(vnode.children.length)
    const renderedArr = olddom.__rendered.slice(0, vnode.children.length)
    olddom.__rendered = renderedArr
    for(let i = 0; i < vnode.children.length; i++) {
        render(vnode.children[i], olddom, null, renderedArr[i], i)
    }

    willRemoveArr.forEach(element => {
        recoveryComp(element)
        olddom.removeChild(getDOM(element))
    })

    olddom.__vnode = vnode
}
```

到这里， tinyreact 就有 生命周期了

之前的代码 由于会用到  dom.__rendered。 所以：
```jsx harmony
const root = document.getElementById("root")
root.__rendered = []
render(<App/>, root)
```
为了不要在 调用render之前 设置：__rendered 做个小的改动 ：
```jsx harmony
/**
 * 渲染vnode成实际的dom
 * @param vnode 虚拟dom表示
 * @param parent 实际渲染出来的dom，挂载的父元素
 */
export default function render(vnode, parent) {
    parent.__rendered =[]  //<--- 这里设置 __rendered
    renderInner(vnode, parent, null, null, 0)
}

function renderInner(vnode, parent, comp, olddomOrComp, myIndex) {
    ...
}
```

### 其他
tinyreact 未实现功能：
1. context
2. 事件代理
3. 多吃调用setState， 只render一次
4. react 顶层Api
5. 。。。

tinyreat 有些地方参考了[preact](https://github.com/developit/preact)
 
npm包: 
```
     npm install tinyreact --save
```