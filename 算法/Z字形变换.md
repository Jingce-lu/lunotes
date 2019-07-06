Z 字形变换
===
<!-- TOC -->

- [Z 字形变换](#Z-字形变换)
  - [题目](#题目)
  - [解答1](#解答1)
  - [解答2](#解答2)

<!-- /TOC -->
## 题目
将一个给定字符串根据给定的行数，以从上往下、从左到右进行 Z 字形排列。

比如输入字符串为 `"LEETCODEISHIRING"` 行数为 3 时，排列如下：
```
L   C   I   R
E T O E S I I G
E   D   H   N
```
之后，你的输出需要从左往右逐行读取，产生出一个新的字符串，比如：`"LCIRETOESIIGEDHN"`。

请你实现这个将字符串进行指定行数变换的函数：
```js
string convert(string s, int numRows);
```

示例 1:
```js
输入: s = "LEETCODEISHIRING", numRows = 3
输出: "LCIRETOESIIGEDHN"
```

示例 2:
```js
输入: s = "LEETCODEISHIRING", numRows = 4
输出: "LDREOEIIECIHNTSG"
```
解释:
```
L     D     R
E   O E   I I
E C   I H   N
T     S     G
```
## 解答1
1. 找到 每个字符所在的行，然后放到对应的数组，最后拼接每行的字符串 rowindex是根据上一个字符的rowindex加1或减1（offset=1, offset=-1），如果numRows是3，rowindex的范围是[0,2]，因此可以检测到达边界的时候改变offset的符号
```js
var convert = function(s, numRows) {
  var rows = new Array(numRows),
    ch,
    offset = 1,
    prevIndex = -1,
    rowIndex;

  for (let i = 0; i < s.length; i++) {
    ch = s[i];
    rowIndex = prevIndex + offset;
    if (i > 0 && i % (numRows - 1) === 0) {
      offset = -offset;
    }
    if (!rows[rowIndex]) {
      rows[rowIndex] = "";
    }
    rows[rowIndex] += ch;
    prevIndex = rowIndex;
  }

  return rows.join("");
};
```

## 解答2
按行排序，通过变量来控制下标的递增／递减
```js
var convert = function(s, numRows) {
  // 通过一个数组来存储numRows个字符串
  let arr = [];
  // 记录当前下标
  let count = 0;
  // 当前应该是下标递增或是递减
  let add = true;
  // 如果numRows为1，直接返回字符串s
  if (numRows === 1) {
    return s;
  }
  // 遍历给定字符串
  for (let i = 0; i < s.length; i++) {
    // 需要判断arr[count]是否存在，防止出现undefined + 'a'这类情况
    arr[count] = arr[count] ? arr[count] + s[i] : s[i];
    // 当count计数到0时，接下来需要递增
    // 当count计数到numRows - 1时，接下来需要递减
    if (count === 0) {
      add = true;
    } else if (count === numRows - 1) {
      add = false;
    }
    // 根据递增递减情况，对下标count进行对应操作
    count = add ? count + 1 : count - 1;
  }

  // 拼接多个元素并返回结果
  return arr.join("");
};
```