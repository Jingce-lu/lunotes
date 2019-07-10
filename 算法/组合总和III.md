组合总和 III
===
<!-- TOC -->

- [组合总和 III](#组合总和-III)
  - [题目](#题目)
  - [标签](#标签)
  - [js 回溯](#js-回溯)
  - [js 递归 + 剪枝](#js-递归--剪枝)
  - [js 时间可能比较长，但是便于理解回溯法](#js-时间可能比较长但是便于理解回溯法)

<!-- /TOC -->

## 题目
找出所有相加之和为 **n** 的 **k** 个数的组合。组合中只允许含有 `1 - 9` 的正整数，并且每种组合中不存在重复的数字。

说明：
1. 所有数字都是正整数。
2. 解集不能包含重复的组合。 

示例 1:
```js
输入: k = 3, n = 7
输出: [[1,2,4]]
```

示例 2:
```js
输入: k = 3, n = 9
输出: [[1,2,6], [1,3,5], [2,3,4]]
```

## 标签
- 数组
- 回溯算法

## js 回溯
```js
var combinationSum3 = function(k, target) {
  const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  // backtrack
  let current = [];
  const result = [];
  const set = new Set();
  const bt = (index, rest, target) => {
    if ((rest === 0 && target !== 0) || index > nums.length) {
      return;
    }

    if (rest === 0 && target === 0) {
      const currentSetItem = current
        .slice()
        .sort((a, b) => a - b)
        .join("|");
      if (!set.has(currentSetItem)) {
        result.push(current.slice());
        set.add(currentSetItem);
      }
      return;
    }

    current.push(nums[index]);
    bt(index + 1, k - current.length, target - nums[index]);
    current.pop();
    bt(index + 1, k - current.length, target);
  };

  bt(0, k, target);
  return result;
};
```

## js 递归 + 剪枝
```js
/**
 * @param {number} k
 * @param {number} n
 * @return {number[][]}
 */
var combinationSum3 = function(k, n) {
  let left = [...new Array(9)].map((item, index) => index + 1);
  let result = [];
  let digui = (start, value, arr) => {
    for (let i = start; i < value; i++) {
      let copy = arr.slice(0);
      copy.push(left[i]);
      if (copy.length === k && left[i] === value) {
        result.push(copy);
      } else if (copy.length < k && value - left[i] > 0) {
        if (copy.length > 0) {
          let start1 = copy[copy.length - 1];
          digui(start1, value - left[i], copy);
        }
      }
    }
  };
  digui(0, n, []);
  return result;
  console.log(result);
};
```

## js 时间可能比较长，但是便于理解回溯法
```js
var combinationSum3 = function(k, n) {
  let arr = [],
    res = [];
  const dfs = (index, num, target, count) => {
    if (count == 0) {
      if (num == target) {
        res.push([...arr]);
        return;
      }
    } else {
      for (let i = index + 1; i <= 9; i++) {
        if (num + i > target) continue;
        arr.push(i);
        dfs(i, num + i, target, count - 1);
        arr.pop();
      }
    }
  };
  for (let i = 1; i <= 9; i++) {
    arr = [i];
    dfs(i, i, n, k - 1);
  }
  return res;
};
```