js基础
====

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