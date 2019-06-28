自己实现简单的shift()
===

shift()方法从数组中删除第一个元素，并返回该元素的值，此方法会改变数组的长度。

如果数组为空则返回undefined。

<b>此方法会改变数组自身。</b>

```js
Array.prototype.shift = function () {
    var temp = this[0];
    for (var i = 1; i < this.length; i++) {
        this[i-1] = this[i];
    }
    this.length--;
    return temp;
}
```