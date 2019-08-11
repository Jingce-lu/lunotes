背包问题 II
===
<!-- TOC -->

- [背包问题 II](#背包问题-ii)
  - [标签](#标签)
  - [01背包问题](#01背包问题)
  - [分数背包问题](#分数背包问题)
  - [other](#other)
    - [一、](#一)
    - [二、](#二)

<!-- /TOC -->

## 标签
- 动态规划
- 贪心算法

## 01背包问题
背包问题是一个组合优化问题，它可以描述如下：给定一个固定大小、能够携重W的背包，以及一组有价值和重量的物品，找出一个最佳解决方案，使得装入背包的物品总重量不超过W，且总价值最大

下面是一个例子：

| 物品# | 重量 | 价值 |
| ---- | ---- | ---- |
| 1 | 2 | 3 |
| 2 | 3 | 4 |
| 3 | 4 | 5 |

考虑背包能够携带的重量只有5， 对于这个例子，我们可以说最佳解决方案是往背包里装入物品1和物品2，这样，总重量为5, 总价值为7.

动态规划对分数版本无能为力

算法
```js
function knapSack(capacity, weights, values, n) {
  var i, w, a, b, kS = [];

  for(i = 0; i <= n; i++) { //{1}
    kS[i] = [];
  }

  for(i = 0; i <= n; i++) {
    for(w = 0; w <= capacity; w++) {
      if(i == 0 || w == 0) { //{2}
        kS[i][w] = 0;
      } else if (weights[i-1] <= w) { //{3}
        a = values[i-1] + kS[i-1][w-weights[i-1]];
        b = kS[i-1][w];
        kS[i][w] = (a > b) ? a : b; // {4} max(a,b)
      } else {
        kS[i][w] = kS[i-1][w]; //{5}
      }
    }
  }

  return kS[n][capacity];  //{6}
}

knapSack(5, [2,3,4], [3,4,5], 3) // 7
```

解析：
- {1}: 首先，初始化将用于寻找解决方案的矩阵 kS[n+1][capacity+1]
- {2}: 忽略矩阵的第一列和第一行，只处理索引不为0的列和行
- {3}: 物品i的重量必须小于约束(capacity)才有可能成为解决方案的一部分; 否则，总重量就会超出背包能够携带的重量，这是不可能发生的。发生这种情况时，只要忽略它，用之前的值就可以了(行{5})。
- {4}: 当找到可以构成解决方案的物品时，选择价值最大的那个
- {6}: 最后，问题的解决方案就在这个二维表格右下角的最后一个格子里


注意： 这个算法只输出背包携带物品架子的最大值，而不列出实际的物品，  
可以增加下面的附加函数来找出构成解决方案的物品
```js
function findValues(n, capacity, kS, weights, values) {
  var i = n, k = capacity;

  console.log("解决方案包含以下物品： ")；

  while (i > 0 && k > 0) {
    if(kS[i][k] !== kS[i-1][k]) {
      console.log(`物品${i}, 重量： ${weights[i-1]}, 价值： ${values[i-1]}`);
      i--;
      k = k - kS[i][k];
    } else {
      i--;
    }
  }
}
```

完整算法：
```js
function knapSack(capacity, weights, values, n) {
  var i, w, a, b, kS = [];

  for (i = 0; i <= n; i++) {
    kS[i] = [];
  }

  for (i = 0; i <= n; i++) {
    for (w = 0; w <= capacity; w++) {
      if (i == 0 || w == 0) {
        kS[i][w] = 0;
      } else if (weights[i - 1] <= w) {
        a = values[i - 1] + kS[i - 1][w - weights[i - 1]];
        b = kS[i - 1][w];
        kS[i][w] = a > b ? a : b; //max(a,b)
        console.log(a + " can be part of the solution");
      } else {
        kS[i][w] = kS[i - 1][w];
      }
    }
    console.log(kS[i].join());
  }

  //extra algorithm to find the items that are part of the solution
  findValues(n, capacity, kS, values, weights);

  return kS[n][capacity];
}

function findValues(n, capacity, kS, weights, values) {
  var i = n,
    k = capacity;

  console.log("Items that are part of the solution:");

  while (i > 0 && k > 0) {
    if (kS[i][k] !== kS[i - 1][k]) {
      console.log(`物品${i}, 重量： ${weights[i-1]}, 价值： ${values[i-1]}`);
      i--;
      k = k - kS[i][k];
    } else {
      i--;
    }
  }
}

var values = [3, 4, 5],
  weights = [2, 3, 4],
  capacity = 5,
  n = values.length;

knapSack(capacity, weights, values, n)

// 物品2, 重量： 4, 价值： 3
// 物品1, 重量： 3, 价值： 2
// 总价值7
```

## 分数背包问题
求解分数背包问题的算法与动态规划版本稍有不同。 在01背包问题中，只能向背包里装入完整的物品，而分数背包问题中，我们可以装入分数的物品。

我们用前面用过的例子来比较两者的差异，如下图所示

| 物品# | 重量 | 价值 |
| ---- | ---- | ---- |
| 1 | 2 | 3 |
| 2 | 3 | 4 |
| 3 | 4 | 5 |

在动态规划的例子里， 我们考虑背包能够携带的重量只有5. 而在这个例子里，我们可以说最佳解决方案里是往背包里装入物品1和物品2，总重量为5，总价值为7.

如果在分数背包问题中考虑相同的容量，得到的结果是一样的， 因此我们考虑容量为6的情况

在这种情况下，解决方案是装入物品1和物品2，还有25%的物品3， 这样，重量为6的物 物品总价值为8.25。

算法
```js
function knapSack(capacity, values, weights) {
  var n = values.length,
      load = 0, i = 0, val = 0;

  for(i = 0; i < n && load < capacity; i++) { // {1}
    if(weights[i] <= (capacity - load)) { // {2}
      val += values[i];
      load += weights[i];
    } else {
      var r = (capacity - load) / weights[i]  // {3}
      val += r * values[i];
      load += weights[i];
    }
  }

  return val;
}

knapSack(6,[3,4,5], [2,3,4]) // 8.25
```
 
解释
- {1}: 总重量少于背包容量， 继续迭代，装入物品
- {2}: 如果物品可以完整的装入背包，就将其价值和重量分别计入背包已装入物品的总价值(val)和总重量(load)
- {3}: 如果物品不能完整的装入背包，计算能够装入部分的比例(r)

如果在01背包问题中考虑同样的容量6，我们就会看到，物品1和物品3组成立解决方案，在这种情况下，对同一个问题应用不同的解决方法，会得到两种不同的结果


## other
### 一、
```js
/**
 *背包问题算法及个人理解
 *
 * @param {*} weightLimit 背包重量限制
 * @param {*} weightArray 物品重量组成的数组
 * @param {*} valueArray 物品价值组成的数组。注意顺序要与重量数组对应
 * @param {*} account 物品种类（number类型）
 */
function knapSack(weightLimit, weightArray, valueArray, account) {
  //ks是保存数据的二维数组，可以看做是矩阵
  //初始化一个长度为account+1的二维空数组，每一个子数组都可以看成是选用多少个物品时的情况。
  let ks = [];
  for (let i = 0; i <= account; i++) {
    ks.push([]);
  }

  //对应的，每一列都是对应重量限制时的物品组合
  //即，i行w列的值，对应的是选了前i个物品时，重量限制为w时的最优解
  for (let i = 0; i <= account; i++) {
    for (let w = 0; w <= weightLimit; w++) {
      //重量限制为0，或者选用0个物品组合，结果都为0
      if (i === 0 || w === 0) {
        ks[i][w] = 0;

        //如果加入组合的物品的重量没有超过单轮循环的重量限制，那么加入组合
        //加入组合，就是这个物品的值，加上剩余重量（重量限制-该物品重量）的最优解，和就是当前组合的最优解
        //然后与上一行同列的最优解比较，取较大值，作为当前组合的实际的最优解
        //矩阵可以理解成缓存。缓存了之前每种组合的结果
        //为什么是第i行的值，取weightArray[i-1],valueArray[i-1]，是因为数组的下标从0开始
      } else if (weightArray[i - 1] <= w) {
        let a = valueArray[i - 1] + ks[i - 1][w - weightArray[i - 1]];
        ks[i][w] = Math.max(a, ks[i - 1][w]);

        //如果加入组合的物品的重量超过单轮循环的重量限制，那么这个物品不加入组合
        //即这种情况下取上一行同列的值
      } else {
        ks[i][w] = ks[i - 1][w];
      }
    }
  }
  //最终我们需要的结果就是第i行第w列的值。
  return ks[account][weightLimit];
}
```

### 二、
```js
function completeKnapsack(weights, values, W) {
  var f = [], n = weights.length;
  f[-1] = []; //初始化边界
  for (var i = 0; i <= W; i++) {
    f[-1][i] = 0;
  }
  
  for (var i = 0; i < n; i++) {
    f[i] = new Array(W + 1);
    for (var j = 0; j <= W; j++) {
      f[i][j] = 0;
      var bound = j / weights[i];
      for (var k = 0; k <= bound; k++) {
        f[i][j] = Math.max(
          f[i][j],
          f[i - 1][j - k * weights[i]] + k * values[i]
        );
      }
    }
  }
  return f[n - 1][W];
}
//物品个数n = 3，背包容量为W = 5，则背包可以装下的最大价值为40.
var a = completeKnapsack([3, 2, 2], [5, 10, 20], 5);
console.log(a); //40
```
