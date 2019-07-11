跳跃游戏 II
===
<!-- TOC -->

- [跳跃游戏 II](#跳跃游戏-II)
  - [题目](#题目)
  - [标签](#标签)
  - [贪心,跳到下一次可以到达最远的位置](#贪心跳到下一次可以到达最远的位置)

<!-- /TOC -->

## 题目
给定一个非负整数数组，你最初位于数组的第一个位置。

数组中的每个元素代表你在该位置可以跳跃的最大长度。

你的目标是使用最少的跳跃次数到达数组的最后一个位置。

示例:
```js
输入: [2,3,1,1,4]
输出: 2
解释: 跳到最后一个位置的最小跳跃数是 2。
     从下标为 0 跳到下标为 1 的位置，跳 1 步，然后跳 3 步到达数组的最后一个位置。
```

说明:

假设你总是可以到达数组的最后一个位置。

## 标签
- 数组
- 贪心算法

## 贪心,跳到下一次可以到达最远的位置
```js
var jump = function(nums) {
  if (nums.length < 2) return 0;
  var index = 0,
    step = 1;
  while (index + nums[index] < nums.length - 1) {
    var nextindex = index + 1;
    for (var ii = index + 2; ii <= index + nums[index]; ii++) {
      if (nextindex + nums[nextindex] < ii + nums[ii]) {
        nextindex = ii;
      }
    }
    index = nextindex;
    step += 1;
  }
  return step;
};
```
