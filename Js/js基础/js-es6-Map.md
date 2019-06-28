# es6 javascript的map数据类型转换

<!-- TOC -->

- [es6 javascript的map数据类型转换](#es6-javascript的map数据类型转换)
  - [1. Map定义 | 属性 | 方法](#1-Map定义--属性--方法)
    - [1.1. 定义](#11-定义)
    - [1.2. 语法](#12-语法)
    - [1.3. 属性](#13-属性)
    - [1.4. 方法](#14-方法)
      - [示例](#示例)
  - [2. 数据类型转换](#2-数据类型转换)
    - [2.1. Map 转为数组](#21-Map-转为数组)
    - [2.2. 数组转为 Map](#22-数组转为-Map)
    - [2.3. Map 转为对象](#23-Map-转为对象)
    - [2.4. 对象转为 Map](#24-对象转为-Map)
    - [2.5. Map 转为 JSON](#25-Map-转为-JSON)
    - [2.6. JSON 转为 Map](#26-JSON-转为-Map)

<!-- /TOC -->

## 1. Map定义 | 属性 | 方法

### 1.1. 定义

> 键/值对的集合

### 1.2. 语法

> mapObj = new Map()

- 集合中的键和值可以是任何类型。如果使用现有密钥向集合添加值，则新值会替换旧值。

### 1.3. 属性

下表列出了 Map 对象的属性和描述

```
构造函数
    指定创建映射的函数。
Prototype — 原型
    为映射返回对原型的引用。
size
    返回映射中的元素数。
```

### 1.4. 方法

下表列出了 Map 对象的方法和描述。

```
clear
    从映射中移除所有元素。
delete
    从映射中移除指定的元素。
forEach
    对映射中的每个元素执行指定操作。
get
    返回映射中的指定元素。
has
    如果映射包含指定元素，则返回 true。
set
    添加一个新建元素到映射。
toString
    返回映射的字符串表示形式。
valueOf
    返回指定对象的原始值。
```

#### 示例

```js
var m = new Map();
m.set(1, "black");
m.set(2, "red");
m.set("colors", 2);
m.set({x:1}, 3);

m.forEach(function (item, key, mapObj) {
    document.write(item.toString() + "<br />");
});

document.write("<br />");
document.write(m.get(2));

// Output:
// black
// red
// 2
// 3
//
// red
```


## 2. 数据类型转换

### 2.1. Map 转为数组

```js
// 使用扩展运算符(...)
let myMap = new Map().set(true, 7).set({
    foo: 3
}, ['abc']);
[...myMap]
// [ [ true, 7 ], [ { foo: 3 }, [ 'abc' ] ] ]
```


### 2.2. 数组转为 Map

将数组转入 Map 构造函数, 就可以转为 Map

```js
new Map([
    [true, 7],
    [
        { foo: 3 },
        ['abc']
    ]
])
// Map {true => 7, Object {foo: 3} => ['abc']}
```


### 2.3. Map 转为对象

如果所有 Map 的键都是字符串, 它可以转为对象。

```js
function strMapToObj(strMap) {
    let obj = Object.create(null);
    for (let [k, v] of strMap) {
        obj[k] = v;
    }
    return obj;
}
let myMap = new Map().set('yes', true).set('no', false);
strMapToObj(myMap)
// { yes: true, no: false }
```


### 2.4. 对象转为 Map

```js
function objToStrMap(obj) {
    let strMap = new Map();
    for (let k of Object.keys(obj)) {
        strMap.set(k, obj[k]);
    }
    return strMap;
}
objToStrMap({
    yes: true,
    no: false
})
// [ [ 'yes', true ], [ 'no', false ] ]
```


### 2.5. Map 转为 JSON

Map 转为 JSON 要区分两种情况。 

* 一种情况是, Map 的键名都是字符串, 这时可以选择转为对象 JSON。

    ```js
    function strMapToJson(strMap) {
        return JSON.stringify(strMapToObj(strMap));
    }
    let myMap = new Map().set('yes', true).set('no', false);
    strMapToJson(myMap)
    // '{"yes":true,"no":false}'
    ```

* 另一种情况是, Map 的键名有非字符串, 这时可以选择转为数组 JSON。

    ```js
    function mapToArrayJson(map) {
        return JSON.stringify([...map]);
    }
    let myMap = new Map().set(true, 7).set({
        foo: 3
    }, ['abc']);
    mapToArrayJson(myMap)
    // '[[true,7],[{"foo":3},["abc"]]]'
    ```

### 2.6. JSON 转为 Map

JSON 转为 Map, 正常情况下, 所有键名都是字符串。

```js
function jsonToStrMap(jsonStr) {
    return objToStrMap(JSON.parse(jsonStr));
}
jsonToStrMap('{"yes":true,"no":false}')
// Map {'yes' => true, 'no' => false}
```

但是, 有一种特殊情况, 整个 JSON 就是一个数组, 且每个数组成员本身, 又是一个有两个成员的数组。 这时, 它可以一一对应地转为 Map。 这往往是数组转为 JSON 的逆操作。

```js
function jsonToMap(jsonStr) {
    return new Map(JSON.parse(jsonStr));
}
jsonToMap('[[true,7],[{"foo":3},["abc"]]]')
// Map {true => 7, Object {foo: 3} => ['abc']}
```