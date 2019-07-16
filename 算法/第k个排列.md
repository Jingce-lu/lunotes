第k个排列
===
<!-- TOC -->

- [第k个排列](#第k个排列)
  - [题目](#题目)
  - [标签](#标签)
  - [JS 找规律](#JS-找规律)
  - [JS2](#JS2)

<!-- /TOC -->

## 题目
给出集合 `[1,2,3,…,n]`，其所有元素共有 `n!` 种排列。

按大小顺序列出所有排列情况，并一一标记，当 n = 3 时, 所有排列如下：
1. `"123"`
2. `"132"`
3. `"213"`
4. `"231"`
5. `"312"`
6. `"321"`

给定 n 和 k，返回第 k 个排列。

**说明**：
- 给定 n 的范围是 [1, 9]。
- 给定 k 的范围是[1,  n!]。

示例 1:
```js
输入: n = 3, k = 3
输出: "213"
```

示例 2:
```js
输入: n = 4, k = 9
输出: "2314"
```

## 标签
- 数学
- 回溯算法

## JS 找规律
比如`n = 4`，那么以`1`开头的单词有 `3 * 2 * 1` 个；`n = 3`，以`1`开头的单词有 `2 * 1`个，依次类推，只要得出 `k` 是当前阶乘的多少倍，那么就获取剩下的当中的第几个单词。

执行用时 :68 ms, 在所有JavaScript提交中击败了100.00%的用户 内存消耗 :33.7 MB, 在所有JavaScript提交中击败了80.28%的用户

```js
/**
 * @param {number} n
 * @param {number} k
 * @return {string}
 */
var getPermutation = function(n, k) {
  let m = 1;
  k = k - 1;
  for (let i = 2; i < n; i++) m *= i;

  let a = [];
  for (let i = 1; i <= n; i++) a.push(i);

  let s = [];
  for (let i = 0; i < n; i++) {
    let t = (k / m) | 0;
    s[i] = a[t];
    a.splice(t, 1);
    k %= m;
    m /= n - i - 1;
  }
  return s.join("");
};
```

## JS2 
n中每一个数，都有n-1种组合，所以可以不断的循环递减，累积结果，找到答案。
```js
var getPermutation = function(n, k) {
  let result = '', arr = [];
  for (let i = 1; i <= n; i++) {
    arr.push(i);
  };
  //计算阶乘
  let fac = (n) => {
    if (n === 1) return 1;
    return n * fac(n-1);
  };
  let N = n;
  while (k > 1) {
    let count = 1, base = fac(N-1);
    while (k > count*base) { count++ };
    result += arr[count-1];  //注意这里的拼接
    arr.splice(count-1, 1);   //将本次拼接的数字从arr里删除，因为它已经被“取”走了
    k = k - (count-1)*base;  //下次循环的k要减掉本次已经积累过的个数
    N--;
  }
  //这里，当k为1时，说明要拿剩下数字的第一种组合，那就是直接join()起来的数。
  return result + arr.join(''); 
};
```