js数组里面任意两个数的和与目标值
===

问题： 给定一个数组例如[1,3,4,6,7] ，再给定一个目标数，例如9。 写一个算法找出两个数他们相加等于目标数，返回他们在数组中的位置。给出一个解即可，同一个数字不能使用2次。
 
比如[1,3,4,6,7] 目标数为9，那么需要返回[1,3]。如果目标数为20，返回null。

**hash实现：**
```js
// 返回下标
const twoSum = (arr, target) => {
  let obj = {};
  for (let i = 0; i < arr.length; i++) {
    let item = arr[i];
    if (obj[item] === undefined) {
      let x = target - item;
      obj[x] = i;  
    } else {
      return [obj[item], item];
    }
  }
  return null;
}

console.log(twoSum([1, 3, 7, 6, 9, 11], 9))
// [1, 3]


// ---------
// 返回数组
const twoSum = (arr, target) => {
  let obj = {};
  for (let i = 0; i < arr.length; i++) {
    let item = arr[i];
    if (obj[item] === undefined) {
      let x = target - item;
      obj[x] = arr[i];  
    } else {
      return [obj[item], item];
    }
  }
  return null;
}

console.log(twoSum([1, 3, 7, 6, 9, 11], 9))
// [3, 6]
```

**while**
```js
const twoSum = (arr, target) => {
  const max = arr.length;
  let start = 0;
  let end = max -1;

  while(start < end) {
    const sum = arr[start] + arr[end];

    if(sum === target) {
      return [start + 1, end + 1];
    }

    if(sum > target) {
      end--;
      continue
    }

    if(sum < target) {
      start++
      continue
    }
  }
}

console.log(twoSum([1, 3, 7, 6, 9, 11], 9))
// [2, 4]
```