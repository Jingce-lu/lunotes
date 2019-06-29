# 从0实现一个tiny react-redux
<!-- TOC -->

- [从0实现一个tiny react-redux](#从0实现一个tiny-react-redux)
  - [从0实现一个tiny react-redux](#从0实现一个tiny-react-redux-1)
    - [不用react-redux](#不用react-redux)
    - [connect](#connect)
    - [Provider](#provider)
    - [其他](#其他)

<!-- /TOC -->
## 从0实现一个tiny react-redux
---

react-redux 是一个连接react和redux的库， 方便把redux状态库在react中使用。

### 不用react-redux
先让我们来个裸的redux 和react结合的例子试试手
样例store（本文都会以这个store为例）
```javascript
import { createStore, applyMiddleware } from 'redux'
import logger from 'redux-logger'

function reduer(state, action) {
    switch (action.type) {
        case 'add': {
            return {
                ...state,
                count: state.count + 1
            }
        }
        default: {
            return state
        }
    }
}

const store = createStore(reduer, { count: 0 }, applyMiddleware(logger))
```
这个store接受一个 type为add的action。 
假设现在有一个 组件HelloWorld 监听展示这个 store的count值。
```javascript
class HelloWorld extends Component {
    constructor(props) {
        super(props)
        store.subscribe(() => {
            this.setState({})
        })
    }
    render() {
        const state = store.getState()
        return (
            <div
                onClick={e => store.dispatch({type: 'add'})}
                style={{color: 'red'}}
            >
                {state.count}
            </div>
        )
    }
}
ReactDOM.render(<HelloWorld/>, document.getElementById("root"))
```
[在线地址](https://ykforerlang.github.io/treact-tredux/test/simple/index.html)。 打开f12，当我们点击的时候 会发现有redux日志输出，并且渲染的值和store保持了一致。

### connect
HelloWorld 已经向我们展示了当react把状态交给redux的处理方式。 但是这里有这样的问题： 
>* redux侵入了每一个组件，每个组件都要引入store
>* 每个组件和redux交互的逻辑，就是constructor里面监听， 取对应的state。。。诸多逻辑无法方便复用

让我们用react-redux的思路来思考这个问题。 react-redux需要做什么呢？
1. 组件要监听store
2. 从store取出对应的数据，放到组件的props上

所以： 
```javascript
class HelloWorld extends Component {
    render() {
        return (
            <div>
                <div onClick={e => store.dispatch({type: 'add'})} >{this.props.count}</div>
                <div onClick={e => store.dispatch({type: 'delete'})} >xxx</div>
            </div>
        )
    }
}


function reduxHoc(WrappedComponent, mapStateToProps) {

    return class Rh extends Component {
        constructor(props) {
            super(props)

            this.sub = store.subscribe(() => {
                this.setState({})
            })

            this._beforeProps = mapStateToProps(store.getState(), props)
        }

        componentWillUnmount() {
            this.sub()
        }

        shouldComponentUpdate() {
            const newProps = mapStateToProps(store.getState(), this.props)
            if (this._beforeProps === newProps) {
                return false
            }
            this._beforeProps = newProps
            return true
        }

        render() {
            return <WrappedComponent {...this.props} {...this._beforeProps} />
        }
    }
}

HelloWorld = reduxHoc(HelloWorld, state => state)
```
这里的reduxHoc方法返回了一个React组件类，类比与“高阶函数”的概念，这里叫做“高价组件”。[高阶组件详解](https://zhuanlan.zhihu.com/p/24776678?group_id=802649040843051008)。reduxHoc 接受2个参数WrappedComponent, mapStateToProps，分别是要被包装的组件（这里是HelloWorld)以及 把state映射到props的mapStateToProps。 返回的Rh组件此刻已经监听了store的变化，并且会把从store映射过来的props 传递给WrappedComponent组件。
react-redux的connect 方法不仅接受mapStateToProps，还接受mapDispatchToProps。更近一步，把reduxHoc改为connect吧
```javascript

function connect(mapStateToProps, mapDispatchToProps) {
    return function (WrappedComponent) {
        return class Hoc extends Component {
           constructor(props, context) {
                super(props)
                this.unsubscribe = store.subscribe(() => {
                    this.setState({})
                })

                this.memorizeProps = this.calculateProps()
            }

            calculateProps() {
                const o1 = mapStateToProps(store.getState(), this.props)

                let o2 = null
                if(mapDispatchToProps) {
                    o2 = mapDispatchToProps(store.dispatch, this.props)
                } else {
                    o2 = {
                        dispatch: store.dispatch
                    }
                }

                return {
                    ...o1,
                    ...o2
                }
            }

            componentWillUnmount() {
                this.unsubscribe()
                this.unsubscribe = null
            }

            shouldComponentUpdate() {
                const nextProps = this.calculateProps()

                const isEqual = shallowEqual(nextProps, this.memorizeProps)
                if (isEqual) {
                    return false
                } else {
                    this.memorizeProps = nextProps
                    return true
                }
            }


            render() {
                return (
                    <WrappedComponent {...this.props} {...this.memorizeProps} />
                )
            }
        }

    }
}

function shallowEqual(objA, objB) {
  if (objA === objB) {
    return true;
  }

  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);

  if (keysA.length !== keysB.length) {
    return false;
  }

  // Test for A's keys different from B.
  const hasOwn = Object.prototype.hasOwnProperty;
  for (let i = 0; i < keysA.length; i++) {
    if (!hasOwn.call(objB, keysA[i]) ||
        objA[keysA[i]] !== objB[keysA[i]]) {
      return false;
    }
  }

  return true;
}
```
这里的connect使用方式和 react-redux的connect是一致的了（react-redux的connect其实接受4个参数）。有一点需要注意：reduxHoc和connect的shouldComponentUpdate 都只是 浅比较了引用， 这是因为redux库是无副作用的，所以来自redux库的对象只要引用相同就一定完全没有改变， 可以不用再次渲染。反过来说：如果store里面的值改变了，但是页面没有重新渲染，说明redux的逻辑写的有问题。

### Provider
前面提到的connect方法， 虽然现在store没有侵入具体业务组件， 但是connect方法里面却用到了store。而我们在使用react-redux这个库的时候， 可能压根儿就不知道store在哪里。 或者我们需要把store传给这个库，来生成connect函数。 
换一个角度， react不仅提供了props来传递数据。 还提供了context， context传递数据是透传的形式， 关于[conext的详细介绍请看](https://reactjs.org/docs/context.html)。 在最外层的根组件提供store， 然后所有的组件都可以通过context获取store。 
```javascript
class Provider extends Component {

    static childContextTypes =  {
        store: PropTypes.object
    }

    getChildContext() {
        return {
            store: this.props.store
        }
    }

    render() {
        return Children.only(this.props.children)
    }
}
```
对应的connect写法
```javascript
function connect(mapStateToProps, mapDispatchToProps) {

    return function (WrappedComponent) {
        return class Hoc extends Component {
            static contextTypes = {
                store: PropTypes.object
            }

            constructor(props, context) {
                super(props)

                this.store = props.store || context.store

                this.unsubscribe = this.store.subscribe(() => {
                    this.setState({})
                })

                this.memorizeProps = this.calculateProps()
            }

            calculateProps() {
                const o1 = mapStateToProps(this.store.getState(), this.props)

                let o2 = null
                if(mapDispatchToProps) {
                    o2 = mapDispatchToProps(this.store.dispatch, this.props)
                } else {
                    o2 = {
                        dispatch: this.store.dispatch
                    }
                }

                return {
                    ...o1,
                    ...o2
                }
            }

            componentWillUnmount() {
                this.unsubscribe()
                this.unsubscribe = null
            }

            shouldComponentUpdate() {
                const nextProps = this.calculateProps()

                const isEqual = shallowEqual(nextProps, this.memorizeProps)
                if (isEqual) {
                    return false
                } else {
                    this.memorizeProps = nextProps
                    return true
                }
            }


            render() {
                return (
                    <WrappedComponent {...this.props} {...this.memorizeProps} />
                )
            }
        }

    }
}
```

### 其他
[代码托管在](https://github.com/Jingce-lu/tiny-tredux)
安装：
```
npm install tiny-tredux
```

