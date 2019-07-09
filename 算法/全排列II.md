全排列 II
===

<!-- TOC -->

- [全排列 II](#全排列-II)
  - [题目](#题目)
  - [递归，使用hash保证不重复选择](#递归使用hash保证不重复选择)
  - [最后用set去重](#最后用set去重)
  - [最后用set去重](#最后用set去重-1)

<!-- /TOC -->

## 题目
给定一个可包含重复数字的序列，返回所有不重复的全排列。

示例:
```js
输入: [1,1,2]
输出:
[
  [1,1,2],
  [1,2,1],
  [2,1,1]
]
```

## 递归，使用hash保证不重复选择
```js
//执行用时 :124 ms, 在所有 JavaScript 提交中击败了84.40%的用户
//递归，使用hash保证不重复选择。如[1,1,2]第一位只选一次1
var permuteUnique = function(nums) {
  var res = [];
  function bfs(arr, result) {
    if (arr.length === 0) {
      res.push([...result]);
      return;
    }
    var hash = new Map();
    for (var i = 0; i < arr.length; i++) {
      if (hash.has(arr[i])) {
        continue;
      }
      hash.set(arr[i], true);
      bfs(arr.slice(0, i).concat(arr.slice(i + 1)), result.concat([arr[i]]));
    }
  }
  bfs(nums, []);
  return res;
};
```

## 最后用set去重
```js
var permuteUnique = function(nums) {
  let res = [];
  function fn(arr, start) {
    if(start >= arr.length-1)  {
      res.push(arr.slice(0));
      return;
    }
    for(let i=start, len=arr.length; i<len; i++) {
      [arr[start], arr[i]] = [arr[i], arr[start]];
      fn(arr, start + 1);
      [arr[start], arr[i]] = [arr[i], arr[start]];
    }
  }  
  fn(nums, 0);
  res.forEach((val, index) => {
    res[index] = val.join(',');
  })
  return [...new Set(res)].map(val => {
    return val.split(',');
  })
};
```

## 最后用set去重
```js
var permuteUnique = function(nums) {
  let res = [];
  function fn(arr, start) {
    if(start >= arr.length-1)  {
      res.push(arr.slice(0));
      return;
    }
    for(let i=start, len=arr.length; i<len; i++) {
      [arr[start], arr[i]] = [arr[i], arr[start]];
      fn(arr, start + 1);
      [arr[start], arr[i]] = [arr[i], arr[start]];
    }
  }  

  fn([...new Set(nums)], 0);
  return res;
};
```