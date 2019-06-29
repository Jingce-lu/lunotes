# 开发插件

<!-- TOC -->

- [开发插件](#开发插件)
    - [官方文档](#官方文档)
    - [vue-toast 插件](#vue-toast-插件)
    - [开发 vue-toast 插件](#开发-vue-toast-插件)
        - [完整code：](#完整code)
            - [js](#js)
            - [CSS：](#css)
            - [使用：](#使用)
    - [download code](#download-code)

<!-- /TOC -->

## 官方文档
Vue.js 的插件应该有一个公开方法 `install`。这个方法的第一个参数是 `Vue` 构造器，第二个参数是一个可选的选项对象：
```js
MyPlugin.install = function (Vue, options) {
  // 1. 添加全局方法或属性, 如: vue-custom-element
  Vue.myGlobalMethod = function () {
    // 逻辑...
  }

  // 2. 添加全局资源：指令/过滤器/过渡等，如 vue-touch
  Vue.directive('my-directive', {
    bind (el, binding, vnode, oldVnode) {
      // 逻辑...
    }
    ...
  })

  // 3. 注入组件
  Vue.mixin({
    created: function () {
      // 逻辑...
    }
    ...
  })

  // 4. 添加实例方法，通过把它们添加到 Vue.prototype 上实现
  Vue.prototype.$myMethod = function (methodOptions) {
    // 逻辑...
  }
}
```

## vue-toast 插件
 vue-toast 插件则是通过添加实例方法实现的。我们先来看个小例子。
 
 先新建个js文件来编写插件：toast.js
```js
 // toast.js
var Toast = {};
Toast.install = function (Vue, options) {
	Vue.prototype.$msg = 'Hello World';
}
module.exports = Toast;
```

在 main.js 中，需要导入 toast.js 并且通过全局方法 Vue.use() 来使用插件：
```js
// main.js
import Vue from 'vue';
import Toast from './toast.js';
Vue.use(Toast);
```

然后，我们在组件中来获取该插件定义的 $msg 属性。
```js
// App.vue
export default {
	mounted(){
		console.log(this.$msg); // Hello World
	}
}
```

可以看到，控制台成功的打印出了 Hello World 。既然 $msg 能获取到，那么我们就可以来实现我们的 vue-toast 插件了。

## 开发 vue-toast 插件

需求：在组件中通过调用 **`this.$toast(‘网络请求失败’)`** 来弹出提示，默认在底部显示。可以通过调用 `this.$toast.top()` 或 `this.$toast.center()` 等方法来实现在不同位置显示。

整理一下思路，弹出提示的时候，我可以在 body 中添加一个 div 用来显示提示信息，不同的位置我通过添加不同的类名来定位，那就可以开始写了。
```js
// toast.js
var Toast = {};
Toast.install = function (Vue, options) {
	Vue.prototype.$toast = (tips) => {
		let toastTpl = Vue.extend({     // 1、创建构造器，定义好提示信息的模板
			template: '<div class="vue-toast">' + tips + '</div>'
		});
		let tpl = new toastTpl().$mount().$el;  // 2、创建实例，挂载到文档以后的地方
		document.body.appendChild(tpl);     // 3、把创建的实例添加到body中
		setTimeout(function () {        // 4、延迟2.5秒后移除该提示
			document.body.removeChild(tpl);
		}, 2500)
	}
}
module.exports = Toast;
```

好像很简单，我们就实现了 this.$toast() ，接下来显示不同位置
```js
// toast.js
['bottom', 'center', 'top'].forEach(type => {
	Vue.prototype.$toast[type] = (tips) => {
		return Vue.prototype.$toast(tips,type)
	}
})
```

这里把 type 传给 $toast 在该方法里进行不同位置的处理，上面说了通过添加不同的类名(toast-bottom、toast-top、toast-center)来实现，那 $toast 方法需要小小修改一下
```js
Vue.prototype.$toast = (tips,type) => {     // 添加 type 参数
	let toastTpl = Vue.extend({             // 模板添加位置类
		template: '<div class="vue-toast toast-'+ type +'">' + tips + '</div>'
	});
	...
}
```

好像差不多了。但是如果我想默认在顶部显示，我每次都要调用 `this.$toast.top()` 好像就有点多余了，我能不能` this.$toast()` 就直接在我想要的地方呢？还有我不想要 `2.5s` 后才消失呢？这时候注意到 `Toast.install(Vue,options)` 里的` options` 参数，我们可以在 `Vue.use()` 通过 `options` 传进我们想要的参数。最后修改插件如下：
```js
var Toast = {};
Toast.install = function (Vue, options) {
	let opt = {
		defaultType:'bottom',   // 默认显示位置
		duration:'2500'         // 持续时间
	}
	for(let property in options){
		opt[property] = options[property];  // 使用 options 的配置
	}
	Vue.prototype.$toast = (tips,type) => {
		if(type){
			opt.defaultType = type;         // 如果有传type，位置则设为该type
		}
		if(document.getElementsByClassName('vue-toast').length){
			// 如果toast还在，则不再执行
			return;
		}
		let toastTpl = Vue.extend({
			template: '<div class="vue-toast toast-'+opt.defaultType+'">' + tips + '</div>'
		});
		let tpl = new toastTpl().$mount().$el;
		document.body.appendChild(tpl);
		setTimeout(function () {
			document.body.removeChild(tpl);
		}, opt.duration)
	}
	['bottom', 'center', 'top'].forEach(type => {
		Vue.prototype.$toast[type] = (tips) => {
			return Vue.prototype.$toast(tips,type)
		}
	})
}
module.exports = Toast;
```

这样子一个简单的 vue 插件就实现了，并且可以通过 npm 打包发布，下次就可以使用 npm install 来安装了。

### 完整code：

#### js
```js
/**
 * Updated by libin on 2017/11/5.
 */
var Toast = {};
var showToast = false, // 存储toast显示状态
	showLoad = false, // 存储loading显示状态
	toastVM = null, // 存储toast vm
	loadNode = null; // 存储loading节点元素

Toast.install = function(Vue, options) {

	var opt = {
		defaultType: 'bottom',
		duration: '2500',
		wordWrap: false
	};
	for(var property in options) {
		opt[property] = options[property];
	}

	Vue.prototype.$toast = function(tips, type) {

		var curType = type ? type : opt.defaultType;
		var wordWrap = opt.wordWrap ? 'lx-word-wrap' : '';
		var style = opt.width ? 'style="width: ' + opt.width + '"' : '';
		var tmp = '<div v-show="show" :class="type" class="lx-toast ' + wordWrap + '" ' + style + '>{{tip}}</div>';

		if(showToast) {
			// 如果toast还在，则不再执行
			return;
		}
		if(!toastVM) {
			var toastTpl = Vue.extend({
				data: function() {
					return {
						show: showToast,
						tip: tips,
						type: 'lx-toast-' + curType
					}
				},
				template: tmp
			});
			toastVM = new toastTpl();
			console.log(toastVM)
			var tpl = toastVM.$mount().$el;
			document.body.appendChild(tpl);
		}
		toastVM.type = 'lx-toast-' + curType;
		toastVM.tip = tips;
		toastVM.show = showToast = true;

		setTimeout(function() {
			toastVM.show = showToast = false;
		}, opt.duration)
	};
	['bottom', 'center', 'top'].forEach(function(type) {
		Vue.prototype.$toast[type] = function(tips) {
			return Vue.prototype.$toast(tips, type)
		}
	});

	Vue.prototype.$loading = function(tips="loading...", type) {
		if(type == 'close') {
			if(loadNode){
				loadNode.show = showLoad = false;
			}else{
				return false;
			}
			
		} else {
			if(showLoad) {
				// 如果loading还在，则不再执行
				return;
			}
			var loadTpl = Vue.extend({
				data: function() {
					return {
						show: showLoad
					}
				},
				template: `<div v-show="show" class="lx-load-mark">
				              <div class="lx-load-box">
				                 <div class="lx-loading">
				                    <div class="loading_leaf loading_leaf_0"></div>
				                    <div class="loading_leaf loading_leaf_1"></div>
				                    <div class="loading_leaf loading_leaf_2"></div>
				                    <div class="loading_leaf loading_leaf_3"></div>
				                    <div class="loading_leaf loading_leaf_4"></div>
				                    <div class="loading_leaf loading_leaf_5"></div>
				                    <div class="loading_leaf loading_leaf_6"></div>
				                    <div class="loading_leaf loading_leaf_7"></div>
				                    <div class="loading_leaf loading_leaf_8"></div>
				                    <div class="loading_leaf loading_leaf_9"></div>
				                    <div class="loading_leaf loading_leaf_10"></div>
				                    <div class="loading_leaf loading_leaf_11"></div>
				                  </div>
				                  <div class="lx-load-content">${tips}</div>
				               </div>
				           </div>`
			});
			loadNode = new loadTpl();
			var tpl = loadNode.$mount().$el;

			document.body.appendChild(tpl);
			loadNode.show = showLoad = true;
		}
	};

	['open', 'close'].forEach(function(type) {
		Vue.prototype.$loading[type] = function(tips) {
			return Vue.prototype.$loading(tips, type)
		}
	});
}
export default Toast;
```

#### CSS：
```css
.lx-toast {
    position: fixed;
    bottom: 100px;
    left: 50%;
    box-sizing: border-box;
    max-width: 80%;
    height: 40px;
    line-height: 20px;
    padding: 10px 20px;
    transform: translateX(-50%);
    -webkit-transform: translateX(-50%);
    text-align: center;
    z-index: 9999;
    font-size: 14px;
    color: #fff;
    border-radius: 5px;
    background: rgba(0, 0, 0, 0.7);
    animation: show-toast .5s;
    -webkit-animation: show-toast .5s;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.lx-toast.lx-word-wrap {
    width: 80%;
    white-space: inherit;
    height: auto;
}

.lx-toast.lx-toast-top {
    top: 50px;
    bottom: inherit;
}

.lx-toast.lx-toast-center {
    top: 50%;
    margin-top: -20px;
    bottom: inherit;
}

@keyframes show-toast {
    from {
        opacity: 0;
        transform: translate(-50%, -10px);
        -webkit-transform: translate(-50%, -10px);
    }
    to {
        opacity: 1;
        transform: translate(-50%, 0);
        -webkit-transform: translate(-50%, 0);
    }
}

.lx-load-mark {
    position: fixed;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    z-index: 9999;
}

.lx-load-box {
    position: fixed;
    z-index: 3;
    width: 7.6em;
    min-height: 7.6em;
    top: 180px;
    left: 50%;
    margin-left: -3.8em;
    background: rgba(0, 0, 0, 0.7);
    text-align: center;
    border-radius: 5px;
    color: #FFFFFF;
}

.lx-load-content {
    margin-top: 64%;
    font-size: 14px;
}

.lx-loading {
    position: absolute;
    width: 0px;
    left: 50%;
    top: 38%;
}

.loading_leaf {
    position: absolute;
    top: -1px;
    opacity: 0.25;
}

.loading_leaf:before {
    content: " ";
    position: absolute;
    width: 9.14px;
    height: 3.08px;
    background: #d1d1d5;
    box-shadow: rgba(0, 0, 0, 0.0980392) 0px 0px 1px;
    border-radius: 1px;
    -webkit-transform-origin: left 50% 0px;
    transform-origin: left 50% 0px;
}

.loading_leaf_0 {
    -webkit-animation: opacity-0 1.25s linear infinite;
    animation: opacity-0 1.25s linear infinite;
}

.loading_leaf_0:before {
    -webkit-transform: rotate(0deg) translate(7.92px, 0px);
    transform: rotate(0deg) translate(7.92px, 0px);
}

.loading_leaf_1 {
    -webkit-animation: opacity-1 1.25s linear infinite;
    animation: opacity-1 1.25s linear infinite;
}

.loading_leaf_1:before {
    -webkit-transform: rotate(30deg) translate(7.92px, 0px);
    transform: rotate(30deg) translate(7.92px, 0px);
}

.loading_leaf_2 {
    -webkit-animation: opacity-2 1.25s linear infinite;
    animation: opacity-2 1.25s linear infinite;
}

.loading_leaf_2:before {
    -webkit-transform: rotate(60deg) translate(7.92px, 0px);
    transform: rotate(60deg) translate(7.92px, 0px);
}

.loading_leaf_3 {
    -webkit-animation: opacity-3 1.25s linear infinite;
    animation: opacity-3 1.25s linear infinite;
}

.loading_leaf_3:before {
    -webkit-transform: rotate(90deg) translate(7.92px, 0px);
    transform: rotate(90deg) translate(7.92px, 0px);
}

.loading_leaf_4 {
    -webkit-animation: opacity-4 1.25s linear infinite;
    animation: opacity-4 1.25s linear infinite;
}

.loading_leaf_4:before {
    -webkit-transform: rotate(120deg) translate(7.92px, 0px);
    transform: rotate(120deg) translate(7.92px, 0px);
}

.loading_leaf_5 {
    -webkit-animation: opacity-5 1.25s linear infinite;
    animation: opacity-5 1.25s linear infinite;
}

.loading_leaf_5:before {
    -webkit-transform: rotate(150deg) translate(7.92px, 0px);
    transform: rotate(150deg) translate(7.92px, 0px);
}

.loading_leaf_6 {
    -webkit-animation: opacity-6 1.25s linear infinite;
    animation: opacity-6 1.25s linear infinite;
}

.loading_leaf_6:before {
    -webkit-transform: rotate(180deg) translate(7.92px, 0px);
    transform: rotate(180deg) translate(7.92px, 0px);
}

.loading_leaf_7 {
    -webkit-animation: opacity-7 1.25s linear infinite;
    animation: opacity-7 1.25s linear infinite;
}

.loading_leaf_7:before {
    -webkit-transform: rotate(210deg) translate(7.92px, 0px);
    transform: rotate(210deg) translate(7.92px, 0px);
}

.loading_leaf_8 {
    -webkit-animation: opacity-8 1.25s linear infinite;
    animation: opacity-8 1.25s linear infinite;
}

.loading_leaf_8:before {
    -webkit-transform: rotate(240deg) translate(7.92px, 0px);
    transform: rotate(240deg) translate(7.92px, 0px);
}

.loading_leaf_9 {
    -webkit-animation: opacity-9 1.25s linear infinite;
    animation: opacity-9 1.25s linear infinite;
}

.loading_leaf_9:before {
    -webkit-transform: rotate(270deg) translate(7.92px, 0px);
    transform: rotate(270deg) translate(7.92px, 0px);
}

.loading_leaf_10 {
    -webkit-animation: opacity-10 1.25s linear infinite;
    animation: opacity-10 1.25s linear infinite;
}

.loading_leaf_10:before {
    -webkit-transform: rotate(300deg) translate(7.92px, 0px);
    transform: rotate(300deg) translate(7.92px, 0px);
}

.loading_leaf_11 {
    -webkit-animation: opacity-11 1.25s linear infinite;
    animation: opacity-11 1.25s linear infinite;
}

.loading_leaf_11:before {
    -webkit-transform: rotate(330deg) translate(7.92px, 0px);
    transform: rotate(330deg) translate(7.92px, 0px);
}

@-webkit-keyframes opacity-0 {
    0% {
        opacity: 0.25;
    }
    0.01% {
        opacity: 0.25;
    }
    0.02% {
        opacity: 1;
    }
    60.01% {
        opacity: 0.25;
    }
    100% {
        opacity: 0.25;
    }
}

@-webkit-keyframes opacity-1 {
    0% {
        opacity: 0.25;
    }
    8.34333% {
        opacity: 0.25;
    }
    8.35333% {
        opacity: 1;
    }
    68.3433% {
        opacity: 0.25;
    }
    100% {
        opacity: 0.25;
    }
}

@-webkit-keyframes opacity-2 {
    0% {
        opacity: 0.25;
    }
    16.6767% {
        opacity: 0.25;
    }
    16.6867% {
        opacity: 1;
    }
    76.6767% {
        opacity: 0.25;
    }
    100% {
        opacity: 0.25;
    }
}

@-webkit-keyframes opacity-3 {
    0% {
        opacity: 0.25;
    }
    25.01% {
        opacity: 0.25;
    }
    25.02% {
        opacity: 1;
    }
    85.01% {
        opacity: 0.25;
    }
    100% {
        opacity: 0.25;
    }
}

@-webkit-keyframes opacity-4 {
    0% {
        opacity: 0.25;
    }
    33.3433% {
        opacity: 0.25;
    }
    33.3533% {
        opacity: 1;
    }
    93.3433% {
        opacity: 0.25;
    }
    100% {
        opacity: 0.25;
    }
}

@-webkit-keyframes opacity-5 {
    0% {
        opacity: 0.270958333333333;
    }
    41.6767% {
        opacity: 0.25;
    }
    41.6867% {
        opacity: 1;
    }
    1.67667% {
        opacity: 0.25;
    }
    100% {
        opacity: 0.270958333333333;
    }
}

@-webkit-keyframes opacity-6 {
    0% {
        opacity: 0.375125;
    }
    50.01% {
        opacity: 0.25;
    }
    50.02% {
        opacity: 1;
    }
    10.01% {
        opacity: 0.25;
    }
    100% {
        opacity: 0.375125;
    }
}

@-webkit-keyframes opacity-7 {
    0% {
        opacity: 0.479291666666667;
    }
    58.3433% {
        opacity: 0.25;
    }
    58.3533% {
        opacity: 1;
    }
    18.3433% {
        opacity: 0.25;
    }
    100% {
        opacity: 0.479291666666667;
    }
}

@-webkit-keyframes opacity-8 {
    0% {
        opacity: 0.583458333333333;
    }
    66.6767% {
        opacity: 0.25;
    }
    66.6867% {
        opacity: 1;
    }
    26.6767% {
        opacity: 0.25;
    }
    100% {
        opacity: 0.583458333333333;
    }
}

@-webkit-keyframes opacity-9 {
    0% {
        opacity: 0.687625;
    }
    75.01% {
        opacity: 0.25;
    }
    75.02% {
        opacity: 1;
    }
    35.01% {
        opacity: 0.25;
    }
    100% {
        opacity: 0.687625;
    }
}

@-webkit-keyframes opacity-10 {
    0% {
        opacity: 0.791791666666667;
    }
    83.3433% {
        opacity: 0.25;
    }
    83.3533% {
        opacity: 1;
    }
    43.3433% {
        opacity: 0.25;
    }
    100% {
        opacity: 0.791791666666667;
    }
}

@-webkit-keyframes opacity-11 {
    0% {
        opacity: 0.895958333333333;
    }
    91.6767% {
        opacity: 0.25;
    }
    91.6867% {
        opacity: 1;
    }
    51.6767% {
        opacity: 0.25;
    }
    100% {
        opacity: 0.895958333333333;
    }
}
```

#### 使用：
```js
import '@/assets/css/toast.css';
import Toast from '@/assets/js/vue-toast.js';
Vue.use(Toast, {
    defaultType: 'center',
    duration: 3000,
    wordWrap: true,
    width: '150px'
});
```
  

```js
fun2() {
    this.$toast.top('Vue插件');
},
fun3() {
    this.$toast.center('Vue插件');
},
fun4() {
    this.$toast.bottom('Vue插件');
},
fun5() {
    this.$loading('加载中...');
    setTimeout(function(){
        this.$loading.close();
    }.bind(this),2000)
},
fun6() {
        this.$loading.open();	
},
fun7() {
    this.$loading.close();
}
```

## download code
[download code](https://github.com/Jingce-lu/vue-toast)