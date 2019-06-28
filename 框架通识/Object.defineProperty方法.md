Object.defineProperty方法
===

对象是由多个名/值对组成的无序的集合。对象中每个属性对应任意类型的值。

定义对象可以使用构造函数或字面量的形式：

    var obj = new Object;  //obj = {}
    obj.name = "张三";  //添加描述
    obj.say = function(){};  //添加行为

除了以上添加属性的方式，还可以使用Object.defineProperty定义新属性或修改原有的属性。

# Object.defineProperty()

语法：

    Object.defineProperty(obj, prop, descriptor)

参数说明：

* obj：必需。  目标对象
* prop：必需。  需定义或修改的属性的名字
* descriptor：必需。  目标属性所拥有的特性

返回值：

> 传入函数的对象。即第一个参数obj

针对属性，我们可以给这个属性设置一些特性，比如是否只读不可以写；是否可以被for..in或Object.keys()遍历。

给对象的属性添加特性描述，目前提供两种形式：数据描述和存取器描述。


|  | configurable | enumerable | value | writable | get | set |
| ------- | --------- | ---------- | ---------- | ---------- | ----------- | --------- |
| 数据描述符 | Yes | Yes | Yes | Yes | No | No |
| 存取描述符 | Yes | Yes | No | No | Yes | Yes |


## 数据描述

当修改或定义对象的某个属性的时候，给这个属性添加一些特性：

```js
var obj = {
    test:"hello"
}
//对象已有的属性添加特性描述
Object.defineProperty(obj,"test",{
    configurable:true | false,
    enumerable:true | false,
    value:任意类型的值,
    writable:true | false
});
//对象新添加的属性的特性描述
Object.defineProperty(obj,"newKey",{
    configurable:true | false,
    enumerable:true | false,
    value:任意类型的值,
    writable:true | false
});
```

数据描述中的属性都是可选的，来看一下设置每一个属性的作用。

* ### value

属性对应的值,可以使任意类型的值，默认为undefined

```js
var obj = {}
//第一种情况：不设置value属性
Object.defineProperty(obj,"newKey",{

});
console.log( obj.newKey );  //undefined
------------------------------
//第二种情况：设置value属性
Object.defineProperty(obj,"newKey",{
    value:"hello"
});
console.log( obj.newKey );  //hello
```

* ### writable

属性的值是否可以被重写。设置为true可以被重写；设置为false，不能被重写。默认为false。

```js
var obj = {}
//第一种情况：writable设置为false，不能重写。
Object.defineProperty(obj,"newKey",{
    value:"hello",
    writable:false
});
//更改newKey的值
obj.newKey = "change value";
console.log( obj.newKey );  //hello

//第二种情况：writable设置为true，可以重写
Object.defineProperty(obj,"newKey",{
    value:"hello",
    writable:true
});
//更改newKey的值
obj.newKey = "change value";
console.log( obj.newKey );  //change value
```

* ### enumerable

此属性是否可以被枚举（使用for...in或Object.keys()）。设置为true可以被枚举；设置为false，不能被枚举。默认为false。

```js
var obj = {}
//第一种情况：enumerable设置为false，不能被枚举。
Object.defineProperty(obj,"newKey",{
    value:"hello",
    writable:false,
    enumerable:false
});

//枚举对象的属性
for( var attr in obj ){
    console.log( attr );  
}
//第二种情况：enumerable设置为true，可以被枚举。
Object.defineProperty(obj,"newKey",{
    value:"hello",
    writable:false,
    enumerable:true
});

//枚举对象的属性
for( var attr in obj ){
    console.log( attr );  //newKey
}
```

* ### configurable

是否可以删除目标属性或是否可以再次修改属性的特性（writable, configurable, enumerable）。

设置为true可以被删除或可以重新设置特性；设置为false，不能被可以被删除或不可以重新设置特性。默认为false。

configurable特性表示对象的属性是否可以被删除，以及除writable特性外的其他特性是否可以被修改。


这个属性起到两个作用：
    1. 目标属性是否可以使用delete删除
    2. 目标属性是否可以再次设置特性

```js
//-----------------测试目标属性是否能被删除------------------------
var obj = {}
//第一种情况：configurable设置为false，不能被删除。
Object.defineProperty(obj,"newKey",{
    value:"hello",
    writable:false,
    enumerable:false,
    configurable:false
});
//删除属性
delete obj.newKey;
console.log( obj.newKey ); //hello

//第二种情况：configurable设置为true，可以被删除。
Object.defineProperty(obj,"newKey",{
    value:"hello",
    writable:false,
    enumerable:false,
    configurable:true
});
//删除属性
delete obj.newKey;
console.log( obj.newKey ); //undefined

//-----------------测试是否可以再次修改特性------------------------
var obj = {}
//第一种情况：configurable设置为false，不能再次修改特性。
Object.defineProperty(obj,"newKey",{
    value:"hello",
    writable:false,
    enumerable:false,
    configurable:false
});

//重新修改特性
Object.defineProperty(obj,"newKey",{
    value:"hello",
    writable:true,
    enumerable:true,
    configurable:true
});
console.log( obj.newKey ); //报错：Uncaught TypeError: Cannot redefine property: newKey

//第二种情况：configurable设置为true，可以再次修改特性。
Object.defineProperty(obj,"newKey",{
    value:"hello",
    writable:false,
    enumerable:false,
    configurable:true
});

//重新修改特性
Object.defineProperty(obj,"newKey",{
    value:"hello",
    writable:true,
    enumerable:true,
    configurable:true
});
console.log( obj.newKey ); //hello

```

除了可以给新定义的属性设置特性，也可以给已有的属性设置特性

```js
//定义对象的时候添加的属性，是可删除、可重写、可枚举的。
var obj = {
    test:"hello"
}

//改写值
obj.test = 'change value';

console.log( obj.test ); //'change value'

Object.defineProperty(obj,"test",{
    writable:false
})


//再次改写值
obj.test = 'change value again';

console.log( obj.test ); //依然是：'change value'

```

提示：一旦使用Object.defineProperty给对象添加属性，那么如果不设置属性的特性，那么configurable、enumerable、writable这些值都为默认的false

```js
var obj = {};
//定义的新属性后，这个属性的特性中configurable，enumerable，writable都为默认的值false
//这就导致了neykey这个是不能重写、不能枚举、不能再次设置特性
//
Object.defineProperty(obj,'newKey',{

});

//设置值
obj.newKey = 'hello';
console.log(obj.newKey);  //undefined

//枚举
for( var attr in obj ){
    console.log(attr);
}
```

#### configurable和writable

当configurable为false时，我们唯一仍能改变的属性就是将设置为true的writable设置为false。对此译者进行了以下测试（以下代码在Chrome和IE下运行论证，输出结果相同）：

```js
var a={};
Object.defineProperty(a,"o",{
    configurable:false,
    value:10,
    writable:true
});

console.log(a.o);//10
a.o=12;//不报错
console.log(a.o);//12

Object.defineProperty(a,"o",{
    configurable:false,
    value:14,
    writable:true
});
console.log(a.o);//14

Object.defineProperty(a,"o",{
    configurable:false,
    value:14,
    writable:false
});
a.o=16;//不报错
console.log(a.o);//14

//报错
Object.defineProperty(a,"o",{
    configurable:false,
    value:16,
    writable:false
});
```

设置的特性总结：
1. value: 设置属性的值
2. writable: 值是否可以重写。true | false
3. enumerable: 目标属性是否可以被枚举。true | false
4. configurable: 目标属性是否可以被删除或是否可以再次修改特性 true | false



## 存取器描述

当使用存取器描述属性的特性的时候，允许设置以下特性属性：

```js
var obj = {};
Object.defineProperty(obj,"newKey",{
    get:function (){} | undefined,
    set:function (value){} | undefined
    configurable: true | false
    enumerable: true | false
});
```

#### 注意：当使用了getter或setter方法，不允许使用writable和value这两个属性

### getter/setter

当设置或获取对象的某个属性的值的时候，可以提供getter/setter方法。

* getter 是一种获得属性值的方法
* setter是一种设置属性值的方法。

在特性中使用get/set属性来定义对应的方法。

```js
var obj = {};
var initValue = 'hello';
Object.defineProperty(obj,"newKey",{
    get:function (){
        //当获取值的时候触发的函数
        return initValue;    
    },
    set:function (value){
        //当设置值的时候触发的函数,设置的新值通过参数value拿到
        initValue = value;
    }
});
//获取值
console.log( obj.newKey );  //hello

//设置值
obj.newKey = 'change value';

console.log( obj.newKey ); //change value
```

> 注意：get或set不是必须成对出现，任写其一就可以。如果不设置方法，则get和set的默认值为undefined

> configurable和enumerable同上面的用法。

-------------

#### 一般的 Setters 和 Getters

为了保证这些描述符属性被填充为默认值，你可能会使用形如预先冻结Object.prototype、明确设置每个描述符属性的值、使用Object.create(null)来获取空对象等方式。

```js
// using __proto__
var obj = {};
var descriptor = Object.create(null); // no inherited properties

//所有描述符的属性被设置为默认值
descriptor.value = 'static';
Object.defineProperty(obj, 'key', descriptor);

//明确设置每个描述符的属性
Object.defineProperty(obj, 'key', {
  enumerable: false,
  configurable: false,
  writable: false,
  value: 'static'
});

//重用同一个对象作为描述符
function withValue(value) {
  var d = withValue.d || (
    withValue.d = {
      enumerable: false,
      writable: false,
      configurable: false,
      value: null
    }
  );
  d.value = value;
  return d;
}
Object.defineProperty(obj, 'key', withValue('static'));

//如果Object.freeze方法可用，则使用它来防止对对象属性的修改 
(Object.freeze || Object)(Object.prototype);
```

下面的例子展示了如何实现一个自存档对象。 当设置temperature 属性时，archive 数组会获取日志条目。

```js
function Archiver() {
  var temperature = null;
  var archive = [];

  Object.defineProperty(this, 'temperature', {
    get: function() {
      console.log('get!');
      return temperature;
    },
    set: function(value) {
      temperature = value;
      archive.push({ val: temperature });
    }
  });

  this.getArchive = function() { return archive; };
}

var arc = new Archiver();
arc.temperature; // 'get!'
arc.temperature = 11;
arc.temperature = 13;
arc.getArchive(); // [{ val: 11 }, { val: 13 }]
```

或

```js
var pattern = {
    get: function () {
        return 'I alway return this string,whatever you have assigned';
    },
    set: function () {
        this.myname = 'this is my name string';
    }
};


function TestDefineSetAndGet() {
    Object.defineProperty(this, 'myproperty', pattern);
}


var instance = new TestDefineSetAndGet();
instance.myproperty = 'test';

// 'I alway return this string,whatever you have assigned'
console.log(instance.myproperty);
// 'this is my name string'
console.log(instance.myname); // 继承属性
```

#### 继承属性
如果访问者的属性是被继承的，它的 get 和set 方法会在子对象的属性被访问或者修改时被调用。

如果这些方法用一个变量存值，该值会被所有对象共享。

```js
function myclass() {
}

var value;
Object.defineProperty(myclass.prototype, "x", {
  get() {
    return value;
  },
  set(x) {
    value = x;
  }
});

var a = new myclass();
var b = new myclass();
a.x = 1;
console.log(b.x); // 1
```

这可以通过将值存储在另一个属性中固定。在 get 和 set 方法中，this 指向某个被访问和修改属性的对象。

```js
function myclass() {
}

Object.defineProperty(myclass.prototype, "x", {
  get() {
    return this.stored_x;
  },
  set(x) {
    this.stored_x = x;
  }
});

var a = new myclass();
var b = new myclass();
a.x = 1;
console.log(b.x); // undefined
```

不像访问者属性，值属性始终在对象自身上设置，而不是一个原型。

然而，如果一个不可写的属性被继承，它仍然可以防止修改对象的属性。

```js
function myclass() {
}

myclass.prototype.x = 1;
Object.defineProperty(myclass.prototype, "y", {
  writable: false,
  value: 1
});

var a = new myclass();
a.x = 2;
console.log(a.x); // 2
console.log(myclass.prototype.x); // 1
a.y = 2; // Ignored, throws in strict mode
console.log(a.y); // 1
console.log(myclass.prototype.y); // 1
```