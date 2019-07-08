删除链表的倒数第N个节点
===
<!-- TOC -->

- [删除链表的倒数第N个节点](#删除链表的倒数第N个节点)
  - [题目](#题目)
  - [先后指针](#先后指针)
  - [法二](#法二)
  - [法三](#法三)

<!-- /TOC -->

## 题目
给定一个链表，删除链表的倒数第 n 个节点，并且返回链表的头结点。

示例：
```js
给定一个链表: 1->2->3->4->5, 和 n = 2.

当删除了倒数第二个节点后，链表变为 1->2->3->5.
```

**说明**： 给定的 n 保证是有效的。

进阶： 你能尝试使用一趟扫描实现吗？

提示： Maintain two pointers and update one with a delay of n steps.

## 先后指针
先后指针：快指针先走n-1步后慢指针再开始从头节点开始走。当快指针走到最后一个结点的时候，慢指针就走到了倒数第N个结点。 

证明：
1. 假设总共有N个结点，则倒数第n个结点就是正数第N-n+1个结点。
2. 从头结点正向走到第N-n+1个结点需要走N-n步。
3. 而从头节点到链表最后一个结点需要走N-1步，所以还剩n+1步。

```js
var removeNthFromEnd = function(head, n) {
  // 先指针先走n-1步
  let fast = head;
  for (let i = 1; i <= n - 1; i++) {
    fast = fast.next;
  }
  let slow = head;
  // 缓存要删除结点的前一个结点
  let pre = null;
  while (fast.next) {
    pre = slow;
    fast = fast.next;
    slow = slow.next;
  }
  // 如果要删除的结点是第一个结点的话，则直接返回slow.next
  if (pre === null) {
    return slow.next;
  } else {
    pre.next = slow.next;
  }
  return head;
};
```

## 法二
JavaScript。不需要额外的node节点。有点像一辆高铁，先找到车头，当车头跑到终点时，车尾也到了
```js
var removeNthFromEnd = function(head, n) {
  let curr = head, deleteNode = head, i = 0;
  while(i < n) {
    curr = curr.next;
    i++;
  }
  if (!curr) return head.next;  // 要删除的是第一个节点
  while(curr.next) {
    curr = curr.next;
    deleteNode = deleteNode.next;
  }
  deleteNode.next = deleteNode.next.next;
  return head;
};
```

## 法三
代码里设置初始状态两个指针都是null，比较抽象，可以新建一个辅助节点放在链表头之前，两个指针最开始都指向这个辅助节点，这样整个流程就可以统一了，避免了各种null的判断。

除此之外，还有两个解法可可以参考：
1. 遍历一遍链表存到一个数组a里，直接a.splice(a.length-n, 1)，这个方法需要额外空间，而且还得再把数组转为链表，但是我认为最好想到了。
2. 遍历一遍链表，得到链表长度l，再从头往后走l-n步就可以找到要删除的节点了。

```js
var removeNthFromEnd = function(head, n) {
  //idx1指向要删除的节点之前的节点
  let idx1 = null,
      idx2 = null;
  //idx2先向后走n步，这样idx1正好指向从idx2往前数n+1个节点
  for (let i = 0; i < n; i++) {
    if (idx2 === null) idx2 = head;
    else idx2 = idx2.next;
  }

  //两个指针一起往后走，直到idx2指到最后一个节点
  while (idx2.next) {
    if (idx1 === null) idx1 = head;
    else idx1 = idx1.next;
    idx2 = idx2.next;
  }

  //判断idx1是不是一步没走
  //是的话，则是“长度为n的链表删除倒数第n个节点”的情况，即删除第一个节点
  if (idx1 === null) return head.next;

  //idx1走了的话，就删除idx1所指节点后面的节点
  idx1.next = idx1.next.next;

  return head;
};
```