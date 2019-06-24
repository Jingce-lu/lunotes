React 基础
====

## reactjs 获取真实dom，并获取dom css 三种方法

方法1：
```javascript
let senderName = ReactDOM.findDOMNode(this.refs['sender-name']);
let nleft = senderName.style.left;
let ntop = senderName.style.top;
let nwidth = senderName.style.width;
let nheight = senderName.style.height;
console.log(nleft,ntop,nwidth,nheight);
```

方法2：
```javascript
let rstyle = this.refs['sender-name'].style;
let rleft = rstyle.left;
let rtop = rstyle.top;
let rwidth = rstyle.width;
let rheight = rstyle.height;
console.log(rleft,rtop,rwidth,rheight);
```

方法3：
```javascript
let computedStyle=document.defaultView.getComputedStyle(ReactDOM.findDOMNode(this.refs['sender-name']),null);
let cleft = computedStyle.left;
let ctop = computedStyle.top;
console.log(cleft,ctop);
```










