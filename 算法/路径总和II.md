路径总和 II
===
<!-- TOC -->

- [路径总和 II](#路径总和-II)
  - [题目](#题目)
  - [标签](#标签)
  - [JS 递归 + 回溯](#JS-递归--回溯)
  - [JS2](#JS2)
  - [JS3](#JS3)

<!-- /TOC -->
## 题目
给定一个二叉树和一个目标和，找到所有从根节点到叶子节点路径总和等于给定目标和的路径。

**说明**: 叶子节点是指没有子节点的节点。

示例:
```js
给定如下二叉树，以及目标和 sum = 22，

              5
             / \
            4   8
           /   / \
          11  13  4
         /  \    / \
        7    2  5   1
返回:

[
   [5,4,11,2],
   [5,8,4,5]
]
```

## 标签
- 树
- 深度优先搜索


## JS 递归 + 回溯
```js
var pathSum = function(root, sum) {
  if(!root) {
    return []
  }

  if (root.val === sum && !root.left && !root.right) {
    return [[root.val]]
  }

  let ret = []

  for(let l of pathSum(root.left, sum - root.val)) {
    if(l.reduce((r, i) => r + i, 0) + root.val === sum) {
      l = [root.val, ...l]
      ret.push(l)
    }
  }


  for(let l of pathSum(root.right, sum - root.val)) {
    if(l.reduce((r, i) => r + i, 0) + root.val === sum) {
      l = [root.val, ...l]
      ret.push(l)
    }
  }

  return ret
};
```


## JS2
```js
var pathSum = function(root, sum) {
  if (root === null) return [];
  var res = [];
  function dfs(result, ressum, node) {
    if (node.left === null && node.right === null) {
      if (ressum + node.val === sum) {
        res.push(result.concat([node.val]));
      }
      return;
    }
    if (node.left !== null)
      dfs([...result, node.val], ressum + node.val, node.left);
    if (node.right !== null)
      dfs([...result, node.val], ressum + node.val, node.right);
  }
  dfs([], 0, root);
  return res;
};
```

## JS3
```js
var pathSum = function(root, sum) {
  let result = [];
  let tmp = [];

  const getSum = node => {
    if (node === null) {
      return false;
    }
    tmp.push(node.val);

    if (
      node.left === null &&
      node.right === null &&
      tmp.reduce((s, item) => s + item, 0) === sum
    ) {
      result.push(tmp.slice(0));
    }

    if (getSum(node.left) === undefined) {
      tmp.pop();
    }
    if (getSum(node.right) === undefined) {
      tmp.pop();
    }
  };
  getSum(root);
  return result;
};
```