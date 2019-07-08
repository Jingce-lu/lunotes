合并K个排序链表
===
<!-- TOC -->

- [合并K个排序链表](#合并K个排序链表)
  - [题目](#题目)
  - [标签](#标签)
  - [归并排序-合并K个排序链表](#归并排序-合并K个排序链表)
  - [就是不断地2、2合并](#就是不断地22合并)

<!-- /TOC -->

## 题目
合并 k 个排序链表，返回合并后的排序链表。请分析和描述算法的复杂度。

示例:
```js
输入:
[
  1->4->5,
  1->3->4,
  2->6
]
输出: 1->1->2->3->4->4->5->6
```

## 标签
- 堆
- 链表
- 分治算法

## 归并排序-合并K个排序链表
从代码中可以看出，我主要用了两个函数实现归并排序，第一个函数Partition用于2分数组Lists，第二个函数merge2Lists用于合并并排序两个链表。假设Lists的长度为L，那么Partition的时间开销就是二分法得到的Log(L)，而merge2Lists的时间开销应当是min(m1, m2)其中m1和m2为排序的两个链表的长度。

综上，时间复杂度等于Partition的时间开销乘以merge2Lists的时间开销，即O(min(m1, m2)logL) <= O(MlogL)其中M为链表数组中最长的链表的长度。

```js
function partition(lists) {
  switch (lists.length) {
    case 0:
      return null;
    case 1:
      return lists[0];
    case 2:
      return merge2Lists(lists[0], lists[1]);
    default:
      let mid = lists.length >> 1;
      return merge2Lists(
        partition(lists.slice(0, mid)),
        partition(lists.slice(mid, lists.length))
      );
  }
}

function merge2Lists(l0, l1) {
  let p0 = l0,
    p1 = l1,
    c = new ListNode(null),
    pc = c;
  while (p0 || p1) {
    if (p0 && p1) {
      if (p0.val < p1.val) {
        pc.next = p0;
        p0 = p0.next;
      } else {
        pc.next = p1;
        p1 = p1.next;
      }
    } else if (p0) {
      pc.next = p0;
      break;
    } else if (p1) {
      pc.next = p1;
      break;
    }
    pc = pc.next;
  }
  return c.next;
}

var mergeKLists = function(lists) {
  return partition(lists);
};
```

## 就是不断地2、2合并
```js
var mergeKLists = function(lists) {
  if (lists.length == 0) return null;
  function x(list1, list2) {
    if (list1 == null) return list2;
    if (list2 == null) return list1;
    var x1 = list1.val,
      x2 = list2.val,
      head;
    if (x1 > x2) {
      head = list2;
      list2 = list2.next;
    } else {
      head = list1;
      list1 = list1.next;
    }
    var list = head;
    while (list1 !== null && list2 !== null) {
      x1 = list1.val;
      x2 = list2.val;
      if (x1 > x2) {
        list.next = list2;
        list2 = list2.next;
      } else {
        list.next = list1;
        list1 = list1.next;
      }
      list = list.next;
    }
    if (list1 == null) list.next = list2;
    else list.next = list1;
    return head;
  }

  return lists.reduce(function(a, b) {
    return x(a, b);
  });
};
```
