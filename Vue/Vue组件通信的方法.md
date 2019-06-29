# Vue组件通信的方法
<!-- TOC -->

- [Vue组件通信的方法](#vue组件通信的方法)
	- [通过设置监听单一事件可以管理组件之间的通信](#通过设置监听单一事件可以管理组件之间的通信)

<!-- /TOC -->

## 通过设置监听单一事件可以管理组件之间的通信

【组件】是Vue框架的最核心的概念，通过Vue构建的应用，每一个模块都可以看成是一个单独的组件，那么每个组件之间就避免不了要互相通信、传输数据，**其中一种方法：通过设置监听单一事件可以管理组件之间的通信，彼此传输数据**，具体方法如下：

比如现在有三个组件：组件a、组件b和组件c，点击组件a和b中的按钮，将它们各自的数据传输给组件c并加以显示，这样就涉及到了组件a或b动态修改组件c中的数据这个问题了。

html部分：
```html
<div id="wrap">
  <!--自定义的三个组件-->
	<my-a></my-a>
	<my-b></my-b>
	<my-c></my-c>
</div>
```

js部分：
```js
//new一个空中vue对象，用于操作$emit、和$on事件
var Fn = new Vue();

//组件a
var A = {
	template : `
		<div>
			<span>这是a组件的数据</span>
			<button v-on:click="func();">释放a组件的数据</button>
		</div>
	`,
	data : function(){
		return {
			a : '这是a组件的数据！！！'
		}
	},
	methods : {
		//设置一个方法，设置一个data-a事件，并传输当前this.a的数据
		func : function(){
			Fn.$emit('data-a', this.a);
		}
	}
}

//组件b
var B = {
	template : `
		<div>
			<span>这是b组件的数据</span>
			<button v-on:click="func();">释放b组件的数据</button>
		</div>
	`,
	data : function(){
		return {
			a : '这是b组件的数据！！！'
		}
	},
	methods : {
		//设置一个方法，设置一个data-b事件，并传输当前this.a的数据
		func : function(){
			Fn.$emit('data-b', this.a);
		}
	}
}

//组件c
var C = {
	template : `
		<div>
			<span>这是c组件的数据：</span>
			<p>获取a组件中的数据为:{{a}}</p>
			<p>获取b组件中的数据为：{{b}}</p>
		</div>
	`,
	data : function(){
		return {
			a : '',
			b : ''
		}
	},
	mounted : function(){
		var This = this;
		
		//监听到data-a事件是否有发生变化，如果发生变化，则取到想对应的数据（回调函数的参数）
		Fn.$on('data-a', function(msg){
			//这一这里不能用this.a来获取数据，因为this指向不同
			This.a = msg;
		});
		
		//监听到data-b事件是否有发生变化，如果发生变化，则取到想对应的数据（回调函数的参数）
		Fn.$on('data-b', function(msg){
			this.b = msg;
		}.bind(this));//通过bind方法来改变this指向
	}
}

//实例化vue对象
new Vue({
	el : '#wrap',
	components : {
		'my-a' : A,
		'my-b' : B,
		'my-c' : C
	}
});
```