Vue关于 keep-alive的一些用法以及采坑记录
===

`<keep-alive>`的使用

App.vue中(根据不同的组件设置是否需要被缓存)

```html
<keep-alive>
  <router-view v-if="$route.meta.keepAlive" />
</keep-alive>
 
<router-view v-if="!$route.meta.keepAlive" />
```

router/index.js里（给不同的组件添加`keepAlive`属性是否需要被缓存  `true`表示会   `false`表示不需要被缓存）

```js
routes: [
  {
    path: "/",
    name: "cardmanage",
    component: cardManage, // 会员管理
    meta: {
      title: "会员卡管理",
      keepAlive: true
    }
  },
  {
    path: "/card",
    name: "cardManageInfo",
    component: cardManageInfo,
    meta: {
      title: "会员卡管理",
      keepAlive: true
    }
  },
  {
    path: "/chooseSite",
    name: "chooseSite",
    component: chooseSite,
    meta: {
      title: "选择使用场地",
      keepAlive: false
    }
  },
]
```

**我先说一下设置了 `<keep-alive>`缓存的属性  以下的一些生命周期不会执行**
 1. created() {},   //只执行一次   之后不会再被执行
 2. beforeDestroy() {},
 3. destroyed() {},


## 采坑1   
由于以上的生命周期不执行,所以前一个页面携带进来的参数不能再created  以及data数据里直接赋值，要么直接在请求接口的方法里使用`this.$route.query.参数名`；  或者在`activated() {}`生命周期里赋值`this.cardId = this.$route.query.cardId`;往后可以直接通过 `this.cardid`得到值

<span style="color: red">顺便说一下activated() {}这个生命周期函数,这个是只有设置了keepalive才会生效的</span>

 

碰到如下需求

a组件有一个表单里面的值是从后台获取的但是可以修改,当我点击修改去b组件修改值之后需要把b组件选中的值带到a组件,同时之前填写过的一些信息不能被改


## 采坑2
我的想法是判断`localStorage`里是否有该值,如果有就从`localStorage`拿,不存在就在从接口拿；但是当你退出页面或者退出编辑的时候要清空`localStorage`

本来是想在生命周期销毁之前删除设置的缓存,由于设置了`<keep-alive>`，销毁的生命周期就失效了,于是想到了切换路由的时候监听页面的路径来清除`localStorage`


## 采坑3
设置了`<keep-alive>`的组件只要组件被缓存了，在watch里监听路由的变化时做相应的操作时,就算在其他的组件也会里也会执行到该组件里的方法