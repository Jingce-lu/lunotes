vueRouter使用query和params传参的使用和区别
====

## 基础
```js
<router-link :to="{ name:'router1',params: { id: status ,id2: status3},query: { queryId: status2 }}" >
  router-link跳转router1
</router-link>
```

- params：/router1/:id ，/router1/123，/router1/789 ,这里的id叫做params
- query：/router1?id=123 ,/router1?id=456 ,这里的id叫做query。


## params传参和query传参有什么区别：
1. 用法上的  
刚query要用path来引入，params要用name来引入，接收参数都是类似的，分别是this.$route.query.name和this.$route.params.name。  
注意接收参数的时候，已经是$route而不是$router了哦！！
2. 展示上的  
query更加类似于我们ajax中get传参，params则类似于post，说的再简单一点，前者在浏览器地址栏中显示参数，后者则不显示
3. params是路由的一部分,必须要有。query是拼接在url后面的参数，没有也没关系。    
params一旦设置在路由，params就是路由的一部分，如果这个路由有params传参，但是在跳转的时候没有传这个参数，会导致跳转失败或者页面会没有内容。
比如：跳转/router1/:id
    ```js
    <router-link :to="{ name:'router1',params: { id: status}}" >正确</router-link>
    <router-link :to="{ name:'router1',params: { id2: status}}">错误</router-link>
    ```
4. params、query不设置也可以传参，params不设置的时候，刷新页面或者返回参数会丢失，这一点的在上面说过了