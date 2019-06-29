# React实现Toast（提示）效果
<!-- TOC -->

- [React实现Toast（提示）效果](#React实现Toast提示效果)
  - [效果图](#效果图)
  - [需求](#需求)
  - [使用方法](#使用方法)
  - [组件分析](#组件分析)
  - [Notification开发](#Notification开发)
  - [Notice开发](#Notice开发)
  - [Toast封装](#Toast封装)
  - [总结](#总结)
  - [参考链接](#参考链接)

<!-- /TOC -->

## 效果图
<div align="center"><img src="../../resource/assets/react/041801.gif" /></div>

## 需求
项目中需要实现app中常见的提示效果Toast。这个效果看似简单，实现起来没有那么容易。  
首先Toast的使用方法必须十分简单，简单到一行代码搞定：
```js
Toast.info('普通的Toast我普通的摇！！', 3000);
```

随时用随时调用上述方法即可。
再有一点，Toast不用插入到页面中，他不会向其他组件一样一直出现在DOM中。
只有在调用该方法的时候，动态插入到DOM中。
还有，页面可以存在多个提示，多个提示单独存在，互不影响。
所以，实现Toast并不像其他组件那么普通。

## 使用方法
这次先来看看效果图中的使用代码：
```js
import React from 'react'
import ListTitle from '../../components/DataDisplay/ListTitle'
import Button from '../../components/DataEntry/Button'
import Toast from '../../components/Feedback/Toast'
import Tools from '../../components/Tools/Tools'

const ToastPage = () => {
    const commonInfo = () => {
        Toast.info('普通的Toast我普通的摇！！', 3000);
    };
    const commonSuccess = () => {
        Toast.success('操作成功', 3000, 'fa-check');
    };
    const commonError = () => {
        Toast.error('有错误！！', 3000, undefined, false, ()=>{console.log("callback");});
    };
    const commonToast = () => {
        Toast.info('欢迎来到本直播间', 3000, undefined, false);
    };
    const successToast = () => {
        Toast.success('操作成功！', 3000, 'fa-check', false);
    };
    const errorToast = () => {
        Toast.error('操作失败！', 3000, 'fa-times', false);
    };
    const warningToast = () => {
        Toast.warning('警告：手机2s后爆炸', 3000, 'fa-exclamation-triangle', false);
    };
    const loadingToast = () => {
        Toast.show('加载中...', 0, 'fa-circle-o-notch fa-spin', false);
        const timer = setTimeout(()=>{
            Toast.hide();
            clearTimeout(timer);
        }, 3000);
    };

    return (
        <div className="page toast">
            <h1 className="title">
                <i className="fa fa-home" onClick={()=>{Tools.linkTo("/index")}}></i>
                Toast
            </h1>

            <ListTitle title="基本" />
            <div className="button-box">
                <Button onClick={commonInfo}>纯文字提示</Button>
                <Button onClick={commonSuccess}>icon成功提示有蒙版</Button>
                <Button onClick={commonError}>纯文字报错提示有回调</Button>
            </div>
            <ListTitle title="场景使用" />
            <div className="button-box">
                <Button type="primary" onClick={commonToast}>普通提示</Button>
                <Button type="primary" onClick={successToast}>成功提示</Button>
                <Button type="primary" onClick={errorToast}>失败提示</Button>
                <Button type="primary" onClick={warningToast}>警告</Button>
                <Button type="primary" onClick={loadingToast}>加载中</Button>
            </div>
        </div>
    )
};

export default ToastPage
```

可以看到在ToastPage中，render return出来的DOM中没有<Toast/>。
只是在点击Button的回调中直接调用的Toast。
按理说，组件都应该在render时候return出来，Toast是怎么实现在React中动态添加删除DOM的。

## 组件分析
首先多个提示可以堆叠，不同提示定制化也不同，很显然是个组件，起名为Notice。
然后Notice外面还有个容器组件，用来装载Notice并且，暴露一些方法给Toast，起名Notification。
最后就是Toast组件，负责直接生成不同的Notice，或者销毁Notification。但是其实Toast只是个对象，而不是真正意义的组件。
所以简单的Toast其实是也是分成三部分来完成。
Toast -> Notification -> Notice * n;
接下来就是逐个开发。

## Notification开发
为什么要先开发Notification，因为他特别重要，起到承上启下的作用。
首先，Notification是个容器，他自己有state，state中的notices数组就是存放生成Notice关键的数据notice（每个Notice都是不同的，所以notice中比如有一个属性：key）。
然后render的时候，循环notices生成一段DOM节点，放到自己的div中。
同时，其还提供一个向notices中添加notice的方法（add）和根据key，在notices中删除notice的方法（remove）。
最后关键的地方，定义一个reRwrite方法，该方法接受一些参数，动态的向DOM中插入一个div，然后再向这个div中插入Notification，最后返回一个含有几个操作这个Notification的方法的对象。（这就是动态实现插入DOM的关键）
Notification的代码：
```js
// Notification是Notice父组件，容器
// 是动态插入和删除DOM节点的核心
// 同时也向上暴露给Toast重写改变自己的方法
import React from 'react'
import ReactDOM from 'react-dom'
import Notice from './Notice'

class Notification extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            notices: [], // 存储当前有的notices
            hasMask: true, // 是否显示蒙版
        }
    }
    add (notice) {
        // 添加notice
        // 创造一个不重复的key
        const {notices} = this.state;
        const key = notice.key ? notice.key : notice.key = getUuid();
        const mask = notice.mask ? notice.mask : false;
        const temp = notices.filter((item) => item.key === key).length;

        if(!temp){
            // 不存在重复的 添加
            notices.push(notice);
            this.setState({
                notices: notices,
                hasMask: mask
            });
        }
    }
    remove (key) {
        // 根据key删除对应
        this.setState(previousState => {
            return {
                notices: previousState.notices.filter(notice => notice.key !== key),
            };
        });
    }
    getNoticeDOM () {
        const _this = this;
        const {notices} = this.state;
        let result = [];

        notices.map((notice)=>{
            // 每个Notice onClose的时候 删除掉notices中对应key的notice
            const closeCallback = () => {
                _this.remove(notice.key);
                // 如果有用户传入的onClose 执行
                if(notice.onClose) notice.onClose();
            };

            result.push(
                <Notice key={notice.key} {...notice} onClose={closeCallback} />
            );
        });

        return result;
    }
    getMaskDOM () {
        const {notices, hasMask} = this.state;
        // notices为空的时候 不显示蒙版
        // 始终只有一个蒙版
        if(notices.length > 0 && hasMask == true) return <div className="zby-mask"></div>;
    }
    render () {
        const noticesDOM = this.getNoticeDOM();
        const maskDOM = this.getMaskDOM();

        return (
            <div className="zby-notification-box">
                {maskDOM}
                {noticesDOM}
            </div>
        )
    }
}

// 统计notice总数 防止重复
let noticeNumber = 0;

// 生成唯一的id
const getUuid = () => {
    return "notification-" + new Date().getTime() + "-" + noticeNumber++;
};

// Notification增加一个重写方法
// 该方法方便Notification组件动态添加到页面中和重写
Notification.reWrite = function (properties) {
    const { ...props } = properties || {};

    let div;

    div = document.createElement('div');
    document.body.appendChild(div);

    const notification = ReactDOM.render(<Notification {...props} />, div);

    return {
        notice(noticeProps) {
            notification.add(noticeProps);
        },
        removeNotice(key) {
            notification.remove(key);
        },
        destroy() {
            ReactDOM.unmountComponentAtNode(div);
            document.body.removeChild(div);
        },
        component: notification
    }
};

export default Notification
```

看了Notification其实谜团就解开了，Notice其实就是根据notices中的notice渲染出来的组件，Toast其实就是调用Notification.reWrite返回结果的集合。

## Notice开发
这时候在写Notice就简单了，其props有几个关键的参数duration就是Notice显示几秒，content就是其显示的具体内容，onClose就是该销毁时候执行的回调函数。
这里面控制Notice显示几秒，实际上是用定时器setTimeout实现的，onClose实际上就是在父组件Notification中将自己对应的notice删除。
Notice代码：
```js
// Notice是Toast最底层组件
// 每个黑色的小框框其实都是一个Notice
// Notice核心就是组件初始化的时候 生成一个定时器
// 根据输入的时间 加载一个动画 然后执行输入的回调
// Notice的显示和隐藏收到父组件Notification的绝对控制
import React from 'react'
import classNames from 'classnames'

class Notice extends React.Component {
    static propTypes = {
        duration: React.PropTypes.number, // Notice显示时间
        content: React.PropTypes.any, // Notice显示的内容
        onClose: React.PropTypes.func // 显示结束回调
    };
    static defaultProps = {
        duration: 3000,
    };
    constructor (props) {
        super(props);
        this.state = {
            shouldClose: false, // 是否开启关闭动画
        }
    }
    componentDidMount () {
        if(this.props.duration > 0){
            this.closeTimer = setTimeout(() => {
                this.close();
            }, this.props.duration - 300); // 减掉消失动画300毫秒
        }
    }
    componentWillUnmount () {
        // 当有意外关闭的时候 清掉定时器
        this.clearCloseTimer();
    }
    clearCloseTimer () {
        if (this.closeTimer) {
            clearTimeout(this.closeTimer);
            this.closeTimer = null;
        }
    }
    close () {
        // 关闭的时候 应该先清掉倒数定时器
        // 然后开启过场动画
        // 等待动画结束 执行回调
        this.clearCloseTimer();
        const _this = this;
        _this.setState({shouldClose: true});
        this.timer = setTimeout(()=>{
            if(this.props.onClose){
                this.props.onClose();
            }
            clearTimeout(_this.timer);
        }, 300);
    }
    render () {
        const {shouldClose} = this.state;

        return (
            <div className={classNames(['zby-notice-box', {'leave': shouldClose}])}>
                {this.props.content}
            </div>
        )
    }
}

export default Notice
```

## Toast封装
最后看下Toast就比较简单了。
Toast首先就是要利用Notification.reWrite初始化一个newNotification，并且保持这个Notification为单例。
然后封装一个notice方法，动态的改变这个newNotification。
最后封装几个常用notice方法暴露出去。
Toast代码：
```js
import React from 'react'
import classNames from 'classnames'
import Notification from './Notification'

// Toast组件比较特殊
// 因为<Toast />不会被直接渲染在DOM中
// 而是动态插入页面中
// Toast组件核心就是通过Notification暴露的重写方法 动态改变Notification
let newNotification;

// 获得一个Notification
const getNewNotification = () => {
    // 单例 保持页面始终只有一个Notification
    if (!newNotification) {
        newNotification = Notification.reWrite();
    }

    return newNotification;
};

// notice方法实际上就是集合参数 完成对Notification的改变
const notice = (content, type, icon, duration = 3000, onClose, mask = true) => {
    let notificationInstance = getNewNotification();

    notificationInstance.notice({
        duration,
        mask: mask,
        content: !!icon ? (
            <div className={
                classNames(['zby-toast-box',
                    {'info': type === 'info'},
                    {'success': type === 'success'},
                    {'warning': type === 'warning'},
                    {'error': type === 'error'}
                ])
            }>
                <div className="zby-toast-icon"><i className={"fa " + icon}></i></div>
                <div className="zby-toast-content">{content}</div>
            </div>
        ) : (
            <div className={
                classNames(['zby-toast-box',
                    {'info': type === 'info'},
                    {'success': type === 'success'},
                    {'warning': type === 'warning'},
                    {'error': type === 'error'}
                ])
            }>
                <div className="zby-toast-content">{content}</div>
            </div>
        ),
        onClose: () => {
            if (onClose) onClose();
        },
    });
};

export default {
    // 无动画
    show(content, duration, icon, mask, onClose) {
        return notice(content, undefined, icon, duration, onClose, mask);
    },
    // 翻转效果
    info(content, duration, icon, mask, onClose) {
        return notice(content, 'info', icon, duration, onClose, mask);
    },
    // 缩放效果
    success(content, duration, icon, mask, onClose) {
        return notice(content, 'success', icon, duration, onClose, mask);
    },
    // 从下方滑入
    warning(content, duration, icon, mask, onClose) {
        return notice(content, 'warning', icon, duration, onClose, mask);
    },
    // 抖动
    error(content, duration, icon, mask, onClose) {
        return notice(content, 'error', icon, duration, onClose, mask);
    },
    // 销毁
    hide() {
        if (newNotification) {
            newNotification.destroy();
            newNotification = null;
        }
    },
}
```

这样Toast，一个在React中动态插入删除DOM的组件完成了。

## 总结
这里的Toast，Notification和Notice都是参照antd-mobile源码改写的，这种组件暴露方法给别人调用的场景，和动态插入DOM场景平时不多见，借助其源码也是一次学习。

## 参考链接
1. [项目源码](https://github.com/Aus0049/react-component/)
2. [antd-mobile](https://mobile.ant.design/components/toast-cn/)
3. [react-component](https://github.com/react-component/notification)