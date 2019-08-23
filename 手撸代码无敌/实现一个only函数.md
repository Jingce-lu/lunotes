实现一个only函数
===

```js
var obj = {
    name: 'tobi',
    last: 'holowaychuk',
    email: 'tobi@learnboost.com',
    _id: '12345'
};

const only = (obj, para) => {
    if (!obj || !para) { new Error('please check your args!') }
    let newObj = {};
    let newArr = Array.isArray(para) ? para : typeof (para) === 'string' ? para.split(/ +/) : [];
    newArr.forEach((item) => {
        if (item && obj[item] && !newObj[item]) {
            newObj[item] = obj[item];
        }
    })
    return newObj;
}
// {email: "tobi@learnboost.com", last: "holowaychuk", name: "tobi"}
console.log(only(obj, ['name', 'last', 'email']));
// {name: "tobi", last: "holowaychuk", email: "tobi@learnboost.com"}


console.log(only(obj, 'name last    email'));
// {name: "tobi", last: "holowaychuk", email: "tobi@learnboost.com"}
```