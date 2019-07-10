数组类算法js(双指针)
===

<!-- TOC -->

- [数组类算法js(双指针)](#数组类算法js双指针)
  - [双指针](#双指针)
  - [1.移动零](#1移动零)
  - [2.移除元素](#2移除元素)
  - [3.删除数组中的重复项](#3删除数组中的重复项)
  - [4. 删除排序数组中的重复项 II](#4-删除排序数组中的重复项-II)

<!-- /TOC -->

## 双指针
1. 启发：假设已经有了这个数组的任意两个元素之和的有序数组。那么利用二分查找法进行查找，但是排序需要平方时间
2. 这个二分查找法启发我们，可以直接对两个数字的和进行一个有序的遍历

- 双指针如果取两个最小（和最小）
- 双指针如果取两个最大（和最大）
- 双指针如果取最小和最大（和居中）
- 对于平均查找时间来讲，居中的具有优势

证明双指针法为什么是有效的？
1. 如果存在答案，那么0 <= i < j <=n-1，i, j都往中间走，趋势是对的
2. 一个循环不变式：每次循环后i, j永远都是可能性取值的边界位置


<pre>
证明：  
初始化：初始化前，i, j 处于边界（处于边界的意思是：已经有效排除了所有该排除的可能性）

维持：（若某次操作前，i, j处于边界， 操作后，i, j还是处于边界）
  a) 若(i) + (j) > target
    那么增加i为i1，(i1) + (j) > (i) + (j) > target，也即 任意移动i，所得的和都比target要大，因此排除掉了(j)位置的所有可能性
    只能递减j 
  b) 若(i) + (j) < target
    同理，那么递减j为j1，(i) + (j1) < (i) + (j) < target，也即 任意移动j，所得的和都比target要小，因此排除掉了(i)位置的所有可能性
    只能递增i

（根据证明可知：这个其实本质上也符合贪心的性质，最后转化为了更小子数组的查找）
</pre>


**双指针贪心**

双指针法为什么可以找到所有的情况?

<pre>
这里有一个循环不变式：
  small没加一个，表示small-1的所有可能性已经穷尽；并且也已经穷尽了big从small + 1到当前值的可能性

以target = 15为例说明：
step1. small = 1, big =2，将big一直向右移动，直至sum(small - big) = 15，记录下来；
           继续加到sum(small - big) = 21 > 15，此时small = 1, big = 6
           这是如果big继续加大，那么sum只会更大，偏离target更多，因此
           以small = 1起始的所有情况穷尽了
step2. 内部while循环 找到的是第一个sum > target的big值
           此时small = 1, big = 6，在前面一个的时候sum <= target
           因为此时small = 1已经穷尽，只能small ++变为2
           但是因为sum(2 - 5) < sum(1- 5)，因此只有可能sum(2 - 6)才可能等于target，这也是为什么内部循环要如此写的原因
step3.一直按照step1, step2这样循环往复地分析，就能获取到所有可能性（所有以某个数开始的连续和的所有可能性）

small >= middle
big > small >= midlle
sum(small - big) > target
</pre>

**双指针窗口**

为什么start和end这种移动方式就能找到所有 无重复的字符串
<pre>
循环不变式：一直求得是以start开头的最长无重复字符串

说明：以abcdcbaefga为例
step1. start = 0
    end一直累加，直到end指向4
    这是以0开头的最长的无重复字符串
step2. 当end = 4时，因为此时start = 0，因为start - end之间含有两个c
    因此，移动start = 1，此时还是有两个c，因此 此时的end - start无疑较小，继续累加，这是以1开头的最长无重复
    start =2 ，此时还有两个c，继续累加，这是以2开头的最长无重复字符串
    start = 3，无重复，此时需要累加end，以求得以3开头的最长无重复字符串
</pre>

## 1.移动零
给定一个数组 nums，编写一个函数将所有 0 移动到数组的末尾，同时保持非零元素的相对顺序。

示例:
```js
输入: [0,1,0,3,12]
输出: [1,3,12,0,0]
```

说明: 
1. 必须在原数组上操作，不能拷贝额外的数组。
2. 尽量减少操作次数。

```js
var moveZeroes = function(nums) {
  let n = nums.length;
  for (let i = 0; i < n; i++) {
    if (nums[i] == 0) {
      nums.splice(i, 1);
      nums.push(0);
      n--; //减去push 0这一项,如果不减,会造成死循环.
      i--; //删除一项后,后面的值变成当前位置,遍历时要从当前位置开始
    }
  }
  return nums;
};
```

**双指针方法**
```js
var moveZeroes = function(nums) {
  let n = nums.length;
  let i = -1;
  for (let j = 0; j < n; j++) {
    if (nums[j] !== 0) {
      i++;
      nums[i] = nums[j];
    }
  }
  //遍历i-n为0
  for (let k = i + 1; k < n; k++) {
    nums[k] = 0;
  }
  console.log(nums);
  return nums;
};
```

## 2.移除元素
给定一个数组 nums 和一个值 val，你需要原地移除所有数值等于 val 的元素，返回移除后数组的新长度。  
不要使用额外的数组空间，你必须在原地修改输入数组并在使用 O(1) 额外空间的条件下完成。  
元素的顺序可以改变。你不需要考虑数组中超出新长度后面的元素。  

示例 1:
```js
给定 nums = [3,2,2,3], val = 3,
函数应该返回新的长度 2, 并且 nums 中的前两个元素均为 2。
你不需要考虑数组中超出新长度后面的元素。
```

示例 2:
```js
给定 nums = [0,1,2,2,3,0,4,2], val = 2,
函数应该返回新的长度 5, 并且 nums 中的前五个元素为 0, 1, 3, 0, 4。
注意这五个元素可为任意顺序。
你不需要考虑数组中超出新长度后面的元素。
```

```js
var removeElement = function(nums, val) {
  for (let i = 0; i < nums.length; i++) {
    if (nums[i] == val) {
      nums.splice(i, 1);
      i--;
    }
  }
  return nums.length;
};
```

**双指针方法**
```js
var removeElement = function(nums, val) {
  let n = nums.length;
  let rlen = 0;
  for (let i = 0; i < n; i++) {
    if (nums[i] !== val) {
      nums[rlen] = nums[i];
      rlen++;
    }
  }
  console.log(nums);
  console.log(rlen);

  return rlen;
};
```

## 3.删除数组中的重复项
给定一个排序数组，你需要在原地删除重复出现的元素，使得每个元素只出现一次，返回移除后数组的新长度。  
不要使用额外的数组空间，你必须在原地修改输入数组并在使用 O(1) 额外空间的条件下完成。

示例 1:
```js
给定数组 nums = [1,1,2],
函数应该返回新的长度 2, 并且原数组 nums 的前两个元素被修改为 1, 2。
你不需要考虑数组中超出新长度后面的元素。
```

示例 2:
```js
给定 nums = [0,0,1,1,1,2,2,3,3,4],
函数应该返回新的长度 5, 并且原数组 nums 的前五个元素被修改为 0, 1, 2, 3, 4。
你不需要考虑数组中超出新长度后面的元素。
```

任意数组 方法[1,2,3,2,3,4,1,5]
```js
var removeDuplicates = function(nums) {
  let n = nums.length;
  let k = 1;
  for (let i = 1; i < n; i++) {
    for (let j = 0; j < k; j++) {
      if (nums[i] == nums[j]) {
        nums.splice(i, 1);
        n--;
        i--;
        k--;
      }
    }
    k++;
  }
  return nums.length;
};
```

排序的数组[0,0,1,1,1,2,2,3,3,4]
```js
var removeDuplicates = function(nums) {
  let n = nums.length;
  if (n == 0) return 0;

  for (let i = 1; i < n; i++) {
    if (nums[i] == nums[i - 1]) {
      nums.splice(i, 1);
      n--;
      i--;
    }
  }
  console.log(nums);

  return n;
};
```

**双指针方法**
```js
var removeDuplicates = function(nums) {
  if (nums.length == 0) return 0;
  let i = 0;
  for (let j = 1; j < nums.length; j++) {
    //j是遍历整个数组
    if (nums[j] != nums[i]) {
      //i是新数组
      i++;
      nums[i] = nums[j];
    }
  }
  console.log(i + 1);
  console.log(nums);

  return i + 1;
};
```

## 4. 删除排序数组中的重复项 II
给定一个排序数组，你需要在原地删除重复出现的元素，使得每个元素最多出现两次，返回移除后数组的新长度。
不要使用额外的数组空间，你必须在原地修改输入数组并在使用 O(1) 额外空间的条件下完成。

示例 1:
```js
给定 nums = [1,1,1,2,2,3],
函数应返回新长度 length = 5, 并且原数组的前五个元素被修改为 1, 1, 2, 2, 3 。
你不需要考虑数组中超出新长度后面的元素。
```

示例 2:
```
给定 nums = [0,0,1,1,1,1,2,3,3],
函数应返回新长度 length = 7, 并且原数组的前五个元素被修改为 0, 0, 1, 1, 2, 3, 3 。
你不需要考虑数组中超出新长度后面的元素。
```

```js
var removeDuplicates = function(nums) {
  let n = nums.length;
  let flag = false; //1个为false
  for (let i = 1; i < n; i++) {
    if (flag) {
      if (nums[i] == nums[i - 1] && flag) {
        nums.splice(i, 1);
        n--;
        i--;
      } else {
        flag = false;
      }
    } else {
      if (nums[i] == nums[i - 1]) {
        flag = true; //2个为true
      } else {
        flag = false;
      }
    }
  }
  console.log(nums);
  return n;
};
```

**双指针方法**
```js
var removeDuplicates = function(nums) {
  let n = nums.length;
  if (n <= 2) return n;

  let i = 1,
    j = i + 1;

  while (j < n) {
    if (nums[j] != nums[i] || (nums[j] == nums[i] && nums[j] != nums[i - 1])) {
      nums[i + 1] = nums[j];
      i += 1;
    }

    j += 1;
  }
  // for(let j = i + 1;j < n;j++ ){
  //     if ( (nums[j] != nums[i]) || (nums[j] == nums[i] && nums[j] != nums[i-1]) ){
  //         nums[i+1] = nums[j]
  //         i += 1
  //     }
  // }
  console.log(i + 1);
  console.log(nums);
  return i + 1;
};
```