移动web
====

### 改变meta视口标签
```javascript
	var meta = document.getElemmentsByTagName('meta'[0])；
	meta.setAttribute('content', 'width=device-width, initial-scale=1')
```

### 分辨率
```js
window.devicePixeRatio
```

### 屏幕方向
```js
window.orientation
```

### css  
background-attachment: scroll || fixed || local
- scroll: 默认值 背景图随页面一起滚动
- fixed:  背景图相对于视口固定不动
- local: 背景图随元素一起滚动  

vh 和 vW尺寸单位代表视口的百分比， 比如 50vw表示50%的视口宽度


### 触摸事件   
- touchstart -- 在用户的手指触摸屏幕的瞬间触发  
- touchmove  -- 在用户移动手指的过程中连续触发  
- touchend   -- 在用户的手指离开屏幕的瞬间触发  

touchstart、touchmove、touchend  
pointerdown、pointermove、 pointerup事件在同一时刻触发  

```javascript
//获取兼容浏览器事件坐标的函数
function findCoordinates(e){
	//如果需要，用PageX/Y代替clientX/Y
	var x, y;
	if(e.changedTouches){	//touch事件
		x = e.changedTouches[0].clentX;
		y = e.changedTouches[0].clentY;
	}else{	//pointer或mouse事件
		x = e.clientX;
		y = e.clientY;
	}
	return [x, y];
}
```