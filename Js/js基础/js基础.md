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