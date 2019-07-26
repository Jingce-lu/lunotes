N皇后 II
===
<!-- TOC -->

- [题目](#题目)
- [标签](#标签)
- [JS1 回溯](#js1-回溯)
- [JS2](#js2)

<!-- /TOC -->

## 题目
n 皇后问题研究的是如何将 n 个皇后放置在 n×n 的棋盘上，并且使皇后彼此之间不能相互攻击。

![8-queens.png](../resource/assets/算法/8-queens.png)

上图为 8 皇后问题的一种解法。

给定一个整数 n，返回所有不同的 n 皇后问题的解决方案。

每一种解法包含一个明确的 n 皇后问题的棋子放置方案，该方案中 `'Q'` 和 `'.'` 分别代表了皇后和空位。

示例:
```js
输入: 4
输出: 2
解释: 4 皇后问题存在如下两个不同的解法。
[
 [".Q..",  // 解法 1
  "...Q",
  "Q...",
  "..Q."],

 ["..Q.",  // 解法 2
  "Q...",
  "...Q",
  ".Q.."]
]
```

## 标签
- 回溯算法

## JS1 回溯
```js
var totalNQueens = function (n) {
  let res = 0;

  var backtrack = (n, board = [], r = 0) => {
    if (r === n) {
      res++
      return;
    }
    for (let c = 0; c < n; c++) {
      //判断行列斜是否出现皇后
      if (!board.some((bc, br) => bc === c || c - bc === r - br || c - bc === -(r - br))) {
        board.push(c);
        backtrack(n, board, r + 1);
        board.pop();
      }
    }
  }
  backtrack(n)

  return res;
};
```

## JS2 
```js
/**
 * @param {number} n
 * @return {number}
 */
var totalNQueens = function(n) {
  let count = 0;
  dfs(0, [], [], []);
  return count;
  function dfs(level, col, left, right) {
    if (level === n) {
      count++;
      return;
    }
    for (let i = 0; i < n; i++) {
      if (
        !(
          ~col.indexOf(i) ||
          ~left.indexOf(level + i) ||
          ~right.indexOf(level - i)
        )
      ) {
        dfs(
          level + 1,
          [...col, i],
          [...left, level + i],
          [...right, level - i]
        );
      }
    }
  }
};
```