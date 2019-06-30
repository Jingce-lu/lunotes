## 1.通过构造函数+原型实现类
```js
/**
 * 构造器方法/变量和原型中的方法变量之间的区别：
 *  1. 原型上的方法和变量，是该类所有实例化对象共享的。
 *  也就是说，只有一份。
 * 
 *  2. 而构造器内的代码块，则是每个实例化对象单独占有- -
 *  ->不管是否用this.**方式，还是私有变量的方式，都是独占的。 
 * 
 * 所以，在写一个类的时候，需要考虑该新增属性是共享的，还是独占的。
 * 以此，决定在构造器还是原型上进行声明。
 */

//构造函数，默认大写开头
function Toast(option){
    // 类的实例化，一个强制要求的行为，就是需要使用new操作符。
    // 如果不使用new操作符，那么构造器内的this指向，将不是当前的实例化对象。
    // ES5:  使用instanceof做一层防护。 
    // ES6： typeof new.target !== "undefined"
    if(!(this instanceof Toast)){
        return new Toast(option);
    }
 
    // 这里或者抛出一个错误的信息也可以
    //   if(typeof new.target !== "undefined")){
    //       throw new Error('Toast instantiation error');
    //   }

    this.prompt = '';    //toast中的内容
    this.elem = null;    //定义元素dom结构
    this.init(option);  //构造函数的入口；
}
Toast.prototype = {
    // 构造器
    constructor:Toast, //必须重新定义原型指向
    // 初始化方法
    init: function(option){
        this.prompt = option.prompt || '';
        this.render();
        this.bindEvent();
        return this;   //链式操作的核心
    },
    // 显示
    show: function(time){
        var that=this;
        this.changeStyle(this.elem, 'display', 'block');
        setTimeout(function(){
            that.hide();
        },time);
    },
    // 隐藏
    hide: function(){
        this.changeStyle(this.elem, 'display', 'none');
    },
    // 画出dom
    render: function(){
        var html = '';
        this.elem = document.createElement('div');
        this.changeStyle(this.elem, 'display', 'none');
        html += '<a class="J-close" href="javascript:;">x</a>'
        html += '<p style="border:1px solid #a865aa">'+ this.prompt +'</p>';
        this.elem.innerHTML = html;
        return document.body.appendChild(this.elem);
    },
    // 绑定事件
    bindEvent: function(){
        var self = this;

        this.addEvent(this.elem, 'click', function(e){
            if(e.target.className.indexOf('J-close') != -1){
                console.log('close Toast!');
                self.hide();
            }
        });
    },
    // 添加事件方法
    addEvent: function(node, name, fn){
        var self = this;
        node.addEventListener(name,function(){
            fn.apply(self,Array.prototype.slice.call(arguments));
        },false);
    },
    // 改变样式
    changeStyle: function(node, key, value){
        node.style[key] = value;
    }
};
 
var T=new Toast({prompt:'I\'m Toast!'}).show(2000);  //链式操作
```

## 2.构造函数+内部函数+对象字面量对外暴露
```js
/**
 * 在平时开发页面的过程中对于某一块的功能进行内部的封装，
 * 优点是代码组织简洁，需要提前规划好对外暴露的接口
 */
function Toast(){
    // 已点歌曲
    function  init(option){
        this.prompt = option.prompt || '';
        render();
        bindEvent();
    }
    function show(time){
        changeStyle(this.elem, 'display', 'block');
        setTimeout(function(){
            hide();
        },time);
    }
    function  hide(){
        changeStyle(this.elem, 'display', 'none');
    }
    function  render(){
        var html = '';
        this.elem = document.createElement('div');
        changeStyle(this.elem, 'display', 'none');
        html += '<a class="J-close" href="javascript:;">x</a>'
        html += '<p style="border:1px solid #a865aa">'+ this.prompt +'</p>';
        this.elem.innerHTML = html;
        return document.body.appendChild(this.elem);
    }
    //绑定点击事件
    function  bindEvent(){
        var self = this;
        addEvent(this.elem,'click',function(e){
            if(e.target.className.indexOf('J-close') != -1){
                self.hide();
            }else{
                alert("绑定的点击事件生效了");
            }
        });
    }
    // 添加绑定多种事件的方法
    function  addEvent(node,name,fn){
        var self = this;
        node.addEventListener(name,function(){
            fn.apply(self,Array.prototype.slice.call(arguments));
        },false);
    }
    // 改变样式
    function changeStyle(node,key,value){
        node.style[key]=value;
    }


    /**
     * @Desc: 将上述方法综合起来使用，
     * 这些方法仅仅在构造函数内部进行使用，对外仅仅暴露开启和关闭方法即可
     */
    var service = {
        start: function(config){
            init(config);  //构造函数的入口；
            show(20000);
        },
        stop: function(){
            hide();
        }
    };
    return service;  //将该组件的接口暴露出去
}

// 使用案例
var T= new Toast();
T.start({prompt:'I\'m Toast!',elem:document.getElementById("test")});  //先创建一个测试元素
```

## 3. ES6 class创建
```js
/**
 * class类实现可以通过extends对类进行方法继承
 */
class Toast {
    // constructor(x, y) {
    //     this.x = x;
    //     this.y = y;
    // }
    
    // 已点歌曲
    init(option){
        this.prompt = option.prompt || '';
        render();
        bindEvent();
        show(2000);
    }
    show(time){
        changeStyle(this.elem, 'display', 'block');
        setTimeout(function(){
            hide();
        },time);
    }
    hide(){
        changeStyle(this.elem, 'display','none');
    }
    render(config){
        var html = '';
        this.elem = document.createElement('div');
        this.changeStyle(this.elem, 'display', 'block');
        html += '<a class="J-close" href="javascript:;">x</a>'
        html += '<p style="border:1px solid #a865aa">'+ config.prompt +'</p>';
        this.elem.innerHTML = html;
        return document.body.appendChild(this.elem);
    }
    //绑定点击事件
    bindEvent(){
        var self = this;
        this.addEvent(this.elem,'click',function(e){
            if(e.target.className.indexOf('J-close') != -1){
                self.hide();
            }else{
                alert("绑定的点击事件生效了");
            }
        });
    }
    // 添加绑定多种事件的方法
    addEvent(node,name,fn){
        var self = this;
        node.addEventListener(name,function(){
            fn.apply(self,Array.prototype.slice.call(arguments));
        },false);
    }
    // 改变样式
    changeStyle(node,key,value){
        node.style[key]=value;
    }
}
var T= new Toast();
T.render({prompt:'I\'m Toast!',elem:document.getElementById("test")});  //先创建一个测试元素
T.bindEvent();
```
