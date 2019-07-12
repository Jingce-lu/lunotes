x的平方根
===
<!-- TOC -->

- [题目](#题目)
- [标签](#标签)
- [JS1](#js1)
- [JS2](#js2)
- [JS3 二分法](#js3-二分法)
- [JS4 传说中的牛顿迭代法](#js4-传说中的牛顿迭代法)
- [JS5 牛顿迭代法](#js5-牛顿迭代法)
- [JS6](#js6)

<!-- /TOC -->
## 题目
实现 `int sqrt(int x)` 函数。

计算并返回 x 的平方根，其中 x 是非负整数。

由于返回类型是整数，结果只保留整数的部分，小数部分将被舍去。

示例 1:
```js
输入: 4
输出: 2
```

示例 2:
```js
输入: 8
输出: 2
说明: 8 的平方根是 2.82842..., 
     由于返回类型是整数，小数部分将被舍去。
```

## 标签
- 数学
- 二分查找
- 牛顿迭代法


## JS1
```js
var mySqrt = function(x) {

  if (x === 0 || x === 1) return x

  let left = 1
  let right = x - 1
  let m
  let target
  let res

  while(left <= right) {
      m = Math.floor((left + right) / 2)
      target = Math.floor(x / m)
      if (target === m) {
          return m
      }
      if (target < m) {
          right = m - 1
      }
      if (target > m) {
          left = m + 1
          res = m
      }
  }

  return Math.floor(res)
};
```

## JS2
```js
var mySqrt = function(x) {
    if (x <= 1) {
        return x
    }
    for (var i = 1; i <= x; i++) {
        if(i * i > x) {
            return i - 1
        } 
    }
}
```

```js
var mySqrt = function(x) {
    result = Math.sqrt(x)
    result = parseInt(result)
    return result
};
```

## JS3 二分法
```js
var mySqrt = function(x) {
  if(x == 0 || x == 1) return x;
  var l = 0;
  var r = x;
  while (l <= r){
      var mid = (l+r) >> 1;
      if(mid == x/mid) return mid;
      if(x/mid > mid) l = mid+1;
      else r= mid-1;
  }
  return r; 
};
```

## JS4 传说中的牛顿迭代法
由 X^2 + C = 0 ==> X = (X + X/C) / 2 不断迭代推出 X

```js
var mySqrt = function(x) {
  if(x == 0 || x == 1) return x;
  long res = x;
  while(res > (x/res)){
      res = (res + x/res) / 2;
  }
  return (int)res;   
};  
```

## JS5 牛顿迭代法
```js
var mySqrt = function(x) {
    let m = x;
    let r = x;
    while (true) {
        if (m * m === x) {
            return m;
        } else if (m * m < x) {
            m = (m + r) / 2;
        } else if (m * m > x) {
            r = m;
            if (Math.floor(r) * Math.floor(r) < x) {
                return Math.floor(r);
            }
            m = m / 2;
        }
    }
};
```

## JS6
```js
/**
 * @param {number} x
 * @return {number}
 */
var mySqrt = function(x) {
    if(x <= 1) {
        return x
    }
    let r = x;
    while(r > x / r) {
        r = Math.floor((r + x / r) / 2)
    }
    return parseInt(r)
};
```