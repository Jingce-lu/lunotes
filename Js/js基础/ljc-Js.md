```js
/**
 * 作者：路小二
 * 开发日期：2016/12/25
 * 描述：通用框架
 */

//定义一个对象 - 名字是$
var $$ = function() {};
//第二种写法
$$.prototype = {
    $id: function(id) {
        return document.getElementById(id);
    },
    //去除左边空格
    ltrim: function(str) {
        return str.replace(/(^\s*)/g, "");
    },
    //去除右边空格
    rtrim: function(str) {
        return str.replace(/(\s*$)/g, "");
    },
    //去除空格
    trim: function(str) {
        return str.replace(/(^\s*)|(\s*$)/g, "");
    },
    //ajax 
    myAjax: function(URL, fn) {
        var xhr = createXHR(); //返回了一个对象，这个对象IE6兼容。
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                if (
                    (xhr.status >= 200 && xhr.status < 300) ||
                    xhr.status == 304
                ) {
                    fn(xhr.responseText);
                } else {
                    alert("错误的文件！");
                }
            }
        };
        xhr.open("get", URL, true);
        xhr.send();

        //闭包形式，因为这个函数只服务于ajax函数，所以放在里面
        function createXHR() {
            //本函数来自于《JavaScript高级程序设计 第3版》第21章
            if (typeof XMLHttpRequest != "undefined") {
                return new XMLHttpRequest();
            } else if (typeof ActiveXObject != "undefined") {
                if (typeof arguments.callee.activeXString != "string") {
                    var versions = [
                            "MSXML2.XMLHttp.6.0",
                            "MSXML2.XMLHttp.3.0",
                            "MSXML2.XMLHttp"
                        ],
                        i,
                        len;

                    for (i = 0, len = versions.length; i < len; i++) {
                        try {
                            new ActiveXObject(versions[i]);
                            arguments.callee.activeXString = versions[i];
                            break;
                        } catch (ex) {
                            //skip
                        }
                    }
                }

                return new ActiveXObject(arguments.callee.activeXString);
            } else {
                throw new Error("No XHR object available.");
            }
        }
    },
    //tab
    tab: function(id) {
        //如何获取某个父元素下面的子元素
        var box = document.getElementById(id);
        var spans = box.getElementsByTagName("span");
        var lis = box.getElementsByTagName("li");

        //两步走
        //第一步: 先把上半部分实现
        //群体绑定事件  -- 对所有的span绑定事件
        //群体绑定事件
        for (var i = 0; i < spans.length; i++) {
            //相亲法则  -- 给男一号一个代号  --  怎么给 -- 自定义属性
            spans[i].index = i;
            spans[i].onmouseover = function() {
                //排他思想 --  将所有的span置为默认状态  --- 然后再将当前鼠标移上的span置为class -- select
                for (var i = 0; i < spans.length; i++) {
                    spans[i].className = "";
                    lis[i].className = "";
                }
                this.className = "select";
                lis[this.index].className = "select";
            };
        }
    },
    //简单的数据绑定formateString
    formateString: function(str, data) {
        return str.replace(/@\((\w+)\)/g, function(match, key) {
            return typeof data[key] === "undefined" ? "" : data[key];
        });
    },
    //给一个对象扩充功能
    extendMany: function() {
        var key,
            i = 0,
            len = arguments.length,
            target = null,
            copy;
        if (len === 0) {
            return;
        } else if (len === 1) {
            target = this;
        } else {
            i++;
            target = arguments[0];
        }
        for (; i < len; i++) {
            for (key in arguments[i]) {
                copy = arguments[i][key];
                target[key] = copy;
            }
        }
        return target;
    },
    extend: function(tar, source) {
        //遍历对象
        for (var i in source) {
            tar[i] = source[i];
        }
        return tar;
    },
    //随机数
    random: function(begin, end) {
        return Math.floor(Math.random() * (end - begin)) + begin;
    },
    //访问css属性
    getStyle: function(obj, attr) {
        if (obj.currentStyle) {
            // ie 等
            return obj.currentStyle[attr]; // 返回传递过来的某个属性
        } else {
            return window.getComputedStyle(obj, null)[attr]; // w3c 浏览器
        }
    },
    //scroll函数
    scroll: function() {
        if (window.pageYOffset != null) {
            //  ie9+ 和其他浏览器
            return {
                left: window.pageXOffset,
                top: window.pageYOffset
            };
        } else if (document.compatMode == "CSS1Compat") {
            // 声明的了 DTD
            // 检测是不是怪异模式的浏览器 -- 就是没有 声明<!DOCTYPE html>
            return {
                left: document.documentElement.scrollLeft,
                top: document.documentElement.scrollTop
            };
        }
        return {
            //  剩下的肯定是怪异模式的
            left: document.body.scrollLeft,
            top: document.body.scrollTop
        };
    },
    //封装可视区域大小
    client: function() {
        if (window.innerWidth != null) {
            // ie9 +  最新浏览器
            return {
                width: window.innerWidth,
                height: window.innerHeight
            };
        } else if (document.compatMode === "CSS1Compat") {
            // 标准浏览器
            return {
                width: document.documentElement.clientWidth,
                height: document.documentElement.clientHeight
            };
        }
        return {
            // 怪异浏览器
            width: document.body.clientWidth,
            height: document.body.clientHeight
        };
    },
    // 多个属性运动框架  添加回调函数
    animate: function(obj, json, fn) {
        // 给谁    json
        clearInterval(obj.timer);
        obj.timer = setInterval(function() {
            var flag = true; // 用来判断是否停止定时器   一定写到遍历的外面
            for (var attr in json) {
                // attr  属性     json[attr]  值
                //开始遍历 json
                // 计算步长    用 target 位置 减去当前的位置  除以 10
                // console.log(attr);
                var current = 0;
                if (attr == "opacity") {
                    current =
                        Math.round(parseInt(getStyle(obj, attr) * 100)) || 0;
                    console.log(current);
                } else {
                    current = parseInt(getStyle(obj, attr)); // 数值
                }
                // console.log(current);
                // 目标位置就是  属性值
                var step = (json[attr] - current) / 10; // 步长  用目标位置 - 现在的位置 / 10
                step = step > 0 ? Math.ceil(step) : Math.floor(step);
                //判断透明度
                if (attr == "opacity") {
                    // 判断用户有没有输入 opacity
                    if ("opacity" in obj.style) {
                        // 判断 我们浏览器是否支持opacity
                        // obj.style.opacity
                        obj.style.opacity = (current + step) / 100;
                    } else {
                        // obj.style.filter = alpha(opacity = 30)
                        obj.style.filter =
                            "alpha(opacity = " + (current + step) * 10 + ")";
                    }
                } else if (attr == "zIndex") {
                    obj.style.zIndex = json[attr];
                } else {
                    obj.style[attr] = current + step + "px";
                }

                if (current != json[attr]) {
                    // 只要其中一个不满足条件 就不应该停止定时器  这句一定遍历里面
                    flag = false;
                }
            }
            if (flag) {
                // 用于判断定时器的条件
                clearInterval(obj.timer);
                //alert("ok了");
                if (fn) {
                    // 很简单   当定时器停止了。 动画就结束了  如果有回调，就应该执行回调
                    fn(); // 函数名 +  （）  调用函数  执行函数 暂且这样替代
                }
            }
        }, 30);
    }
};
//在框架中实例化，这样外面使用的使用就不用实例化了
$$ = new $$();
```
