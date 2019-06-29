# React Object实现React对象
<!-- TOC -->

- [React Object实现React对象](#react-object实现react对象)
  - [不使用ES6](#不使用es6)
  - [声明Prop的检查类型以及默认Props值](#声明prop的检查类型以及默认props值)
  - [设定初始化状态](#设定初始化状态)
  - [自动绑定](#自动绑定)
  - [代码混合器](#代码混合器)
  - [不使用JSX](#不使用jsx)

<!-- /TOC -->

## 不使用ES6
通常情况下，定义一个React组件可以使用ES6规范中的class关键字：
```js
class Greeting extends React.Component {
  render() {
    return <h1>Hello, {this.props.name}</h1>;
  }
}
```

如果不使用ES6语法，可以直接使用 React.createClass 来实现相同的功能：
```js
var Greeting = React.createClass({
  render: function() {
    return <h1>Hello, {this.props.name}</h1>;
  }
});
```


## 声明Prop的检查类型以及默认Props值
```js
class Greeting extends React.Component {
  // ...
}

Greeting.propTypes = {
  name: React.PropTypes.string
};

Greeting.defaultProps = {
  name: 'Mary'
};
```

在使用 `React.createClass` 时，可以通过设定传入的对象的一个属性值—— `propTypes` 来指定参数类型，通过 `getDefaultProps()` 方法来设定每个参数的默认值：
```js
var Greeting = React.createClass({
  propTypes: {
    name: PropTypes.string
  },

  getDefaultProps: function() {
    return {
      name: 'Mary'
    };
  },

  // ...

});
```


## 设定初始化状态  
在ES6的 class 结构中，我们可以在构造函数中设定初始化状态：
```js
class Counter extends React.Component {
  constructor(props) {
    super(props);
    this.state = {count: props.initialCount};
  }
  // ...
}
```

在使用 `React.createClass` 时，可以为传入的对象参数添加一个  `getInitialState` 方法并返回一个初始状态值：
```js
var Counter = React.createClass({
  getInitialState: function() {
    return {count: this.props.initialCount};
  },
  // ...
});
```


## 自动绑定  
当使用ES6的 class 关键字声明一个React组件时，类中的方法遵循与常规的方法一样的定义。这就意味着在类中申明的方法在执行时并不会自动属于当前实例，必须在构造函数中显示的使用.bind(this)方法绑定到当前实例：
```js
class SayHello extends React.Component {
  constructor(props) {
    super(props);
    this.state = {message: 'Hello!'};
    // 必须，否在在handleClick中this将指向调用对象
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    alert(this.state.message);
  }

  render() {
    return (
      <button onClick={this.handleClick}>
        Say hello
      </button>
    );
  }
}
```

在使用 `React.createClass` 时不必绑定所有的方法：
```js
var SayHello = React.createClass({
  getInitialState: function() {
    return {message: 'Hello!'};
  },

  handleClick: function() {
    alert(this.state.message);
  },

  render: function() {
    return (
      <button onClick={this.handleClick}>
        Say hello
      </button>
    );
  }
});
```

以上的特性意味着使用ES6编写代码每一个方法都会额外增加一些样板式代码，但是对于大型应用来说代码结构更清晰。

如果十分排斥样板式代码，可以启用Babal的 类属性功能（ [Class Properties](https://babeljs.io/docs/plugins/transform-class-properties/?spm=a2c4e.11153940.blogcont618401.9.24205bdb25hCFf) ），利用双箭头来创建方法：
```js
class SayHello extends React.Component {
  constructor(props) {
    super(props);
    this.state = {message: 'Hello!'};
  }

  handleClick = () => {
    alert(this.state.message);
  }

  render() {
    return (
      <button onClick={this.handleClick}>
        Say hello
      </button>
    );
  }
}
```

需要注意的是，目前这个功能还是实验性的，双箭头的表达式很有可能会调整。该提议不一定会被委员会接纳。

如果非常想要尝试这种写法，你可以有这几种实现方式：
* 在构造函数中绑定方法。
* 使用箭头来定义方法。
* 使用 React.createClass 。

## 代码混合器
> 注意：   
> ES6在目前的方案中并不支持代码混合功能，因此在使用ES6编写React代码时并不能实现相关功能。  
> 官方也收到许多在使用混合器时遇到的问题，强烈建议不要在新的代码中使用混合器功能。  
> 以下的内容仅供参考。

某些时候2个不同的组件需要共享一些相同的方法或者功能。这种情况我们称为 横切关联（ [cross-cutting concerns](https://en.wikipedia.org/wiki/Cross-cutting_concern?spm=a2c4e.11153940.blogcont618401.10.24205bdb25hCFf)）。 `React.createClass` 可以通过继承来实现组件间公用相同方法。

一个通用的案例是一个组件需要定期更新自己的状态，只要使用`setInterval()`就可以实现。但是当您不再需要它来节省内存时，取消定时器是很重要的。React提供了生命周期方法来通知创建和销毁事件。下面的代码创建了一个肩带的混合器，混合器的作用是当组件被销毁之前，可以清除已有的定时器：
```js
// 定义一个混合器
var SetIntervalMixin = {
  //组件将要被渲染时调用
  componentWillMount: function() {
    this.intervals = [];
  },
  // 设置定时器方法
  setInterval: function() {
    this.intervals.push(setInterval.apply(null, arguments));
  },

  //组件将要被卸载时调用
  componentWillUnmount: function() {
    this.intervals.forEach(clearInterval);
  }
};

var TickTock = React.createClass({
  mixins: [SetIntervalMixin], // 设定混合器
  getInitialState: function() {
    return {seconds: 0};
  },
  componentDidMount: function() {
    this.setInterval(this.tick, 1000); // 调用混合器中的setInterval 方法
  },
  tick: function() {
    this.setState({seconds: this.state.seconds + 1});
  },
  render: function() {
    return (
      <p>
        React has been running for {this.state.seconds} seconds.
      </p>
    );
  }
});

ReactDOM.render(
  <TickTock />,
  document.getElementById('example')
);
```

如果组件使用了多个混合器并且很多混合器定义了相同的生命周期方法，比如同时定义了componentWillUnmount方法当组件卸载时注销某些资源。所有混合器的生命周期方法都会被调用，React会按照混合器设定的顺序来执行。


## 不使用JSX
对于React来说JSX并不是必须要使用的表达式。当在环境中不想在家额外的编译工具时尤其适用。

每一个JSX的元素都仅仅是`React.createElement(component, props, ...children)`的语法糖，所以任何使用JSX表达式实现的内容都可以直接用JavaScript来实现。

例如下面使用JSX编码的例子：
```js
class Hello extends React.Component {
  render() {
    return <div>Hello {this.props.toWhat}</div>;
  }
}

ReactDOM.render(
  <Hello toWhat="World" />,
  document.getElementById('root')
);
```

如果我们不想使用JSX，可以将其修改为：
```js
class Hello extends React.Component {
  render() {
    return React.createElement('div', null, `Hello ${this.props.toWhat}`);
  }
}

ReactDOM.render(
  React.createElement(Hello, {toWhat: 'World'}, null),
  document.getElementById('root')
);
```

组件被编译成一段字符串、由 `React.Component`创建的子类或者一个普通无状态的组件。

如果对编码时每次都要键入长长`React.createElement`感到痛苦，一个常见的模式是分配一个别名：
```js
const e = React.createElement;

ReactDOM.render(
  e('div', null, 'Hello World'),
  document.getElementById('root')
);
```