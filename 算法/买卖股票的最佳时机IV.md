买卖股票的最佳时机 IV
===
<!-- TOC -->

- [买卖股票的最佳时机 IV](#买卖股票的最佳时机-IV)
  - [题目](#题目)
  - [标签](#标签)
  - [JS1](#JS1)

<!-- /TOC -->

## 题目
给定一个数组，它的第 i 个元素是一支给定的股票在第 i 天的价格。

设计一个算法来计算你所能获取的最大利润。你最多可以完成 k 笔交易。

注意: 你不能同时参与多笔交易（你必须在再次购买前出售掉之前的股票）。

示例 1:
<pre>
输入: [2,4,1], k = 2
输出: 2
解释: 在第 1 天 (股票价格 = 2) 的时候买入，在第 2 天 (股票价格 = 4) 的时候卖出，这笔交易所能获得利润 = 4-2 = 2 。
</pre>

示例 2:
<pre>
输入: [3,2,6,5,0,3], k = 2
输出: 7
解释: 在第 2 天 (股票价格 = 2) 的时候买入，在第 3 天 (股票价格 = 6) 的时候卖出, 这笔交易所能获得利润 = 6-2 = 4 。
     随后，在第 5 天 (股票价格 = 0) 的时候买入，在第 6 天 (股票价格 = 3) 的时候卖出, 这笔交易所能获得利润 = 3-0 = 3 。
</pre>

## 标签
- 动态规划

## JS1
```js
/**
 * @param {number} k
 * @param {number[]} prices
 * @return {number}
 */
var maxProfit = function(k, prices) {
  if (!k) return 0;

  // 相当于不限次数，能赚钱的都加上
  if (k >= prices.length - 1) {
    let max = 0;
    for (let i = 1; i < prices.length; i++) {
      let v = prices[i] - prices[i - 1];
      if (v > 0) max += v;
    }
    return max;
  }

  // 限制次数
  let nBuyNSell = new Array(k).fill(0);
  let nBuy = new Array(k).fill(Number.POSITIVE_INFINITY);

  for (let i = 0; i < prices.length; i++) {
    const p = prices[i];

    // 购买价格
    nBuy[0] = Math.min(nBuy[0], p);
    // 出售后的利润
    nBuyNSell[0] = Math.max(nBuyNSell[0], p - nBuy[0]);

    for (let j = 1; j < k; j++) {
      // 第N次购买的投入，综合了前一次的利润
      nBuy[j] = Math.min(nBuy[j], p - nBuyNSell[j - 1]);
      // 第N次出售的利润，因为算投入的时候综合了前一次的利润，所以这就是总利润
      nBuyNSell[j] = Math.max(nBuyNSell[j], p - nBuy[j]);
    }
  }
  return nBuyNSell[nBuyNSell.length - 1];
};

// console.log(maxProfit(2, [3, 2, 6, 5, 0, 3]))
// console.log(maxProfit(2, [1, 4, 2]))
```