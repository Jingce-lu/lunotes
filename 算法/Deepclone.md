Deepclone
====

```js
function deepcopy(obj) {
  if (tepeof obj != 'object') {
    return obj
  }

  var newObj = {};

  for (var i in obj) {
    newObj[i] = deepcopy(obj[i])
  }

  return newObj;
}

function deepcopy(p, c) {
  var c = c || {};
  for (var i in p) {
    if (typeof p[i] === 'object') {
      c[i] = (p[i].constructor === Array) ? [] : {};
      deepcopy(p[i], c[i])
    } else {
      c[i] = p[i]
    }
  }
  return c;
}

function deepClone(data) {
  var type = getType(data);
  var obj;
  if (type === 'array') {
    obj = [];
  } else if (type === 'object') {
    obj = {};
  } else {
    //不再具有下一层次
    return data;
  }
  if (type === 'array') {
    for (var i = 0, len = data.length; i < len; i++) {
      obj.push(deepClone(data[i]));
    }
  } else if (type === 'object') {
    for (var key in data) {
      obj[key] = deepClone(data[key]);
    }
  }
  return obj;
}

function deepClone(obj) {
  var newObj = obj instanceof Array ? [] : {};
  //obj属于基本数据类型,直接返回obj
  if (typeof obj !== 'object') {
    return obj;
  } else {
    //obj属于数组或对象，遍历它们
    for (var i in obj) {
      newObj[i] = typeof obj[i] === 'object' ? deepClone(obj[i]) : obj[i];
    }
  }
  return newObj;
}
```