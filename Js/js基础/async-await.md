# async/await

<!-- TOC -->

- [async/await](#asyncawait)
    - [Async 与其他异步操作的对比](#async-与其他异步操作的对比)
        - [Promise 方式](#promise-方式)
        - [Generator 方式](#generator-方式)

<!-- /TOC -->

ES7 提出的`async` 函数，终于让 JavaScript 对于异步操作有了终极解决方案。No more callback hell。
`async 函数是 Generator 函数的语法糖`。使用 关键字 `async` 来表示，在函数内部使用 `await` 来表示异步。

相较于 `Generator`，`Async` 函数的改进在于下面四点：

1. <b>内置执行器</b>。 Generator 函数的执行必须依靠执行器，而 `Aysnc` 函数自带执行器，调用方式跟普通函数的调用一样
2. <b>更好的语义</b>。 `async` 和 `await` 相较于 `*` 和 `yield` 更加语义化
3. <b>更广的适用性</b>。 `co` 模块约定，`yield` 命令后面只能是 Thunk 函数或 Promise对象。而 `async` 函数的 `await` 命令后面则可以是 Promise 或者 原始类型的值（Number，string，boolean，但这时等同于同步操作）
4. <b>返回值是 Promise</b>。 `async` 函数返回值是 `Promise` 对象，比 Generator 函数返回的 Iterator 对象方便，可以直接使用 `then()` 方法进行调用

## Async 与其他异步操作的对比

> 先定义一个 Fetch 方法用于获取 github user 的信息：
```js
function fetchUser() { 
    return new Promise((resolve, reject) => {
        fetch('https://api.github.com/users/superman66')
        .then((data) => {
            resolve(data.json());
        }, (error) => {
            reject(error);
        })
    });
}
```

### Promise 方式
```js
/**
 * Promise 方式
 */
function getUserByPromise() {
    fetchUser()
        .then((data) => {
            console.log(data);
        }, (error) => {
            console.log(error);
        })
}
getUserByPromise();
```
Promise 的方式虽然解决了 callback hell，但是这种方式充满了 Promise的 `then()` 方法，如果处理流程复杂的话，整段代码将充满 `then`。语义化不明显，代码流程不能很好的表示执行流程。


### Generator 方式
```js
/**
 * Generator 方式
 */
function* fetchUserByGenerator() {
    const user = yield fetchUser();
    return user;
}

const g = fetchUserByGenerator();
const result = g.next().value;
result.then((v) => {
    console.log(v);
}, (error) => {
    console.log(error);
})
```
Generator 的方式解决了 Promise 的一些问题，流程更加直观、语义化。但是 Generator 的问题在于，函数的执行需要依靠执行器，每次都需要通过 `g.next()` 的方式去执行。


### async 方式
```js
/**
 * async 方式
 */
 async function getUserByAsync(){
     let user = await fetchUser();
     return user;
 }
getUserByAsync()
.then(v => console.log(v));
```
`async` 函数完美的解决了上面两种方式的问题。流程清晰，直观、语义明显。操作异步流程就如同操作同步流程。同时 `async` 函数自带执行器，执行的时候无需手动加载。


## 语法

### async 函数返回一个 Promise 对象
`async` 函数内部 return 返回的值。会成为 `then` 方法回调函数的参数
```js
async function  f() {
    return 'hello world'
};
f().then( (v) => console.log(v)) // hello world
```
如果 `async` 函数内部抛出异常，则会导致返回的 Promise 对象状态变为 `reject` 状态。抛出的错误而会被 `catch` 方法回调函数接收到。
```js
async function e(){
    throw new Error('error');
}
e().then(v => console.log(v))
.catch( e => console.log(e));
```

### async 函数返回的 Promise 对象，必须等到内部所有的 await 命令的 Promise 对象执行完，才会发生状态改变
也就是说，只有当 `async` 函数内部的异步操作都执行完，才会执行 `then` 方法的回调。
```js
const delay = timeout => new Promise(resolve=> setTimeout(resolve, timeout));
async function f(){
    await delay(1000);
    await delay(2000);
    await delay(3000);
    return 'done';
}

f().then(v => console.log(v)); // 等待6s后才输出 'done'
```
<b>正常情况下，await 命令后面跟着的是 Promise ，如果不是的话，也会被转换成一个 立即 resolve 的 Promise</b>
如下面这个例子：
```js
async function  f() {
    return await 1
};
f().then( (v) => console.log(v)) // 1
```
如果返回的是 `reject` 的状态，则会被 `catch` 方法捕获。


## Async 函数的错误处理
`async` 函数的语法不难，难在错误处理上。

先来看下面的例子：
```js
let a;
async function f() {
    await Promise.reject('error');
    a = await 1; // 这段 await 并没有执行
}
f().then(v => console.log(a));
```
如上面所示，当 `async` 函数中只要一个 `await` 出现 reject 状态，则后面的 `await` 都不会被执行。

<b>解决办法：</b>可以添加 `try/catch`。
```js
// 正确的写法
let a;
async function correct() {
    try {
        await Promise.reject('error')
    } catch (error) {
        console.log(error);
    }
    a = await 1;
    return a;
}

correct().then(v => console.log(a)); // 1
```
如果有多个 `await` 则可以将其都放在 `try/catch` 中。


## 如何在项目中使用
依然是通过 `babel` 来使用。

只需要设置 `presets` 为 `stage-3` 即可。

安装依赖：
```bash
npm install babel-preset-es2015 babel-preset-stage-3 babel-runtime babel-plugin-transform-runtime
```
修改`.babelrc`:
```json
"presets": ["es2015", "stage-3"],
"plugins": ["transform-runtime"]
```