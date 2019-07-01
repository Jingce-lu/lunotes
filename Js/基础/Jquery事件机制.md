Jquery事件机制
====

Jquery事件机制中也会调用原生的注册事件和删除事件，回调函数存储跟React的回调函数存储类似，可以阅读代码，感受一下事件机制的相通之处，源码如下：

```js
jQuery.fn.extend( {
  on: function (types, selector, data, fn) {
    // on 又依托于全局的 on 函数
    return on(this, types, selector, data, fn);
  }
} );

//on函数
function on( elem, types, selector, data, fn, one ) {
  var origFn, type;

  // 支持 object 的情况
  if ( typeof types === "object" ) {

    // ( types-Object, selector, data )
    if ( typeof selector !== "string" ) {

      // ( types-Object, data )
      data = data || selector;
      selector = undefined;
    }
    // 一次执行 object 的每一个
    for ( type in types ) {
      on( elem, type, selector, data, types[ type ], one );
    }
    return elem;
  }
  // 参数为两个的情况
  if ( data == null && fn == null ) {

    // ( types, fn )
    fn = selector;
    data = selector = undefined;
  } else if ( fn == null ) {
    if ( typeof selector === "string" ) {

      // ( types, selector, fn )
      fn = data;
      data = undefined;
    } else {

      // ( types, data, fn )
      fn = data;
      data = selector;
      selector = undefined;
    }
  }
  if ( fn === false ) {
    // returnFalse 是一个返回 false 的函数
    fn = returnFalse;
  } else if ( !fn ) {
    return elem;
  }

  if ( one === 1 ) {
    origFn = fn;
    fn = function( event ) {

      // Can use an empty set, since event contains the info
      jQuery().off( event );
      return origFn.apply( this, arguments );
    };

    // Use same guid so caller can remove using origFn
    fn.guid = origFn.guid || ( origFn.guid = jQuery.guid++ );
  }
  return elem.each( function() {
    // 关键
    jQuery.event.add( this, types, fn, data, selector );
  } );
}

//off函数
jQuery.fn.off = function (types, selector, fn) {
  var handleObj, type;
  if (types && types.preventDefault && types.handleObj) {
    // ( event )  dispatched jQuery.Event
    handleObj = types.handleObj;
    jQuery(types.delegateTarget).off(
      handleObj.namespace ? handleObj.origType + "." + handleObj.namespace : handleObj.origType,
      handleObj.selector,
      handleObj.handler
    );
    return this;
  }
  if (typeof types === "object") {
    // ( types-object [, selector] )
    for (type in types) {
      this.off(type, selector, types[type]);
    }
    return this;
  }
  if (selector === false || typeof selector === "function") {
    // ( types [, fn] )
    fn = selector;
    selector = undefined;
  }
  if (fn === false) {
    fn = returnFalse;
  }
  return this.each(function() {
    // 关键
    jQuery.event.remove(this, types, fn, selector);
  });
}
```