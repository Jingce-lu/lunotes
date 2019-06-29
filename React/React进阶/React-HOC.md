# React高阶组件
<!-- TOC -->

- [React高阶组件](#react高阶组件)
  - [1. 什么是高阶组件？](#1-什么是高阶组件)
  - [2. 解决什么问题？](#2-解决什么问题)
  - [3. 高阶组件总共分为两大类](#3-高阶组件总共分为两大类)
  - [4. 代理方式](#4-代理方式)
    - [4.1 代理方式之 操纵prop](#41-代理方式之-操纵prop)
    - [4.2 代理方式之 抽取状态](#42-代理方式之-抽取状态)
    - [4.3 代理方式之 包装组件](#43-代理方式之-包装组件)
    - [4.4 代理方式的生命周期函数的过程类似于堆栈调用](#44-代理方式的生命周期函数的过程类似于堆栈调用)
  - [5. 继承方式](#5-继承方式)
    - [5.1 **继承方式之 操纵生命周期（渲染劫持）**](#51-继承方式之-操纵生命周期渲染劫持)
    - [5.2 继承方式之 操纵prop](#52-继承方式之-操纵prop)
  - [6. 彩蛋recompose库](#6-彩蛋recompose库)

<!-- /TOC -->

## 1. 什么是高阶组件？
> 高阶组件是一种用于复用组件逻辑的高级技术，它并不是 React API 的一部分，而是从 React 演化而来的一种模式。具体地说，高阶组件就是一个接收一个组件并返回另外一个新组件的函数！

输入的组件可以是一个组件的实例，也可以是一个组件类，还可以是一个无状态组件的函数。


## 2. 解决什么问题？
随着项目越来越复杂，开发过程中，多个组件需要某个功能，而且这个功能和页面并没有关系，所以也不能简单的抽取成一个新的组件，但是如果让同样的逻辑在各个组件里各自实现，无疑会导致重复的代码。比如页面有三种弹窗一个有title，一个没有，一个又有右上角关闭按钮，除此之外别无它样，你总不能整好几个弹窗组件吧，这里除了tilte,关闭按钮其他的就可以做为上面说的基本材料。



## 3. 高阶组件总共分为两大类
- **代理方式**
    1. 操纵 prop
    2. 访问 ref(不推荐)
    3. 抽取状态
    4. 包装组件

- 继承方式
    1. 操纵生命周期
    2. 操纵prop


## 4. 代理方式
### 4.1 代理方式之 操纵prop

1. 删除prop
```js
import React from 'react'
function HocRemoveProp(WrappedComponent) {
  return class WrappingComponent extends React.Component {
    render() {
      const { user, ...otherProps } = this.props
      return <WrappedComponent {...otherProps} />
    }
  }
}
export default HocRemoveProp
```

2. 增加prop   
接下来我把简化了写法，把匿名函数去掉，同时换成箭头函数
```jsx
import React from 'react'
class HocAddProp = (WrappedComponent, uid) =>
  class extends React.Component {
    render () {
      const newProps = {
        uid
      }
      return <WrappedComponent {...this.props} {...newProps} />
    }
  }
export default HocAddProp
```

上面HocRemoveProp高阶组件中，所做的事情和输入组件WrappedComponent功能一样，只是忽略了名为user的prop。也就是说，如果WrappedComponent能处理名为user的prop,这个高阶组件返回的组件则完全无视这个prop。
```js
const { user, ...otherProps } = this.props;
```

这是一个利用es6语法技巧，经过上面的语句，otherProps里面就有this.props中所有的字段除了user. 假如我们现在不希望某个组件接收user的prop,那么我们就不要直接使用这个组件，而是把这个组件作为参数传递给HocRemoveProp，然后我们把这个函数的返回结果当作组件来使用 两个高阶组件的使用方法：
```js
const  newComponent = HocRemoveProp(SampleComponent);
const  newComponent = HocAddProp(SampleComponent,'1111111');
```

也可以利用decorator语法糖这样使用
```js
import React, { Component } from 'React';
@HocRemoveProp
class SampleComponent extends Component {
  render() {}
}
export default SampleComponent;
```


### 4.2 代理方式之 抽取状态

将所有的状态的管理交给外面的容器组件，这个模式就是 抽取状态，外面的容器就是这个高阶组件。
```js
const HocContainer = (WrappedComponent) => {
  class extends React.Component {
    constructor(props) {
      super(props)
      this.state = {
        name: ''
      }
    }
    onNameChange = (event) => {
      this.setState({
        name: event.target.value
      })
    }
    render () {
      const newProps = {
        name: {
          value: this.state.name,
          onChange: this.onNameChange
        }
      }
      return <WrappedComponent {...this.props} {...newProps} />
    }
  }
}
```

```js
@HocContainer
class SampleComponent extends React.Component {
  render() {
    return <input name="name" {...this.props.name} />
  }
}
```

这样当我们使用这个以及被包裹的input组件(SampleComponent)时候，它的值就被放在了HocContainer高阶组件中，当很多这样的input组件都用这个HocContainer高阶组件时，那么它们的值都将保存在这个 HocContainer 高阶组件中


### 4.3 代理方式之 包装组件
```js
const HocStyleComponent = (WrappedComponent, style) =>{
  class extends React.Component {
    render() {
      return (
        <div style={style}>
          <WrappedComponent {...this.props} {...newProps} />
        </div>
      )
    }
  }
}
```

这样使用
```js
import HocStyleComponent from './HocStyleComponent'
const colorStyle  = {color: '#ff5555'}
const newComponent = HocStyleComponent(SampleComponent, colorStyle)
```


### 4.4 代理方式的生命周期函数的过程类似于堆栈调用
> didmount -> HOC didmount -> (HOCs dismount) -> (HOCs will unmount) -> Hoc will unmount -> unmount



## 5. 继承方式
在说继承方式之前先看一个例子
```js
const MyContainer = (WrappedComponent) => {
  class extends WrappedComponent {
    render() {
      return super.render()
    }
  }
}
```

这个例子很简单，相当于把WrappedComponent组件的render方法，通过super.render()方法吐到了MyContainer中，可以顺序调用。

继承方式的生命周期的过程类似于队列调用：
> didmount -> HOC didmount -> (HOCs didmount) -> will unmount -> HOC will unmount -> (HOCs will unmount) ->

1. 代理方式下 WrappedComponent 会经历一个完整的生命周期，产生的新组件和参数组件是两个不同的组件，一次渲染，两个组件都会经历各自的生命周期。
2. 在继承方式下，产生的新组件和参数组件合二为一， super.render只是生命周期中的函数，变成一个生命周期。


### 5.1 **继承方式之 操纵生命周期（渲染劫持）**  
首先创建一个高阶，在创建一个使用高阶组件，也就是输入组件，最后我在改变这个输入组件 props
```js
import * as React from 'react'
const HocComponent = (WrappedComponent) =>{
  class MyContainer extends WrappedComponent {
    render() {
      if (this.props.time && this.state.success) {
        return super.render()
      }
      return <div>倒计时完成了...</div>
    }
  }
}
```

这个高阶组件会直接读取输入组件中的props,state,然后控制了输入组件的render展示 只有在props.time和state.success同时为真的时候才会展示

```js
import * as React from 'react';
import HocComponent from './HocComponent'
@HocComponent
class DemoComponent extends React.Component {
 constructor(props) {
   super(props);
   this.state = {
    success: true,
   };
}
 render() {
   return <div>我是一个组件</div>
 }
}
export default DemoComponent;
```

然后调用，递减time数值直到变为0最后页面的效果就是，当然他不是循环的。先展示”我是一个组件“，我设置了两秒，之后展示”倒计时完成“
由此可以看出高阶组件也可以控制state

但是最好要限制这样做，可能会让WrappedComponent组件内部状态变得一团糟。建议可以通过重新命名state，以防止混淆。

### 5.2 继承方式之 操纵prop
```js
const HOCPropsComponent = (WrappedComponent) => {
  class extends WrappedComponent {
    render() {
      const elementsTree = super.render()
      let newProps = {
        color: (elementsTree && elementsTree.type === 'div') ? '#fff' : '#ff5555'
      }
      const props = Object.assign({}, elementsTree.props, newProps)
      const newElementsTree = React.cloneElement(elementsTree, props, elementsTree.props.children)
    }
  }
}
```

这样就传入了新的props
```js
React.cloneElement( element, [props], [...children])
参数：TYPE（ReactElement），[PROPS（object）]，[CHILDREN（ReactElement）
```

克隆并返回一个新的 ReactElement ，新返回的元素会保留有旧元素的 props、ref、key，也会集成新的 props。


## 6. 彩蛋recompose库
recompose是一个很流行的库，它提供了很多很有用的高阶组件（小工具），而且也可以优雅的组合它们。

**Step1 扁平props**  
我们有这样一个组件
```js
const Profile = ({user}) => (
  <div>
    <div>Username: {user.username}</div>
    <div>Age: {user.age}</div>
  </div>
)
```

如果想要改变组件接口来接收单个 prop 而不是整个用户对象，可以用 recompose 提供的高阶组件 flattenProp 来实现
```js
const Profile = ({username, age}) => (
  <div>
    <div>Username: {username}</div>
    <div>Age: {age}</div>
  </div>
)
const ProfileWithFlattenUser = flattenProp('user')(Profile)
```

现在我们希望同时使用多个高阶组件：一个用于扁平化处理用户prop,另外一个用于重命名用户对象的单个 prop。此时 recompose 库提供的 compose 函数就派上用场了。

```js
const enhance = compose(
  flattenProp('user'),
  renameProp('username', 'name')
)
```

然后按照以下方式将它应用于原有组件：
```js
const EnhancedProfile = enhance(Profile)
```
还可以将 compose 函数用在我们自己的高阶组件上，甚至结合使用都可以：
```js
const enhance = compose(
  flattenProp('user'),
  renameProp('username', 'name'),
  withInnerWidth
)
```

**Step2 提取输入表单的State** 

我们将从 Recompose 库中使用 withStateHandlers 高阶组件。它将允许我们从组件状态与组件本身隔离开来。
我们将使用它作为电子邮件，密码和确认密码字段添加表单状态，以及上述的时间处理程序。
```js
import { withStateHandlers, compose } from 'recompose'
const initialState = {
  email: {value: ''},
  password: {value: ''},
  confirmPassword: {value: ''}
}
const onChangeEmail = props => event => ({email: {value: event.target.value, isDirty: true })
const onChangePassword = props => event => ({
  password: {
    value: event.target.value,
    isDirty: true
  }
})
const onChangeConfirmPassword = props => event => ({
  confirmPassword: {
    value: event.target.value,
    isDirty: true
  }
})
const withTextFieldState => withStateHandlers(initialState, {
  onChangeEmail,
  onChangePassword,
  onChangeConfirmPassword
})
export default widthTextFieldState
```

withStateHandlers它接受初始状态和包含状态处理程序的对象。调用时，每个状态处理程序将返回新的状态。