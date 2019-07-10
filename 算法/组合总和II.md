组合总和 II
===
<!-- TOC -->

- [组合总和 II](#组合总和-II)
  - [题目](#题目)
  - [标签](#标签)
  - [动态规划](#动态规划)
  - [回溯](#回溯)
  - [js 回溯](#js-回溯)

<!-- /TOC -->

## 题目
给定一个数组 `candidates` 和一个目标数 `target` ，找出 `candidates` 中所有可以使数字和为 `target` 的组合。

`candidates` 中的每个数字在每个组合中只能使用一次。

说明：
1. 所有数字（包括目标数）都是正整数。
2. 解集不能包含重复的组合。 

示例 1:
```js
输入: candidates = [10,1,2,7,6,1,5], target = 8,
所求解集为:
[
  [1, 7],
  [1, 2, 5],
  [2, 6],
  [1, 1, 6]
]
```

示例 2:
```js
输入: candidates = [2,5,2,1,2], target = 5,
所求解集为:
[
  [1,2,2],
  [5]
]
```

## 标签
- 数组
- 回溯算法

## 动态规划
```js
var combinationSum = function(candidates, target) {
  var dp = [];
  //先排序解决顺序问题 例 （1，2）（2，1）
  candidates.sort((a, b) => a - b);
  for (let i = 0; i <= target; i++) {
    dp[i] = new Set();
  }
  dp[0].add("");
  for (let c of candidates) {
    for (let i = target; i >= c; i--) {
      for (item of dp[i - c]) {
        //使用Set去重, 子项要转化成 String
        dp[i].add(item + "," + c);
      }
    }
  }
  //最后把Set 转成 Array
  return Array.from(dp[target]).map(item => item.slice(1).split(","));
};
```

## 回溯
```js
var combinationSum2 = function(candidates, target) {
  candidates.sort((a, b) => a - b);
  var result = [],
    n = candidates.length;

  function backtrack(start, sum, list) {
    if (sum === target) {
      result.push(list);
    }
    for (let i = start; i < n; i++) {
      if (candidates[i] + sum > target) break;
      //相同数字只允许循环的第一个递归，避免重复
      if (candidates[i] === candidates[i - 1] && i > start) continue;
      backtrack(i + 1, sum + candidates[i], [...list, candidates[i]]);
    }
  }

  backtrack(0, 0, []);

  return result;
};
```

##  js 回溯 
```js
var combinationSum2 = function(candidates, target) {
  const buffer = [];
  const result = [];

  const backTrace = (index, target) => {
    if (target == 0) {
      return result.push(buffer.slice());
    }

    if (target < 0) {
      return;
    }

    if (index === candidates.length) return;

    buffer.push(candidates[index]);
    backTrace(index + 1, target - candidates[index]);
    buffer.pop();

    backTrace(index + 1, target);
  };
  backTrace(0, target);

  return [
    ...new Set(
      result.map(arr => arr.sort((a, b) => a - b)).map(arr => arr.join("|"))
    )
  ].map(item => item.split("|").map(num => +num));
};
```