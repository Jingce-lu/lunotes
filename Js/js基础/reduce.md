# 详解JS数组Reduce()方法详解及高级技巧

## 1. 简单应用
```js
[10, 120, 1000].reduce((a, b) => a + b, 0); // 1130

var items = [10, 120, 1000];
// our reducer function
var reducer = function add(sumSoFar, item) {
  sumSoFar.sum = sumSoFar.sum + item;
  return sumSoFar;
};
// do the job
var total = items.reduce(reducer, { sum: 0 });
console.log(total); // {sum:1130}
```

## 2. 进阶应用
在下面的方法中，采用分而治之的方法，即将reduce函数第一个参数callback封装为一个数组，由数组中的每一个函数单独进行叠加并完成reduce操作。所有的一切通过一个manager函数来管理流程和传递初始参数。
```js
var manageReducers = function(reducers) {
  return function(state, item) {
    return Object.keys(reducers).reduce(function(nextState, key) {
      reducers[key](state, item);
      return state;
    }, {});
  };
};
```

上面就是manager函数的实现，它需要reducers对象作为参数，并返回一个callback类型的函数，作为reduce的第一个参数。在该函数内部，则执行多维的叠加工作（Object.keys（））。  

通过这种分治的思想，可以完成目标对象多个属性的同时叠加，完整代码如下：
```js
var reducers = {
  totalInEuros: function(state, item) {
    return (state.euros += item.price * 0.897424392);
  },
  totalInYen: function(state, item) {
    return (state.yens += item.price * 113.852);
  }
};
var manageReducers = function(reducers) {
  return function(state, item) {
    return Object.keys(reducers).reduce(function(nextState, key) {
      reducers[key](state, item);
      return state;
    }, {});
  };
};
var bigTotalPriceReducer = manageReducers(reducers);
var initialState = { euros: 0, yens: 0 };
var items = [{ price: 10 }, { price: 120 }, { price: 1000 }];
var totals = items.reduce(bigTotalPriceReducer, initialState);
console.log(totals);
```

## 3. 在来一个例子：
某同学的期末成绩如下表示
```js
var result = [
  {
    subject: 'math',
    score: 88
  },
  {
    subject: 'chinese',
    score: 95
  },
  {
    subject: 'english',
    score: 80
  }
];

```

如何求该同学的总成绩？
```js
var sum = result.reduce(function(prev, cur) {
  return cur.score + prev;
}, 0);
```

假设该同学因为违纪被处罚在总成绩总扣10分，只需要将初始值设置为-10即可。
```js
var sum = result.reduce(function(prev, cur) {
  return cur.score + prev;
}, -10);

```
我们来给这个例子增加一点难度。假如该同学的总成绩中，各科所占的比重不同，分别为50%，30%，20%，我们应该如何求出最终的权重结果呢？

> 解决方案如下： 

```js
var dis = {
  math: 0.5,
  chinese: 0.3,
  english: 0.2
}
var sum = result.reduce(function(prev, cur) {
  return cur.score + prev;
}, -10);
var qsum = result.reduce(function(prev, cur) {
  return cur.score * dis[cur.subject] + pre;
}, 0)
console.log(sum, qsum);
```

## 4. 再看一个例子，如何知道一串字符串中每个字母出现的次数？
```js
var arrString = "abcdaabc";
arrString.split("").reduce(function(res, cur) {
  res[cur] ? res[cur]++ : (res[cur] = 1);
  return res;
}, {});
// {a: 3, b: 2, c: 2, d: 1}
```

由于可以通过第二参数设置叠加结果的类型初始值，因此这个时候reduce就不再仅仅只是做一个加法了，我们可以灵活的运用它来进行各种各样的类型转换，比如将数组按照一定规则转换为对象，也可以将一种形式的数组转换为另一种形式的数组，大家可以动手去尝试一样。
```js
[1, 2].reduce(function(res, cur) { 
  res.push(cur + 1); 
  return res; 
}, [])
// [2, 3]
```

## 5. koa的源码中，有一个only模块，整个模块就一个简单的返回reduce方法操作的对象：
```js
var only = function(obj, keys){
 obj = obj || {};
 if ('string' == typeof keys) keys = keys.split(/ +/);
 return keys.reduce(function(ret, key){
  if (null == obj[key]) return ret;
  ret[key] = obj[key];
  return ret;
 }, {});
};
```

通过对reduce概念的理解，这个模块主要是想新建并返回一个obj对象中存在的keys的object对象。
```js
var a = {
  env : 'development',
  proxy : false,
  subdomainOffset : 2
}
only(a,['env','proxy'])  // {env:'development',proxy : false}
```
