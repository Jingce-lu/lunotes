js基础
====
<!-- TOC -->

- [js基础](#js基础)
  - [自定义模块](#自定义模块)
  - [随机生成颜色](#随机生成颜色)
  - [利用 Object.defineProperty 侦测对象的变化，最简单的可以写出这样的代码](#利用-ObjectdefineProperty-侦测对象的变化最简单的可以写出这样的代码)
  - [JS中的可枚举属性与不可枚举属性以及扩展](#JS中的可枚举属性与不可枚举属性以及扩展)

<!-- /TOC -->
## 自定义模块
```javascript
(function(module){
	module.exports = function (a, b){
		return a + b;
	}

	if ('undefined' != typeof window){
		window.add = module.exports;
	}

})('undefined' == typeof module ? { module: { exports: {} } } : module);
```

## 随机生成颜色
```javascript
function getRandomColor(){
	let rgb = [];:
	for (let i = 0; i<3; i++){
		let color = Math.floor(Math.random()*256).toString(16);
		color = color.lenth == 1 ? '0' + color : color;
		rgb.push(color)
	}
	return '#' + rgb.join('');
}
```

## 利用 Object.defineProperty 侦测对象的变化，最简单的可以写出这样的代码
```javascript
function defineReactive (data, key, val) {
    Object.defineProperty(data, key, {
        enumerable: true,
        configurable: true,
        get: function () {
            return val
        },
        set: function (newVal) {
            if(val === newVal){
                return
            }
            val = newVal
        }
    })
}
```

## JS中的可枚举属性与不可枚举属性以及扩展
属性的枚举性会影响以下三个函数的结果：
- for…in
- Object.keys()
- JSON.stringify

先看一个例子，按如下方法创建kxy对象：
```js
function Person() {
    this.name = "KXY";
}
Person.prototype = {
    constructor: Person,
    job: "student",
};

var kxy = new Person();
Object.defineProperty(kxy, "sex", {
    value: "female",
    enumerable: false
});
```

其中用defineProperty为对象定义了一个名为”sex”的不可枚举属性

接下来做以下验证：
```javascript
for(var pro in kxy) {
    console.log("kxy." + pro + " = " + kxy[pro]);
}

// 结果：
// kxy.name = KXY
// kxy.constructor = function Person() {
//    this.name = "KXY";
// }
// kxy.job = student

console.log(Object.keys(kxy));
// 返回结果：["name"]
// 只包含”name”属性，说明该方法只能返回对象本身具有的可枚举属性。


console.log(JSON.stringify(kxy));
// 返回结果：{"name":"KXY"}
// 此方法也只能读取对象本身的可枚举属性，并序列化为JSON字符串（通过typeof JSON.stringify(kxy)得到string类型）。
```

```javascript
function Person(){  
    this.name = 'kong';  
}  
Person.prototype = {  
    age : 18,  
    job : 'student'  
}  
var a = new Person();  
Object.defineProperty(a, 'sex', {  
    value : 'men',  
    enumerable : false      //定义该属性不可枚举  
})  

//for in  
for(var k in a){  
    console.log(k);  
}  
//name age job  

//Object.keys()  
console.log(Object.keys(a));  
//['name']  

//JSON.stringify()  
console.log(JSON.stringify(a));  
//{'name' : 'kong'}  

//propertyIsEnumerable方法判断该属性是否可枚举  
console.log(a.propertyIsEnumerable('name'));    //true  
console.log(a.propertyIsEnumerable('age'));     //false  
console.log(a.propertyIsEnumerable('sex'));     //false  
```

```javascript
for (prop in obj) {
    if (!obj.hasOwnProperty(prop)) continue; // 跳过继承属性
}
```

如此一来，可以这样来使用 for...in 循环遍历对象属性：
```js
(function () {
    var getEnumPropertyNames = function (obj) {
        if (typeof obj !== 'object') throw TypeError(); // 参数必须是对象
        var props = []; // 将要返回的数组
        for (var prop in obj) { // 遍历所有可枚举的属性
            if (obj.hasOwnProperty(prop)) { //判断是否是自有属性
                props.push(prop); //将属性名添加到数组中
            }
        }
        return props; //返回这个数组
    }

    // 实例化
    var obj = {
       'x': 1,
       'y':2
    }
    obj.propertyIsEnumerable('toString')
    var propertys = getEnumPropertyNames(obj);
    console.log(propertys.length);       //2
    console.log(propertys.join(","));   //x,y
})()
```