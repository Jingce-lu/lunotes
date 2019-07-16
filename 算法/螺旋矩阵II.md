螺旋矩阵 II
===
<!-- TOC -->

- [螺旋矩阵 II](#螺旋矩阵-II)
  - [题目](#题目)
  - [标签](#标签)
  - [JS1](#JS1)
  - [JS2](#JS2)
  - [JS3 递归](#JS3-递归)
  - [JS4](#JS4)

<!-- /TOC -->

## 题目
给定一个正整数 `n`，生成一个包含 `1 到 n2` 所有元素，且元素按顺时针顺序螺旋排列的正方形矩阵。

示例:
```js
输入: 3
输出:
[
 [ 1, 2, 3 ],
 [ 8, 9, 4 ],
 [ 7, 6, 5 ]
]
```

## 标签
- 数组

## JS1
```js
var generateMatrix = function(n) {
  let res = [];
  for (let i = 0; i < n; i++) {
    res[i] = [];
  }

  let i = (j = 0);
  let level = n;
  let start = 0;
  let offsetX = 1;
  let offsetY = 0;

  for (num = 1; num <= n * n; num++) {
    res[j][i] = num;

    if (num === start + level) {
      offsetX = 0;
      offsetY = 1;
    }
    if (num === start + 2 * level - 1) {
      offsetX = -1;
      offsetY = 0;
    }
    if (num === start + 3 * level - 2) {
      offsetX = 0;
      offsetY = -1;
    }
    if (num === start + 4 * level - 4) {
      start = num;
      level -= 2;
      offsetX = 1;
      offsetY = 0;
    }

    i += offsetX;
    j += offsetY;
  }

  return res;
};
```

## JS2
```js
var generateMatrix = function(n) {
  let matrix = [];

  for (let i = 0; i < n; i++) {
    matrix.push([]);
  }

  let up = 0;
  let down = n - 1;
  let left = 0;
  let right = n - 1;

  let val = 1;

  while (true) {
    for (let i = left; i <= right; i++) {
      matrix[up][i] = val++;
    }

    if (++up > down) break;

    for (let i = up; i <= down; i++) {
      matrix[i][right] = val++;
    }

    if (--right < left) break;

    for (let i = right; i >= left; i--) {
      matrix[down][i] = val++;
    }

    if (--down < up) break;

    for (let i = down; i >= up; i--) {
      matrix[i][left] = val++;
    }

    if (++left > right) break;
  }

  return matrix;
};
```

## JS3 递归
```js
/**
 * @param {number} n
 * @return {number[][]}
 */
var generateMatrix = function(n) {
  let orin = n % 2;
  let returnList = [];
  if (orin === 1) {
    returnList.push([1]);
  }
  while (orin < n) {
    let prev = orin;
    cur = prev + 2;
    let addNum = cur * cur - prev * prev;
    returnList = returnList.map(innerList => {
      innerList = innerList.map(num => num + addNum);
      return innerList;
    });
    
    let top = Array(cur)
      .fill(1)
      .map((_, index) => index + 1);

    let bottom = Array(cur)
      .fill(1)
      .map((_, index) => 2 * cur - 1 + index)
      .reverse();
      
    returnList.forEach((innerList, index) => {
      innerList.push(cur + 1 + index);
      innerList.unshift(addNum - index);
    });
    returnList.unshift(top);
    returnList.push(bottom);
    orin = cur;
  }
  return returnList;
};
```

## JS4
```js
const generateMatrix = input => {
  const matrix = Array(input)
    .fill()
    .map(() => Array(input).fill());
  const total = input * input;
  let currentValue = 1;
  const draw = (all, index) => {
    if (all === 1) {
      matrix[index][index] = currentValue;
      return;
    }
    if (all === 0) return;
    const current = (Math.sqrt(all) - 1) * 4;

    const width = Math.sqrt(all) - 1;
    const itertor = Array(width).fill();

    for (const key of itertor.keys()) {
      matrix[index][index + key] = currentValue++;
    }
    for (const key of itertor.keys()) {
      matrix[index + key][index + width] = currentValue++;
    }
    for (const key of itertor.keys()) {
      matrix[index + width][index + width - key] = currentValue++;
    }
    for (const key of itertor.keys()) {
      matrix[index + width - key][index] = currentValue++;
    }

    draw(all - current, index + 1);
  };

  draw(total, 0);

  return matrix;
};
```