买卖股票的最佳时机 III
===
<!-- TOC -->

- [买卖股票的最佳时机 III](#买卖股票的最佳时机-III)
  - [题目](#题目)
  - [标签](#标签)
  - [JS DP](#JS-DP)

<!-- /TOC -->
## 题目
给定一个数组，它的第 i 个元素是一支给定的股票在第 i 天的价格。

设计一个算法来计算你所能获取的最大利润。你最多可以完成 两笔 交易。

注意: 你不能同时参与多笔交易（你必须在再次购买前出售掉之前的股票）。

示例 1:
<pre>
输入: [3,3,5,0,0,3,1,4]
输出: 6
解释: 在第 4 天（股票价格 = 0）的时候买入，在第 6 天（股票价格 = 3）的时候卖出，这笔交易所能获得利润 = 3-0 = 3 。
     随后，在第 7 天（股票价格 = 1）的时候买入，在第 8 天 （股票价格 = 4）的时候卖出，这笔交易所能获得利润 = 4-1 = 3 。
</pre>

示例 2:
<pre>
输入: [1,2,3,4,5]
输出: 4
解释: 在第 1 天（股票价格 = 1）的时候买入，在第 5 天 （股票价格 = 5）的时候卖出, 这笔交易所能获得利润 = 5-1 = 4 。   
     注意你不能在第 1 天和第 2 天接连购买股票，之后再将它们卖出。   
     因为这样属于同时参与了多笔交易，你必须在再次购买前出售掉之前的股票。
</pre>

示例 3:
<pre>
输入: [7,6,4,3,1] 
输出: 0 
解释: 在这个情况下, 没有交易完成, 所以最大利润为 0。
</pre>


## 标签
- 数组
- 动态规划

## JS DP
这个dp分成四种情况，
使用数组dp1来保存经过一次、两次卖出后能够获得的最大收益，使用数组dp2来保存经过一次、两次购买后能获得的最大收益，递归方程如下: dp2[0][i]=max(-prices[i], i-1>=0?dp2[0][i-1]:-Infinity) ——在第i天第一次购买股票能够获得的最大收益（此时肯定都是负数） dp1[1][i]=max(dp2[0][i-1]+prices[i],dp1[1][i-1])——在第i天第一次卖出股票能够获得的最大收益（max的两个参数分别代表卖出/不卖出能够获得的收益） dp2[1][i]=max(dp1[1][i-1]-prices[i],dp2[1][i-1])——在第i天第二次购买股票能够获得的最大收益。 dp1[2][i]=max(dp2[1][i-1]+prices[i],dp1[2][i-1])——在第i天第二次卖出股票能够获得的最大收益。
```js
/**
 * @param {number[]} prices
 * @return {number}
 */
var maxProfit = function(prices) {
  if (prices.length === 0) {
    return 0;
  }

  const dp1 = new Array(3).fill(1).map(_ => new Array(prices.length).fill(0));
  const dp2 = new Array(2).fill(1).map(_ => new Array(prices.length).fill(-Infinity));

  for (let i = 0; i < prices.length; i++) {
    dp2[0][i] = Math.max(-prices[i], i - 1 >= 0 ? dp2[0][i - 1] : -Infinity);
    if (i >= 1) {
      dp1[1][i] = Math.max(dp2[0][i - 1] + prices[i], dp1[1][i - 1]);
    }
    if (i >= 2) {
      dp2[1][i] = Math.max(dp1[1][i - 1] - prices[i], dp2[1][i - 1]);
    }
    if (i >= 3) {
      dp1[2][i] = Math.max(dp2[1][i - 1] + prices[i], dp1[2][i - 1]);
    }
  }

  // console.log(dp1,dp2);
  return Math.max.apply(null, dp1[2].concat(dp1[1]));
};
```