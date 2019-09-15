vue-function-api
===
<!-- TOC -->

- [vue-function-api](#vue-function-api)
  - [示例](#示例)
  - [解析](#解析)
  - [watch](#watch)

<!-- /TOC -->

## 示例
```js
<template>
  <div id="app">
    {{time.getHours() + ':' + time.getMinutes() + ':' + time.getSeconds()}}
  </div>
</template>
<script lang="ts">
  import {interval} from 'rxjs/observable/interval';
  import {value as Wrapper} from 'vue-function-api';

  const time = Wrapper(new Date());
  interval(100).pipe().subscribe(() => {
    time.value = new Date();
  });

  export default {
    setup() {
      return {time};
    }
  };
</script>
```

## 解析
上面是一个基于function-api简单的显示当前时间的实例代码，关于为什么在外部改变变量的时候能够触发视图变化，这个问题我相信关注function-api的伙伴们应该都清除了，就不再多说。
可以看到，定义变量和修改变量的代码都是在组件属性对象的外部声明的，这里为了直观放在了同一个文件，其实可以把这部分代码提取出来：
新建一个time.ts文件

```js
import {value as Wrapper} from 'vue-function-api';
import {interval} from 'rxjs/observable/interval';

const time = Wrapper(new Date());
interval(100).pipe().subscribe(() => {
  time.value = new Date();
});

export default time;
```

这时候Vue文件就只剩下：

```js
<template>
  <div id="app">
    {{time.getHours() + ':' + time.getMinutes() + ':' + time.getSeconds()}}
  </div>
</template>
<script lang="ts">
  import time from './time';

  export default {
    setup() {
      return {time};
    }
  };
</script>
```

运行完全没问题

这样我们可以在需要显示当前时间的不同组件中引入time这个对象，把它展示出来就OK了。


## watch
看完上面的部分，相信大家已经对function-api的设计方式有了一定的理解，那么我们再来看看watch。
关于Vue2.0的watch有一个诟病的地方，就是被watch的路径是一个字符串，在维护上非常麻烦（比如说重构），如果使用对象引用的方式，就不存在这样的问题了。

```js
const api = require('vue-function-api');
const Vue = require('vue');
const { interval } = require('rxjs/observable/interval');
Vue.use(api.plugin);
const value = api.value(new Date());
api.watch(() => value.value, (val, old) => {
  if (old && val.getSeconds() !== old.getSeconds()) {
    console.log(`seconds changed from ${old.getSeconds()} to ${val.getSeconds()}`);
  }
});
interval(100)
    .pipe()
    .subscribe(() => {
      value.value = new Date();
    });
```

上面的代码可以直接在js中运行, 也是可以和组件剥离的。
