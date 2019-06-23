# VUE组件编码规范

### 相关文档
* vue 1.x: [http://v1.vuejs.org/api/]
* vue-ressource 1.x: [https://github.com/pagekit/vue-resource/blob/develop/docs/http.md]
* vue-router 0.x: [https://github.com/vuejs/vue-router/tree/1.0/docs/zh-cn]

`请注意区分项目使用的库版本及相关文档，以上三个包都在vue.dll.js依赖包里`

### 项目通过组件来规划
```
 // 示例项目aaa
 aaa/
 	components/ : 项目内组件
 	pages/ : 项目视图存放目录
 	html/: 项目页面存放目录
 		index.hbs 
 	index.js: 项目入口文件
 
 // index.hbs , 尽量只用一个标记，无其他内容
 	<div id="main">
 		// 如果有seo相关内容，凡在里面，作为slot插入组件内
 		<div class="banner" slot="banner"></div>
 	</div>
 
 // index.js
 // 若项目不复杂，可直接使用template
 	new Vue({
 		el: '#main',
 		template: `
 			<component-a></component-a>
 			<component-b></component-b>
 			<component-c></component-c>
 		`,
 		components: {componentA,componentB,componentC}
 	})
 // 相对复杂的项目或使用路由的项目，建立页面级别的组件
 	new Vue({
 		el : '#main',
 		template: `<index></index>`,
 		components: {Index}
 	})
 // pages/index.vue
 <template>
 	<component-a></component-a>
 	<component-b></component-b>
  	<component-c></component-c>
 <template>
 <script>
 export default {
 	name: 'index'
 }
 </script>
```


### 目录划分
* libs/vue-components ： 用于存放全项目公用的vue组件
* xxx/components: 比如xinche.m/components, 用于存放单一项目公用的vue组件, 或跟此单一项目业务强相关的vue组件
* xxx/yyy/components: 比如xinche.m/about/components, 用于存放子项目自己使用的vue组件，一般不提供给外部其他项目使用

### 公用组件目录结构
```
 xxx/
 	index.vue : 主组件文件
 	*.png/*.gif : 组件使用的图片（公用组件尽量不要使用大于10k的图片）
 	README.md: 组件使用说明文档
```

### 组件命名
* 有意义的， 简短，具有可读性。2-3个单词
* 符合自定义元素规范，使用-连字符分隔单词， 如app-header

### 组件单一原则
* 每一个vue组件专注于解决单一的问题，独立，可复用
* 一个组件尽量不要超过100行，如果组件太臃肿，需要拆分成更小的组件

### props原子化
组件的props尽量使用原始数据类型，避免使用复杂对象
```
 // 不适用复杂对象
 const option = {title:'xxx', inApp: true}
 <app-header :option="option"></app-header>
 
  // 使用原始数据类型
  // 注意inApp驼峰的props书写在组件标记内需要改成in-app类型
  // 注意props值传入的如果不是字符串，需要v-bind:props来绑定
  <app-header title="xxx" :in-app="true"></app-header>
```

### 验证组件的props
```
 // 尽量不使用简写props
 export default {
  props: ['title', 'isApp']
 }
 
 // 验证props
  export default {
 	props: {
 		title: {
 			type: String,
 			default: ,
 			required: true
 		},
 		isApp: {
 			type: Boolean,
 			default: false
 		}
 	}
 }
```

### 合理使用this
```
 // 组件内不要出现如下之类
 const self = this
 // 充分利用es6特性，使用this
 created(){
 	this.title = 123
 }
```

### 组件使用name
```
 // 单一组件的导出不建议指定名称, 直接使用default导出
 export default {}
 // 组件建议添加name属性
 export default {
 	name: 'appHeader"
 }
```

### 组件不要使用双向绑定的props
```
 // 不要使用.sync类型的props
 <app-header :title.sync="title"></app-header>
 export default {
 	props: {
 		type: String,
 		twoway: true
 	}
 }
 // 子组件通知父级数据变更，应采用调用父级传入的函数型props回调，或者事件通知的方式
```

### 避免使用this.$parent
直接访问上下文降低了组建的复用性，应避免使用，尽量通过事件通知

### 尽量使用this.$http而不是jquery.ajax
```
vue组件应尽量使用自己的resource插件，符合promise规范
 // 最外层需要将插件引入
 import Vue from 'vue'
 import VueResource from 'vue-resource'
 Vue.use(VueResource)
```

### 组件内尽量不要直接使用window上的全局变量
```
 // 不要使用window上的全局变量，降低组件复用性和增加维护成本
 this.$http.get(APIURL, {})
 
 // 通过props传入组件的所有外部依赖
 <app-header api="xxx/yyy/to/path"></app-header>
 this.$http.get(this.api, {})
```

### props向下传递，事件向上传递

### 当必须要操作dom时，才使用this.$refs, 而不是jQuery
### 组件顶级class规范化，建议component-xxx开头命名
```
 <template>
 	<div class="component-xxx">
 		xxx
 	</div>
 </template>
```

### 提供api文档
建议组件api文档写到组件同目录README.md里