实现系统Math.max方法
===
```js
// 自己定义一个对象，实现系统的 max 方法
function Mymax() {
  // 添加一个方法
  this.getMax = function () {
    // 假设这个数是最大值
    var max = arguments[0];

    for(var i = 0; i < arguments.length; i++) {
      if(max < arguments[i]) {
        max = arguments[i]
      }
    }

    return max;
  }
}


// 实例对象
var my = new Mymax();
console.log(my.getMax(9, 5, 6, 32));
console.log(Math.max(9, 5, 6, 32));
```