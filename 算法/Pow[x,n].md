Pow(x, n)
===
<!-- TOC -->

- [题目](#题目)
- [标签](#标签)
- [JS 分治，递归](#js-分治递归)
- [JS2](#js2)
- [JS3 二进制](#js3-二进制)
- [JS4](#js4)
- [JS5](#js5)

<!-- /TOC -->
## 题目
实现 `pow(x, n)` ，即计算 `x` 的 `n` 次幂函数。

示例 1:
```js
输入: 2.00000, 10
输出: 1024.00000
```

示例 2:
```js
输入: 2.10000, 3
输出: 9.26100
```

示例 3:
```s
输入: 2.00000, -2
输出: 0.25000
解释: 2-2 = 1/22 = 1/4 = 0.25
```

说明:
- -100.0 < x < 100.0
- n 是 32 位有符号整数，其数值范围是 [−231, 231 − 1] 。

## 标签
- 数学
- 二分查找

## JS 分治，递归
```js
/**
 * @param {number} x
 * @param {number} n
 * @return {number}
 */
var myPow = function(x, n) {
  if(x === 0) return 0;
  if (n < 0) return 1 / myPow(x, -n);
  if (n === 0) return 1;
  if (n % 2 === 0) return myPow(x * x, Math.floor(n / 2));
  return myPow(x * x, Math.floor(n / 2)) * x;
};
```

## JS2
```js
/**
 * @param {number} x
 * @param {number} n
 * @return {number}
 */
var myPow = function(x, n) {
    if (n === 1) {
        return x;
    }
    if (n === 0) {
        return 1;
    }
    var sign = 1;
    if (n < 0) {
        sign = -1;
        n = -n;
    }
    var tmps = [];
    //用于存储已经计算过的值，如果n不是2的某次方，则该数组值一定用得到
    tmps[0] = x;
    var result = 1;
    var i = 1;
    for (i = 1; i <= n;) {
        result *= tmps[parseInt(i/2)];
        tmps[i] = result;
        i*=2;
    }
    i /= 2;
    n -= i;
    i = parseInt(i/2);
    while(n > 0) {
        if (n >= i) {
            result *= tmps[i];
            n -= i;
        }
        i = parseInt(i/2);
    }
    return sign === 1 ? result : 1/result;
};
```

## JS3 二进制
```js
/**
 * @param {number} x
 * @param {number} n
 * @return {number}
 */
var myPow = function(x, n) {
    var res=[x],nabs=Math.abs(n),result=1;
    var arr=nabs.toString(2).split('').reverse();
    for(var i=1; i<arr.length; i++){
        res[i] = res[i-1]*res[i-1];
    }
    for(var i=0; i<arr.length; i++){
        if(arr[i] == 1){
            result*=res[i];
        }
    }
    if(n>0){
        return result.toFixed(5);
    }
    if(n<0){
        return (1/result).toFixed(5);
    }
    return 1;
};
```

## JS4
```js
/**
 * @param {number} x
 * @param {number} n
 * @return {number}
 */
const myPow = function(x, n) {
  if (x === 0) return 0;
  if (n === 0) return 1;
  if (n === 1) return x;

  let isOverZero = n >= 0;

  n = Math.abs(n);

  let res;

  if (n % 2 !== 0) {
    const v1 = myPow(x, (n - 1)/2);
    res = x * v1 * v1;
  } else {
    const v2 = myPow(x, n/2);
    res = v2 * v2;
  }

  if (!isOverZero) {
    return 1 / res;
  }
  return res;
};
```

## JS5
```js
// /**
//  * @param {number} x
//  * @param {number} n
//  * @return {number}
//  */
// var myPow = function(x, n) {
//   if (n === 0) return 1;
//   if (n < 0) return 1 / myPow(x, -n);
//   if (n % 2 === 1) {
//     return x * myPow(x, n - 1);
//   }
//   return myPow(x * x, Math.floor(n / 2));
// };

/**
 * @param {number} x
 * @param {number} n
 * @return {number}
 */
var myPow = function(x, n) {
  if (n < 0) {
    x = 1 / x;
    n = -n;
  }
  let result = 1;
  while (n) {
    if (n % 2 === 1) {
      result *= x;
      n--;
    }
    x *= x;
    n = Math.floor(n / 2);
  }
  return result;
};
```
