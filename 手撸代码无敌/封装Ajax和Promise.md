# 封装Ajax 和 Promise

1. ### 原生js (一)

```js
function getJSON(url) {
    return new Promise(function(resolve, reject) {
        var XHR = new XMLHttpRequest();
        XHR.open('GET', url, true);
        XHR.send();
 
        XHR.onreadystatechange = function() {
            if (XHR.readyState == 4) {
                if (XHR.status == 200) {
                    try {
                        var response = JSON.parse(XHR.responseText);
                        resolve(response);
                    } catch (e) {
                        reject(e);
                    }
                } else {
                    reject(new Error(XHR.statusText));
                }
            }
        }
    })
}
 
getJSON(url).then(resp => console.log(resp));
```

2. ### 原生js (二)

```js
// (原生js)封装Promise对象二
var jsGetAjaxPromise = function(param){
    return new Promise(function(resolve, reject ){
        var xhr = new XMLHttpRequest();
        xhr.open('get', param.url, true);
        xhr.onload = resolve;
        xhr.onerror = reject;
        xhr.send();
    })
}


// 调用示例
var p1 = jsGetAjaxPromise({  // 启动第一个任务
    url: 'cross-domain1.txt' // 要获取的文件地址
});

p1.then(function(response){  // 处理第一个异步任务的结果(每次调用then都会返回一个新创建的Promise对象)
    console.log(response);
    return jsGetAjaxPromise({ // 启动第二个任务 
        url: 'cross-domain2.txt'
    })
}).then(function(response2){  // 处理第二个任务的结果
    console.log(response2);
    return jsGetAjaxPromise({ // 启动第三个任务  
        url: 'cross-domain3.txt'
    })
}).then(function(response3){  // 处理第二个任务的结果
    console.log(response3);
}).catch(function(err){
    console.log(err);
});
```

3. ###  改写成jquery实现

```js
// (jquery)封装Promise对象和ajax过程
var jqGetAjaxPromise = function(param){
    return new Promise(function(resolve, reject){
        $.ajax({
            url: param.url,
            type: 'get',
            data: param.data || '',
            success: function(data){
                resolve(data);
            },
            error: function(error){
                reject(error)
            }
        });
    });
};


// 调用示例
var p2 = jqGetAjaxPromise({    
    url: 'cross-domain1.txt'
});

p2.then(function(data){      
    console.log(data);
    return jqGetAjaxPromise({  
        url:'cross-domain2.txt'
    });
}).then(function(data2){   
    console.log(data2);
}).catch(function(err){
    console.log(err);
});
```

4. ### axios 

```js
function myGet(url, params) {
  return new Promise((resolve, reject) => {
    axios.get(url, params).then(function (response) {
      resolve(response.data)
    })
    .catch(function (err) {
      reject(err)
    })
  })
}
 
myGet(url,params).then(function(data){console.log(data)}).catch(function(){})
```

---------------------

## XMLHttpRequest 的 readystatechange 事件和 load 事件的区别

分别在 onreadystatechange 和 onload 里写入代码：

```js
xhr.onload = function () {
    console.log(`load:xhr.readyState == ${xhr.readyState} ,xhr.status=${xhr.status}`);
}
xhr.onreadystatechange = function () {
    console.log(`readystatechange:xhr.readyState == ${xhr.readyState} ,xhr.status=${xhr.status}`);
}
xhr.open(...);
xhr.send(...);
```

输出结果如下：

```js
readystatechange : xhr.readyState == 1 ,xhr.status=200
readystatechange : xhr.readyState == 2 ,xhr.status=200
readystatechange : xhr.readyState == 3 ,xhr.status=200
readystatechange : xhr.readyState == 4 ,xhr.status=200
load : xhr.readyState == 4 ,xhr.status=200
```

可以看到，readystatechange 事件先于 load 事件执行。load 事件就相当于 readyState 的值为 4 后触发的事件。如果不需要跟踪请求返回之前的过程时，用 load 事件更省事儿。

然而...

load 事件并不总是被触发。比如当网络错误时，目标地址访问不了时，会触发 error 事件，load 事件就不会被触发。404 之类的错误只是服务器返回的状态代码，并不是请求过程错误，所以 load 事件会触发，而 error 事件反而不会触发。

如果需要无论哪种情况都被触发的话，请用 loadend 事件。

OK！既然有 loadend 事件，当然还会有 loadstart 事件！

这些事件的触发顺序是：

readystatechange > loadstart > readystatechange > readystatechange > progress > readystatechange > load / error > loadend 

readystatechange 每次触发时 readyState 值不同。
