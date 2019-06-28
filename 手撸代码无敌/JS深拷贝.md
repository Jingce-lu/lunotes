手写一个JS深拷贝
====

<!-- TOC -->

- [手写一个JS深拷贝](#手写一个JS深拷贝)
    - [乞丐版](#乞丐版)
    - [面试够用版](#面试够用版)

<!-- /TOC -->

### 乞丐版
```js
var newObj = JSON.parse( JSON.stringify( someObj ) );
```

### 面试够用版
```js
function deepCopy(obj){
    //判断是否是简单数据类型，
    if(typeof obj == "object"){
        //复杂数据类型
        var result = obj.constructor == Array ? [] : {};
        for(let i in obj){
            result[i] = typeof obj[i] == "object" ? deepCopy(obj[i]) : obj[i];
        }
    }else {
        //简单数据类型 直接 == 赋值
        var result = obj;
    }
    return result;
}
```