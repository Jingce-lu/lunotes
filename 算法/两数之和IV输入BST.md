两数之和 IV 输入BST
===

<!-- TOC -->

- [两数之和 IV 输入BST](#两数之和-IV-输入BST)
  - [题目](#题目)
  - [BST的定义了解了是关键](#BST的定义了解了是关键)
  - [解答 第一种思路：整理成数组，回到two sum 2](#解答-第一种思路整理成数组回到two-sum-2)
    - [二分法定义](#二分法定义)
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

### 二分法定义
现在我们来玩一个猜数的游戏，假设有一个人要我们猜0-99之间的一个数。那么最好的方法就是从0-99的中间数49开始猜。如果要猜的数小于49，就猜24（0-48的中间数）；如果要猜的数大于49，就猜74（50-99的中间数）。重复这个过程来缩小猜测的范围，直到猜出正确的数字。二分查找的工作方法类似于此。

**二分查找操作的数据集是一个有序的数据集**。开始时，先找出有序集合中间的那个元素。如果此元素比要查找的元素大，就接着在较小的一个半区进行查找；反之，如果此元素比要找的元素小，就在较大的一个半区进行查找。在每个更小的数据集中重复这个查找过程，直到找到要查找的元素或者数据集不能再分割。

**二分查找能应用于任何类型的数据，只要能将这些数据按照某种规则进行排序**。然而，正因为它依赖于一个有序的集合，这使得它在处理那些频繁插入和删除操作的数据集时不太高效。这是因为，对于插入和操作来说，为了保证查找过程正常进行，必须保证数据集始终有序。相对于查找来说，维护一个有序数据集的代价更高。此外，元素必须存储在连续的空间中。因此，当待搜索的集合是相对静态的数据集时，此时使用二分查找是最好的选择。

**二分查找的接口定义**
bisearch

int bisearch(void *sorted, void *target, int size, int esize, int (compare *)(const void *key1, const void *key2);

返回值：如果查找成功返回目标的索引值；否则返回-1。

描述：利用二分查找定位有序元素数组sorted中target。数组中的元素个数由size决定，每个元素的大小由esize决定。函数指针compare指向一个用户自定义的比较函数。如果key1大于key2，函数返回1，如果key1=key2，函数返回0，如果key1小于key2，函数返回-1。

复杂度：O（lg n），n为要查找的元素个数。

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
