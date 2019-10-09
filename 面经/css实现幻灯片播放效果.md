css实现幻灯片播放效果
===
<!-- TOC -->

- [方法1：定位。通过position属性改变left值](#方法1定位通过position属性改变left值)
- [方法2:2D转换。通过transfrom属性](#方法22d转换通过transfrom属性)

<!-- /TOC -->

用两种方法实现css花灯片效果。

## 方法1：定位。通过position属性改变left值

html代码：
```html
<section id=box>
  <ul>
    <li>1</li>
    <li>2</li>
    <li>3</li>
    <li>4</li>
    <li>1</li>
  </ul>
</section>
```

css代码：
```html
<style>
    * {
      margin: 0;
      padding: 0;
      font-family: 微软雅黑;
      list-style: none;
    }
    #box{
        width:400px;
        height:200px;
        border: 1px solid #000;
        margin: 50px auto;
        position:relative;
        overflow: hidden;
    }
    ul{
        width: 2000px;
        position: absolute;
        top:0;
        left:0;
      animation: dh 10s infinite ease;
    }
    ul li{
      width:400px;
      height:200px;
      float: left;

    }
    ul li:nth-child(1){
      background:#4b86db;
    }
    ul li:nth-child(2){
      background:#ff9999;
    }
    ul li:nth-child(3){
      background:olivedrab;
    }
    ul li:nth-child(4){
      background:skyblue;
    }
    ul li:nth-child(5){
      background:#4b86db;
    }
        @keyframes dh {
          0%{
            left:0px;
      }
          25%{
            left:-400px;
          }
          50%{
            left:-800px;
          }
          75%{
            left:-1200px;
          }
          100%{
            left:-1600px;
          }
    }
</style>
```

## 方法2:2D转换。通过transfrom属性

html代码：
```html
<section id=box>
  <ul>
    <li>1</li>
    <li>2</li>
    <li>3</li>
    <li>4</li>
    <li>1</li>
  </ul>
</section>
```

css代码：
```html
<style>
    * {
      margin: 0;
      padding: 0;
      font-family: 微软雅黑;
      list-style: none;
    }
    #box{
        width:400px;
        height:200px;
        border: 1px solid #000;
        margin: 50px auto;
        overflow: hidden;
    }
    ul{
      width: 2000px;
      animation: dh 10s infinite ease;
    }
    ul li{
      width:400px;
      height:200px;
      float: left;

    }
    ul li:nth-child(1){
      background:#4b86db;
    }
    ul li:nth-child(2){
      background:#ff9999;
    }
    ul li:nth-child(3){
      background:olivedrab;
    }
    ul li:nth-child(4){
      background:skyblue;
    }
    ul li:nth-child(5){
      background:#4b86db;
    }
 
@keyframes dh {
      0%{transform: translateX(0)}
      25%{transform: translateX(-400px)}
      50%{transform: translateX(-800px)}
      75%{transform: translateX(-1200px)}
      100%{transform: translateX(-1600px)}
}
</style>
```

