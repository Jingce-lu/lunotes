# 在 JS 中使用 fetch 更加高效地进行网络请求

### Why Fetch
XMLHttpRequest 是一个设计粗糙的 API，不符合关注分离（Separation of Concerns）的原则，配置和调用方式非常混乱，而且基于事件的异步模型写起来也没有现代的 Promise，generator/yield，async/await 友好。

1. #### 使用 XHR 发送一个 json 请求一般是这样：

    ```js
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.responseType = 'json';
    
    xhr.onload = function() {
    console.log(xhr.response);
    };
    
    xhr.onerror = function() {
    console.log("Oops, error");
    };
    ```

2. #### 使用 Fetch： 

    ```js
    fetch(url).then(function(response) {
    return response.json();
    }).then(function(data) {
    console.log(data);
    }).catch(function(e) {
    console.log("Oops, error");
    });
    ```

3. #### 使用 ES6 的 箭头函数：

    ```js
    fetch(url).then(response => response.json())
    .then(data => console.log(data))
    .catch(e => console.log("Oops, error", e))
    ```

4. #### 使用 async/await 来做最终优化：

    ```js
    try {
    let response = await fetch(url);
    let data = response.json();
    console.log(data);
    } catch(e) {
    console.log("Oops, error", e);
    }
    // 注：这段代码如果想运行，外面需要包一个 async function
    ```

### Fetch 常见坑

* Fetch 请求默认是不带 cookie 的，需要设置 fetch(url, {credentials: 'include'})
* 服务器返回 400，500 错误码时并不会 reject，只有网络错误这些导致请求不能完成时，fetch 才会被 reject。

## Fetch 和标准 Promise 的不足

1. #### 没有 Deferred
    Deferred 可以在创建 Promise 时可以减少一层嵌套，还有就是跨方法使用时很方便。

2. #### 没有获取状态方法：isRejected，isResolved
    标准 Promise 没有提供获取当前状态 rejected 或者 resolved 的方法。只允许外部传入成功或失败后的回调。我认为这其实是优点，这是一种声明式的接口，更简单。

3. #### 缺少其它一些方法：always，progress，finally
    always 可以通过在 then 和 catch 里重复调用方法实现。finally 也类似。progress 这种进度通知的功能还没有用过，暂不知道如何替代。

4. #### 不能中断，没有 `abort`、`terminate`、`onTimeout` 或 `cancel` 方法
    Fetch 和 Promise 一样，一旦发起，不能中断，也不会超时，只能等待被 resolve 或 reject。幸运的是，whatwg 目前正在尝试解决这个问题whatwg/fetch#27
    
## fetch进行post请求为什么会首先发一个options 请求?
不仅仅是fetch，只要你满足以下几种情况，都会去发起一个 Preflighted requests，也就是options请求， 
> * It uses methods other than GET, HEAD or POST. Also, if POST is used to send request data with a Content-Type other than application/x-www-form-urlencoded, multipart/form-data, ortext/plain, e.g. if the POST request sends an XML payload to the server using application/xmlor text/xml, then the request is preflighted.  
> * It sets custom headers in the request (e.g. the request uses a header such as X-PINGOTHER)

浏览器在发起跨域请求的时候会带着一个`Origin` header，那么其实就是个custom headers，那么也就会先触发一个Preflighted requests，

最近在用fetch请求接口数据时，会自动加上一次OPTIONS请求，而且还会返回数据。后面发现是因为这次请求在header上加了个Authorization字段（以前的项目如果不在header上加字段的话，是不会看到这次请求的），这样fetch就会默认发送一次OPTIONS检测是否有权限调用，后面后端就判断了下，当请求是OPTIONS，直接设置返回的头部信息就行了，这样虽然每次还会调用OPTIONS接口，但起码不会有数据了
```js
if($_SERVE['REQUEST_METHOD'] === 'OPTIONS') {
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Origin-Headers: Authorization");
    exit;
}
```