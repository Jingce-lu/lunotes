React+DvaJS 之 hook 路由权限控制
====
在model的subscriptions中进行匹配，分发到effects中进行判断和跳转

### effects 有三个参数:
1. **put**  用于触发 action 。
    ```js
    yield put({ type: 'todos/add', payload: 'Learn Dva' });
    ```
2. **call** 用于调用异步逻辑，支持 promise 。
    ```js
    const result = yield call(fetch, '/todos');
    ```
3. **select** 用于从 state 里获取数据。
    ```js
    const todos = yield select(state => state.todos);
    ```


### 基于 action 进行页面跳转
```javascript
import { routerRedux } from 'dva/router';

// Inside Effects
yield put(routerRedux.push('/logout'));

// Outside Effects
dispatch(routerRedux.push('/logout'));

// With query
routerRedux.push({
  pathname: '/logout',
  query: {
    page: 2,
  },
});
```

除 push(location) 外还有更多方法，[详见这里](https://github.com/reactjs/react-router-redux#pushlocation-replacelocation-gonumber-goback-goforward)

示例如下：
```javascript
  state: {
    isLogin: false,
    loginfail:false,
  },
  subscriptions: {
    setup({ dispatch, history }) {
      history.listen(location => {
        if (location.pathname.includes('app')) {
          dispatch({
            type: 'loginhook',
          });
        }
      });
    },
  },
    effects: {
    * login({ payload },{call, put}) {
      const { data } = yield call(login, payload);
      if (data && data.success) {    
        yield put({
                  type: 'checklogin',
                  payload:{
                    isLogin:true,
                  }
              });
        yield put(routerRedux.push('/app/users'));
      }else{
        yield put({
                    type: 'loginfail',
                    payload:{
                      loginfail:true,
                    }
                });
      }
    },

    * loginhook({ payload },{select,call, put}){
      const isLogin = yield select(({session}) => session.isLogin);
      console.log('logincheck',isLogin);
      if(isLogin === false){
        yield put((routerRedux.push('/login')));
      }

    },
  },
  reducers: {

    checklogin(state,action) {
      return {...state,isLogin:action.payload.isLogin };
    },

    loginfail(state,action) {
      return {...state, loginfail:action.payload.loginfail};
    },
  }
```