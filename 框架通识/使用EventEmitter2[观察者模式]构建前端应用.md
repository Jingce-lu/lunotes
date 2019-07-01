使用EventEmitter2（观察者模式）构建前端应用
=====

## 观察者模式在前端中的表现形式——事件机制
这里的“事件”，实际上是指“观察者模式（Observer Pattern）”在前端的一种呈现方式。所谓观察者模式可以类比博客“订阅/推送”，你通过RSS订阅了某个博客，那么这个博客有新的博文就会自动推送给你；当你退订阅这个博客，那么就不会再推送给你。

用JavaScript代码可以怎么表示这么一个场景？
```js
var blog = new Blog; // 假设已有一个Blog类实现subscribe、publish、unsubscribe方法

var readerFunc1 = function(blogContent) { 
    console.log(blogContent + " will be shown here.");
}
var readerFunc2 = function(blogContent) { 
    console.log(blogContent + " will be shown here, too.");
}

blog.subscribe(readerFunc1); // 读者1订阅博客
blog.subscribe(readerFunc2); // 读者2订阅博客

blog.publish("This is blog content."); // 发布博客内容，上面的两个读者的函数都会被调用
blog.unsubscribe(readerFunc1); // 读者1取消订阅
blog.publish("This is another blog content."); // readerFunc1函数不再调用，readerFunc2继续调用
```

可以把上面的“新文章”看成是一个事件，“订阅文章”则是“**监听**”这个事件，“发布新文章”则是“**触发**”这个事件，“取消订阅文章”就是“**取消监听**”“新文章”这个事件。假如“**监听**”用on来表示，“**触发**”用emit来表示，“**取消监听**”用off来表示，那么上面的代码可以重新表示为：

```js
var blog = new Blog; // 假设已有一个Blog类实现on、emit、off方法

var readerFunc1 = function(blogContent) { 
    console.log(blogContent + " will be shown here.");
}
var readerFunc2 = function(blogContent) { 
    console.log(blogContent + " will be shown here, too.");
}

blog.on("new post", readerFunc1); // 读者1监听事件
blog.on("new post", readerFunc2); // 读者2监听事件

blog.emit("new post", "This is blog content."); // 发布博客内容，触发事件，上面的两个读者的函数都会被调用
blog.off("new post", readerFunc1); // 读者1取消监听事件
blog.emit("new post", "This is another blog content."); // readerFunc1函数不再调用，readerFunc2继续调用
```

这就是前端中观察者模式的一种具体的表现，使用**on**来监听特定的事件，**emit**触发特定的事件，**off**取消监听特定的事件。再举一个场景“小猫听到小狗叫就会跑”：
```js
var dog = new Dog;
var cat = new Cat;

dog.on("park", function() { 
    cat.run(); 
});

dog.emit("park");
```

巧妙利用观察者模式可以让前端应用开发耦合性变得更加低，开发效率更高。可能说“变得更有趣”会显得有点不专业，但确实会变得有趣。

## EventEmitter2
如果要自己实现一遍也不很复杂：每个“事件名”对应的就是一个函数数组，每次`on`某个事件的时候就是把函数压到对应的函数数组当中；每次`emit`的时候相当于把事件名对应的函数数组遍历一遍进行调用；每次`off`的时候把目标函数从数组当中剔除。

简单实现
```js
function events (obj) {
	if(!isEventObj(obj)) {
		obj.events = {}
		extend(obj, eventsObj)
	}
	return obj
}

var eventsObj = {}

eventsObj.on = function(eventName, handler) {
	var events = this.events || (this.events = {})

	if (events[eventName]) {
		events[eventName].push(handler)
	} else {
		events[eventName] = [handler]
	}
}

eventsObj.off = function(eventName, handler) {
	var events = this.events || (this.events = {})

	if (events[eventName] && handler) {
		var handlers = events[eventName]
		if (handlers) {
			for(var i = 0, len = handlers.length; i < len; i++) {
				if (handlers[i] == handler) {
					handlers.splice(i, 1)
				}
			}
		}
	}
}

eventsObj.emit = function(eventName) {
	var events = this.events || (this.events = {})
	var args = Array.prototype.slice.call(arguments, 1)

	if(events[eventName]) {
		var handlers = events[eventName]
		if (handlers) {
			for(var i = 0, len = handlers.length; i < len; i++) {
				var handler = handlers[i]
				handler.apply(handler, args)
			}
		}
	}
}

function isEventObj (obj) {
	return obj.emit && obj.on && obj.off && obj.events
}
```

EventEmitter2可以供浏览器、或者Node.js使用。安装过程和API就不在这里累述，参照官方文档即可。使用Browserify或者Node.js可以非常方便地引用EvenEmitter2，只需要require即可。示例：
```js
var EventEmitter2 = require('eventemitter2').EventEmitter2;
var emitter = new EventEmitter2;

emitter.on("Hello World", function() {
    console.log("Somebody said: Hello world.");
});

emitter.emit("Hello World"); // 输出 Somebody said: Hello world.
```

## EventEmitter2作为父类给给子类提供事件机制
但在实际应用当中，很少单纯EventEmitter直接实例化来使用。比较多的应用场景是，为某些已有的类添加事件的功能。如上面的第一章中的“小猫听到小狗叫就会跑”的例子，Cat和Dog类本身就有自己的类属性、方法，需要的是为已有的Cat、Dog添加事件功能。这里就需要让EventEmitter作为其他类的父类进行继承。

```js
var EventEmitter2 = require('eventemitter2').EventEmitter2;

// Cat子类继承父类构造字
function Cat() {
    EventEmitter2.apply(this);
    // Cat 构造子，属性初始化等
} 

// 原型继承
Cat.prototype = Object.create(EventEmitter2.prototype); 
Cat.prototype.constructor = Cat; 

// Cat类方法
Cat.prototype.run = function () {
    console.log("This cat is running...");
}

var cat = new Cat;
console.assert(typeof cat.on == "function"); // => true
console.assert(typeof cat.run == "function"); // => true
```

很棒是吧，这样就可以即有EventEmitter2的原型方法，也可以定义Cat自身的方法。

这一点都不棒！每次定义一个类都要重新写一堆啰嗦的东西，下面做个继承的改进：构建一个函数，只需要传入已经定义好的类就可以在不影响类原有功能的情况下，让其拥有EventEmitter2的功能：
```js
// Function `eventify`: Making a class get power of EventEmitter2!
// @copyright: Livoras
// @date: 2015/3/27
// All rights reserve!

function eventify(klass) {
    if (klass.prototype instanceof EventEmitter2) {
        console.warn("Class has been eventified!");
        return klass;
    }

    function Tempt() {
        klass.apply(this, arguments);
        EventEmitter2.call(this);
    };
    function Tempt2() {};

    Tempt2.prototype = Object.create(EventEmitter2.prototype)
    Tempt2.prototype.constructor = EventEmitter2;

    var temptProp = Object.create(Tempt2.prototype);
    var klassProp = klass.prototype;

    for (var attr in klassProp) {
        temptProp[attr] = klassProp[attr];
    }

    Tempt.prototype = temptProp;
    Tempt.prototype.constructor = klass;

    return Tempt;
}
```

上面的代码可以的实现原理在这里并不重要的，有兴趣的可以接下来的博客，会继续讨论eventify的实现原理。在这里只需要知道，有了eventify就可以很方便的给类添加EventEmitter2的功能，使用方法如下：
```js
// Dog类的构造函数和原型方法定义
function Dog(name) {
  this.name = name;
}

Dog.prototype.park = function() {
  console.log(this.name + " parking....");
}

// 使Dog具有EventEmitter2功能
Dog = eventify(Dog);
var dog = new Dog("Jerry");

dog.on("somebody is coming", function() {
    dog.park();
})

dog.emit("somebody is coming") // 输出 Jerry is parking....
```

如上面的代码，现在没有必要为Dog类重新书写类继承代码，只需要按正常的方式定义好Dog类，然后传入eventify函数即可使Dog获取EventEmitter2的功能。本文接下来的讨论会持续使用`eventify`函数。

注意：如果你正在使用CoffeeScript，直接使用CoffeeScript自带的extends进行类继承即可，无需上面复杂的代码：
```js
class Dog extends EventEmitter2
    constructor: ->
        super.apply @, arguments
    park: ->
        // ...
```

## EventEmitter2 在组件化的前端架构中的应用
### 组件化的前端架构
当一个前端应用足够复杂的时候，往往需要对应用进行“组件化”。所谓组件化，就是把一个大的应用拆分成多个小的应用。每个“应用”具有自己独特的结构和内容、样式和业务逻辑，这些小的应用称为“组件”（Component）。组件的复用性一般很强，是DRY原则的应用典范，多个组件的嵌套、组合，构建成了一个完成而复杂的应用。

举我在《一种SPA（单页面应用）架构》举过的例子，博客的评论功能组件：
![2019070101](../resource/assets/2019070101.jpg)

这个评论组件的功能大概如此：**可显示多条评论（comment）；每条评论多条有自己的回复（reply）；评论或者回复都会显示有用户头像，鼠标放到用户头像上会显示该用户的信息（类似微博的功能）**。

这里可以把这个功能分好几个组件：

1. 整体评论功能作为一个组件：commentsBox
2. commentsBox有子组件（child component）comment负责显示用户的评论
3. 每个comment组件有子组件replay负责显示用户对评论的回复
4. commentsBox有子组件user-info-card负责显示用户的信息

组件这样的关系可以用树的结构来表示：
![2019070102](../resource/assets/2019070102.png)

这里要注意的是组件之间的关系一般有两种：嵌套和组合。嵌套，如，每个commentBox有comment和user-info-card，comment和user-info-card是嵌套在commentBox当中的，所以这两个组件和commentBox之间都是嵌套的关系；组合，comment和user-info-card都是作为commentBox的子组件存在，他们两个互为兄弟，是组合的关系。处理组件之间的嵌套和组合关系是架构层面需要解决的最重要的问题之一，不在本文讨论范围内，故不累述。但接下来我们讨论的“组件之间以事件的形式进行消息传递”和这些组件之间的关系密切相关。

当开始按照上面的设计进行组件化的时候，我们首先要做的是为每个组件构建一个超类，所有的组件都应该继承这个超类：

component.js:
```js
eventify = require("./eventify.js");

// Component构造函数
function Component(parent) {
    this.$el = $("...")
    this.parent = parent;
}

// Component原型方法
Component.prototype.init = function () {/* ... */};

module.exports = eventify(Component);
```
这里为了方便起见，Component基本什么内容都没有，几乎只是一个“空”的类，而它通过eventify函数获得了“超能力”，所以继承Component的类同样具有事件的功能。

注意Component构造函数，每个Component在示例化的时候应该传入一个它所属的父组件的实例parent，接下来会看到，组件之间的消息通信可以通过这个实例来完成。而$el可以看作是该组件所负责的HTML元素。


### 父子、兄弟组件之间的消息传递
现在把注意力放在commentsBox、comment、user-info-card三个组件上，暂且忽略reply。

目前要实现的功能是：鼠标放到comment组件的用户头像上，就会显示用户信息。要把这个功能完成大概是这么一个事件流程：comment组件监听用户鼠标放在头像上的交互事件，然后通过`this.parent`向父组件（commentsBox）传递该事件（`this.parent`就是commentsBox），commentsBox获取到该事件以后触发一个事件给user-info-card，user-info-card可以通过`this.parent`监听到该事件，显示用户信息。
```js
// comment-component.js
// 从Component类中继承获得Comment类
// ...

// 原型方法
Comment.prototype.init = function () {
    var that = this;
    this.$el.find("div.avatar").on("mouseover", function () { 
        // 这里的that.parent相当于父组件CommentsBox，在Comment组件被示例化的时候传入
        that.parent.emit("comment:user-mouse-on-avatar", this.userId);
    })
}
```
上述代码为当用户把鼠标放到用户头像的时候触发一个事件comment:user-mouse-on-avatar，这里需要注意的是，通过组件名:事件名给这样的事件命名方式可以区分事件的来源组件或目标组件，是一种比较好的编程习惯。
```js
// comments-box-component.js
// 从Component类中继承获得CommentsBox类
// ...

// 原型方法
CommentsBox.prototype.init = function() {
    var that = this;
    this.on("comment:user-mouse-on-avatar", function (userId) { // 这里接受到来自Comment组件的事件
        that.emit("user-info-card:show-user-info", userId); // 把这个事件传递给user-info-card组件                                                                        
    });
}
```

上述代码中commentsBox获取到来自comment组件的`comment:user-mouse-on-avatar`事件，由于user-info-card组件也同时拥有commentsBox的实例，所以commentsBox可以通过触发自身的事件`user-info-card:show-user-info`来给user-info-card组件传递事件。再一次注意这里到事件名，`user-info-card:`前缀说明这个事件是由user-info-card组件所接收的。
```js
// user-info-card-component.js
// 从Component类中继承获得UserInfoCard类
// ...

// 原型方法
UserInfoCard.prototype.init = function () {
    var that = this;
    this.parent.on("user-info-card:show-user-info", function (userId) {
        $.ajax({ // 通过ajax获取用户数据
            url: "/users/" + userId,
            method: "GET"
        }).success(function(data) { 
            that.render(data); // 渲染用户信息
            that.show(); // 显示信息
        })
    });
}
```

上述代码中，user-info-card组件通过this.parent获取到来自其父组件（也就是commentsBox）的事件`user-info-card:show-user-info`，并且得到所传入的用户id；然后通过ajax向服务器发送用户id，请求用户数据渲染页面数据然后显示。

这样，消息就通过事件机制从comment到达了它的父组件commentsBox，然后通过commentsBox到达它的兄弟组件user-info-card。完成了一个父子组件之间、兄弟之间的消息传递过程：

![2019070103](../resource/assets/2019070103.png)

按照这种消息传递方式的事件有四种类型：
1. this.parent.emit，触发父组件的事件，由父组件监听，相当于告知父组件自己所发生的事情。
2. this.parent.on，监听父组件的事件，由父组件触发，相当于接收处理来自父组件的指令。
3. this.emit，触发自己的事件，由子组件监听，相当于向某个子组件发送命令。
4. this.on，监听自己的事件，由子组件触发，相当于接受处理来自子组件的事件。

每个组件只要hold住一个其父组件实例，就可以完成：
1. 和父组件直接进行消息通信
2. 通过父组件和自己的兄弟组件间接进行消息通信

两个功能。

### 使用事件总线（eventbus）进行跨组件消息传递
现在可以把注意力放到reply组件上，reply作为comment的子组件，负责显示这条评论下的回复。类似地，它有回复者的用户头像，鼠标放上去以后也可以显示用户的信息。

user-info-card是commentsBox的子组件，reply是comment的子组件；user－info-card和reply既不是父子也不是兄弟节点关系，reply无法按照上面的方式比较直接地把事件传递给它；reply的鼠标放到头像上的事件需要先传递给其父组件comment，然后经过comment传递给commentsBox，最后通过commentsBox传递给user-info-card组件。如下：

![2019070104](../resource/assets/2019070104.png)

看起来好像比较麻烦，reply离它根组件commentsBox高度为二，嵌套了两层。假设reply嵌套了很多层，那么事件的传递就类似浏览器的事件冒泡一样，需要先冒泡到根节点commentsBox，再由跟节点把事件发送给user-info-card。

如果要真的这样写会带来相当大的维护成本，当组件之间的交互方式更改了甚至只是单单修改了事件名，中间层的负责事件转发的都需要把代码重新修改。而且，这些负责转发的组件需要维护和自己业务逻辑并不相关的逻辑，违反单一职责原则。

解决这个问题的方式就是：**提供一个组件之间共享的事件对象eventbus，可以负责跨组件之间的事件传递。**所有的组件都可以从这个这个总线上触发事件，也可以从这个总线上监听事件。

![2019070105](../resource/assets/2019070105.png)

commom/eventbus.js
```js
var EventEmitter2 = require('eventemitter2').EventEmitter2;

module.exports = new EventEmitter2; // eventbus是一个简单的EventEmitter2对象
```
那么reply组件和user-info-card就可以通过eventbus进行之间的信息交换，在reply组件中：
```js
// reply.js
// 从Component类中继承获得Reply类
// ...

eventbus = require("../common/eventbus.js");

// 原型方法
Reply.prototype.init = function () {
    var that = this;
    this.$el.find("div.avatar").on("mouseover", function () { 
        // 触发eventbus上的事件user-info-card:show-user-info
        eventbus.emit("user-info-card:show-user-info", that.userId); 
    })
}
```

在user-info-card组件当中：
```js
// user-info-card-component.js
// 从Component类中继承获得UserInfoCard类
// ...

eventbus = require("../common/eventbus.js");

// 原型方法
UserInfoCard.prototype.init = function () {
    var that = this;

    // 原来的逻辑不变
    this.parent.on("user-info-card:show-user-info", getUserInfoAndShow); 

    // 新增获取eventbus的事件
    eventbus.on("user-info-card:show-user-info", getUserInfoAndShow); 

    function getUserInfoAndShow (userId) {
        $.ajax({ // 通过ajax获取用户数据
            url: "/users/" + userId,
            method: "GET"
        }).success(function(data) { 
            that.render(data); // 渲染用户信息
            that.show(); // 显示信息
        });   
    };
};
```
这样user-info-card和就跨越了组件嵌套组合的关系，直接进行组件之间的信息事件的交互。

![2019070106](../resource/assets/2019070106.png)

### 问题就来了
那么问题就来了：
1. 既然eventbus这么方便，为什么不所有组件都往eventbus上发送事件，这样不就不需要组件的事件转发，方便多了吗？
2. 什么时候使用eventbus进行事件传递，什么时候通过组件转发事件？

如果所有的组件都往eventbus上post事件，那么就会带来eventbus上事件的维护的困难；我们可以类比一下JavaScript里面的全局变量，假如所有函数都不自己维护局部变量，而都使用全局变量会带来什么问题？想想都觉得可怕。既然这个事件交互只是在局部组件之间交互的，那么就尽量不要把它post到eventbus，eventbus上的事件应该尽量少，越少越好。

那什么时候使用eventbus上的事件？这里给出一个原则：**当组件嵌套了三层以上的时候，带来局部事件转发维护困难的时候，就可以考虑祭出eventbus**。而在实际当中很少会出现三层事件传播这种情况，也可保持eventbus事件的简洁。（按照这个原则上面的reply是不需要使用eventbus的，但是为了阐述eventbus而使用，这点要注意。）
