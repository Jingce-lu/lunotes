### Vue 组件data为什么必须是函数？

在创建或注册模板的时候，传入一个data属性作为用来绑定的数据。但是在组件中，data必须是一个函数，而不能直接把一个对象赋值给它。
```js
Vue.component('my-component', {
  template: '<div>OK</div>',
  data() {
    return {} // 返回一个唯一的对象，不要和其他组件共用一个对象进行返回
  },
})
```

在前面看到，在new Vue()的时候，是可以给data直接赋值为一个对象的。这是怎么回事，为什么到了组件这里就不行了。

你要理解，上面这个操作是一个简易操作，实际上，它首先需要创建一个组件构造器，然后注册组件。注册组件的本质其实就是建立一个组件构造器的引用。使用组件才是真正创建一个组件实例。所以，注册组件其实并不产生新的组件类，但会产生一个可以用来实例化的新方式。

理解这点之后，再理解js的原型链：
```js
var MyComponent = function() {}
MyComponent.prototype.data = {
  a: 1,
  b: 2,
}
// 上面是一个虚拟的组件构造器，真实的组件构造器方法很多

var component1 = new MyComponent()
var component2 = new MyComponent()
// 上面实例化出来两个组件实例，也就是通过<my-component>调用，创建的两个实例

component1.data.a === component2.data.a // true
component1.data.b = 5
component2.data.b // 5
```

可以看到上面代码中最后三句，这就比较坑爹了，如果两个实例同时引用一个对象，那么当你修改其中一个属性的时候，另外一个实例也会跟着改。这怎么可以，两个实例应该有自己各自的域才对。所以，需要通过下面方法来进行处理：
```js
var MyComponent = function() {
  this.data = this.data()
}
MyComponent.prototype.data = function() {
  return {
    a: 1,
    b: 2,
  }
}
var MyComponent = function() {
  this.data = this.data()
}
MyComponent.prototype.data = function() {
  return {
    a: 1,
    b: 2,
  }
}
function () {
  return {
    a: 1,
    b: 2,
  }
}
var component1 = new MyComponent()
var component2 = new MyComponent()
undefined
component1.data===component2.data
false
component1.data
Object {a: 1, b: 2}
```

这样每一个实例的data属性都是独立的，不会相互影响了。所以，你现在知道为什么vue组件的data必须是函数了吧。这都是因为js本身的特性带来的，跟vue本身设计无关。其实vue不应该把这个方法名取为data()，应该叫setData或其他更容易立即的方法名。