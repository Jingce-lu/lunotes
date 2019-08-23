实现sleep函数
===

```js
function sleep(interval) {
  return new Promise(resolve => {
    setTimeout(resolve, interval);
  })
}
async function test() {
  for (let index = 0; index < 10; index++) {
    console.log(index);
    await sleep(2000)
  }
}
```