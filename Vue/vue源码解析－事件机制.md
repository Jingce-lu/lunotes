vue源码解析－事件机制
===

源码都是基于最新的Vue.js v2.3.0。下面我们来看看vue中的事件机制：
```html
<div id="app">
  <div id="test1" @click="click1">click1</div>
  <div id="test2" @click.stop="click2">click2</div>
  <my-component v-on:click.native="nativeclick" v-on:componenton="parentOn">
  </my-component>
</div>
</body>
<script src="vue.js"></script>
<script type="text/javascript">
var Child = {
  template: '<div>A custom component!</div>'
} 
Vue.component('my-component', {
  name: 'my-component',
  template: '<div>A custom component!<div @click.stop="toParent">test click</div></div>',
  components: {
    Child:Child
  },
  created(){
    console.log(this);
  },
  methods: {
    toParent(){
      this.$emit('componenton','toParent')
    }
  },
  mounted(){
    console.log(this);
  }
})
  new Vue({
  el: '#app',
  data: function () {
    return {
      heihei:{name:3333},
      a:1
    }
  },
  components: {
    Child:Child
  },
  methods: {
    click1(){
      alert('click1')
    },
    click2(){
      alert('click2')
    },
    nativeclick(){
      alert('nativeclick')
    },
    parentOn(value){
      alert(value)
    }
  }
})
</script>
```

上面的demo中一共有四个事件。基本涵盖了vue中最经典的事件的四种情况


## 普通html元素上的事件
那么首先我们看看最简单的第一、二个(两个事件只差了个修饰符)：  
`<div id="test1" @click="click1">click1</div>`
这是简单到不能在简单的一个点击事件。  
我们来看看建立这么一个简单的点击事件，vue中发生了什么。  
1:new Vue()中调用了initState(vue):看代码  
```js
function initState (vm) {
  vm._watchers = [];
  var opts = vm.$options;
  if (opts.props) { initProps(vm, opts.props); }
  if (opts.methods) { initMethods(vm, opts.methods); }//初始化事件
  if (opts.data) {
    initData(vm);
  } else {
    observe(vm._data = {}, true /* asRootData */);
  }
  if (opts.computed) { initComputed(vm, opts.computed); }
  if (opts.watch) { initWatch(vm, opts.watch); }
}

//接着看看initMethods
function initMethods (vm, methods) {
  var props = vm.$options.props;
  for (var key in methods) {
    vm[key] = methods[key] == null ? noop : bind(methods[key], vm);//调用了bind方法，我们再看看bind
    {
      if (methods[key] == null) {
        warn(
          "method \"" + key + "\" has an undefined value in the component definition. " +
          "Did you reference the function correctly?",
          vm
        );
      }
      if (props && hasOwn(props, key)) {
        warn(
          ("method \"" + key + "\" has already been defined as a prop."),
          vm
        );
      }
    }
  }
}

//我们接着看看bind

function bind (fn, ctx) {
  function boundFn (a) {
    var l = arguments.length;
    return l
      ? l > 1
        ? fn.apply(ctx, arguments)//通过返回函数修饰了事件的回调函数。绑定了事件回调函数的this。并且让参数自定义。更加的灵活
        : fn.call(ctx, a)
      : fn.call(ctx)
  }
  // record original fn length
  boundFn._length = fn.length;
  return boundFn
}
```

总的来说。vue初始化的时候，将method中的方法代理到vue[key]的同时修饰了事件的回调函数。绑定了作用域。

2:vue进入compile环节需要将该div变成ast(抽象语法树）。当编译到该div时经过核心函数genHandler：

```js
function genHandler (
  name,
  handler
) {
  if (!handler) {
    return 'function(){}'
  }

  if (Array.isArray(handler)) {
    return ("[" + (handler.map(function (handler) { return genHandler(name, handler); }).join(',')) + "]")
  }

  var isMethodPath = simplePathRE.test(handler.value);
  var isFunctionExpression = fnExpRE.test(handler.value);

  if (!handler.modifiers) {
    return isMethodPath || isFunctionExpression//假如没有修饰符。直接返回回调函数
      ? handler.value
      : ("function($event){" + (handler.value) + "}") // inline statement
  } else {
    var code = '';
    var genModifierCode = '';
    var keys = [];
    for (var key in handler.modifiers) {
      if (modifierCode[key]) {
        genModifierCode += modifierCode[key];//处理修饰符数组，例如.stop就在回调函数里加入event.stopPropagation()再返回。实现修饰的目的
        // left/right
        if (keyCodes[key]) {
          keys.push(key);
        }
      } else {
        keys.push(key);
      }
    }
    if (keys.length) {
      code += genKeyFilter(keys);
    }
    // Make sure modifiers like prevent and stop get executed after key filtering
    if (genModifierCode) {
      code += genModifierCode;
    }
    var handlerCode = isMethodPath
      ? handler.value + '($event)'
      : isFunctionExpression
        ? ("(" + (handler.value) + ")($event)")
        : handler.value;
    return ("function($event){" + code + handlerCode + "}")
  }
}
```

genHandler函数简单明了，如果事件函数有修饰符。就处理完修饰符，添加修饰符对应的函数语句。再返回。这个过程还会单独对native修饰符做特殊处理。这个等会说。compile完后自然就render。我们看看render函数中这块区域长什么样子：
```js
_c('div',{attrs:{"id":"test1"},on:{"click":click1}},[_v("click1")]),_v(" "),_c('div',{attrs:{"id":"test2"},on:{"click":function($event){$event.stopPropagation();click2($event)}}}
```

一目了然。最后在虚拟dom－》真实dom的时候。会调用核心函数：
```js
function add$1 (
  event,
  handler,
  once$$1,
  capture,
  passive
) {
  if (once$$1) {
    var oldHandler = handler;
    var _target = target$1; // save current target element in closure
    handler = function (ev) {
      var res = arguments.length === 1
        ? oldHandler(ev)
        : oldHandler.apply(null, arguments);
      if (res !== null) {
        remove$2(event, handler, capture, _target);
      }
    };
  }
  target$1.addEventListener(
    event,
    handler,
    supportsPassive
      ? { capture: capture, passive: passive }//此处绑定点击事件
      : capture
  );
}
```


## 组件上的事件
好了下面就是接下来的组件上的点击事件了。可以预感到他走的和普通的html元素应该是不同的道路。事实也是如此：
```html
<my-component v-on:click.native="nativeclick" v-on:componenton="parentOn">
  </my-component>
```

最简单的一个例子。两个事件的区别就是一个有.native的修饰符。我们来看看官方.native的作用：在原生dom上绑定事件。好吧。很简单。我们跟随源码看看有何不同。这里可以往回看看我少的可怜的上一章组件机制。vue中的组件都是扩展的vue的一个新实例。在compile结束的时候你还是可以发现他也是类似的一个样子。如下图：
```js
_c('my-component',{on:{"componenton":parentOn},nativeOn:{"click":function($event){nativeclick($event)}}
```

可以看到加了.native修饰符的会被放入nativeOn的数组中。等待后续特殊处理。等不及了。我们直接来看看特殊处理。render函数在执行时。如果遇到组件。看过上一章的可以知道。会执行

```js
function createComponent (
  Ctor,
  data,
  context,
  children,
  tag
) {
  if (isUndef(Ctor)) {
    return
  }

  var baseCtor = context.$options._base;

  // plain options object: turn it into a constructor
  if (isObject(Ctor)) {
    Ctor = baseCtor.extend(Ctor);
  }

  // if at this stage it's not a constructor or an async component factory,
  // reject.
  if (typeof Ctor !== 'function') {
    {
      warn(("Invalid Component definition: " + (String(Ctor))), context);
    }
    return
  }

  // async component
  if (isUndef(Ctor.cid)) {
    Ctor = resolveAsyncComponent(Ctor, baseCtor, context);
    if (Ctor === undefined) {
      // return nothing if this is indeed an async component
      // wait for the callback to trigger parent update.
      return
    }
  }

  // resolve constructor options in case global mixins are applied after
  // component constructor creation
  resolveConstructorOptions(Ctor);

  data = data || {};

  // transform component v-model data into props & events
  if (isDef(data.model)) {
    transformModel(Ctor.options, data);
  }

  // extract props
  var propsData = extractPropsFromVNodeData(data, Ctor, tag);

  // functional component
  if (isTrue(Ctor.options.functional)) {
    return createFunctionalComponent(Ctor, propsData, data, context, children)
  }

  // extract listeners, since these needs to be treated as
  // child component listeners instead of DOM listeners
  var listeners = data.on;//listeners缓存data.on的函数。这里就是componenton事件
  // replace with listeners with .native modifier
  data.on = data.nativeOn;//正常的data.on会被native修饰符的事件所替换

  if (isTrue(Ctor.options.abstract)) {
    // abstract components do not keep anything
    // other than props & listeners
    data = {};
  }

  // merge component management hooks onto the placeholder node
  mergeHooks(data);

  // return a placeholder vnode
  var name = Ctor.options.name || tag;
  var vnode = new VNode(
    ("vue-component-" + (Ctor.cid) + (name ? ("-" + name) : '')),
    data, undefined, undefined, undefined, context,
    { Ctor: Ctor, propsData: propsData, listeners: listeners, tag: tag, children: children }
  );
  return vnode
}
```

整段代码关于事件核心操作：
```js
var listeners = data.on;//listeners缓存data.on的函数。这里就是componenton事件
// replace with listeners with .native modifier
data.on = data.nativeOn;//正常的data.on会被native修饰符的事件所替换
```


经过这两句话。.native修饰符的事件会被放在data.on上面。接下来data.on上的事件（这里就是nativeclick）会按普通的html事件往下走。最后执行target.add('',''')挂上原生的事件。而先前的data.on上的被缓存在listeneners的事件就没着么愉快了。接下来他会在组件init的时候。它会进入一下分支：
```js
function initEvents (vm) {
  vm._events = Object.create(null);
  vm._hasHookEvent = false;
  // init parent attached events
  var listeners = vm.$options._parentListeners;
  if (listeners) {
    updateComponentListeners(vm, listeners);
  }
}

function updateComponentListeners (
  vm,
  listeners,
  oldListeners
) {
  target = vm;
  updateListeners(listeners, oldListeners || {}, add, remove$1, vm);
}

function add (event, fn, once$$1) {
  if (once$$1) {
    target.$once(event, fn);
  } else {
    target.$on(event, fn);
  }
}

```

发现组件上的没有`.native`的修饰符调用的是$on方法。这个好熟悉。进入到`$on,$emit`大致想到是一个典型的观察者模式的事件。看看相关`$on,$emit`代码。我加点注解：
```js
Vue.prototype.$on = function (event, fn) {
    var this$1 = this;

    var vm = this;
    if (Array.isArray(event)) {
      for (var i = 0, l = event.length; i < l; i++) {
        this$1.$on(event[i], fn);
      }
    } else {
      (vm._events[event] || (vm._events[event] = [])).push(fn);//存入事件
      // optimize hook:event cost by using a boolean flag marked at registration
      // instead of a hash lookup
      if (hookRE.test(event)) {
        vm._hasHookEvent = true;
      }
    }
    return vm
  };

Vue.prototype.$emit = function (event) {
    var vm = this;
    console.log(vm);
    {
      var lowerCaseEvent = event.toLowerCase();
      if (lowerCaseEvent !== event && vm._events[lowerCaseEvent]) {
        tip(
          "Event \"" + lowerCaseEvent + "\" is emitted in component " +
          (formatComponentName(vm)) + " but the handler is registered for \"" + event + "\". " +
          "Note that HTML attributes are case-insensitive and you cannot use " +
          "v-on to listen to camelCase events when using in-DOM templates. " +
          "You should probably use \"" + (hyphenate(event)) + "\" instead of \"" + event + "\"."
        );
      }
    }
    var cbs = vm._events[event];
    console.log(cbs);
    if (cbs) {
      cbs = cbs.length > 1 ? toArray(cbs) : cbs;
      var args = toArray(arguments, 1);
      for (var i = 0, l = cbs.length; i < l; i++) {
        cbs[i].apply(vm, args);／／当emit的时候调用该事件。注意上面说的vue在初始化的守候。用bind修饰了事件函数。所以组件上挂载的事件都是在父作用域中的
      }
    }
    return vm
  };
```

看了上面的$on,$emit用法下面这个demo也就瞬间秒解了（一个经常用的非父子组件通信）：

```js
var bus = new Vue()
// 触发组件 A 中的事件
bus.$emit('id-selected', 1)
// 在组件 B 创建的钩子中监听事件
bus.$on('id-selected', function (id) {
  // ...
})
```
