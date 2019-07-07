两数之和 II - 输入有序数组
===
<!-- TOC -->

- [两数之和 II - 输入有序数组](#两数之和-II---输入有序数组)
  - [题目](#题目)
  - [Javascript 版双指针](#Javascript-版双指针)
  - [一遍哈希表](#一遍哈希表)

<!-- /TOC -->
## 题目
给定一个已按照升序排列 的有序数组，找到两个数使得它们相加之和等于目标数。

函数应该返回这两个下标值 index1 和 index2，其中 index1 必须小于 index2。

说明:
- 返回的下标值（index1 和 index2）不是从零开始的。
- 你可以假设每个输入只对应唯一的答案，而且你不可以重复使用相同的元素。

示例:
```js
输入: numbers = [2, 7, 11, 15], target = 9
输出: [1,2]
解释: 2 与 7 之和等于目标数 9 。因此 index1 = 1, index2 = 2 。
```

## Javascript 版双指针
相较于 `Two Sum 1`, 我们获取的是排序后的数列，因此较好的方法是用双指针，一个指向首位，一个指向末尾，通过对比两者指向元素之和与目标的大小，来遍历我们的数组:

> 执行用时 :80 ms, 在所有 JavaScript 提交中击败了89.08%的用户

```js
/**
 * @param {number[]} numbers
 * @param {number} target
 * @return {number[]}
 */
var twoSum = function(numbers, target) {
  let left = 0;
  let right = numbers.length - 1;

  if (numbers.length <= 2) {
    return [++left, ++right];
  }

  while (left < right) {
    if (numbers[left] + numbers[right] > target) {
      right--;
    } else if (numbers[left] + numbers[right] < target) {
      left++;
    } else {
      return [++left, ++right];
    }
  }
};
```

## 一遍哈希表
> 124 ms	34.8 MB

```js
const twoSum = function(nums, target) {
  if (
    Object.prototype.toString.call(nums) !== "[object Array]" ||
    typeof target !== "number"
  ) {
    alert("input type incorrect");
    return;
  }

  const arrMap = new Map();
  for (let i = 0; i < nums.length; i++) {
    const result = target - nums[i];
    if (arrMap.has(result)) {
      return [arrMap.get(result) + 1, i + 1];
    }
    arrMap.set(nums[i], i);
  }
};
```