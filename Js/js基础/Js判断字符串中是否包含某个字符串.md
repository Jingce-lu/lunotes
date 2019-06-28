# js 判断字符串中是否包含某个字符串

## 1. String对象的方法

1. ### indexOf()

    ```js
    var str = "123";
    console.log(str.indexOf("3") != -1 );  // true
    ```

    indexOf() 方法可返回某个指定的字符串值在字符串中首次出现的位置。如果要检索的字符串值没有出现，则该方法返回 -1。

2. ### search() 

    ```js
    var str = "123";
    console.log(str.search("3") != -1 );  // true
    ```

    search() 方法用于检索字符串中指定的子字符串，或检索与正则表达式相匹配的子字符串。如果没有找到任何匹配的子串，则返回 -1。

3. ### match()

    ```js
    var str = "123";
    var reg = RegExp(/3/);
    if(str.match(reg)){
        // 包含        
    }
    ```

    match() 方法可在字符串内检索指定的值，或找到一个或多个正则表达式的匹配。

## 2. RegExp 对象方法

4. ### test() 

    ```js
    var str = "123";
    var reg = RegExp(/3/);
    console.log(reg.test(str)); // true
    ```

    test() 方法用于检索字符串中指定的值。返回 true 或 false。

5. ### exec()

    ```js
    var str = "123";
    var reg = RegExp(/3/);
    if(reg.exec(str)){
        // 包含        
    }
    ```

    exec() 方法用于检索字符串中的正则表达式的匹配。返回一个数组，其中存放匹配的结果。如果未找到匹配，则返回值为 null。

## 3. ES6 includes()

> str.includes(searchString[, position])

* searchString：查询的子字符串
* position：可选，开始搜索的位置，默认为0

    ```js
    'Blue Whale'.includes('Blue'); // returns true
    'Blue Whale'.includes('blue'); // returns false
    ```

    includes方法是会区分大小写。

    对于不支持es6的浏览器，可以添加es6-shim，如：

    ```js
    require('es6-shim')
    ```

## 4. ES6 startsWith()  endsWith()

> startsWith()：返回布尔值，表示参数字符串是否在原字符串的头部。  
> endsWith()：返回布尔值，表示参数字符串是否在原字符串的尾部。

### Polyfill
```js
/*! http://mths.be/startswith v0.2.0 by @mathias */
if (!String.prototype.startsWith) {
  (function() {
    'use strict'; // needed to support `apply`/`call` with `undefined`/`null`
    var defineProperty = (function() {
      // IE 8 only supports `Object.defineProperty` on DOM elements
      try {
        var object = {};
        var $defineProperty = Object.defineProperty;
        var result = $defineProperty(object, object, object) && $defineProperty;
      } catch(error) {}
      return result;
    }());
    var toString = {}.toString;
    var startsWith = function(search) {
      if (this == null) {
        throw TypeError();
      }
      var string = String(this);
      if (search && toString.call(search) == '[object RegExp]') {
        throw TypeError();
      }
      var stringLength = string.length;
      var searchString = String(search);
      var searchLength = searchString.length;
      var position = arguments.length > 1 ? arguments[1] : undefined;
      // `ToInteger`
      var pos = position ? Number(position) : 0;
      if (pos != pos) { // better `isNaN`
        pos = 0;
      }
      var start = Math.min(Math.max(pos, 0), stringLength);
      // Avoid the `indexOf` call if no match is possible
      if (searchLength + start > stringLength) {
        return false;
      }
      var index = -1;
      while (++index < searchLength) {
        if (string.charCodeAt(start + index) != searchString.charCodeAt(index)) {
          return false;
        }
      }
      return true;
    };
    if (defineProperty) {
      defineProperty(String.prototype, 'startsWith', {
        'value': startsWith,
        'configurable': true,
        'writable': true
      });
    } else {
      String.prototype.startsWith = startsWith;
    }
  }());
}
```