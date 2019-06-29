# 实现自己的react之简单rendering
<!-- TOC -->

- [实现自己的react之简单rendering](#实现自己的react之简单rendering)
  - [元素和组件](#元素和组件)
    - [原生DOM元素](#原生DOM元素)
    - [虚拟元素](#虚拟元素)
    - [组件](#组件)
    - [自定义组件](#自定义组件)
  - [React是声明式的](#React是声明式的)
  - [Feact的实现](#Feact的实现)
    - [模仿React来创建Feact应用](#模仿React来创建Feact应用)
    - [Feact中createElement的实现](#Feact中createElement的实现)
    - [Feact中Render的实现](#Feact中Render的实现)
    - [创建自定义组件](#创建自定义组件)
    - [重新实现render方法](#重新实现render方法)
    - [改进复合组件](#改进复合组件)
    - [再次完善Feact.render方法](#再次完善Feactrender方法)

<!-- /TOC -->

在这里我们将会从0到1来实现我们自己到react。这样我们可以更好的了解react是如何工作的，为什么存在这么多生命周期的方法以及每个方法在什么时候调用。 

需要提出来的是，我们的实现是基于`React 15.3`，虽然`React 16`中存在很大的变动，但是我认为去了解这些依然是有用的。

## 元素和组件
在React中存在三种不同类型的对象：
1. 原生DOM元素、
2. 虚拟元素
3. 组件。   

### 原生DOM元素
原生DOM元素实际上是浏览器用来构建网页的元素。有时React也会对原生DOM元素进行操作。比如调用`document.createElement()`来创建原生DOM元素，调用`element.insertBefore()`, `element.nodeValue`来更新DOM元素。

### 虚拟元素
虚拟元素是React中非常核心概念。该类元素的思想是，将特定的DOM元素或者DOM树存储在内存中，在需要渲染的时候交由渲染方法进行渲染。**虚拟元素既可以是h1和div这样的DOM元素，又可以用户自定义的组件**。虚拟元素存在使得DOM元素的更新比直接操作原生DOM原生成本要低许多。

### 组件
组件是React中另一个核心的概念，而且不同的组件在React中可以做不同的事情。比如ReactDOMComponent主要作为React元素和原生DOM元素沟通的桥梁

### 自定义组件
当我们调用`React.createClass`或者使用es6语法继承`React.Component`时，我们都会创建出一个组件类。该组件类提供了比如`componentWillMount`和`shouldComponentUpdate`生命周期的方法，通常我们都会实现这些方法来做我们想做的事情。实际上，在React生命周期中还存在比如`mountComponent`和`receiveComponent`这样的方法，这些方法只在react内部来使用，所以我们不会实现这些方法，甚至不知道这些方法的存在。


## React是声明式的
在使用React的时候，我们只是对组件类进行了定义，并没有对其进行初始化。组件类的初始化工作是React来完成的。或许你也会发现对于DOM元素我们也没有对其进行初始化，但是我们却`隐式对其进行了初始化`。比如使用JSX定义组件：
```js
class MyComponent extends React.Component {
    render() {
        return <div>hello</div>;
    }
}
```

上述JSX代码会被编译成：
```js
class MyComponent extends React.Component {
    render() {
        return React.createElement('div', null, 'hello');
    }
}
```

通过上述代码可以发现，`React.createElement`方法会被执行来创建DOM元素。换句话说，我们不会创建DOM元素，是React在初始化组件的时候调用render()来创建DOM元素。因此我们可以说React是声明式的，我们描述我们想要什么，然后React来对其进行实现。



## Feact的实现

### 模仿React来创建Feact应用
首先模仿React来创建Feact应用：
```js
Feact.render(<h1>hello world</h1>, document.getElementById('root'));
```

我们认为上述的JSX代码编译之后可以得到如下的代码：
```js
Feact.render(
    Feact.createElement('h1', null, 'hello world'),
    document.getElementById('root')
);
```

由于JSX是一个很大的话题，所以我们对针对编译之后的代码来实现Feact。


### Feact中createElement的实现
```js
const Feact = {
    createElement(type, props, children) {
        const element = {
            type,
            props: props || {}
        };

        if (children) {
            element.props.children = children;
        }

        return element;
    }
};
```

element只是一个简单对象，由于描述我们希望如何渲染。

### Feact中Render的实现
Feact的Render方法中传递是我们想要的渲染的东西，而且也是应用的起点。在这里，我们先讲render方法定义如下：
```js
const Feact = {
    createElement() { /* 如上*/ },

    render(element, container) {
        const componentInstance = new FeactDOMComponent(element);
        return componentInstance.mountComponent(container);
    }
};
```

当render方法执行完毕，在网页上就可以看到我们想要渲染的东西来。由此可以得出**FeactDOMComponent**才是DOM元素的实际创建者。`FeactDOMComponent`的实现如下：
```js
class FeactDOMComponent {
    constructor(element) {
        this._currentElement = element;
    }

    mountComponent(container) {
        const domElement = document.createElement(this._currentElement.type);
        const text = this._currentElement.props.children;
        const textNode = document.createTextNode(text);
        domElement.appendChild(textNode);

        container.appendChild(domElement);

        this._hostNode = domElement;
        return domElement;
    }
}
```

**PS**：在`mountComponent`方法中我们将DOM元素保存在`this._hostNode`中。在后续的工作中会使用到。

通过上述的代码我们已经实现了一个非常简单的Feact，当然它的功能还是非常受限的。下面我们来自定义组件。

### 创建自定义组件
显然，我们不希望我们的Feact只能渲染一个写死的DOM元素，下面就让我们的Feact支持自定义组件。
```js
const Feact = {
    createClass(spec) {
        function Constructor(props) {
            this.props = props;
        }

        Constructor.prototype.render = spec.render;

        return Constructor;
    }, 

    render(element, container) {
        // 我们上述实现的render方法是不能处理自定义组件的，
        // 所以我们需要对其重新实现
    }
};

const MyTitle = Feact.createClass({
    render() {
        return Feact.createElement('h1', null, this.props.message);
    }
};

Feact.render({
    Feact.createElement(MyTitle, { message: 'hey there Feact' }),
    document.getElementById('root')
);
```

由于我们不考虑使用JSX，所以上述代码看起来比较繁琐。如果我们使用JSX的话，上述代码会变成：
```js
Feact.render(
    <MyTitle message="hey there Feact" />,
    document.getElementById('root')
);
```

在`createElement`方法我们既可以传递所要渲染的组件，也可以传递原生DOM元素。**如果元素的type是一个字符串，则该元素为原生DOM元素，如果type是一个方法，则该元素为用户自定义的组件**。

### 重新实现render方法
我们一开始实现的render方法是不支持渲染自定义组件的，对其进行改变为：
```js
Feact = {
    render(element, container) {
        const componentInstance =
            new FeactCompositeComponentWrapper(element);

        return componentInstance.mountComponent(container);
    }
}

class FeactCompositeComponentWrapper {
    constructor(element) {
        this._currentElement = element;
    }

    mountComponent(container) {
        const Component = this._currentElement.type;
        const componentInstance = new Component(this._currentElement.props);
        const element = componentInstance.render();

        const domComponentInstance = new FeactDOMComponent(element);
        return domComponentInstance.mountComponent(container);
    }
}
```

虽然上述的实现还存在改进的地方，但是通过上述代码我们可以发现`componentInstance.render()`方法在哪里进行调用。为了能够将组件元素渲染在页面中，我们将起传递到`FeactDOMComponent`中。

### 改进复合组件
目前我们的组件只能返回原生DOM节点，并不能返回其他的自定义组件。我们希望组件可以返回组件，比如：
```js
const MyMessage = Feact.createClass({
    render() {
        if (this.props.asTitle) {
            return Feact.createElement(MyTitle, {
                message: this.props.message
            });
        } else {
            return Feact.createElement('p', null, this.props.message);
        }
    }
}
```

这个组件既可以返回原生DOM元素，又可以返回自定义组件。目前的Feact是不能处理这种场景的。当asTitle为true时，FeactCompositeComponentWrapper将会传递给FeactDOMComponent非原生DOM元素。这时FeactDOMComponent就会出问题了。我们对FeactCompositeComponentWrapper进行改进：
```js
class FeactCompositeComponentWrapper {
    constructor(element) {
        this._currentElement = element;
    }

    mountComponent(container) {
        const Component = this._currentElement.type;
        const componentInstance =
            new Component(this._currentElement.props);
        let element = componentInstance.render();

        while (typeof element.type === 'function') {
            element = (new element.type(element.props)).render();
        }

        const domComponentInstance = new FeactDOMComponent(element);
        domComponentInstance.mountComponent(container);
    }
}
```

**PS**：上述改进的方式仅仅是为了满足我们目前的需求。当元素为组件的时候我们会循环调用组件的渲染方法，这种方式会让所有子组件参与进来。如果组件都存在componentWillMount的方法时，这种方式会使得子组件componentWillMount的调用很难处理了。在后续工作中会对其进行修复。

### 再次完善Feact.render方法
在开始的render方法中只能处理原生DOM元素，现在的render方法只能处理组件元素。我们希望render方法`既可以处理原生元素`，`又可以处理组件`。当然我们可以创建一个`工厂方法`，基于元素的类型返回不同的组件，但是React采用的是另外一种方式。由于`FeactCompositeComponentWrapper`组件最终生成的是一个`FeactDOMComponent`，所以我们可以将任意元素使用`FeactCompositeComponentWrapper`进行包装：
```js
const TopLevelWrapper = function(props) {
    this.props = props;
};

TopLevelWrapper.prototype.render = function() {
    return this.props;
};

const Feact = {
    render(element, container) {
        const wrapperElement =
            this.createElement(TopLevelWrapper, element);

        const componentInstance =
            new FeactCompositeComponentWrapper(wrapperElement);

        // as before
    }
};
```

ToplevelWrapper是一个简单的组件，它的render方法返回的是用户提供的元素，这样原生DOM元素也会被包装一下，所以我们无需去关心传递的是什么元素，都可以统一进行处理。

到这里一个简单的Feact已经实现了，当然在React中还有很多问题需要考虑。 

[代码链接](https://github.com/zhaoruda/Feact/tree/first-task)
[原文地址](https://www.mattgreer.org/articles/react-internals-part-one-basic-rendering/)