# js 无限分类递归树

1. ### js数据集生成tree

```js
var data = [
    { id: 1,  name: "一级分类：1", pid: 0, },
    { id: 2,  name: "二级分类：1", pid: 1, },
    { id: 3,  name: "三级分类：3", pid: 2, },
    { id: 4,  name: "一级分类：2", pid: 0, },
    { id: 7,  name: "f级分类：2",  pid: 4, },
    { id: 10, name: "f级分类：2",  pid: 7, },
    { id: 9,  name: "f级分类：2",  pid: 10, },
    { id: 12, name: "f级分类：2",  pid: 9, },
    { id: 15, name: "f级分类：2",  pid: 12, },
    { id: 13, name: "f级分类：2",  pid: 15, },
];


function toTree(data) {
    // 删除 所有 children,以防止多次调用
    data.forEach(function (item) {
        delete item.children;
    });

    // 将数据存储为 以 id 为 KEY 的 map 索引数据列
    var map = {};
    data.forEach(function (item) {
        map[item.id] = item;
    });
//    console.log(map);

    var val = [];
    data.forEach(function (item) {

        // 以当前遍历项，的pid,去map对象中找到索引的id
        var parent = map[item.pid];

        // 好绕啊，如果找到索引，那么说明此项不在顶级当中,那么需要把此项添加到，他对应的父级中
        if (parent) {

            (parent.children || ( parent.children = [] )).push(item);

        } else {
            //如果没有在map中找到对应的索引ID,那么直接把 当前的item添加到 val结果集中，作为顶级
            val.push(item);
        }
    });

    return val;
}

console.log(toTree(data))
```

2. ### js 对象数组 根据某个共同字段 分组

```js
var arr = [
    {"id":"1001", "name":"值1", "value":"111" },
    {"id":"1001", "name":"值1", "value":"11111"},
    {"id":"1002", "name":"值2", "value":"25462"},
    {"id":"1002", "name":"值2", "value":"23131"},
    {"id":"1002", "name":"值2", "value":"2315432"},
    {"id":"1003", "name":"值3", "value":"333333"}
];

var getTree = arr => {
    let map = {},  result = [];

    for(let i = 0; i < arr.length; i++){
        if(!map[arr[i].id]){
            result.push({
                id: arr[i].id,
                name: arr[i].name,
                children: [arr[i]]
            });
            map[arr[i].id] = arr[i];
        }else{
            for(let j = 0; j < result.length; j++){
                let dj = result[j];
                if(dj.id == arr[i].id){
                    dj.children.push(arr[i]);
                    break;
                }
            }
        }
    }

    return result;
}

 
console.log(getTree(arr));
```

3. ### work instance

```js
const { groupids } = this.props.orgDepartment;
const provinceOptions = [], cityData = [], cityOptions = [];
const getStationCities = arr => {
    let obj = {}, result = [];
    for(let i = 0, len = arr.length; i < len; i++) {
        if(!obj[arr[i].province.key]){
            result.push({
                province: arr[i].province,
                type: arr[i].type,
                provinceCode: arr[i].province.key,
                provinceName: arr[i].province.val,
                children: [arr[i]]
            });
            obj[arr[i].province.key] = arr[i];
        }else{
            for (let j = 0; j < arr.length; j++) {
                if(result[j].province.key == arr[i].province.key){
                    result[j].children.push(arr[i])
                    break;
                }
            }
        }
    }
    return result;
}
let stationCities = getStationCities(groupids);
```