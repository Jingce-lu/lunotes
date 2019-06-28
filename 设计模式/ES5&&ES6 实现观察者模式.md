ES5 && ES6 实现观察者模式
===

> 观察者模式:观察者模式（Observer mode）指的是函数自动观察数据对象，
> 一旦对象有变化，函数就会自动执行。而js中最常见的观察者模式就是事件触发机制。

现在，让我们重新实现一个自定义事件。

## ES5实现

要实现一个自定义事件，首先要想清楚我们要干什么。

1. 要有一个对象，存储着它自己的触发函数，所以他的触发函数应该是这种类型
    ```js
    handler = {
      type1:
      type2:
      ...
    }
    ```

2. 这个对象的触发函数可能有很多种，比如一个onclick可能触发多个事件，那么handler的属性应该是一个数组，每个数组的值都是一个函数
    ```js
    handler = {
      type1: [func1,func2...],
      type2: [func2,func4...],
      ...
    }
    ```
3. 现在这个对象的主体部分已经思考好了，现在就是要它‘动起来’，给它添加各种动作。

    一个事件可能有哪些动作呢？
    
    * add：添加事件某种类型的函数，
    * remove: 移除某种类型的函数，
    * fire：触发某种类型的函数,
    * once:触发某种类型的函数，然后移除掉这个函数，


    那么现在我们的自定义事件的骨架已经搭建好了。
        
    ```js
    eventOb={
      //函数储存
      handler:{
        type1:[func1,func2...],
        type2:[func2,func4...],
        ...
      },

      //主要事件
      add:function(){},
      remove:function(){},
      fire:function(){},
      once:function(){},
    }
    ```



下面开始填充这些函数，

### 1. add

添加一个事件监听，首先传入参数应该是 事件类型type，和触发函数 func，传入的时候检测有没有这个函数，有了就不重复添加，那么代码并不难，应该是下面这样。
```js
add: function (type,func) {
   //检测type是否存在
   if(eventOb.handleFunc[type]) {
       //检测事件是否存在，不存在则添加
       if(eventOb.handleFunc[type].indexOf(func)===-1) {
           eventOb.handleFunc[type].push(func);
       }
   } else {
       eventOb.handleFunc[type]=[func];
   }
},
```

### 2. remove

remove也需要指明传入类型和函数，和add很相像，首先我们就写成下面的样子
```js
remove: function (type,func) {
   let target = eventOb.handleFunc[type];
   let index=target.indexOf(func);
   target.splice(index,1);
},
```
看起来很简单，但是remove有一个潜在的需求，就是如果你的事件不存在，它应该会报错。而这里不会报错，index在func不存在的时候是-1；这时候不能正确的删除，也不会报错。

所以我们需要改进一下。
```js
remove: function (type,func) {
   try{
       let target = eventOb.handleFunc[type];
       let index=target.indexOf(func);
       if(index===-1)throw error;
       target.splice(index,1);
   }catch (e){
       console.error('别老想搞什么飞机，删除我有的东西！');
   }
},
```
当index=-1抛出一个错误，好了，解决的很简陋，但是效果还行。


### 3. fire

触发一个点击事件肯定是要触发它全部的函数，这里也是一样，所以只需要传入type，然后事件可能不存在，像上面一样处理。
```js
fire:function (type,func) {
   try{
       let target = eventOb.handleFunc[type];
           let count = target.length;
           for (var i = 0; i < count; i++) {
           //加()使立即执行
               target[i]();
           }
       
   }catch (e){
       console.error('别老想搞什么飞机，触发我有的东西！');
   }
},
```
看起来很还好。但是。。。嗯。先说once。


### 4. once

once这里应该相当简单。感觉起来是这样。。。fire，然后remove？来试试
```js
fire: function (type,func) {
   try{
       let target = eventOb.handleFunc[type];
       if(arguments.length===1) {
           //不传func则全部触发
           let count = target.length;
           for (var i = 0; i < count; i++) {
               target[i]();
           }
       }else{
           //传func则触发func
           let index=target.indexOf(func);
           if(index===-1)throw error;
           func();
       }
      //need some code
   }catch (e){
       console.error('别老想搞什么飞机，触发我有的东西！');
       //need some code
   }
},
```
这样once就写好了？

试试，对一个不存在的事件触发once，发现once会报两个错误，

![once.png](https://upload-images.jianshu.io/upload_images/6967282-1bd8d435afc6190b.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/680/format/webp)

这样当然不太好，想想，嗯可以给fire一个返回值，当fire报错就return false不执行remove

最后的once长这样
```js
once: function (type,func) {
   eventOb.fire(type, func)?
   eventOb.remove(type, func):null;
}
```
并且在fire上面 need code的地方补上return true 和return false，大功告成~

#### 完整代码:

```js
var eventOb = {
    // 函数储存
    handleFunc:{},

    add: function (type,func) {
        if(eventOb.handleFunc[type]){
            //检测事件是否存在，不存在则添加
            if(eventOb.handleFunc[type].indexOf(func)===-1){
                eventOb.handleFunc[type].push(func);
            }
        }else{
            eventOb.handleFunc[type]=[func];
        }

    },
    
    fire: function (type,func) {
        try{
            let target = eventOb.handleFunc[type];
            if(arguments.length===1) {
                // 不传func则全部触发
                let count = target.length;
                for (var i = 0; i < count; i++) {
                    target[i]();
                }
            }else{
                // 传func则触发func
                let index=target.indexOf(func);
                if(index===-1)throw error;
                func();
            }
            return true;
        }catch (e){
            console.error('别老想搞什么飞机，触发我有的东西！');
            return false;
        }
    },

    remove: function (type,func) {
        try{
            let target = eventOb.handleFunc[type];
            let index=target.indexOf(func);
            if(index===-1)throw error;
            target.splice(index,1);
        }catch (e){
            console.error('别老想搞什么飞机，删除我有的东西！');
        }

    },

    once: function (type,func) {
        eventOb.fire(type, func)?
        eventOb.remove(type, func):null;
    }
};
```

## ES6

上面的一个实例我们发现是不能继承的，只有一个实例，我们要用ES5把它改造成一个可以继承的函数的话（并且使用最佳的组合继承模式），首先要把handleFunc挂载在this上，然后把方法挂载在eventOb的prototype上，使用es6则更显而易见。

 ```js
class eventObs {
    constructor(){
        this.handleFunc={}
    }

    add(type,func){
        if(this.handleFunc[type]){
            if(this.handleFunc[type].indexOf(func)===-1){
                this.handleFunc[type].push(func);
            }
        }else{
            this.handleFunc[type]=[func];
        }

    };

    fire(type,func){
        try{

            if(arguments.length===1) {
                let target = this.handleFunc[type];
                let count = target.length;
                for (var i = 0; i < count; i++) {
                    target[i]();
                }
            }else{
                let target = this.handleFunc[type];
                let index=target.indexOf(func);
                if(index===-1)throw error;
                func();
            }
            return true;
        }catch (e){
            console.error('别老想搞什么飞机，触发我有的东西！');
            return false;
        }
    };

    remove(type,func){
        try{
            let target = this.handleFunc[type];
            let index=target.indexOf(func);
            if(index===-1)throw error;
            target.splice(index,1);
        }catch (e){
            console.error('别老想搞什么飞机，删除我有的东西！');
        }

    };

    once(type,func) {
        this.fire(type, func)?
        this.remove(type, func):null;
    }

}
```
