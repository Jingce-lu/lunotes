路径总和 III
===
<!-- TOC -->

- [路径总和 III](#路径总和-III)
  - [题目](#题目)
  - [标签](#标签)
  - [JS](#JS)
  - [JS2 双重递归，对每个节点进行判断](#JS2-双重递归对每个节点进行判断)
  - [JS3 超过100%的JavaScript解法](#JS3-超过100的JavaScript解法)
  - [JS4 双递归](#JS4-双递归)

<!-- /TOC -->
## 题目
给定一个二叉树，它的每个结点都存放着一个整数值。

找出路径和等于给定数值的路径总数。

路径不需要从根节点开始，也不需要在叶子节点结束，但是路径方向必须是向下的（只能从父节点到子节点）。

二叉树不超过1000个节点，且节点数值范围是 [-1000000,1000000] 的整数。

示例：
```js
root = [10,5,-3,3,2,null,11,3,-2,null,1], sum = 8

      10
     /  \
    5   -3
   / \    \
  3   2   11
 / \   \
3  -2   1

返回 3。和等于 8 的路径有:

1.  5 -> 3
2.  5 -> 2 -> 1
3.  -3 -> 11
```

## 标签
- 树

## JS
```js
var pathSum = function(root, sum) {
  if (root == null) {
    return 0;
  }
  return pathSum(root.left, sum) + pathSum(root.right, sum) + getdfs(root, sum);
};

let getdfs = function(node, sum) {
  let num = 0;
  if (node == null) {
    return 0;
  }
  if (node.val == sum) {
    num = 1;
  }
  return (
    num + getdfs(node.left, sum - node.val) + getdfs(node.right, sum - node.val)
  );
};
```

## JS2 双重递归，对每个节点进行判断
```js
/**
 * Definition for a binary tree node.
 * function TreeNode(val) {
 *     this.val = val;
 *     this.left = this.right = null;
 * }
 */
/**
 * @param {TreeNode} root
 * @param {number} sum
 * @return {number}
 */
var pathSum = function(root, sum) {
  //双重递归，对每个节点进行判断
  var res = [];
  var count = 0;
  function dfs(root, num) {
    if (!root) return;
    s(root, num);
    dfs(root.left, num);
    dfs(root.right, num);
  }
  dfs(root, sum);
  function s(root, num) {
    if (!root) return;
    num -= root.val;
    if (num === 0) {
      count++;
    }
    s(root.left, num);
    s(root.right, num);
  }
  return count;
};
```

## JS3 超过100%的JavaScript解法
```js
var pathSum = function(root, sum) {
  if (!root) return 0;
  let count = 0;
  let stack = [];
  let dfs = function(root, cur) {
    //当前路径和等于从根节点到此节点的val和
    let curSum = cur + root.val;
    //遍历栈，子路径和等于根到此节点的路径和 - 根到父节点的路径和
    if (curSum === sum) count++;
    for (let i = 0; i < stack.length; i++) {
      if (curSum - stack[i] === sum) count++;
    }
    //当前路径和入栈备用
    stack.push(curSum);
    //用完了就弹出
    if (root.left) {
      dfs(root.left, cur + root.val);
      stack.pop();
    }
    if (root.right) {
      dfs(root.right, cur + root.val);
      stack.pop();
    }
  };
  dfs(root, 0);
  return count;
};
```

## JS4 双递归
```js
/**
 * Definition for a binary tree node.
 * function TreeNode(val) {
 *     this.val = val;
 *     this.left = this.right = null;
 * }
 */
/**
 * @param {TreeNode} root
 * @param {number} sum
 * @return {number}
 */
var pathSum = function(root, sum) {
  if(root === null) return 0;
  var res = 0;
  return res+= (dfs(root, sum)+pathSum(root.right, sum) + pathSum(root.left, sum));
};

function dfs(root, sum){
  if(root === null) return 0;
  var res = 0;
  if(root.val === sum) ++res;
  return res+=(dfs(root.left, sum-root.val)+dfs(root.right, sum-root.val));
}
```