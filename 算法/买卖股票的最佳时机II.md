买卖股票的最佳时机 II
===
<!-- TOC -->

- [买卖股票的最佳时机 II](#买卖股票的最佳时机-II)
  - [题目](#题目)
  - [标签](#标签)
  - [JS1 贪心算法](#JS1-贪心算法)
  - [JS2 滑动窗口](#JS2-滑动窗口)
  - [JS3](#JS3)
  - [JS4 双指针](#JS4-双指针)

<!-- /TOC -->
## 题目
给定一个数组，它的第 i 个元素是一支给定股票第 i 天的价格。

设计一个算法来计算你所能获取的最大利润。你可以尽可能地完成更多的交易（多次买卖一支股票）。

**注意**：你不能同时参与多笔交易（你必须在再次购买前出售掉之前的股票）。

示例 1:
<pre>
输入: [7,1,5,3,6,4]
输出: 7
解释: 在第 2 天（股票价格 = 1）的时候买入，在第 3 天（股票价格 = 5）的时候卖出, 这笔交易所能获得利润 = 5-1 = 4 。
     随后，在第 4 天（股票价格 = 3）的时候买入，在第 5 天（股票价格 = 6）的时候卖出, 这笔交易所能获得利润 = 6-3 = 3 。
</pre>

示例 2:
<pre>
输入: [1,2,3,4,5]
输出: 4
解释: 在第 1 天（股票价格 = 1）的时候买入，在第 5 天 （股票价格 = 5）的时候卖出, 这笔交易所能获得利润 = 5-1 = 4 。
     注意你不能在第 1 天和第 2 天接连购买股票，之后再将它们卖出。
     因为这样属于同时参与了多笔交易，你必须在再次购买前出售掉之前的股票。
</pre>

示例 3:
<pre>
输入: [7,6,4,3,1]
输出: 0
解释: 在这种情况下, 没有交易完成, 所以最大利润为 0。
</pre>

## 标签
- 数组
- 贪心算法
- 滑动窗口
- 双指针

## JS1 贪心算法
贪心算法，只要当天的比昨天的价格高就可以选择在当天卖出（同一天可以卖出在昨天的再买入今天的）

思路
1. 只要股票价格上涨，上涨的部分就是我的利润，可以理解为上涨期间第一天买入，然后一直持有到上涨最后一天即下跌前一天再卖出
2. 只要股票价格下跌，那我肯定在下跌前一天卖了，而且下跌期间永远不会买入
3. 现实中不存在这样的操作

```js
/**
 * @param {number[]} prices
 * @return {number}
 */
var maxProfit = function(prices) {
  let profit = 0;
  for (let i = 0; i < prices.length - 1; i++) {
    if (prices[i + 1] > prices[i]) {
      profit += prices[i + 1] - prices[i];
    } 
  }
  return profit;
};
```

## JS2 滑动窗口
滑动窗口法确实慢了 1ms， 主要题目没说明白当天可以卖出去之前的然后再买入当天的
```js
/**
 * @param {number[]} prices
 * @return {number}
 */
var maxProfit = function(prices) {
  // 数组为空特例！！ 还有这种没意义的样例！！
  if (prices.length == 0) return 0;

  let i = 0,
    j = 1,
    ans = 0;

  while (j < prices.length) {
    if (prices[j] < prices[j - 1]) {
      ans += prices[j - 1] - prices[i];
      i = j;
    }
    j++;
  }

  // 判断如果最后一位也是递增的情况做最后一次检查，
  // 例如 数组最后三位为 [...,3,4,5] 则没有j位<j-1位的判断
  if (prices[j - 1] - prices[i] > 0) ans += prices[j - 1] - prices[i];
  return ans;
};
```

## JS3
思路在于当日(i)价格下滑，则取昨日(i-1)卖出的价格差为此次获利。需要注意是在结束的时候需要卖出依旧持有的股票，计算价差获利。
```js
var maxProfit = function(prices) {
  if (prices.length <= 0) {
    return 0;
  }
  let totalProfit = 0,
    minPrice = prices[0];
  // 若价格比前一日低，则以前一日卖出为获利，且在今日再次买入。
  for (let i = 1; i < prices.length; i++) {
    if (prices[i] < prices[i - 1]) {
      totalProfit += prices[i - 1] - minPrice;
      minPrice = prices[i];
    }
  }
  // 结束后卖出持有的股票（如有）
  totalProfit += prices[prices.length - 1] - minPrice;
  return totalProfit;
};
```

## JS4 双指针
双指针,比最优解麻烦很多,想复杂了. 不过也是时间复杂度O(N),空间复杂度O(3)
```js
var maxProfit = function(prices) {
  if (prices == null) {
    return -1;
  }
  if (prices.length < 2) {
    return 0;
  }
  let result = 0; //利润结果
  let point1 = 0; //上一个购买节点 默认为0
  let point2 = 1; //当前节点
  while (point2 < prices.length - 1) {
    //当前价格在上涨
    if (prices[point2] > prices[point2 - 1]) {
      //不会继续上涨
      if (prices[point2 + 1] <= prices[point2]) {
        //卖出
        result +=
          prices[point2] > prices[point1] ? prices[point2] - prices[point1] : 0;
        point1 = point2;
      }
    }
    //当前价格在下跌
    if (prices[point2] < prices[point2 - 1]) {
      //不会继续下跌
      if (prices[point2 + 1] >= prices[point2]) {
        //买入
        point1 = point2;
      }
    }
    point2++;
  }
  //最后一个节点
  result +=
    prices[point2] > prices[point1] ? prices[point2] - prices[point1] : 0;
  return result;
};
```