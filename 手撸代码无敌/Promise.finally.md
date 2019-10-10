模拟实现一个 Promise.finally

```js
Promise.prototype.finally = function (callback) {
  let P = this.constructor;
  return this.then(
    value  => P.resolve(callback()).then(() => value),
    error => P.resolve(callback()).then(() => { throw error })
  );
};
```

为什么需要`Promise.resolve(callback()).then(() => value)`  
而不能直接执行`callback, return value`  
因为callback如果是个异步操作，返回promise呢.希望等callback执行完再接着执行


```js
window.Promise && !('finally' in Promise) && !function() {        
  Promise.prototype.finally = function(cb) {
    cb = typeof cb === 'function' ? cb : function() {};
      
    var Fn = this.constructor;  // 获取当前实例构造函数的引用

    // 接受状态：返回数据
    var onFulfilled = function(data) {
      return Fn.resolve(cb()).then(function() {
        return data
      })
    };

    // 拒绝状态：抛出错误
    var onRejected = function(err) {
      return Fn.resolve(cb()).then(function() {
        throw err
      })
    };

    return this.then(onFulfilled, onRejected);
  }
}();

/*********************** 测试 ***********************/
const p = new Promise((resolve, reject) => {
  console.info('starting...');

  setTimeout(() => {
    Math.random() > 0.5 ? resolve('success') : reject('fail');
  }, 1000);
});

// 正常顺序测试
p.then((data) => {
    console.log(`%c resolve: ${data}`, 'color: green')
  })
  .catch((err) => {
    console.log(`%c catch: ${err}`, 'color: red')
  })
  .finally(() => {
    console.info('finally: completed')
  });

// finally 前置测试  
p.finally(() => {
    console.info('finally: completed')
  })	
  .then((data) => {
    console.log(`%c resolve: ${data}`, 'color: green')
  })
  .catch((err) => {
    console.log(`%c catch: ${err}`, 'color: red')
  });
```