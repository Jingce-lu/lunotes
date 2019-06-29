# React Router页面传值的三种方法
<!-- TOC -->

- [React Router页面传值的三种方法](#react-router页面传值的三种方法)
  - [一. props.params](#一-propsparams)
  - [二.query](#二query)
  - [三.state](#三state)

<!-- /TOC -->

本文主要介绍React Router定义路由之后如何传值，有关React和React Router 

> 注：本文示例React Router版本为：3.0.2，使用前请注意检查版本

## 一. props.params
官方例子使用`React router`定义路由时，我们可以给`<Route>`指定一个`path`，然后指定通配符可以携带参数到指定的path： 
首先定义路由到UserPage页面:

```js
import { Router,Route,hashHistory} from 'react-router';
```

```jsx
class App extends React.Component {
  render() {
    return (
        <Router history={hashHistory}>
            <Route path='/user/:name' component={UserPage}></Route>
        </Router>
    )
  }
}
```

上面指定参数一个参数name 
使用：
```js
import {Link,hashHistory} from 'react-router';
```

1. Link组件实现跳转：
    ```js
    <Link to="/user/sam">用户</Link>
    ```

2. history跳转：
    ```js
    hashHistory.push("/user/sam");
    ```

当页面跳转到UserPage页面之后，取出传过来的值：
```jsx
export default class UserPage extends React.Component{
    constructor(props){
        super(props);
    }
    render(){
        return(<div>this.props.params.name</div>)
    }
}
```

**上面的方法可以传递一个或多个值，但是每个值的类型都是字符串，没法传递一个对象,如果传递的话可以将json对象转换为字符串，然后传递过去，传递过去之后再将json字符串转换为对象将数据取出来** 

如：定义路由：
```js
<Route path='/user/:data' component={UserPage}></Route>
```

使用：
```js
var data = {id:3,name:sam,age:36};
data = JSON.stringify(data);
var path = `/user/${data}`;
```

```js
// 1
<Link to={path}>用户</Link>

//2
hashHistory.push(path);
```

获取数据：
```js
var data = JSON.parse(this.props.params.data);
var {id,name,age} = data;
```

通过这种方式跳转到UserPage页面时只能通过传递字符串来传递参数，那么是否有其他方法来优雅地直接传递对象而不仅仅是字符串呢？

## 二.query
query方式使用很简单，类似于表单中的get方法，传递参数为明文： 

首先定义路由：
```jsx
<Route path='/user' component={UserPage}></Route>
```

使用：
```js
var data = {id:3,name:sam,age:36};
var path = {
  pathname:'/user',
  query:data,
}
```

```js
// 1
<Link to={path}>用户</Link>

// 2
hashHistory.push(path);
```

获取数据：
```js
var data = this.props.location.query;
var {id,name,age} = data;
```

query方式可以传递任意类型的值，但是页面的URL也是由query的值拼接的，URL很长，那么有没有办法类似于表单post方式传递数据使得传递的数据不以明文传输呢？


## 三.state

state方式类似于post方式，使用方式和query类似， 

首先定义路由：
```js
<Route path='/user' component={UserPage}></Route>
```

使用：
```js
var data = {id:3,name:sam,age:36};
var path = {
  pathname:'/user',
  state:data,
}
```

```js
// 1
<Link to={path}>用户</Link>

// 2
hashHistory.push(path);
```

获取数据：
```js
var data = this.props.location.state;
var {id,name,age} = data;
```

state方式依然可以传递任意类型的数据，而且可以不以明文方式传输。

可以在实现后对比地址栏的URL来观察三种传值方式URL的区别
