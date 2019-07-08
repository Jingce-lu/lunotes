删除链表的倒数第N个节点
===
<!-- TOC -->

- [删除链表的倒数第N个节点](#删除链表的倒数第N个节点)
  - [题目](#题目)
  - [先后指针](#先后指针)

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