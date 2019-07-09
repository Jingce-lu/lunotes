实现strStr()
===
<!-- TOC -->

- [实现strStr()](#实现strStr)
  - [题目](#题目)
  - [标签](#标签)
  - [JavaScript 中有三个字符串方法都可以实现这个功能，分别是 indexOf , search, match](#JavaScript-中有三个字符串方法都可以实现这个功能分别是-indexOf--search-match)
  - [js2](#js2)
  - [KMP](#KMP)

<!-- /TOC -->

## 题目
实现 `strStr()` 函数。

- strstr （PHP语言函数）
- strstr(str1,str2) 函数用于判断字符串str2是否是str1的子串。如果是，则该函数返回str2在str1中首次出现的地址；否则，返回NULL

给定一个 `haystack` 字符串和一个 `needle` 字符串，在 `haystack` 字符串中找出 `needle` 字符串出现的第一个位置 (从0开始)。如果不存在，则返回  -1。

示例 1:
```js
输入: haystack = "hello", needle = "ll"
输出: 2
```

示例 2:
```js
输入: haystack = "aaaaa", needle = "bba"
输出: -1
```

说明:

当 `needle` 是空字符串时，我们应当返回什么值呢？这是一个在面试中很好的问题。

对于本题而言，当 `needle` 是空字符串时我们应当返回 0 。这与C语言的 `strstr()` 以及 Java的 `indexOf()` 定义相符。

## 标签
- 字符串
- 双指针

## JavaScript 中有三个字符串方法都可以实现这个功能，分别是 indexOf , search, match
indexOf 是最切合要求的，原本就是题目中要求的功能：
```js
var strStr = function(haystack, needle) {
    return haystack.indexOf(needle);
};
```

search 方法与 indexOf 方法功能基本一样，只是search支持正则作为参数，则indexOf不支持
```js
var strStr = function(haystack, needle) {
    return haystack.search(needle);
};
```

match 方法返回一个结果数组，在没有指定正则修饰符g的时候，会额外提供index属性来表示位置，只是如果没有查找到，match返回的值为null。
```js
var strStr = function(haystack, needle) {
    let ret = haystack.match(needle);
    return ret === null ? -1 : ret.index;
};
```

## js2
```js
var strStr = function(haystack, needle) {
  if(haystack === needle || needle.length === 0) return 0;
  for(let i=0; i<haystack.length; i++) {
    if(haystack[i] === needle[0]) {
      for(let j=i, t=0; j<haystack.length && t<needle.length; j++, t++) {
        let mark = haystack[j] === needle[t];
        if(mark) {
          if(t === needle.length - 1) {
            return i;
          }
        }
        else {
          break;
        }
      }
    }
  }
  return -1;
};
```

## KMP
```js
var strStr = function(haystack, needle) {
  // 计算next数组，next[i]表示str[i]前面字符串的最长公共前后缀
  // 如 abcdabe，next[6]=2，最长公共前后缀是ab。
  function getNext(str) {
    let len = str.length;
    // i表示str的下标
    let i = 0, j = -1;
    let next = [];
    // next[0]前面没有字符串了，所以置为-1
    next[0] = -1;
    // 因为if中是先i++再给next[i]赋值，所以循环到len-1就够了
    while(i < len - 1) {
      if(j === -1 || str[i] === str[j]) {
        i++;
        j++;
        next[i] = j;
      }
      else {
        j = next[j];
      }
    }
    return next;
  }
  function kmp(str, s) {
    let next = getNext(s);
    let len1 = str.length, len2 = s.length;
    let i = 0, j = 0;
    while(i <len1 && j < len2) {
      if(j === -1 || str[i] === s[j]) {
        i++;
        j++;
      }
      else {
        j = next[j];
      }
    }
    // 匹配成功，返回在str中第一次出现s的下标
    if(j === len2)  return i - j;
    // 没有匹配到就返回-1
    return -1;
  }
  return kmp(haystack, needle);
}
```