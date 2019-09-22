React 21-40
===
<!-- TOC -->

- [21.redux和flux的区别是什么？](#21redux和flux的区别是什么)
- [22. React-Router的`<Link>`标签和`<a>`标签有什么区别？](#22-react-router的link标签和a标签有什么区别)
- [23. Redux中异步action和同步action最大的区别是什么？](#23-redux中异步action和同步action最大的区别是什么)
- [24. Redux和vuex有什么区别？](#24-redux和vuex有什么区别)
- [25.Redux的中间件是什么？你有用过哪些Redux的中间件？](#25redux的中间件是什么你有用过哪些redux的中间件)
- [26. 说说Redux的实现流程](#26-说说redux的实现流程)
- [27. Mobx的设计思想是什么？](#27-mobx的设计思想是什么)
- [28. Redux由哪些组件构成？](#28-redux由哪些组件构成)
- [29.Mobx和Redux有什么区别？](#29mobx和redux有什么区别)
- [30.在React项目中你是如何选择Redux和Mobx的？说说你的理解](#30在react项目中你是如何选择redux和mobx的说说你的理解)
- [31.你有在React中使用过Mobx吗？它的运用场景有哪些？](#31你有在react中使用过mobx吗它的运用场景有哪些)
- [32.怎样实现react组件的记忆？原理是什么？](#32怎样实现react组件的记忆原理是什么)
- [33.创建react动画有哪些方式？](#33创建react动画有哪些方式)
- [34.为什么建议不要过渡使用Refs？](#34为什么建议不要过渡使用refs)
- [35.在react使用HOC有遇到过哪些问题？如何解决？](#35在react使用hoc有遇到过哪些问题如何解决)
- [36. 在使用react过程中什么时候用HOC？](#36-在使用react过程中什么时候用hoc)
- [37.请描述下flux的思想](#37请描述下flux的思想)
- [38. 什么是flux？说说你对flux的理解？有哪些运用场景？](#38-什么是flux说说你对flux的理解有哪些运用场景)
- [39.redux的thunk作用是什么？](#39redux的thunk作用是什么)
- [40.redux的数据存储和本地储存有什么区别？](#40redux的数据存储和本地储存有什么区别)

<!-- /TOC -->

## 21.redux和flux的区别是什么？

## 22. React-Router的`<Link>`标签和`<a>`标签有什么区别？
Link 组件最终会渲染为 HTML 标签 `<a>`，它的 to、query、hash 属性会被组合在一起并渲染为 href 属性。虽然 Link 被渲染为超链接，但在内部实现上使用脚本拦截了浏览器的默认行为，然后调用了history.pushState 方法。

Link 只负责触发 url 变更，Route 只负责根据 url 渲染组件

相比于 `<a>` 标签，`<Link>` 避免了不必要的渲染


## 23. Redux中异步action和同步action最大的区别是什么？

## 24. Redux和vuex有什么区别？

## 25.Redux的中间件是什么？你有用过哪些Redux的中间件？

## 26. 说说Redux的实现流程

## 27. Mobx的设计思想是什么？

## 28. Redux由哪些组件构成？

## 29.Mobx和Redux有什么区别？

## 30.在React项目中你是如何选择Redux和Mobx的？说说你的理解

## 31.你有在React中使用过Mobx吗？它的运用场景有哪些？

## 32.怎样实现react组件的记忆？原理是什么？

## 33.创建react动画有哪些方式？

## 34.为什么建议不要过渡使用Refs？

## 35.在react使用HOC有遇到过哪些问题？如何解决？

## 36. 在使用react过程中什么时候用HOC？

## 37.请描述下flux的思想 

## 38. 什么是flux？说说你对flux的理解？有哪些运用场景？ 

## 39.redux的thunk作用是什么？

## 40.redux的数据存储和本地储存有什么区别？
