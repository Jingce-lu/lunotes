## Vue SSR 的 Cookies 问题

<!-- TOC -->

- [Vue SSR 的 Cookies 问题](#vue-ssr-的-cookies-问题)
    - [第一种方案](#第一种方案)
    - [第二种方案](#第二种方案)
    - [第三种方案](#第三种方案)
    - [第四种方案](#第四种方案)
    - [code](#code)

<!-- /TOC -->

一个网站一旦涉及到多用户, 就很难从 Cookies 中逃脱, Vue SSR 的 cookies 也真算是遇到的一个不小的问题, 从开始玩 SSR 开始到现在, 一共想出了3种方案, 从最早的把 Cookies 注入到 state 中, 到把 Cookies 注入到 global, 到现在的将 Cookies 注入到组件的 asyncData 方法.

随着 Vue 的升级, 第一种方案已经不再适用, 第二种也有不少的限制, 于是想到第三种方案, 下来就说说具体实现的方法:

### 第一种方案
第一种方案已经不再适用, 这里不再细说

### 第二种方案
思路: 将 cookies 注入到 ssr 的 context里, 然后在请求 api 时读取, 再追加到 axios 的header 

1. **首先在 server.js 里将 cookies 加到 context里**
    ```js
    const context = {
        title: 'M.M.F 小屋',
        description: 'M.M.F 小屋',
        url: req.url,
        cookies: req.cookies
    }
    renderer.renderToString(context, (err, html) => {
        if (err) {
            return errorHandler(err)
        }
        res.end(html)
    })
    ```
    之后, Vue 会把 context 加到 `global.__VUE_SSR_CONTEXT__`

2. **在 api.js 里读取 cookies**
    ```js
    import axios from 'axios'
    import qs from 'qs'
    import md5 from 'md5'
    import config from './config-server'

    const SSR = global.__VUE_SSR_CONTEXT__
    const cookies = SSR.cookies || {}
    const parseCookie = cookies => {
        let cookie = ''
        Object.keys(cookies).forEach(item => {
            cookie+= item + '=' + cookies[item] + '; '
        })
        return cookie
    }

    export default {
        async post(url, data) {
            const cookie = parseCookie(cookies)
            const res = await axios({
                method: 'post',
                url: config.api + url,
                data: qs.stringify(data),
                timeout: config.timeout,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                    cookie
                }
            })
            return res
        },
    }
    ```

    * 为什么可以这么做?

    默认情况下，Vue 对于每次渲染，`bundle renderer` 将创建一个新的 V8 上下文并重新执行整个 bundle。应用程序代码与服务器进程隔离, 所以每个访问的用户上下文都是独立的, 不会互相影响.

    但是从`Vue@2.3.0`开始, 在`createBundleRenderer`方法的选项中, 添加了`runInNewContext`选项, 使用 runInNewContex`t: false`，bundle 代码将与服务器进程在同一个 global 上下文中运行，所以我们不能再将 cookies 放在 global, 因为这会让所有用户共用同一个 cookies.

    * 为什么现在不这么做?

    那我们继续将`runInNewContext`设置成`true`, 不就好了吗? 当然也是可以的, 但是重新创建上下文并执行整个 bundle 还是相当昂贵的，特别是当应用很大的时候.

### 第三种方案
思路: 将 Cookies 作为参数注入到组件的`asyncData`方法, 然后用传参数的方法把 cookies 传给 api, 不得不说这种方法很麻烦, 但是这是个人能想到的比较好的方法

**步骤1:**

还是在 server.js 里, 把 cookies 注入到 context 中
```js
const context = {
    title: 'M.M.F 小屋',
    url: req.url,
    cookies: req.cookies,
}
renderer.renderToString(context, (err, html) => {
    if (err) {
        return handleError(err)
    }
    res.end(html)
})
```

**步骤2:**

在`entry-server.js`里, 将`cookies`作为参数传给 asyncData 方法
```js
Promise.all(matchedComponents.map(({asyncData}) => asyncData && asyncData({
    store,
    route: router.currentRoute,
    cookies: context.cookies,
    isServer: true,
    isClient: false
}))).then(() => {
    context.state = store.state
    context.isProd = process.env.NODE_ENV === 'production'
    resolve(app)
}).catch(reject)
```

**步骤3:**

在组件里, 把 cookies 做为参数给 Vuex 的 actions
```js
export default {
    name: 'frontend-index',
    async asyncData({store, route, cookies}, config = { page: 1}) {
        config.cookies = cookies
        await store.dispatch('frontend/article/getArticleList', config)
    }
    // .....
}
```

**步骤4:**

在 Vuex 里将 cookies 做为参数给 api
```js
import api from '~api'

const state = () => ({
    lists: {
        data: [],
        hasNext: 0,
        page: 1,
        path: ''
    },
})

const actions = {
    async ['getArticleList']({commit, state}, config) {
        // vuex 作为临时缓存
        if (state.lists.data.length > 0 && config.path === state.lists.path && config.page === 1) {
            return
        }
        let cookies
        if (config.cookies) {
            cookies = config.cookies
            delete config.cookies
        }
        const { data: { data, code} } = await api.get('frontend/article/list', {...config, cache: true}, cookies)
        if (data && code === 200) {
            commit('receiveArticleList', {
                ...config,
                ...data,
            })
        }
    },
}

const mutations = {
    ['receiveArticleList'](state, {list, hasNext, hasPrev, page, path}) {
        if (page === 1) {
            list = [].concat(list)
        } else {
            list = state.lists.data.concat(list)
        }
        state.lists = {
            data: list, hasNext, hasPrev, page, path
        }
    },
}

const getters = {

}

export default {
    namespaced: true,
    state,
    actions,
    mutations,
    getters
}
```

这里一定要注意, state 一定要用函数返回值来初始化 state, 不然会导致所有用户共用 state

**步骤5:**

在 api 里接收 cookies, 并加到 axios 的 headers 里
```js
import axios from 'axios'
import qs from 'qs'
import config from './config-server'

const parseCookie = cookies => {
    let cookie = ''
    Object.keys(cookies).forEach(item => {
        cookie+= item + '=' + cookies[item] + '; '
    })
    return cookie
}

export default {
    get(url, data, cookies = {}) {
        const cookie = parseCookie(cookies)
        return axios({
            method: 'get',
            url: config.api + url,
            data: qs.stringify(data),
            timeout: config.timeout,
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                cookie
            }
        })
    },
}
```

如果你没有将 axios 重新封装, 那么也可以把第五步省略, 直接在第四部把 cookies 给 axios 即可


### 第四种方案

**步骤1:**
还是在 server.js 里, 把 cookies 注入到 context 中
```js
const context = {
    title: 'M.M.F 小屋',
    url: req.url,
    cookies: req.cookies,
}
renderer.renderToString(context, (err, html) => {
    if (err) {
        return handleError(err)
    }
    res.end(html)
})
```

**步骤2:**
在`entry-server.js`里, 将`cookies`作为参数传给 `api.setCookies` 方法, `api.setCookies` 是什么东西后面会有
```js
api.setCookies(context.cookies) // 这一句
Promise.all(matchedComponents.map(({asyncData}) => asyncData && asyncData({
  store,
  route: router.currentRoute,
  cookies: context.cookies,
  isServer: true,
  isClient: false
}))).then(() => {
  // ...
}
```

**步骤3:**
重写 api.js
```js
import axios from 'axios'
import qs from 'qs'
import config from './config-server'

const parseCookie = cookies => {
    let cookie = ''
    Object.keys(cookies).forEach(item => {
        cookie+= item + '=' + cookies[item] + '; '
    })
    return cookie
}

export default {
    api: null,
    cookies: {},
    setCookies(value) {
        value = value || {}
        this.cookies = value
        this.api = axios.create({
            baseURL: config.api,
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                cookie: parseCookie(value)
            },
            timeout: config.timeout,
        })
    },
    post(url, data) {
        if (!this.api) this.setCookies()
        return this.api({
            method: 'post',
            url,
            data: qs.stringify(data),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            }
        }).then(res => {
            return res
        })
    },
    get(url, params) {
        if (!this.api) this.setCookies()
        return this.api({
            method: 'get',
            url,
            params,
        }).then(res => {
            return res
        })
    }
}
```

### code
[github地址](https://github.com/lincenying/mmf-blog-vue2-pwa-ssr)