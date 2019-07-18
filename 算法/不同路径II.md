不同路径 II
===
<!-- TOC -->

- [不同路径 II](#不同路径-II)
  - [题目](#题目)
  - [标签](#标签)
  - [JS 动态规划](#JS-动态规划)
  - [JS2 DP](#JS2-DP)
  - [JS](#JS)

<!-- /TOC -->

## 题目
一个机器人位于一个 `m x n` 网格的左上角 （起始点在下图中标记为“Start” ）。

机器人每次只能向下或者向右移动一步。机器人试图达到网格的右下角（在下图中标记为“Finish”）。

现在考虑网格中有障碍物。那么从左上角到右下角将会有多少条不同的路径？

![robot_maze.png](../resource/assets/算法/robot_maze.png)

网格中的障碍物和空位置分别用 `1` 和 `0` 来表示。

**说明**：m 和 n 的值均不超过 100。

示例 1:
```js
输入:
[
  [0,0,0],
  [0,1,0],
  [0,0,0]
]
输出: 2
解释:
3x3 网格的正中间有一个障碍物。
从左上角到右下角一共有 2 条不同的路径：
1. 向右 -> 向右 -> 向下 -> 向下
2. 向下 -> 向下 -> 向右 -> 向右
```

## 标签
- 数组
- 动态规划

## JS 动态规划
思路和上题一模一样，只需要增加一个条件判断，注意边上的格子，若其中存在障碍物，该边上的后续格子都无法到达。
```js
/**
 * @param {number[][]} obstacleGrid
 * @return {number}
 */
// 执行用时: 88 ms, 在Unique Paths II的JavaScript提交中击败了89 .23 % 的用户
// 内存消耗: 36.1 MB, 在Unique Paths II的JavaScript提交中击败了13 .56 % 的用户
// 本题主要是有一个障碍物的设定，因此可以直接沿用62的代码，添加上条件判断即可
var uniquePathsWithObstacles = function (obstacleGrid) {
  let n = obstacleGrid.length,
    m = obstacleGrid[0].length;
  let temp = [];
  for (let i = 0; i < n; i++) {
    // 由于初始格子填充的0，因此后续的障碍物格子不用再赋值
    temp[i] = Array(m).fill(0)
  }
  // console.log(temp)
  // 如果起点或终点有障碍物直接判0
  if (obstacleGrid[0][0] == 1 || obstacleGrid[n - 1][m - 1] == 1) {
    return 0
  }
  // i小于列
  for (i = 0; i < n; i++) {
    // j<行
    for (let j = 0; j < m; j++) {
      if (i == 0 && j == 0) {
        temp[i][j] = 1;
      } else if (i == 0) {
        // 顶边若前一格存在障碍物，即无法到达
        if (obstacleGrid[i][j] != 1 && temp[i][j - 1] != 0) {
          temp[i][j] = 1;
        } else {
          temp[i][j] = 0;
        }
      } else if (j == 0) {
        // 左边同理
        if (obstacleGrid[i][j] != 1 && temp[i - 1][j] != 0) {
          temp[i][j] = 1;
        } else {
          temp[i][j] = 0;
        }
      } else if (obstacleGrid[i][j] != 1) {
        // 剩余格子同理，存在障碍物的格子不做判断
        // 如果不是边上， 当前点的到达方式是i - 1, j和i， j - 1 的和
        temp[i][j] = temp[i - 1][j] + temp[i][j - 1]
      }
    }
  }
  // console.log(temp);
  return temp[n - 1][m - 1]
};
```

## JS2 DP
```js
var uniquePathsWithObstacles = function(obstacleGrid) {
  var m = obstacleGrid.length,
      n = obstacleGrid[0].length,
      dp = new Array(m).fill(0).map(function(a) {
        return new Array(n).fill(0);
      });

  if (obstacleGrid[m - 1][n - 1] === 1) return 0;

  dp[m - 1][n - 1] = 1;

  for (var i = m - 1; i >= 0; i--) {
    for (var ii = n - 1; ii >= 0; ii--) {
      if (obstacleGrid[i][ii] === 1) {
        continue;
      }
      if (i + 1 < m) dp[i][ii] += dp[i + 1][ii];
      if (ii + 1 < n) dp[i][ii] += dp[i][ii + 1];
    }
  }
  
  return dp[0][0];
};
```

## JS
```js
var uniquePathsWithObstacles = function(obstacleGrid) {
  // 获取终点的坐标
  let endX = obstacleGrid.length - 1,
    endY = obstacleGrid[0].length - 1;
  let F = (x, y) => {
    // 如果当前位置的坐标存在负值，说明越界，直接返回0
    if (x < 0 || y < 0) return 0;
    // 如果当前的值为1，就不需要计算到当前位置所需要的情况
    if (obstacleGrid[x][y] === 1) return 0;
    // 如果已经递归至起点，就说明到下一步的步数为1
    if (x === 0 && y === 0) return 1;
    // 到当前位置的所有情况数是到当前位置的正上方的所有情况+到左方的虽有情况数的和
    return F(x - 1, y) + F(x, y - 1);
  };
  return F(endX, endY);
};
```