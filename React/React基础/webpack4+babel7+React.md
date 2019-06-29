# 从零开始使用webpack 4, Babel 7创建一个React项目

<!-- TOC -->

- [从零开始使用webpack 4, Babel 7创建一个React项目](#从零开始使用webpack-4-babel-7创建一个react项目)
  - [你会在本篇学到什么](#你会在本篇学到什么)
  - [初始化项目](#初始化项目)
  - [安装配置webpack](#安装配置webpack)
  - [初始化Babel](#初始化babel)
  - [写React组件](#写react组件)
  - [在HTML文件引入bundle](#在html文件引入bundle)
  - [webpack dev Server](#webpack-dev-server)
  - [总结](#总结)

<!-- /TOC -->

## 你会在本篇学到什么
1. 如何安装配置webpack
2. 如何安装配置babel
3. 如何安装react
4. 如何创建两种React Component --- 容器/展示组件
5. 在html文件中引用webpack生成的bundle文件
6. 如何安装使用webpack dev server


## 初始化项目
首先我们先给项目创建一个文件夹 webpack-react-tutorial：

> mkdir webpack-react-tutorial && cd webpack-react-tutorial

接着在这个文件夹下创建一个src的子文件夹：

> mkdir -p src

初始化项目：

> npm init -y

## 安装配置webpack
> npm i webpack --save-dev  
> npm i webpack-cli --save-dev

接着在package.json里添加webpack的指令
```js
"scripts": {
  "build": "webpack --mode production"
}
```


## 初始化Babel
为什么要使用Babel?

React Component大多是用JS ES6语法来写的，而有些浏览器没办法运行ES6的语法，所以就需要工具来将ES6的代码转化成浏览器可以运行的代码（通常是es5的语法）。

webpack本身是不会做这件事情的，需要靠转换器：`loader`。

一个webpack loader作用就是把输入进去的文件转化成指定的文件格式输出。其中`babel-loader`负责将传入的es6文件转化成浏览器可以运行的文件。

babel-loader需要利用Babel，所以需要预先将Babel配置好。

`babel preset env：将ES6的代码转成ES5(注意：babel-preset-es2015已经被废弃了)`

babel preset react: 将JSX语法编译成JS

接着安装这两个依赖：
```bash
npm i @babel/core babel-loader @babel/preset-env @babel/preset-react --save-dev
```
不要忘了配置Babel! 首先要在webpack-react-tutorial文件夹里新建一个文件.babelrc，内容为
```js
{
  "presets": ["@babel/preset-env", "@babel/preset-react"]
}
```

到这个时候，就可以写一小部分webpack的配置文件了。

创建一个新的文件webpack.config.js，内容为
```js
const path = require('path');
 
module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  }
 
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      }
    ]
  }
};
```


## 写React组件
这里会写两种React组件：容器、展示组件。如果不了解这两种组件概念的同学可以先了解一下。

简单来说: 容器跟展示组件是React组件的两种模式。

容器组件: 一般比较重数据处理的逻辑会写在这，比如监听外界传入（例如redux） state的变化，或者处理组件内部的state，等等。

展示组件：顾名思义，就是仅仅用来展示的。它一般都是一个纯箭头函数，接受容器组件通过props传来的数据，然后展示我们希望展示的html结构。

在下面的例子中，你会看到它们长啥样。

在本节中，我们来创建只有text input 的超级简单的React表单。

首先先把React库引进来：

> npm i react react-dom --save-dev

然后创建两个子文件夹来分别放React 容器/展示组件

> mkdir -p src/js/components/{container,presentational}

接着我们来写一个容器组件，它有下面的特点

- 有自己的state
- 渲染一个html表单

将这个容器组件放在container里
```bash
touch src/js/components/container/FormContainer.js
```

容器组件的代码如下：
```jsx
import React, { Component } from "react";
import ReactDOM from "react-dom";
 
class FormContainer extends Component {
  constructor() {
  super();
 
  this.state = {
      title: ""
  };
  }
 
  render() {
  return (
  <form id="article-form">
  </form>
  );
  }
}
 
export default FormContainer;
```

到目前为止，这个组件还没啥用，它只是一个包裹着子展示组件的外壳。

所以我们来定义一下子组件Input吧。

我们知道html input有下列的属性：

- type
- class
- id
- value
- required
所有的这些属性都由容器组件通过props传给它，这种组件叫做controlled component。

写一个react组件，最好给它加上`Prop Types`，这样一来可以做输入的数据类型检测，二来别人用你的组件，可以很快知道这个组件需要什么input。

安装`prop-types`

```js
npm i prop-types --save-dev
```

接着写这个展示组件

```jsx
import React from "react";
import PropTypes from "prop-types";
const Input = ({ label, text, type, id, value, handleChange }) => (
  <div className="form-group">
    <label htmlFor={label}>{text}</label>
    <input
      type={type}
      className="form-control"
      id={id}
      value={value}
      onChange={handleChange}
      required
    />
  </div>
);
Input.propTypes = {
  label: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  handleChange: PropTypes.func.isRequired
};
export default Input;
```

到这一步我们就可以在容器组件里渲染Input这个子组件了

```jsx
import React, { Component } from "react";
import ReactDOM from "react-dom";
import Input from "../presentational/Input";
class FormContainer extends Component {
  constructor() {
    super();
    this.state = {
      seo_title: ""
    };
    this.handleChange = this.handleChange.bind(this);
  }
  handleChange(event) {
    this.setState({ [event.target.id]: event.target.value });
  }
  render() {
    const { seo_title } = this.state;
    return (
      <form id="article-form">
        <Input
          text="SEO title"
          label="seo_title"
          type="text"
          id="seo_title"
          value={seo_title}
          handleChange={this.handleChange}
        />
      </form>
    );
  }
}
export default FormContainer;
```
写好组件之后，就可以用webpack来打包这些代码啦。

由于前面我们已经定义了webpack入口文件是 ./src/index.js，所以我们先创建一个index.js文件，在里面引入React组件
```js
import FormContainer from "./js/components/container/FormContainer";
```
写好之后，激动人心的时刻到了! 我们终于可以通过运行 npm run build 来生成打包文件，由于我们在配置里定义了输出文件为：dist/bundle.js，所以一切顺利的话， 你现在应该可以看到一个新生成的dist文件，里面有一个bundle.js文件。



## 在HTML文件引入bundle
为了展示我们的React组件，我们需要让webpack生成一个html文件。上面我们生成的bundle.js就会放在这个html文件的script标签里。

webpack需要两个工具来生成这个html文件：`html-webpack-plugin`跟`html-loader`

首先添加这两个依赖：
```bash
npm i html-webpack-plugin html-loader --save-dev
```

然后更新webpack的配置文件
```js
const HtmlWebPackPlugin = require("html-webpack-plugin");
module.exports = {
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      },
      {
        test: /\.html$/,
        use: [
          {
            loader: "html-loader"
          }
        ]
      }
    ]
  },
  plugins: [
    new HtmlWebPackPlugin({
      title: 'Set Up Project',
      filename: "./index.html"
    })
  ]
};
```

`index.html`是我们的模板文件，里面定义了React Component需要插入进入的容器`<div>create-article-form</div>`，不要忘了在FormContainer里用React.render绑定这个。
```html
<!doctype html>
<html>
  <head>
    <title>Getting Started</title>
  </head>
  <body>
    <div id='create-article-form'>
 
    </div>
  </body>
</html>
```

在./src/js/components/container/FormContainer.js 加上下面的代码：
```js
const wrapper = document.getElementById("create-article-form");
wrapper ? ReactDOM.render(<FormContainer />, wrapper) : false;
```

最后，在跑一次构建： `npm run build`

这时候在dist文件夹里就会看到生成的html文件，由于html-webpack-plugin，bundle文件会被自动注入html里。 在浏览器里打开./dist/index.html，你会看到这个React表单。



## webpack dev Server

目前为止，我们来遗留一个问题：每次修改文件的时候，都需要重新跑一次编译

`npm run build`

这样是很麻烦的，我们想达到的效果是自动重新编译。 达到这个目标很简单，只需要3行配置就可以启动运行一个开发服务器。

启动服务器之后webpack就会在浏览器里启动你的应用，而且当你修改保存代码之后，`webpack dev server`还会自动刷新浏览器的窗口。

在启动`webpack dev server`前，需要先安装`npm i webpack-dev-server --save-dev`

打开package.json 加入start script
```js
"scripts": {
  "start": "webpack-dev-server --open --mode development",
  "build": "webpack"
}
```

保存这个文件，最后在跑这个命令 `npm start`

你会在你的浏览器里看到你的应用。

接下来你可以随意修改一下文件内容，会看到webpack dev server会自动刷新浏览器窗口。



## 总结
通过上面的学习，我们已经看到如何从零用webpack 与Babel搭建一个React项目，包括

- 如何安装配置webpack
- 如何安装配置Babel
- 如何安装React
- 如何创建React容器/展示组件
- 如何在html里插入bundle文件
- 如何安装和配置webpack dev server
