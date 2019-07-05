
const twoSum = (arr, target) => {
  let obj = {};
  for (let i = 0; i < arr.length; i++) {
    let item = arr[i];
    if (obj[item] === undefined) {
      let x = target - item;
      obj[x] = i;
      console.log(x)
    } else {
      return [obj[item], item];
    }
  }
  return null;
}

console.log(twoSum([1, 3, 7, 6, 9, 11], 9))