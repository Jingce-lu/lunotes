N皇后
===
<!-- TOC -->

- [题目](#题目)
- [标签](#标签)
- [JS 回溯](#js-回溯)
- [JS2](#js2)
- [JS3](#js3)
- [JS4](#js4)
- [JS5 数组判断](#js5-数组判断)
- [JS6 位运算判断](#js6-位运算判断)

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
输出: [
 [".Q..",  // 解法 1
  "...Q",
  "Q...",
  "..Q."],

 ["..Q.",  // 解法 2
  "Q...",
  "...Q",
  ".Q.."]
]
解释: 4 皇后问题存在两个不同的解法。
```

## 标签
- 回溯算法

## JS 回溯
```js
var solveNQueens = function (n) {
  const res = [];
  var backtrack = (n, preBlock = [], r = 0) => {
    if (r === n) {
      res.push(preBlock.map(c => '.'.repeat(c) + 'Q' + '.'.repeat(n - c - 1)));
      return;
    }
    for (let c = 0; c < n; c++) {
      if (!preBlock.some((j, k) => j === c || j - c === r - k || j - c === k - r)) {
        preBlock.push(c);
        backtrack(n, preBlock, r + 1);
        preBlock.pop();
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
 * @return {string[][]}
 */
const solveNQueens = function(n) {
  if (0 >= n) return [];

  const cols = new Set();
  const xy_dif = new Set();
  const xy_sum = new Set();

  const result = [];

  const dfs = queens => {
    const y = queens.length;

    // debugger

    if (y === n) {
      result.push(queens);
      return;
    }

    let x = 0;

    while (x < n) {
      if (!cols.has(x) && !xy_dif.has(x - y) && !xy_sum.has(x + y)) {
        cols.add(x);
        xy_dif.add(x - y);
        xy_sum.add(x + y);

        dfs([...queens, x]);

        cols.delete(x);
        xy_dif.delete(x - y);
        xy_sum.delete(x + y);
      }

      x++;
    }
  };

  dfs([]);

  return result.map(res => {
    return res.map(idx => {
      const arr = new Array(n);
      arr[idx] = 'Q';
      return arr.join('.');
    });
  });
};
```

## JS3
```js
var solveNQueens = function (n) {
  let cur = [],
      t = 1,
      space = [];

  cur.length = n + 1;
  cur.fill(0);

  const validQueen = function () {
    for (let i = cur[t]; i <= n; ++i) {
      let collision = false;
      for (let j = 1; j <= (t - 1); ++j) {
        if (cur[j] == i || Math.abs(i - cur[j]) == Math.abs(t - j)) {
          collision = true;
          break;
        }
      }
      if (!collision) return i;
    }
    return 0;
  }

  while (t > 0) {
    if (t > n) {
      let lines = [];
      for (let i = 1; i <= n; ++i) {
        lines.push(".".repeat(cur[i] - 1) +
          "Q" +
          ".".repeat(n - cur[i]));
      }
      space.push(lines);
      t--;
    }
    if (cur[t] + 1 > n) {
      cur[t] = 0;
      t--;
    } else {
      cur[t]++;
      let res = validQueen();
      cur[t] = res;
      t = res > 0 ? t + 1 : t - 1;
    }
  }

  return space;
};
```

## JS4
```js
/**
 * @param {number} n
 * @return {string[][]}
 */
var solveNQueens = function(n) {
  const result = [];
  const col = [];
  const left = [];
  const right = [];
  solution(0, []);
  return result;
  function solution(level, plate) {
    if (level == n) {
      result.push(plate);
      return;
    }
    for (let position = 0; position < n; position++) {
      if (
        !(col[position] || left[level + position] || right[level - position])
      ) {
        const row = [];
        for (let i = 0; i < n; i++) {
          row[i] = ".";
        }
        row[position] = "Q";
        col[position] = true;
        left[level + position] = true;
        right[level - position] = true;
        solution(level + 1, [...plate, row.join("")]);
        col[position] = false;
        left[level + position] = false;
        right[level - position] = false;
      }
    }
  }
};
```

## JS5 数组判断
```js
function solveNQueens(n) {
  var answers = [],
    ld_last = [], //左斜线 \ ， col-row
    rd_list = [], //右斜线 / ， row+col
    col_list = [], //列
    queens = []
  function isNotUnderAttack(row, col) {
    return !col_list[col] && !ld_last[col - row] && !rd_list[row + col]
  }
  function placeQueen(row, col) {
    queens.push(col)
    col_list[col] = true
    ld_last[col - row] = true
    rd_list[row + col] = true
  }
  function removeQueen(row, col) {
    queens.pop(col)
    col_list[col] = false
    ld_last[col - row] = false
    rd_list[row + col] = false
  }
  function addSolution() {
    var answer = []
    for (let i = 0; i < n; ++i) {
      let col = queens[i], sb = '';
      for (let j = 0; j < col; ++j) sb += '.';
      sb += 'Q'
      for (let j = 0; j < n - col - 1; ++j) sb += '.';
      answer.push(sb)
    }
    answers.push(answer)
  }
  function backtrack(row) {
    for (var col = 0; col < n; col++) {
      if (isNotUnderAttack(row, col)) {
        placeQueen(row, col);
        if (row + 1 == n) addSolution();
        else backtrack(row + 1);
        removeQueen(row, col);
      }
    }
  }

  backtrack(0)
  return answers
}
```

## JS6 位运算判断
使用 n 位的二进制存储，以 `1100` 为例子，表示1、2格子不能放置，3、4格子可放置皇后
```js
function solveNQueens(n) {
  /*
    ld 左斜线 \  位数为n的二进制数字，1表示已经被占用（不可放置）
    rd 右斜线 /
    col 列   |
    upperlim ��可以放置的位置  n个1 ，例 n=4 --> 1111
  */

  var answers = [],
    upperlim = (1 << n) - 1,
    queens = []

  function addSolution() {
    var answer = []
    for (let i = 0; i < n; ++i) {
      let col = queens[i], sb = '';
      for (let j = 0; j < col; ++j) sb += '.';
      sb += 'Q'
      for (let j = 0; j < n - col - 1; ++j) sb += '.';
      answer.push(sb)
    }
    answers.push(answer)
  }

  function backtrack(col, ld, rd) {
    if (col === upperlim) {
      addSolution()
    } else {
      /*
        pos 当前可以摆放的位置
        例：n=4，第一行第二列摆放了皇后 (.Q..)
           那么第二行限制为
              col 0100
              ld  0010
              rd  1000
           合并限制    col | ld | rd = 1110
           可摆放位置 （~ 会转成32位的反码，这里只需要 n 位，所以 upperlim & 舍去多余的位数）
              pos = ~(col | ld | rd) = 0001
           当 pos>0 , 说明有位置摆放皇后
      */
      var pos = upperlim & ~(col | ld | rd)
      while (pos) {
        /*
          current 当前摆放皇后的位置，从右往做取第一个 1
          ① 取反~，0转1，1转0 ，                        ~ 0001      = 1110
          ② +1，通过二进制加法 把变成 0 的 1 重新转成 1    1110 + 1    = 1111
          ③ pos & ，取得第一个 1，                      0001 & 0001 = 0001
        */
        var current = pos & (~pos + 1)
        pos -= current
        queens.push(n - 1 - Math.log2(current))
        /*
          列：    col | current （ col + current 也可以 ）
          左斜线： ld | current 再 右移 一位
          右斜线： rd | current 再 左移 一位
        */
        backtrack(col | current, upperlim & (ld | current) >> 1, upperlim & (rd | current) << 1)
        queens.pop()
      }
    }
  }

  backtrack(0, 0, 0)
  return answers
}
```