# js 类型转换

<!-- TOC -->

- [js 类型转换](#js-类型转换)
    - [一、JS运算符的优先级](#一js运算符的优先级)
    - [二、JS的类型转化](#二js的类型转化)
        - [1. 对于非原始类型的，通过ToPrimitive() 将值转换成原始类型：](#1-对于非原始类型的通过toprimitive-将值转换成原始类型)
        - [2. 通过ToNumber()把值转换成Number](#2-通过tonumber把值转换成number)
        - [3. 通过ToString()把值转化成字符串](#3-通过tostring把值转化成字符串)
    - [三、步步执行](#三步步执行)
    - [四、小结](#四小结)
    - [五、 ECMAScript的规范定义的抽象操作](#五-ecmascript的规范定义的抽象操作)
        - [5.1 原始值](#51-原始值)
        - [5.2 GetValue(v)](#52-getvaluev)
        - [5.3 SameValue(x,y)](#53-samevaluexy)
        - [5.4 ToPrimitive(input [ , PreferredType])](#54-toprimitiveinput---preferredtype)
            - [obj.valueOf() 和 obj.toString()](#objvalueof-和-objtostring)
                - [toString用来返回对象的字符串表示。](#tostring用来返回对象的字符串表示)
                - [valueOf方法返回对象的原始值，可能是字符串、数值或bool值等，看具体的对象。](#valueof方法返回对象的原始值可能是字符串数值或bool值等看具体的对象)
        - [5.5 ToNumber(x)](#55-tonumberx)
        - [5.6 ToString(x)](#56-tostringx)
        - [5.7 ==转换规则：](#57-转换规则)
    - [六、验证分析++[[]][+[]]+[+[]]==10?](#六验证分析10)
        - [1.首先++[[]][+[]]+[+[]]首先拆分一下：](#1首先首先拆分一下)
        - [2.先来分析右边的[+[]]](#2先来分析右边的)
        - [3.再来分析左边边的++[[]][+[]]](#3再来分析左边边的)
        - [4.分析问题错误的原因](#4分析问题错误的原因)
        - [5.进一步拆分](#5进一步拆分)

<!-- /TOC -->

```js
// sb
(!(~+[])+{})[--[~+""][+[]]*[~+[]] + ~~!+[]]+({}+[])[[~!+[]]*~+[]]

// nb
([][[]]+[])[+!![]]+([]+{})[!+[]+!![]]
```

## 一、JS运算符的优先级
优先级的排列如下表：

优先级从高到低：

| 运算符 | 说明 |
| ---------------------- | ------------------------- |
| .\[]\() | 字段访问、数组下标、函数调用以及表达式分组 |
| ++ — - + ~ ! delete new typeof void | 一元运算符、返回数据类型、对象创建、未定义值 |
| * / % | 相乘、相除、求余数 |
| + - + | 相加、 相减、字符串串联 |
| << >> >>> | 移位 |
| < <= > >= instanceof | 小于、 小于或等于、 大于、 大于或等于、 是否为特定类型的实例 |
| == != === !== | |
| & | 按位”与" |
| ^ | 按位“异或” |
| \\| | 按位“或” |
| && | 逻辑“与” |
| \\|\\| | 逻辑“或” |
| ?: | 条件运算 |
| = OP= | 赋值、 赋值运算（ 如 += 和 &= ）|
| ，| 多个计算 |

根据此规则，我们把这一串运算分为以下16个子表达式：
<div align='center'><img src="https://github.com/Jingce-lu/mystudy/blob/more/assets/jstype.jpg"/></div>

运算符用红色标出，有一点可能大家会意识不到，其实中括号`[]`也是一个运算符，用来通过索引访问数组项，另外也可以访问字符串的子字符，有点类似charAt方法，如：`'abcd'[1] // 返回’b’`。而且`中括号的优先级还是最高的`



## 二、JS的类型转化
先说说什么情况下需要进行类型转化。当操作符两边的操作数类型不一致或者不是基本类型（也叫原始类型）时，需要进行类型转化。先按运算符来分一下类：
* 减号-，乘号*，肯定是进行数学运算，所以操作数需转化为number类型。
* 加号+，可能是字符串拼接，也可能是数学运算，所以可能会转化为number或string
* 一元运算，如+[]，只有一个操作数的，转化为number类型

下面来看一下转化规则。

### 1. 对于非原始类型的，通过ToPrimitive() 将值转换成原始类型：
ToPrimitive(input, PreferredType?)

可选参数PreferredType是Number或者是String。返回值为任何原始值。如果PreferredType是Number，执行顺序如下：
- 如果input为primitive，返回
- 否则，input为Object。调用 obj.valueOf()。如果结果是primitive，返回。
- 否则，调用obj.toString(). 如果结果是primitive，返回
- 否则，抛出TypeError
- 如果 PreferredType是String，步骤2跟3互换，如果PreferredType没有，Date实例被设置成String，其他都是Number

### 2. 通过ToNumber()把值转换成Number
规则如下：

参数 | 结果 
----- | -------
Undefined | NaN
Null | +0
Boolean | true转换为1, false 转换为0
number | 无需转换
string | 由字符串解析为数字，如"123"被转换为123

### 3. 通过ToString()把值转化成字符串
规则如下：

参数 | 结果
----- | -------
undefined | "undefined"
null | "null"
boolean | "true"或者"false"
number | 数字作为字符串，比如，"1.765"
string | 无需转换


## 三、步步执行
1. 先看最简单的子表达式16：+[]
    只有一个操作数[]，肯定是转化为number了，根据上面的规则2，[]是个数组，object类型，即对象。所以得先调用toPrimitive转化为原始类型，并且PreferredType为number，这个参数表示更“倾向于”转化的类型，这里肯定是number了。然后首先调用数组的valueOf方法，数组调用valueOf会返回自身，如下：
    ```js
    [].valueOf() // []
    ```
    这个时候，我们得到一个空串“”，还没有结束，看上面的规则2描述，继续调用toNumber，转化为number类型，如下：
    ```js
    Number('') // 0
    ```
    子表达式16转化完毕，+[]，最终得到0。

2. 来看子表达式15：`[~+””]`
    空串””前面有两个一元操作符，但是操作数还是只有一个，所以，最终要转化为的类型是number。看规则2吧，空串调用toNumber得到0。接下来是~，这是个什么东东呢？它是位运算符，`作用可以记为把数字取负然后减一`，所以`~0就是-1` 。

    别忘了，这个子表达式外头还包着中括号，所以最终的值为`[-1]`，即一个数组，里面只有一个元素-1.

3. 接下来看子表达式13就简单了，把15、16求出来的填进去，就变成了这样：–[-1][0]，取数组的第0个元素，然后自减，结果为-2，是不so easy!
4. 继续往上走，子表达式14： [~+[]]
   其实把15、和16的原理用上就非常明显了，答案[-1]
5. 继续来求子表达式9，
   此刻它已变成：-2*[-1]，有稍许不一样，不过没关系，我们还是按照规则来，运算符是乘号*，当然是做数学运算，那后面的[-1]就得转化为number，与16的求法类似，过程如下：
   1. 调用toPrimitive，发现是object类型
   2. 调用valueOf，返回自身[-1]
   3. 因为不是原始类型，继续调用toString，返回”-1″
   4. ”-1″是原始类型了，然后调用toNumber，返回-1
   5. 与-2相乘，返回2

6. 子表达式10：~~!+[]，不多说了，答案1. 就是从右往左依次一元计算。
7. 有了9和10，我们来到了子表达式4，此刻它已经长这样了：2+1，
8. 继续看表达式7：!(~+[])，~+[]=-1，这个根据上面已经知道了，那!-1是什么呢？这里要说一下这个感叹号，它是逻辑取非的意思，会把表达式转化为布尔类型，转化规则和js的Truthy和Falsy原则是一样的，后面跟数字的，除0以外都为false，后面跟字符串的，除空串以外都为false。这里的!-1当然就是false了。
9. 接下来这个表达式3：false+{}有点关键。
   一个布尔加一个对象，那这个{}应该先转化为原始类型，流程如下：
   1. 调用toPrimitive，发现是object类型
   2. 调用valueOf，返回自身{}，
   3. 不是原始类型，调用toString，返回”[object Object]”
   4. false与”[object Object]”相加，false先转化为字符串”false”
   5. 相加得结果”false[object Object]”

10. 知道了表达式3和4，我们就可以来看表达式1了，此时它是这样的：”false[object Object]”[3]，因为这个[]可以取字符串的子字符，像charAt一样，所以得到了结果”s”


## 四、小结
> 1. 数组下标([])优先级最高， 一元运算符（--，++，+，-）的优先级高于加法或减法运算符（+，-）；
> 2. ++前增量运算符，就是数值上加 1；
> 3. 一元运算符（+，-）的后面如果不是数字，会调用 ToNumber 方法按照规则转化成数字类型。
> 4. 对于加号运算符(+)  
>   首先执行代码，调用 ToPrimitive 方法得到原始值  
>   ①如果原始值是两个数字，则直接相加得出结果。  
>   ②如果两个原始值都是字符串，把第二个字符串连接到第一个上，也就是相当于调用 concat 方法。  
>   ③如果只有一个原始值是字符串，调用 ToString 方法把另一个运算数转换成字符串，结果是两个字符串连接成的字符串。  
> 5. 对于减号运算符(-)  
>   不知道大家有没有看到ECMAScript规范，这里比+少了一步 ToPrimitive ，所以 - 相对容易理解。  
>   ①如果是两个数字，则直接相减得出结果     
    ②如果有一个不是数字，会调用 ToNumber 方法按照规则转化成数字类型，然后进行相减。
> 6. 分号的插入  
    ①新行并入当前行将构成非法语句，自动插入分号。  
    ②在continue,return,break,throw后自动插入分号  
    ③++、--后缀表达式作为新行的开始，在行首自动插入分号  
    ④代码块的最后一个语句会自动插入分号  
    ⑤新行以 ( 、[、\、+ 、 - 、,、. % 和 *开始都不会插入分号
> 7. {}的两种解读  
    ①当{}的前面有运算符号的时候，+，-，*，/,()等等，{}都会被解析成对象字面量，这无可争议。  
    ②当{}前面没有运算符时候但有;结尾的时候，或者浏览器的自动分号插入机制给{}后面插入分号(;)时候，此时{}都会被解析成代码块。 
    ③如果{}前面什么运算符都没有，{}后面也没有分号(;)结尾，Firefox会始终如一的解析为代码块，而chrome有细微的差别，chrome会解析为对象字面量。


## 五、 ECMAScript的规范定义的抽象操作
前面关于ECMAScript规范的解读，涉及到几个重要的抽象操作：
* GetValue(v) : 引用规范类型
* Type(x) : 获取x的类型
* ToNumber(x) : 将x转换为Number类型
* ToString(x) : 将x转换为String类型
* SameValue(x,y) : 计算非数字类型x,y是否相同
* ToPrimitive(x) : 将x转换为原始值

### 5.1 原始值
```
原始值(primitives)

1. undefined
2. null
3. boolean
4. number
5. string

对象值(objects)。
除了原始值外，其他的所有值都是对象类型的值，包括数组(array)和函数(function)等。
```

### 5.2 GetValue(v)
GetValue(v) : 引用规范类型，  
先看下SameValue()和ToPrimitive()两个操作。

### 5.3 SameValue(x,y)
这个SameValue操作说的就是，如果x,y两个值类型相同，但又不同时是Number类型时的比较是否相等的操作。

### 5.4 ToPrimitive(input [ , PreferredType])
ToPrimitive() 方法  
转换成原始类型方法。

```
ToPrimitive(obj,preferredType)

JS引擎内部转换为原始值ToPrimitive(obj,preferredType)函数接受两个参数，第一个obj为被转换的对象，第二个
preferredType为希望转换成的类型（默认为空，接受的值为Number或String）

在执行ToPrimitive(obj,preferredType)时如果第二个参数为空并且obj为Date的事例时，此时preferredType会
被设置为String，其他情况下preferredType都会被设置为Number如果preferredType为Number，ToPrimitive执
行过程如
下：
1. 如果obj为原始值，直接返回；
2. 否则调用 obj.valueOf()，如果执行结果是原始值，返回之；
3. 否则调用 obj.toString()，如果执行结果是原始值，返回之；
4. 否则抛异常。

如果preferredType为String，将上面的第2步和第3步调换，即：
1. 如果obj为原始值，直接返回；
2. 否则调用 obj.toString()，如果执行结果是原始值，返回之；
3. 否则调用 obj.valueOf()，如果执行结果是原始值，返回之；
4. 否则抛异常。
```

#### obj.valueOf() 和 obj.toString()
##### toString用来返回对象的字符串表示。
```js
var obj = {};
console.log(obj.toString());//[object Object]

var arr2 = [];
console.log(arr2.toString());//""空字符串

var date = new Date();
console.log(date.toString());//Sun Feb 28 2016 13:40:36 GMT+0800 (中国标准时间)
```

##### valueOf方法返回对象的原始值，可能是字符串、数值或bool值等，看具体的对象。
```js
var obj = {
  name: "obj"
};
console.log(obj.valueOf());//Object {name: "obj"}

var arr1 = [1];
console.log(arr1.valueOf());//[1]


var date = new Date();
console.log(date.valueOf());//1456638436303
如代码所示，三个不同的对象实例调用valueOf返回不同的数据
```

**原始值指的是['Null','Undefined','String','Boolean','Number']五种基本数据类型之一，一开始就提到过。**

举个简单的例子:
```js
var a={};
ToPrimitive(a)

分析:a是对象类型但不是Date实例对象,所以preferredType默认是Number,先调用a.valueOf()不是原始值,继续来调
用a.toString()得到string字符串,此时为原始值,返回之.所以最后ToPrimitive(a)得到就是"[object Object]".
```

如果觉得描述还不好明白,一大堆描述晦涩又难懂,我们用代码说话:
```js
const toPrimitive = (obj, preferredType='Number') => {
    let Utils = {
        typeOf: function(obj) {
            return Object.prototype.toString.call(obj).slice(8, -1);
        },
        isPrimitive: function(obj) {
            let types = ['Null', 'String', 'Boolean', 'Undefined', 'Number'];
            return types.indexOf(this.typeOf(obj)) !== -1;
        }
    };

    if (Utils.isPrimitive(obj)) {
        return obj;
    }

    preferredType = (preferredType === 'String' || Utils.typeOf(obj) === 'Date') ?
     'String' : 'Number';

    if (preferredType === 'Number') {
        if (Utils.isPrimitive(obj.valueOf())) {
            return obj.valueOf()
        };
        if (Utils.isPrimitive(obj.toString())) {
            return obj.toString()
        };
    } else {
        if (Utils.isPrimitive(obj.toString())) {
            return obj.toString()
        };
        if (Utils.isPrimitive(obj.valueOf())) {
            return obj.valueOf()
        };
    }
}

var a={};
ToPrimitive(a);//"[object Object]",与上面文字分析的一致
```

### 5.5 ToNumber(x)
这个就比ToPrimitive() 方法好理解多了，就是把其他类型按照一定的规则转化成数字类型，也就是类似Number()和parseInt()的方法。    
还是继续看看ECMAScipt规范中对于Number的转换 
是不是又看到 ToPrimitive() 方法了，是不是看了上面的就好理解多了，如果ToNumber(x)这个x是对象就要调用ToPrimitive方法返回x的原始值，是不是一下子就串起来了。

### 5.6 ToString(x)
对数值类型应用 ToString

ToString 运算符将数字 m 转换为字符串格式的给出如下所示：
1. 如果 m 是 NaN，返回字符串 "NaN"。
2. 如果 m 是 +0 或 -0，返回字符串 "0"。
3. 如果 m 小于零，返回连接 "-" 和 ToString (-m) 的字符串。
4. 如果 m 无限大，返回字符串 "Infinity"。
5. 否则，令 n, k, 和 s 是整数，使得 k ≥ 1, 10k-1 ≤ s < 10k，s × 10n-k 的数字值是 m，且 k 足够小。要注意的是，k 是 s 在十进制表示中的数字的个数。s 不被 10 整除，且s 的至少要求的有效数字位数不一定要被这些标准唯一确定。
6. 如果 k ≤ n ≤ 21，返回由 k 个 s 在十进制表示中的数字组成的字符串（有序的，开头没有零），后面跟随字符 '0' 的 n-k 次出现。
7. 如果 0 < n ≤ 21，返回由 s 在十进制表示中的、最多 n 个有效数字组成的字符串，后面跟随一个小数点 '. '，再后面是余下的 k-n 个 s 在十进制表示中的数字。
8. 如果 -6 < n ≤ 0，返回由字符 '0' 组成的字符串，后面跟随一个小数点 '. '，再后面是字符 '0' 的 -n 次出现，再往后是 k 个 s 在十进制表示中的数字。
9. 否则，如果 k = 1，返回由单个数字 s 组成的字符串，后面跟随小写字母 'e'，根据 n-1 是正或负，再后面是一个加号 '+' 或减号 '-' ，再往后是整数 abs(n-1) 的十进制表示（没有前置的零）。
10. 返回由 s 在十进制表示中的、最多的有效数字组成的字符串，后面跟随一个小数点 '. '，再后面是余下的是 k-1 个 s 在十进制表示中的数字，再往后是小写字母 'e'，根据n-1 是正或负，再后面是一个加号 '+ ' 或减号 '-' ，再往后是整数 abs(n-1) 的十进制表示（没有前置的零）。

### 5.7 ==转换规则：
1. undefined == null，结果是true。且它俩与所有其他值比较的结果都是false。
2. String == Boolean，需要两个操作数同时转为Number。
3. String/Boolean == Number，需要String/Boolean转为Number。
4. Object == Primitive，需要Object转为Primitive(具体通过valueOf和toString方法)。

    一共只有4条规则！很清晰、很简单。


## 六、验证分析++[[]][+[]]+[+[]]==10?
### 1.首先++[[]][+[]]+[+[]]首先拆分一下：
```js
(++[[]][+[]])
+
([+[]])
```

### 2.先来分析右边的[+[]]
①先看里面的+[]
* 根据 4.2 ECMAScript 一元运算符（+、-） 可以知道，一元运算符会调用 `ToNumber` 方法把 `ToNumber([])` 转化成数字。
* 根据 5.5 `ToNumber(x)` 的转换规则，x为[]是数组对象，因此会调用 `ToPrimitive` 方法。
* 根据 5.4 `ToPrimitive(input [ , PreferredType])` 的转换规则，空数组先调用 `valueOf()` 方法，得到`[]`不是原始值，继续调用 `toString()` 方法，得到 `""空字符串` 。
* 递归的调用之后成了 `ToNumber("")` ,答案显而易见，根据 5.5 `ToNumber(x)` 的转换规则对照图片可以看出`ToNumber("")===0`。 那么`[+[]]`就变相的成了`[0]` 。

**此时成了(++[[]][+[]])+[0]**

### 3.再来分析左边边的++[[]][+[]]
* `+[]`上面已经分析出来了，结果为0，那么此时就成了`++[[]][0]`
* 根据 4.2 ECMAScript 一元运算符（+、-） 可以知道，数组下标的优先级高于一元运算符++，那么理所当然成了这样 `++([[]][0])` ,而`[[]][0]`可以看出数组下标为0也就是第一个元素，此时为`[]`,那么最后成了`++[]`.
* `++[]`这是什么鬼ghost，根据 4.5 ECMAScript 前自增运算符（++） 没有发现任何有调用 `ToNumber` 的方法，浏览器试了一下，果然有问题，报错啦，到底哪里出问题了呢，为什么走着走着就走偏了。问题出在哪一步呢？

### 4.分析问题错误的原因
首先我们在浏览器输出一下++[]  
无意之中照着错误搜，搜到了这个后缀自增++：  

**Increment Operator_操作的第5步PutValue(expr, newValue)要求expr是引用。这就是问题的关键**

### 5.进一步拆分
`++[[]][0]`可以这么拆分，只要保持引用关系就行：
```js
var refence=[[]][0]；
++refence;
```

再来进一步拆分
```js
var refence=[];
refence=refence+1;
```

最后就成了
```js
refence=[]+1;
```
根据 4.3 ECMAScript 加法运算符（+） ，`[]+1`可以看成是`ToPrimitive([]）+ToPrimitive（1）`，根据 5.4 `ToPrimitive(input [ , PreferredType])` 的转换规则，空数组先调用` valueOf()` 方法，得到`[]`不是原始值，继续调用 `toString()` 方法，得到 `""` 空字符串。

于是就成了 `""+1` ，根据 4.3 ECMAScript 加法运算符（+） ，有一个字符串，另外一个也会变成字符串，所以`""+1==="1"`。所以 `++[[]][0] === "1"` ;