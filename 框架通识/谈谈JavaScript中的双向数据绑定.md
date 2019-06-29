# 谈谈JavaScript中的双向数据绑定

<!-- TOC -->

- [谈谈JavaScript中的双向数据绑定](#谈谈javascript中的双向数据绑定)
    - [原理](#原理)
    - [使用jQuery的简单实现](#使用jquery的简单实现)
    - [不使用jQuery来创建数据双向绑定](#不使用jquery来创建数据双向绑定)

<!-- /TOC -->

## 原理
双向数据绑定指的是将对象属性变化绑定到UI，或者反之。换句话说，如果我们有一个拥有name属性的user对象，当我们给user.name赋予一个新值是UI也会相应的显示新的名字。同样的，如果UI包括了一个输入字段用来输入用户名，输入一个新的值会导致user对象中的那么属性发生变化。

双向数据绑定底层的思想非常的基本，它可以被压缩成为三个步骤：
1. 我们需要一个方法来识别哪个UI元素被绑定了相应的属性 
2. 我们需要监视属性和UI元素的变化 
3. 我们需要将所有变化传播到绑定的对象和元素

虽然实现的方法有很多，但是最简单也是最有效的途径是使用**发布者-订阅者模式**。   

思想很简单：我们可以使用自定义的data属性在HTML代码中指明绑定。所有绑定起来的JavaScript对象以及DOM元素都将“订阅”一个发布者对象。任何时候如果JavaScript对象或者一个HTML输入字段被侦测到发生了变化，我们将代理事件到发布者-订阅者模式，这会反过来将变化广播并传播到所有绑定的对象和元素。

## 使用jQuery的简单实现
使用jQuery来实现双向数据绑定非常的直接且简单，因为这个流行的库能够是我们轻松的订阅和发布DOM事件，以及我们自定义的事件：
```js
function DataBinder(object_id){
    //使用一个jQuery对象作为简单的订阅者发布者
    var pubSub = jQuery({});

    //我们希望一个data元素可以在表单中指明绑定：data-bind-<object_id>="<property_name>"        

    var data_attr = "bind-" + object_id,
            message = object_id + ":change";

    //使用data-binding属性和代理来监听那个元素上的变化事件
    // 以便变化能够“广播”到所有的关联对象   

    jQuery(document).on("change","[data-" + data_attr + "]",function(evt){
        var input = jQuery(this);
        pubSub.trigger(message, [ $input.data(data_attr),$input.val()]);
    });

    //PubSub将变化传播到所有的绑定元素，设置input标签的值或者其他标签的HTML内容   

    pubSub.on(message,function(evt,prop_name,new_val){
        jQuery("[data-" + data_attr + "=" + prop_name + "]").each(function(){
        var $bound = jQuery(this);

        if($bound.is("input,text area,select")){
            $bound.val(new_val);
        }else{
            $bound.html(new_val);
        }
        });
    });

    return pubSub;
}
```

在这个实验中可以按照以下代码简单的实现一个User模型：
```js
function User(uid){
    var binder = new DataBinder(uid),

        user = {
            atttibutes: {},

            //属性设置器使用数据绑定器PubSub来发布变化   

            set: function(attr_name,val){
                this.attriures[attr_name] = val;
                binder.trigger(uid + ":change", [attr_name, val, this]);
            },

            get: function(attr_name){
                return this.attributes[attr_name];
            },

            _binder: binder
        };

        binder.on(uid +":change",function(vet,attr_name,new_val,initiator){
            if(initiator !== user){
                user.set(attr_name,new_val);
            }
        })
}
```

现在，无论我们什么时候想把模型的属性绑定到UI的一部分上，我们只需要在相应的HTML元素上设置一个合适的data属性即可。
```js
//JavaScript

var user = new User(123);
user.set("name","Wolfgang");

//html

<input type="number" data-bind-123="name" />   
```

input字段的值会自动反映出user对象的name属性，反之亦然。任务完成了！

## 不使用jQuery来创建数据双向绑定
使用原生的JavaScript来实现一个自定义的PubSub以及观察DOM事件。
```js
function DataBinder(object_id){
    //创建一个简单地PubSub对象   

    var pubSub = {
        callbacks: {}.

        on: function(msg,calssback){
            this.callbacks[msg] = this.callbacks[msg] || [];
            this.callbacks[msg].push(callback);
        },

        publish: function(msg){
            this.callbacks[msg] = this.callbacks[msg] || [];
            for(var i = 0, len = this.callbacks[msg].length; i<lenli++){
                this.callbacks[msg][i].apply(this,arguments);
            }
        }
    },

    data_attr = "data-bind-" + object_id,
    message = object_id + ":change",

    changeHandler = function(evt){
        var target = evt.target || evt.srcElemnt, //IE8兼容
            prop_name = target.getAttribute(data_attr);

            if(prop_name && prop_name !== ""){
                pubSub.publish(message,prop_name,target.value);
            }
    };

    //监听变化事件并代理到PubSub 
    if(document.addEventListener){
        document.addEventListener("change",changeHandler,false);
    }else{
        //IE8使用attachEvent而不是addEventListener     
        document.attachEvent("onchange",changeHandler);
    }

    //PubSub将变化传播到所有绑定元素    

    pubSub.on(message,function(vet,prop_name,new)_val){
        var elements = document.querySelectorAll("[" + data_attr + "=" + prop_name + "]"),
                tah_name;

        for(var i = 0,len =elements.length; i < len; i++){
            tag_name = elements[i].tagName.toLowerCase();

            if(tag_name === "input" || tag_name === "textarea" || tag_name === "select"){
            elements[i].value = new_val;
            }else{
                elements[i].innerHTML = new_val;
            }
        }
    });

    return pubSub;
}
```

模型可以和勤勉你的例子保持一直，除了在设置器中调用那个jQuery的trigger方法之外，它需要通过调用一个自定义的PubSub的publish方法来实现：
```js
//在model的设置器中   

function User(uid){
//...

user = {
//...
set: function(attr_name,val){
    this.attribute[attr_name] = val;
    //使用“publish”方法  
    binder.publish(uid+ ":change", attr_name, val,this);
        }
    }

    //...
}   
```