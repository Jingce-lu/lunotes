搜索旋转排序数组 II
===
<!-- TOC -->

- [搜索旋转排序数组 II](#搜索旋转排序数组-II)
  - [题目](#题目)
  - [](#)
  - [js 二分查找](#js-二分查找)

<!-- /TOC -->

## 题目
假设按照升序排序的数组在预先未知的某个点上进行了旋转。

( 例如，数组 `[0,0,1,2,2,5,6]` 可能变为 `[2,5,6,0,0,1,2]` )。

编写一个函数来判断给定的目标值是否存在于数组中。若存在返回 true，否则返回 false。

示例 1:
```js
输入: nums = [2,5,6,0,0,1,2], target = 0
输出: true
```

示例 2:
```js
输入: nums = [2,5,6,0,0,1,2], target = 3
输出: false
```

进阶:  
这是 `搜索旋转排序数组` 的延伸题目，本题中的 `nums` 可能包含重复元素。  
这会影响到程序的时间复杂度吗？会有怎样的影响，为什么？

## 
```js
var search = function(nums, target) {
  var num = [...new Set(nums)];
  function erf(arr, target) {
    if (arr.length == 0) {
      return false;
    }
    if (arr.length == 1) {
      if (arr[0] !== target) {
        return false;
      } else {
        return true;
      }
    }
    var middle = parseInt(arr.length / 2);
    if (arr[middle] == target) {
      return true;
    }
    if (arr[middle] > arr[0]) {
      //左边有序
      if (arr[0] <= target && arr[middle] > target) {
        return erf(arr.slice(0, middle), target);
      } else {
        return erf(arr.slice(middle + 1), target);
      }
    } else {
      //右边有序
      if (arr[middle] < arr[0]) {
        if (arr[middle] < target && arr[arr.length - 1] >= target) {
          return erf(arr.slice(middle + 1), target);
        } else {
          return erf(arr.slice(0, middle), target);
        }
      }
    }
  }
  return erf(num, target);
};
```

## js 二分查找
```js
var search = function(nums, target) {
  var left = 0,
    right = nums.length - 1,
    mid;
  while (left <= right) {
    mid = Math.floor((left + right) / 2);
    if (nums[mid] === target) {
      return true;
    } else if (nums[mid] < nums[right]) {
      if (target > nums[mid] && target <= nums[right]) {
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    } else if (nums[mid] > nums[right]) {
      if (target < nums[mid] && target >= nums[left]) {
        right = mid - 1;
      } else {
        left = mid + 1;
      }
    } else {
      right--;
    }
  }
  return false;
};
```
