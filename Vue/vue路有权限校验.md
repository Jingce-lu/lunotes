vue路由权限校验
===
<!-- TOC -->

- [vue路由权限校验](#vue路由权限校验)
  - [路由如何做权限校验？](#路由如何做权限校验)
  - [vue 路由权限限制](#vue-路由权限限制)
  - [vue 路由验证](#vue-路由验证)
  - [如何用 Vue 实现前端权限控制(CSDN)](#如何用-vue-实现前端权限控制csdn)

<!-- /TOC -->
##  路由如何做权限校验？

实现
1. 登陆权限，一般来说这个是独立出来，不用 spa 做，就一个表单的事情，后面也容易做扩展，包括单点登录什么的；
2. 登陆集成到 spa 里面，这个一般在请求加拦截，vuex 可以存 token，每次请求头带 token，后端校验 token 是否有效，如果修改了或者过期了，返回约定的字段标识，异步请求 axios 在返回 response 的时候优先拦截 token 校验，如果失效直接 vue-router 路由到登录页；
3. 内部权限，子页面什么的，前端一般是打包好了文件，页面是全部的，但是有的页面需要权限控制是否能访问，这时候只能做 2 次校验，后端返回当前权限能访问的路由 or 页面，存 vuex，前端路由加 watch，每次切换跳转都要遍历一次；
4. 接口权限，有的接口是不能提供给无权限的人使用的，比如抓包出来的；这时候后端做鉴权，返回约定的字段就行

------
 
1. 后台接口加一层 api gateway 做权限控制，防止越权调用
2. 请求后台接口获取当前登录用户所有的 [可用菜单（路由）] 及 [权限信息（权限 key ）] 
3. 根据 [可用菜单] 动态生成 router
4. 页面子控件，如按钮（对应权限 key ）通过 v-if 实现显示与隐藏， 如
```js
<button @click="action" v-if="hasPermission('user.create')">新增用户</Button>
hasPermission 做成一个 mixin 混入所有组件
```

## vue 路由权限限制
```js
function routerXmlFlag (menu, to) {
  for (let i = 0; i < menu.length; i++) {
    if (menu[i].url === to.fullPath) {
      return true
    }
    if (menu[i].subMenus && menu[i].subMenus.length) {
      routerXmlFlag(menu[i].subMenus, to)
    }
  }
  return false
}
router.beforeEach((to, from, next) => {
  if (to.meta.requireAuth) { // 判断该路由是否需要登录权限
    let token = sessionStorage.getItem('X-CSRF-TOKEN')
    if (token) { // 通过vuex state获取当前的token是否存在
      let menu = store.state.common.menu // 为了菜单的链接，直接跳转404
      if (menu && menu.length > 0) {
        let flag = routerXmlFlag(menu, to)
        if (flag) {
          next()
        } else {
          next('/404')
        }
      } else {
        next()
      }
    } else {
      next({
        path: '/login',
        query: {redirect: to.fullPath} // 将跳转的路由path作为参数，登录成功后跳转到该路由
      })
    }
  } else {
    next()
  }
})
// 前提，每个用户进来分配的菜单权限不一样， 但是手动输入菜单以外的url 可以进行访问
// bug 修改，手动输入菜单以外的链接，返回404
```

## vue 路由验证
在没有登录的情况下开发者有可能会不让用户看到某些或者进入某些页面，vue 跳转使用的是vue-roter跳转。

使用vue-router的beforeEach函数接受三个参数to, from, next分别是to：去的页面、from：来自那个页面、next：定向到哪里

beforeEach需要写到vue实例前。

```js
//首先登录成功之后需要存一个状态到本地 这个状态可以是自己设置也可以配合后台来操作
router.beforeEach((to, from, next) => {
    //获取到登录状态
  const loginStuts = sessionStorage.getItem('loginStuts')
    //如果登录状态不存在或者去的页面是某个用户没登录不能去的页面
    //（to.path的意思为去往的 路径是/myinformation也可不写）
    //就跳转到login页面也就是登录界面
    //next函数不传参数即是验证通过去往该页面 传入参数即是调往参数页面
  if (!loginStuts && to.path == '/myinformation') {
        next('/login')
      } else {
        next()
      }
   })
    /* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>',
  store
})
```

## 如何用 Vue 实现前端权限控制(CSDN)
[如何用 Vue 实现前端权限控制](https://blog.csdn.net/gitchat/article/details/78849246)  
https://blog.csdn.net/gitchat/article/details/78849246

项目本身也是一个可运行的 DEMO，演示地址和测试账号同样见下方。

仓库地址：https://github.com/tower1229/Vue-Access-Control

项目主页：http://refined-x.com/Vue-Access-Control/

- root 任意
- client 任意
