# 实现一个JSON.stringify()

```js
function jsonstringify(obj){
　　let type = typeof obj;
　　if(type !== 'object'){
　　　　if(/string|undefined|function/.test(type)){
　　　　　　obj = '"' + obj +'"'
　　　　}
　　　　return String(obj)
　　}else{
　　　　let arr = Array.isArray(obj);
　　　　let json =[];

　　　　for(let i in obj){
　　　　　　let j = obj[i];
　　　　　　let type = typeof j
　　　　　　if(/string|undefined|function/.test(type)){
　　　　　　　　j = '"' + j +'"'
　　　　　　}else if(type == 'object'){
　　　　　　　　j = jsonstringify(j)
　　　　　　}
　　　　　　json.push((arr ? "" : '"' + i + '":') + String(j));
　　　　}
　　　　return (arr ? "[" : "{") + String(json) + (arr ? "]" : "}")
　　}
}

jsonstringify({x:1})  //"{"x":1}"
jsonstringify({x:undefined})  //"{"x":"undefined"}"
jsonstringify([false,'false','true',true,12])  //"[false,"false","true",true,12]"
```