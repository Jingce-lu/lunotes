两数之和 IV 输入BST
===

<!-- TOC -->

- [两数之和 IV 输入BST](#两数之和-IV-输入BST)
  - [题目](#题目)
  - [BST的定义了解了是关键](#BST的定义了解了是关键)
  - [解答 第一种思路：整理成数组，回到two sum 2](#解答-第一种思路整理成数组回到two-sum-2)
    - [二分法](#二分法)
    - [双指针](#双指针)
    - [一遍哈希表](#一遍哈希表)
    - [用对象呢？](#用对象呢)
    - [哈希表+两分法](#哈希表两分法)
  - [第二种思路：用二叉树的特性](#第二种思路用二叉树的特性)
    - [深度优先搜索](#深度优先搜索)

<!-- /TOC -->

## 题目
给定一个二叉搜索树和一个目标结果，如果 BST 中存在两个元素且它们的和等于给定的目标结果，则返回 true。

案例 1:
```js
输入: 
    5
   / \
  3   6
 / \   \
2   4   7

Target = 9

输出: True
```

案例 2:
```js
输入: 
    5
   / \
  3   6
 / \   \
2   4   7

Target = 28

输出: False
```

## BST的定义了解了是关键
思路是遍历树，转换数据格式变为两数之和。需要注意的是 如果树为BST树，可转换为有序数字，使用双指针对撞法效率最高

## 解答 第一种思路：整理成数组，回到two sum 2
把二叉树变成原来的升序数组，然后再用two sum 2的解法来做

### 二分法
```js
var findTarget = function(root, target) {
  if (!root) {
    // 基础判断
    return false;
  }

  let nums = [];
  function inOrder(root) {
    if (!root) {
      return;
    }
    inOrder(root.left);
    nums.push(root.val);
    inOrder(root.right);
  }
  inOrder(root);

  // 以下是二分法的代码
  for (let index = 0; index < nums.length; index++) {
    const aim = target - nums[index];
    let start = index + 1;
    end = nums.length - 1;
    while (start <= end) {
      let mid = Math.round((start + end) / 2);
      if (nums[mid] === aim) {
        return true;
      } else if (nums[mid] < aim) {
        start = mid + 1;
      } else {
        end = mid - 1;
      }
    }
  }
  return false;
};
```

### 双指针
```js
var findTarget = function (root, target) {
...
  let low = 0;
  high = nums.length - 1;

  while (low < high) {
    let sum = nums[low] + nums[high];
    if (sum < target) {
      low++
    } else if (sum > target) {
      high--
    } else {
      return true
    }
  }
  return false
};
```

### 一遍哈希表
```js
var findTarget = function (root, target) {
...
  const arrMap = new Map()
  for (let i = 0; i < nums.length; i++) {
    const result = target - nums[i];
    if (arrMap.has(result)) {
      return true
    }
    arrMap.set(nums[i], i)
  }
  return false
};
```

### 用对象呢？
```js
var findTarget = function (root, target) {
...
  const map = {}
  for (let i = 0; i < nums.length; i++) {
    const result = target - nums[i];
    if (map.hasOwnProperty(result)) {
      return true
    }
    map[nums[i]] = i;
  }
  return false
};
```

### 哈希表+两分法
和two sum 2的方法不同，需要多做一步判断，不然会出现多次用同一个数的情况。例子是[2,3]，target=6，显然是应该返回false。然而不加判断会返回true。
- 第一遍找不到4，于是把访问过的3加入哈希表{3 => 1}
- 第二遍开始查哈希表，要找3，正好有3，就返回了true。然而这两个3都是nums的第二位，用了同一个数字了。

在two sum2中可以实现，因为给的target总是对的，因此就不会出现这种的情况，也就不需要多加一步判断了。

```js
var findTarget = function (root, target) {
...
	const arrMap = new Map()
  for (let i = 0; i < nums.length; i++) {
    const aim = target - nums[i];
    if (arrMap.has(aim) && arrMap.get(aim) !== i) {  // 这里需要多做一步判断
      return true
    }

    let start = i + 1;
    end = nums.length - 1;
    while (start <= end) {
      let mid = Math.round((start + end) / 2)
      if (nums[mid] === aim) {
        return true
      } else if (nums[mid] < aim) {
        start = mid + 1
      } else {
        end = mid - 1
      }
      arrMap.set(nums[mid], mid)
    }
  }
  return false
};
```

## 第二种思路：用二叉树的特性
### 深度优先搜索
```js
var findTarget = function (root, k) {
  let stack = [root] // 数组初始化，存入root
  let map = []

  while (stack.length > 0) {
    let cur = stack.pop()		// 每次把数组顶端的node拿出来

    if (map.includes(k - cur.val)) { // 在map数组内查询是否有
      return true
    }
    map.push(cur.val) // 没有就推入map数组

    if (cur.left) {
      stack.push(cur.left)
    }
    if (cur.right) {
      stack.push(cur.right)
    }
  }
  return false
};
```

> Runtime: 152 ms, faster than 5.88% of JavaScript online submissions for Two Sum IV - Input is a BST.

因为右边是最后推入stack的，因此是从右往左的深度优先的查询。 
不过感觉非常耗时……也许是因为map是数组的原因？.includes()查询比较耗时？
