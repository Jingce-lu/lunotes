# 85行代码实现一个React
<!-- TOC -->

- [85行代码实现一个React](#85行代码实现一个react)
    - [1.第一个commit: initial commit](#1第一个commit-initial-commit)
    - [2.第二个commit:实现最简单的React渲染字符的功能（第一版）著作权归原作者所有。](#2第二个commit实现最简单的react渲染字符的功能第一版著作权归原作者所有)
    - [3.第三个commit:添加函数组件的功能，能够实现函数组件（第二版）](#3第三个commit添加函数组件的功能能够实现函数组件第二版)
    - [4.第四个commit: 主要实现向React中添加子组件的效果（第三版）](#4第四个commit-主要实现向react中添加子组件的效果第三版)
    - [5.第四个commit：类组件的实现（第四版）](#5第四个commit类组件的实现第四版)
    - [6.第五个commit：React函数组件带参数的实现（第五版）](#6第五个commitreact函数组件带参数的实现第五版)
    - [7.第六个commit：类组件属性的传递（第六版）](#7第六个commit类组件属性的传递第六版)
    - [8.第七个commit：类组件添加事件属性（第七版）](#8第七个commit类组件添加事件属性第七版)
    - [9.第八个commit：实现类组件的动态渲染（数据的变化能够同步到页面上）（第八版）](#9第八个commit实现类组件的动态渲染数据的变化能够同步到页面上第八版)
  - [完整代码](#完整代码)

<!-- /TOC -->

85行代码分18次commit, 每个commit实现一个小目标,每个小目标实现一个相对完整的功能。最后由这些功能组合成自己的React.js框架。著作权归原作者所有。

### 1.第一个commit: initial commit
是在github上建立仓库时自动生成的。然后在README.md中说明了一下仓库的用途。用于实现一个基础的React.js框架著作权归原作者所有。

### 2.第二个commit:实现最简单的React渲染字符的功能（第一版）著作权归原作者所有。

这个commit主要实现了用React输出一个helloworld到HTML页面中。期待引用了我们的React.js后直接通过下述方式实现著作权归原作者所有。
```js
const helloWorld = React.createElement('div', null, `Hello World`);
ReactDOM.render(helloWorld, document.getElementById('root'));
```

此时我们React.js中的代码如下：
```js
function createElement(parentEle, props, childEle) {
  let parentElement = document.createElement(parentEle);
  parentElement.innerHTML = childEle;

  return parentElement;
}
function render(insertEle, rootEle) {
  rootEle.appendChild(insertEle);
}
React = {
  createElement
}
ReactDOM = {
  render
}
```

### 3.第三个commit:添加函数组件的功能，能够实现函数组件（第二版）
主要实现能够在React创建组件时，实现能够传递函数定义的组件，后期还会扩展向函数组件中传递参数著作权归原作者所有。
```js
const Hello = function () {
  return React.createElement('div', null, `Hello Version2.0`);
};
const helloWorld = React.createElement(Hello, null, null);
ReactDOM.render(helloWorld, document.getElementById('root'));
```

此时我们的React.js中的代码如下：
```js
function createElement(parentEle, props, childEle) {
  if(typeof parentEle === 'function') {
    return parentEle();
  } else {
    let parentElement = document.createElement(parentEle);
    parentElement.innerHTML = childEle;
    return parentElement;
  }
}

function render(insertEle, rootEle) {
  rootEle.appendChild(insertEle);
}

React = {
  createElement
}

ReactDOM = {
  render
}
```

### 4.第四个commit: 主要实现向React中添加子组件的效果（第三版）
实现能够在React.js中添加子组件的效果，如下代码实现添加多个helloworld字符和div片段等。著作权归原作者所有。
```js
const HelloVersion3 = function () {
  return React.createElement('div', null, `版本3.0`);
};

const helloWorld1 = React.createElement(HelloVersion3, null, null);
const helloWorld2 = React.createElement(HelloVersion3, null, null);
const divEle = React.createElement('div', null, `我被一个div标签包裹`);

const parent = React.createElement('div', null,
  helloWorld1,
  helloWorld2,
  divEle,
  `我是文本内容哦`
);

ReactDOM.render(parent, document.getElementById('root'));
```

具体的React.js实现代码如下所示：
```js
function createElement(parentEle, props, ...childEles) {
  if(typeof parentEle === 'function') {
    return parentEle();
  } else {
    let parentElement = document.createElement(parentEle);
    childEles.forEach(child => {
      if(typeof child === 'string') {
        parentElement.innerHTML += child;
      } else if(typeof child === 'object') {
        parentElement.appendChild(child);
      }
    });

    return parentElement;
  }
}

function render(insertEle, rootEle) {
  rootEle.appendChild(insertEle);
}

React = {
  createElement
}

ReactDOM = {
  render
}
```

### 5.第四个commit：类组件的实现（第四版）
主要是实现采用和React中最常用的使用class来定义组件的方式，如下代码所示：著作权归原作者所有。
```js
class Hello {
  render() {
    return React.createElement('div', null, `版本四，类组件的实现`);
  }
}
const helloWorld = React.createElement(Hello, null, null);
ReactDOM.render(helloWorld, document.getElementById('root'));
```

React.js代码如下：
```js
function createElement(parentEle, props, ...childEles) {
  if (typeof parentEle === 'function' && /^\s*class\s+/.test(parentEle.toString())) {
    let component = new parentEle();
    return component.render();
  }else if (typeof parentEle === 'function'){
    return parentEle();
  }else {
    let parentElement = document.createElement(parentEle);
    childEles.forEach(child => {
      if(typeof child === 'string') {
        parentElement.innerHTML += child;
      } else if(typeof child === 'object') {
        parentElement.appendChild(child);
      }
    });
    return parentElement;
  }
}

function render(insertEle, rootEle) {
  rootEle.appendChild(insertEle);
}

React = {
  createElement
}
ReactDOM = {
  render
}
```

### 6.第五个commit：React函数组件带参数的实现（第五版）
这个比较简单，其实原理就是向普通函数中传递参数后使用是一个道理，要实现的效果如下代码：著作权归原作者所有。
```js
const Hello = ({name}) => {
  return React.createElement('div', null, `这是 ${name}`);
};
const helloWorld = React.createElement(Hello, {name: '版本五'}, null);
ReactDOM.render(helloWorld, document.getElementById('root'));
```

React.js代码如下：
```js
function createElement(parentEle, props, ...childEles) {
  if (typeof parentEle === 'function' && /^\s*class\s+/.test(parentEle.toString())) {
    let component = new parentEle();
    return component.render();
  } else if (typeof parentEle === 'function') {
    return parentEle(props);
  } else {
    let parentElement = document.createElement(parentEle);
    childEles.forEach(child => {
      if (typeof child === 'string') {
        parentElement.innerHTML += child;
      } else if (typeof child === 'object') {
        parentElement.appendChild(child);
      }
    });
    return parentElement;
  }
}
function render(insertEle, rootEle) {
  rootEle.appendChild(insertEle);
}
React = {
  createElement
}
ReactDOM = {
  render
}
```

### 7.第六个commit：类组件属性的传递（第六版）
这个commit主要用来解决如何向内组件中传递参数的问题，实现如下代码效果
```js
class Hello extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return React.createElement('div', null, `Hello ${this.props.name}`);
  }
}
const helloWorld = React.createElement(Hello, {name: '文字'}, null);
ReactDOM.render(helloWorld, document.getElementById('root'));
```

React.js代码如下所示：
```js
class Component {
  constructor(props) {
    this.props = props;
  }
}
function createElement(parentEle, props, ...childEles) {
  if (typeof parentEle === 'function' && /^\s*class\s+/.test(parentEle.toString())) {
    // 当为类组件时
    let component = new parentEle(props);
    return component.render();
  } else if (typeof parentEle === 'function') {
    // 当为函数组件时
    return parentEle(props);
  } else {
    // 当为html标签组件时
    let parentElement = document.createElement(parentEle);
    childEles.forEach(child => {
      if (typeof child === 'string') {
        parentElement.innerHTML += child;
      } else if (typeof child === 'object') {
        parentElement.appendChild(child);
      }
    });
    return parentElement;
  }
}
function render(insertEle, rootEle) {
  rootEle.appendChild(insertEle);
}
React = {
  createElement,
  Component
}
ReactDOM = {
  render
}

```


### 8.第七个commit：类组件添加事件属性（第七版）
主要实现能够绑定click事件的功能，需要实现的效果代码如下：
```js
class MyButton extends React.Component {
constructor(props) {
  super(props);
}
render() {
  return React.createElement('button', {onclick: this.props.onClick}, `Click me`);
}
}
const myBtn = React.createElement(MyButton, {onClick: () => alert('点击事件触发')}, null);
ReactDOM.render(myBtn, document.getElementById('root'));
```

React.js代码如下：
```js
class Component {
    constructor(props) {
        this.props = props;
    }
}
function createElement(parentEle, props, ...childEles) {
    if (typeof parentEle === 'function' && /^\s*class\s+/.test(parentEle.toString())) {
        // 当为类组件时
        let component = new parentEle(props);
        return component.render();
    } else if (typeof parentEle === 'function') {
        // 当为函数组件时
        return parentEle(props);
    } else {
        // 当为html标签组件时
        let parentElement = document.createElement(parentEle);
        Object.keys(props).forEach(key => {
            switch(key) {
                case 'onclick':
                    parentElement.addEventListener('click', props[key]);
                    break;
                default:
                    break;
            }
        });
        childEles.forEach(child => {
            if(typeof child === 'string') {
                parentElement.innerHTML += child;
            } else if(typeof child === 'object') {
                parentElement.appendChild(child);
            }
        });
        return parentElement;
    }
}
function render(insertEle, rootEle) {
    rootEle.appendChild(insertEle);
}
React = {
    createElement,
    Component
}
ReactDOM = {
    render
}
```

### 9.第八个commit：实现类组件的动态渲染（数据的变化能够同步到页面上）（第八版）
到这一步已经可以使用上述的功能完成一个小的应用了，我们来试一下，实现一个简单的计数器的应用。技术器的代码如下：
```js
class Counter extends React.Component {
    constructor(props) {
      super(props);
      this.state = {value: 0};
    }
    onPlusClick() {
      this.setState({value: this.state.value + 1});
    }
    onMinusClick() {
      this.setState({value: this.state.value - 1});
    }
    render() {
      return React.createElement('div', null,
        React.createElement('div', null, `The Famous Dan Abramov's Counter`),
        React.createElement('div', null, `${this.state.value}`),
        React.createElement('button', {onClick: this.onPlusClick.bind(this)}, '+'),
        React.createElement('button', {onClick: this.onMinusClick.bind(this)}, '-')
      );
    }
}
let myCounter = React.createElement(Counter,null,null);
ReactDOM.render(myCounter, document.getElementById('root'));
```

React.js代码如下：
```js
let rootElement, rootReactElement;
// React基础组件库
class Component {
  constructor(props) {
    this.props = props;
  }
  setState(state) {
    this.state = state;
    reRender();
  }
}
// React.createElement
function createElement(parentEle, props, ...childEles) {
  if (typeof parentEle === 'function' && /^\s*class\s+/.test(parentEle.toString())) {
    // 当为类组件时
    let component = new parentEle(props);
    return component;
  } else if (typeof parentEle === 'function') {
    // 当为函数组件时
    return parentEle(props);
  } else {
    // 当为html标签组件时
    let parentElement = document.createElement(parentEle);
    Object.keys(props || {}).forEach(key => {
      switch (key) {
        case 'onclick':
          parentElement.addEventListener('click', props[key]);
          break;
        case 'onClick':
          parentElement.addEventListener('click', props[key]);
          break;
        default:
          break;
      }
    });
    childEles.forEach(child => {
      if (typeof child === 'string') {
        parentElement.innerHTML += child;
      } else if (typeof child === 'object') {
        parentElement.appendChild(child);
      }
    });
    return parentElement;
  }
}
function render(insertEle, rootEle) {
  rootElement = rootEle;
  rootReactElement = insertEle;
  rootEle.appendChild(insertEle.render());
}
function reRender() {
  while (rootElement.hasChildNodes()) {
    rootElement.removeChild(rootElement.lastChild);
  }
  ReactDOM.render(rootReactElement, rootElement);
}
React = {
  createElement,
  Component
}
ReactDOM = {
  render
}
```

## 完整代码
```js
// 防止局部变量污染全局，只暴露全局的方法
(() => {
    let rootElement, rootReactElement;
    const REACT_CLASS = 'REACT_CLASS';
    // React基础组件库
    class Component {
        constructor(props) {
            this.props = props;
        }
        setState(state) {
            // this.state = state; 导致年龄和姓名丢失
            this.state = Object.assign({}, this.state, state);
            reRender();
        }
    }
    // React.createElement
    function createElement(parentEle, props, ...childEles) {
        if (typeof parentEle === 'function' && /^\s*class\s+/.test(parentEle.toString())) {
            // （1）当为类组件时
            let component = new parentEle(props);
            component.type = REACT_CLASS;
            return component;
        } else if (typeof parentEle === 'function') {
            // （2）当为函数组件时
            return parentEle(props);
        } else {
            // （3）当为html标签组件时
            let parentElement = document.createElement(parentEle);
            Object.keys(props || {}).forEach(key => {
                if(/^on.*$/.test(key)) {
                    eventName = key.slice(2).toLowerCase();
                    parentElement.addEventListener(eventName, props[key]);
                } else if(key ==='className') {
                    parentElement.setAttribute('class', props[key]);
                } else if(key ==='style') {
                    Object.keys(props[key]).forEach(attr => 
                        parentElement.style[attr] = props[key][attr]
                    );
                } else if (key === 'ref'){
                    props[key](parentElement);
                } else {
                    // 添加其他如href等属性直接添加进来
                    parentElement.setAttribute(key, props[key]);
                }
            });
            childEles.forEach(child => {
                if(typeof child === 'string') {
                    // (1)当子元素是一个字符时
                    parentElement.innerHTML += child;
                } else if (Array.isArray(child)) {
                    // (2)当子元素是一个数组中包含多个Node节点时
                    child.forEach((childItem) => parentElement.appendChild(childItem));
                } else if(child !== null && typeof child === 'object' && child.type === 'REACT_CLASS') {
                    parentElement.appendChild(child.render());
                } else if(child !== null && typeof child === 'object') {
                    // (3)当子元素是一个Node节点是直接附加到父节点
                    parentElement.appendChild(child);
                }
            });
            return parentElement;
        }
    }
    function render(insertEle, rootEle) {
        rootElement = rootEle;
        rootReactElement = insertEle;
        let currentEle = rootReactElement.type === 'REACT_CLASS' ? rootReactElement.render() : rootReactElement;
        rootEle.appendChild(currentEle);
    }

    function reRender() {
        while(rootElement.hasChildNodes()) {
            rootElement.removeChild(rootElement.lastChild);
        }
        ReactDOM.render(rootReactElement, rootElement);
    }

    window.React = {
        createElement,
        Component
    }
    window.ReactDOM = {
        render
    }
})();
```