# 从零开始实现一个React（二）：组件和生命周期

<!-- TOC -->

- [从零开始实现一个React（二）：组件和生命周期](#从零开始实现一个react二组件和生命周期)
  - [组件](#组件)
    - [createElement的变化](#createelement的变化)
    - [组件基类React.Component](#组件基类reactcomponent)
    - [Component](#component)
      - [1. 先定义一个**Component**类：](#1-先定义一个component类)
      - [2. **state & props**](#2-state--props)
      - [3. **setState**](#3-setstate)
      - [4. **render**](#4-render)
    - [组件渲染和生命周期](#组件渲染和生命周期)
  - [渲染组件](#渲染组件)
    - [渲染函数定义组件渲染函数定义组件](#渲染函数定义组件渲染函数定义组件)
    - [渲染类定义组件](#渲染类定义组件)
  - [后话](#后话)

<!-- /TOC -->

## 组件
React定义组件的方式可以分为两种：**函数** 和 **类**，函数定义可以看做是类定义的一种简单形式。

### createElement的变化
React.createElement的实现：
```js
function createElement( tag, attrs, ...children ) {
    return {
        tag,
        attrs,
        children
    }
}
```

这种实现我们前面暂时只用来渲染原生DOM元素，而对于组件，createElement得到的参数略有不同：**如果JSX片段中的某个元素是组件，那么createElement的第一个参数tag将会是一个方法，而不是字符串**。

> 区分组件和原生DOM的工作，是`babel-plugin-transform-react-jsx`帮我们做的

例如在处理`<Welcome name="Sara" />`时，`createElement`方法的第一个参数`tag`，实际上就是我们定义`Welcome`的方法：
```js
function Welcome( props ) {
    return <h1>Hello, {props.name}</h1>;
}
```

我们不需要对createElement做修改，只需要知道如果渲染的是组件，tag的值将是一个函数

### 组件基类React.Component
通过类的方式定义组件，我们需要继承`React.Component`：
```js
class Welcome extends React.Component {
    render() {
        return <h1>Hello, {this.props.name}</h1>;
    }
}
```
所以我们就需要先来实现React.Component这个类

### Component
React.Component包含了一些预先定义好的变量和方法，我们来一步一步地实现它：

#### 1. 先定义一个**Component**类：  
```js
class Component {}
```

#### 2. **state & props**   
通过继承`React.Component`定义的组件有自己的私有状态`state`，可以通过`this.state`获取到。同时也能通过`this.props`来获取传入的数据。

所以在构造函数中，我们**需要初始化state和props**
```js
// React.Component
class Component {
    constructor( props = {} ) {
        this.state = {};
        this.props = props;
    }
}
```

#### 3. **setState**  
组件内部的`state`和渲染结果相关，当`state`改变时通常会触发渲染，为了让React知道我们改变了`state`，我们只能通过`setState`方法去修改数据。我们可以通过`Object.assign`来做一个简单的实现。
在每次更新`state`后，我们需要调用`renderComponent`方法来重新渲染组件，`renderComponent`方法的实现后文会讲到。
```js
import { renderComponent } from '../react-dom/render'
class Component {
    constructor( props = {} ) {
        // ...
    }

    setState( stateChange ) {
        // 将修改合并到state
        Object.assign( this.state, stateChange );
        renderComponent( this );
    }
}
```
你可能听说过React的`setState`是异步的，同时它有很多优化手段，这里我们暂时不去管它，在以后会有一篇文章专门来讲`setState`方法。

#### 4. **render**  
上一篇文章中实现的render方法只支持渲染原生DOM元素，我们需要修改`ReactDOM.render`方法，让其支持渲染组件。

修改之前我们先来回顾一下上一篇文章中我们对ReactDOM.render的实现：
```js
function render( vnode, container ) {
    return container.appendChild( _render( vnode ) );
}

function _render( vnode ) {

    if ( vnode === undefined || vnode === null || typeof vnode === 'boolean' ) vnode = '';

    if ( typeof vnode === 'number' ) vnode = String( vnode );

    if ( typeof vnode === 'string' ) {
        let textNode = document.createTextNode( vnode );
        return textNode;
    }

    const dom = document.createElement( vnode.tag );

    if ( vnode.attrs ) {
        Object.keys( vnode.attrs ).forEach( key => {
            const value = vnode.attrs[ key ];
            setAttribute( dom, key, value );
        } );
    }

    vnode.children.forEach( child => render( child, dom ) );    // 递归渲染子节点

    return dom; 
}
```

我们需要在其中加一段用来渲染组件的代码：
```js
function _render( vnode, container ) {

    // ...

    if ( typeof vnode.tag === 'function' ) {

        const component = createComponent( vnode.tag, vnode.attrs );

        setComponentProps( component, vnode.attrs );

        return component.base;
    }
    
    // ...
}
```

### 组件渲染和生命周期
在上面的方法中用到了`createComponent`和`setComponentProps`两个方法，组件的生命周期方法也会在这里面实现。

> 生命周期方法是一些在特殊时机执行的函数，例如componentDidMount方法会在组件挂载后执行

`createComponent`方法用来创建组件实例，并且将函数定义组件扩展为类定义组件进行处理，以免其他地方需要区分不同定义方式。
```js
// 创建组件
function createComponent( component, props ) {

    let inst;
    // 如果是类定义组件，则直接返回实例
    if ( component.prototype && component.prototype.render ) {
        inst = new component( props );
    // 如果是函数定义组件，则将其扩展为类定义组件
    } else {
        inst = new Component( props );
        inst.constructor = component;
        inst.render = function() {
            return this.constructor( props );
        }
    }

    return inst;
}
```

`setComponentProps`方法用来更新p`rops`，在其中可以实现`componentWillMount`，`componentWillReceiveProps`两个生命周期方法
```js
// set props
function setComponentProps( component, props ) {

    if ( !component.base ) {
        if ( component.componentWillMount ) component.componentWillMount();
    } else if ( component.componentWillReceiveProps ) {
        component.componentWillReceiveProps( props );
    }

    component.props = props;

    renderComponent( component );

}
```

renderComponent方法用来渲染组件，setState方法中会直接调用这个方法进行重新渲染，在这个方法里可以实现`componentWillUpdate`，`componentDidUpdate`，`componentDidMount`几个生命周期方法。
```js
export function renderComponent( component ) {

    let base;

    const renderer = component.render();

    if ( component.base && component.componentWillUpdate ) {
        component.componentWillUpdate();
    }

    base = _render( renderer );

    if ( component.base ) {
        if ( component.componentDidUpdate ) component.componentDidUpdate();
    } else if ( component.componentDidMount ) {
        component.componentDidMount();
    }

    if ( component.base && component.base.parentNode ) {
        component.base.parentNode.replaceChild( base, component.base );
    }

    component.base = base;
    base._component = component;

}
```

## 渲染组件

### 渲染函数定义组件渲染函数定义组件
渲染前文提到的`Welcome`组件：
```js
const element = <Welcome name="Sara" />;
ReactDOM.render(
    element,
    document.getElementById( 'root' )
);
```

在浏览器中可以看到结果：
<div align="center"><img src="../assets/040401.png" /></div>

试试更复杂的例子，将多个组件组合起来：
```js
function App() {
    return (
        <div>
            <Welcome name="Sara" />
            <Welcome name="Cahal" />
            <Welcome name="Edite" />
        </div>
    );
}
ReactDOM.render(
    <App />,
    document.getElementById( 'root' )
);
```

在浏览器中可以看到结果：
<div align="center"><img src="../assets/040402.png" /></div>

### 渲染类定义组件
我们来试一试将刚才函数定义组件改成类定义：
```js
class Welcome extends React.Component {
    render() {
        return <h1>Hello, {this.props.name}</h1>;
    }
}

class App extends React.Component {
    render() {
        return (
            <div>
                <Welcome name="Sara" />
                <Welcome name="Cahal" />
                <Welcome name="Edite" />
            </div>
        );
    }
}
ReactDOM.render(
    <App />,
    document.getElementById( 'root' )
);
```

运行起来结果和函数定义组件完全一致：
<div align="center"><img src="../assets/040402.png" /></div>

再来尝试一个能体现出类定义组件区别的例子，实现一个计数器Counter，每点击一次就会加1。
并且组件中还增加了两个生命周期函数：
```js
class Counter extends React.Component {
    constructor( props ) {
        super( props );
        this.state = {
            num: 0
        }
    }

    componentWillUpdate() {
        console.log( 'update' );
    }

    componentWillMount() {
        console.log( 'mount' );
    }

    onClick() {
        this.setState( { num: this.state.num + 1 } );
    }

    render() {
        return (
            <div onClick={ () => this.onClick() }>
                <h1>number: {this.state.num}</h1>
                <button>add</button>
            </div>
        );
    }
}

ReactDOM.render(
    <Counter />,
    document.getElementById( 'root' )
);
```

可以看到结果：
<div align="center"><img src="../assets/040403.gif" /></div>

mount只在挂载时输出了一次，后面每次更新时会输出update

## 后话
至此我们已经从API层面实现了React的核心功能。但是我们目前的做法是每次更新都重新渲染整个组件甚至是整个应用，这样的做法在页面复杂时将会暴露出性能上的问题，DOM操作非常昂贵