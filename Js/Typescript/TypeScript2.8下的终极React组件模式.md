# TypeScript 2.8下的终极React组件模式
<!-- TOC -->

- [TypeScript 2.8下的终极React组件模式](#typescript-28下的终极react组件模式)
- [有状态组件、无状态组件、默认属性、Render回调、组件注入、泛型组件、高阶组件、受控组件](#有状态组件无状态组件默认属性render回调组件注入泛型组件高阶组件受控组件)
  - [准备开始](#准备开始)
  - [无状态组件](#无状态组件)
  - [有状态组件](#有状态组件)
    - [例子：编译时的State类型安全](#例子编译时的state类型安全)
    - [整个容器组件/有状态组件的实现：](#整个容器组件有状态组件的实现)
  - [默认属性](#默认属性)
  - [render回调/render属性模式](#render回调render属性模式)
  - [组件注入](#组件注入)
  - [泛型组件](#泛型组件)
  - [高阶组件](#高阶组件)
  - [受控组件](#受控组件)
  - [总结](#总结)

<!-- /TOC -->

![11.png | left | 827x270](https://cdn.yuque.com/yuque/0/2018/png/99990/1527235790396-60b4e794-7049-456b-8ba3-04bad0de5225.png)

# 有状态组件、无状态组件、默认属性、Render回调、组件注入、泛型组件、高阶组件、受控组件

如果你了解我，你就已经知道我不编写没有类型定义的javascript代码，所以我从0.9版本后，就非常喜欢TypeScript了。除了有类型的JS，我也非常喜欢React库，所以当把React和Typescript 结合在一起后，对我来说就像置身天堂一样:)。整个应用程序和虚拟DOM中的完整的类型安全，是非常奇妙和开心的。

所以这篇文章说是关于什么的呢？在互联网上有各种关于React组件模式的文章，但没有介绍如何将这些模式应用到Typescript中。此外，即将发布的TS 2.8版本带来了另人兴奋的新功能如、如有条件的类型(conditional types)、标准库中新预定义的条件类型、同态映射类型修饰符等等，这些新功能是我们能够以类型安全的方式轻松地创建常见的React组件模式。

这篇文章篇幅会比较长，所以请你坐下放轻松，与此同时你将掌握Typescript下的 终极React组件模式。

> 所有的模式/例子均使用typescript 2.8版本和strict mode

## 准备开始

首先，我们需要安装typescript和tslibs帮助程序库，以便我们生出的代码更小

```shell
yarn add -D typescript@next
# tslib 将仅用与您的编译目标不支持的功能
yarn add tslib
```

有了这个，我们可以初始化我们的typescript配置：

```shell
# 这条命令将在我们的工程中创建默认配置 tsconfig.json 
yarn tsc --init
```

现在我们来安装 react、react-dom 和它们的类型定义。

```shell
yarn add react react-dom
yarn add -D @types/{react,react-dom}
```

棒极啦！现在我们可以开始进入我们的组件模式吧，不是吗？

## 无状态组件

你猜到了，这些是没有state的组件(也被称为展示型组件)。在部分时候，它们也是纯函数组件。让我们用TypeScript创建人造的无状态Button组件。

同使用原生JS一样，我们需要引入React以便我们可以使用JSX

```typescript
import React from 'react'

const Button = ({ onClick: handleClick, children }) => (
  <button onClick={handleClick}>{children}</button>
)
```

虽然 tsc 编译器现在还会跑出错误！我们需要显式的告诉我们的组件/函数我们的props是什么类型的。让我们定义我们的 props：

```typescript
import React, { MouseEvent, ReactNode } from 'react'
type Props = { 
 onClick(e: MouseEvent<HTMLElement>): void
 children?: ReactNode 
}

const Button = ({ onClick: handleClick, children }: Props) => (
  <button onClick={handleClick}>{children}</button>
)
```

现在我们已经解决了所有的错误了！非常好！但我们还可以做的更好！

在`@types/react`中已经预定义一个类型`type SFC<P>`，它也是类型`interface StatelessComponent<P>`的一个别名，此外，它已经有预定义的`children`和其他（defaultProps、displayName等等…），所以我们不用每次都自己编写！

所以最后的无状态组件是这样的：

```typescript
import React, { MouseEvent, SFC } from 'react';

type Props = { onClick(e: MouseEvent<HTMLElement>): void };

const Button: SFC<Props> = ({ onClick: handleClick, children }) => (
  <button onClick={handleClick}>{children}</button>
);
```

## 有状态组件

让我们使用我们的Button组件来创建有状态的计数器组件。

首先我们需要定义`initialState`

```typescript
const initialState = { clicksCount: 0 }
```

现在我们将使用TypeScript来从我们的实现中推断出State的类型。

> 这样我们不需要分开维护我们的类型定义和实现，我们只有唯一的真相源，即我们的实现，太好了！

```typescript
type State = Readonly<typeof initialState>
```

> 另外请注意，该类型被明确映射为使所有的属性均为只读的。我们需要再次使用State类型来显式地在我们的class上定义只读的state属性。

```typescript
readonly state: State = initialState
```

> 这么做的作用是什么？
> 
> 我们知道我们在React中不能像下面这样直接更新`state`：

```typescript
this.state.clicksCount = 2;
this.state = { clicksCount: 2 }
```

> 这将导致运行时错误，但在编译时不会报错。通过显式地使用`Readonly`映射我们的`type State`，和在我们的类定义中设置只读的state属性，TS将会让我们立刻知道我们做错了。

### 例子：编译时的State类型安全


![22.gif | left | 827x289](https://cdn.yuque.com/yuque/0/2018/gif/99990/1527235836807-19f97b80-1fec-4bf6-b450-8557ffd14a4d.gif)


### 整个容器组件/有状态组件的实现：

我们的容器组件还没有任何Props API，所以我们需要将`Compoent`组件的第一个泛型参数定义为`Object`（因为在React中`props`永远是对象`{}`），并使用`State`类型作为第二个泛型参数。

```typescript
import React, { Component } from 'react';

import Button from './Button';

const initialState = { clicksCount: 0 };
type State = Readonly<typeof initialState>;

class ButtonCounter extends Component<object, State> {
  readonly state: State = initialState;

  render() {
    const { clicksCount } = this.state;
    return (
      <>
        <Button onClick={this.handleIncrement}>Increment</Button>
        <Button onClick={this.handleDecrement}>Decrement</Button>
        You've clicked me {clicksCount} times!
      </>
    );
  }

  private handleIncrement = () => this.setState(incrementClicksCount);
  private handleDecrement = () => this.setState(decrementClicksCount);
}

const incrementClicksCount = (prevState: State) => ({
  clicksCount: prevState.clicksCount + 1,
});
const decrementClicksCount = (prevState: State) => ({
  clicksCount: prevState.clicksCount - 1,
});
```

> 你可能已经注意到了我们将状态更新函数提取到类的外部作为纯函数。这是一种常见的模式，这样我们不需要了解渲染逻辑就可以简单的测试这些状态更新函数。此外，因为我们使用了TypeScript并将State显式地映射为只读的，它将阻止我们在这些函数中做一些更改状态的操作：

```typescript
const decrementClicksCount = (prevState: State) => ({
  clicksCount: prevState.clicksCount--,
});

// 这样讲抛出编译错误：
//
// [ts] Cannot assign to 'clicksCount' because it is a constant or a read-only property.
```

非常酷是吧？：）


---


## 默认属性

让我们扩展我们的Button组件，新增一个string类型的颜色属性。

```typescript
type Props = {
  onClick(e: MouseEvent<HTMLElement>): void;
  color: string;
};
```

如果我们想定义默认属性，我们可以在我们的组件中通过`Button.defaultProps = {…}`来定义。

通过这样做，我们需要改变我们的属性类型定义来标记属性是可选有默认值的。

所以定义是这样的（注意`?`操作符）

```typescript
type Props = {
  onClick(e: MouseEvent<HTMLElement>): void;
  color?: string;
};
```

此时我们的组件实现是这样的：

```typescript
const Button: SFC<Props> = ({ onClick: handleClick, color, children }) => (
  <button style={{ color }} onClick={handleClick}>
    {children}
  </button>
);
```

尽管这样在我们简单的例子中可用的，这有一个问题。因为我们在strict mode模式洗啊，可选的属性`color`的类型是一个联合类型`undefined | string`。

比如我们想对color属性做一些操作，TS将会抛出一个错误，因为它并不知道它在React创建中通过`Component.defaultProps`中已经定义了:


![33.gif | left | 813x255](https://cdn.yuque.com/yuque/0/2018/gif/99990/1527235850421-2407a4eb-6cf7-4f59-80bf-5b7c3af52f25.gif)


为了满足TS编译器，我们可以使用下面3种技术：

* 使用__!操作符__在render函数显式地告诉编译器这个变量不会是`undefined`，尽管它是可选的，如：`<button onClick={handleClick!}>{children}</button>`
* 使用__条件语句/三目运算符__来让编译器明白一些属性是没有被定义的：`<button onClick={handleClick ? handleClick : undefined}>{children}</button>`
* 创建可服用的__`withDefaultProps`__高阶函数，它将更新我们的props类型定义和设置默认属性。我认为这是最简洁干净的方案。

我们可以很简单的实现我们的高阶函数（感谢TS 2.8种的条件类型映射）：

```typescript
export const withDefaultProps = <
  P extends object,
  DP extends Partial<P> = Partial<P>
>(
  defaultProps: DP,
  Cmp: ComponentType<P>,
) => {
  // 提取出必须的属性
  type RequiredProps = Omit<P, keyof DP>;
  // 重新创建我们的属性定义，通过一个相交类型，将所有的原始属性标记成可选的，必选的属性标记成可选的
  type Props = Partial<DP> & Required<RequiredProps>;

  Cmp.defaultProps = defaultProps;

  // 返回重新的定义的属性类型组件，通过将原始组件的类型检查关闭，然后再设置正确的属性类型
  return (Cmp as ComponentType<any>) as ComponentType<Props>;
};
```

现在我们可以使用`withDefaultProps`高阶函数来定义我们的默认属性，同时也解决了之前的问题：

```typescript
const defaultProps = {
  color: 'red',
};

type DefaultProps = typeof defaultProps;
type Props = { onClick(e: MouseEvent<HTMLElement>): void } & DefaultProps;

const Button: SFC<Props> = ({ onClick: handleClick, color, children }) => (
  <button style={{ color }} onClick={handleClick}>
    {children}
  </button>
);

const ButtonWithDefaultProps = withDefaultProps(defaultProps, Button);
```

或者直接使用内联（注意我们需要显式的提供原始Button组件的属性定义，TS不能从函数中推断出参数的类型）：

```typescript
const ButtonWithDefaultProps = withDefaultProps<Props>(
  defaultProps,
  ({ onClick: handleClick, color, children }) => (
    <button style={{ color }} onClick={handleClick}>
      {children}
    </button>
  ),
);
```

现在Button组件的属性已经被正确的定义被使用的，默认属性被反应出来并且在类型定义中是可选的，但在实现中是必选的！

```typescript
{
    onClick(e: MouseEvent<HTMLElement>): void
    color?: string
}
```



![44.png | left | 827x83](https://cdn.yuque.com/yuque/0/2018/png/99990/1527235868723-883e7323-f82b-4411-9d4f-085b2414487c.png)


组件使用方法仍然是一样的：

```typescript
render() {
    return (
        <ButtonWithDefaultProps
            onClick={this.handleIncrement}
        >
        	Increment
        </ButtonWithDefaultProps>
    )
}
```

当然这也使用与通过`class`定义的组件（得益于TS中的类结构起源，我们不需要显式指定我们的`Props`泛型类型）。

它看起来像这样：

```typescript
const ButtonViaClass = withDefaultProps(
  defaultProps,
  class Button extends Component<Props> {
    render() {
      const { onClick: handleClick, color, children } = this.props;
      return (
        <button style={{ color }} onClick={handleClick}>
          {Children}
        </button>
      );
    }
  },
);
```

再次，它的使用方式仍然是一样的：

```typescript
render() {
  return (
    <ButtonViaClass onClick={this.handleIncrement}>Increment</ButtonViaClass>
  );
}
```


---


比如说你需要构建一个可展开的菜单组件，它需要在用户点击它时显示子内容。我们就可以使用各种各样的组件模式来实现它。

## render回调/render属性模式

实现组件的逻辑可复用的最好方式将组件的children放到函数中去，或者利用`render`属性API——这也是为什么Render回调也被称为函数子组件。

让我们用render属性方法实现一个`Toggleable`组件：

```typescript
import React, { Component, MouseEvent } from 'react';
import { isFunction } from '../utils';

const initialState = {
  show: false,
};

type State = Readonly<typeof initialState>;
                      
type Props = Partial<{
  children: RenderCallback;
  render: RenderCallback;
}>;

type RenderCallback = (args: ToggleableComponentProps) => JSX.Element;
type ToggleableComponentProps = {
  show: State['show'];
  toggle: Toggleable['toggle'];
};

export class Toggleable extends Component<Props, State> {
  readonly state: State = initialState;

  render() {
    const { render, children } = this.props;
    const renderProps = {
      show: this.state.show,
      toggle: this.toggle,
    };

    if (render) {
      return render(renderProps);
    }

    return isFunction(children) ? children(renderProps) : null;
  }

  private toggle = (event: MouseEvent<HTMLElement>) =>
    this.setState(updateShowState);
}

const updateShowState = (prevState: State) => ({ show: !prevState.show });
```

这里都发生了什么，让我们来分别看看重要的部分：

```typescript
const initialState = {
  show: false,
};
type State = Readonly<typeof initialState>;
```

* 这里我们和前面的例子一样声明了我们的state

现在我们来定义组件的props（注意这里我们使用了Partitial映射类型，因为我们所有的属性都是可选的，不用分别对每个属性手动添加`?`标识符）：

```typescript
type Props = Partial<{
  children: RenderCallback;
  render: RenderCallback;
}>;

type RenderCallback = (args: ToggleableComponentProps) => JSX.Element;
type ToggleableComponentProps = {
  show: State['show'];
  toggle: Toggleable['toggle'];
};
```

我们需要同时支持child作为函数，和render属性作为函数，它们两者都是可选的。为了避免重复代码，我们定义了`RenderCallback`作为我们的渲染函数定义：

```typescript
type RenderCallback = (args: ToggleableComponentProps) => JSX.Element
```

> 在读者眼中看起来比较奇怪的部分是我们最后的别名类型：`type ToggleableComponentProps`！

```typescript
type ToggleableComponentProps = {
  show: State['show'];
  toggle: Toggleable['toggle'];
};
```

这里我们使用了TypeScript的__查找类型（lookup types）__，所以我们又不需要重复地去定义类型了：

* `show: State['show']`我们利用已有的state类型定义了`show`属性
* `toggle: Toggleable['toggle']`我们利用了TS从类实现推断类类型来定义`toggle`属性。很好用而且非常强大。

剩下的实现部分很简单，标准的*render属性/children作为函数*的模式：

```typescript
export class Toggleable extends Component<Props, State> {
  // ...
  render() {
    const { render, children } = this.props;
    const renderProps = {
      show: this.state.show,
      toggle: this.toggle,
    };

    if (render) {
      return render(renderProps);
    }

    return isFunction(children) ? children(renderProps) : null;
  }
  // ...
}
```

现在我们可以把函数作为children传给Toggleable组件了：

```typescript
<Toggleable>
  {({ show, toggle }) => (
    <>
      <div onClick={toggle}>
        <h1>some title</h1>
      </div>
      {show ? <p>some content</p> : null}
    </>
  )}
</Toggleable>
```

或者我们可以把函数作为render属性：

```typescript
<Toggleable
  render={({ show, toggle }) => (
    <>
      <div onClick={toggle}>
        <h1>some title</h1>
      </div>
      {show ? <p>some content</p> : null}
    </>
  )}
/>
```

感谢TypeScript，我们在render属性的参数有了智能提示和正确的类型检查：


![55.gif | left | 674x370](https://cdn.yuque.com/yuque/0/2018/gif/99990/1527235886904-be6bc7f6-e11a-4655-a0c4-aeea4c2e5ee5.gif)


如果我们想复用它（比如用在多个菜单组件中），我们只需要创建一个使用Toggleable逻辑的心组件：

```typescript
type Props = { title: string }
const ToggleableMenu: SFC<Props> = ({ title, children }) => (
  <Toggleable
    render={({ show, toggle }) => (
      <>
        <div onClick={toggle}>
          <h1>title</h1>
        </div>
        {show ? children : null}
      </>
    )}
  />
)
```

现在我们全新的__`ToggleableMenu`__组件已经可以在Menu组件中使用了：

```typescript
export class Menu extends Component {
  render() {
    return (
      <>
        <ToggleableMenu title="First Menu">Some content</ToggleableMenu>
        <ToggleableMenu title="Second Menu">Some content</ToggleableMenu>
        <ToggleableMenu title="Third Menu">Some content</ToggleableMenu>
      </>
    );
  }
}
```

并且它也像我们期望的那样工作了：


![66.gif | left | 647x479](https://cdn.yuque.com/yuque/0/2018/gif/99990/1527235899512-b4cca522-22ab-4d61-a89d-98893679e2c8.gif)


*这中模式在我们想更改渲染的内容，而不关心状态改变的情况下非常有用：可以看到，我们将渲染逻辑移到ToggleableMenu组件的额children函数中了，但把状态管理逻辑保留在我们的Toggleable组件中！*

## 组件注入

为了让我们的组件更灵活，我们可以引入组件注入模式。

什么是组件注入模式呢？如果你对React-Router比较熟悉，那你已经在下面这样路由定义的时候使用这种模式了：

```typescript
<Route path="/foo" component={MyView} />
```

这样我们不是把函数传递给render/children属性，而是通过`component`属性“注入”组件。为此，我们可以重构，把我们的内置render属性函数改成一个可复用的无状态组件：

```typescript
type MenuItemProps = { title: string };
const MenuItem: SFC<MenuItemProps & ToggleableComponentProps> = ({
  title,
  toggle,
  show,
  children,
}) => (
  <>
    <div onClick={toggle}>
      <h1>{title}</h1>
    </div>
    {show ? children : null}
  </>
);
```

有了这个，我们可以使用render属性重构`ToggleableMenu`：

```typescript
type Props = { title: string };
const ToggleableMenu: SFC<Props> = ({ title, children }) => (
  <Toggleable
    render={({ show, toggle }) => (
      <MenuItem show={show} toggle={toggle} title={title}>
        {children}
      </MenuItem>
    )}
  />
);
```

这个完成之后，让我们来开始定义我们新的API——`compoent`属性。

我们需要更新我们的属性API。

* `children`现在可以是函数或者ReactNode（当component属性被使用时）
* `component`是我们新的API，它可以接受实现了`ToggleableComponentProps`属性的组件，并且它需要是设置为any的泛型，这样各种各样的实现组件可以添加其他属性到`ToggleableComponentProps`并通过TS的验证
* `props`我们引入可以传入任意属性的定义。它被定义成any类型的可索引类型，这里我们放松了严格的类型安全检查...

```typescript
// 我们需要使用我们任意的props类型来创建 defaultProps，默认是一个空对象
const defaultProps = { props: {} as { [name: string]: any } };
type Props = Partial<
  {
    children: RenderCallback | ReactNode;
    render: RenderCallback;
    component: ComponentType<ToggleableComponentProps<any>>;
  } & DefaultProps
>;
type DefaultProps = typeof defaultProps;
```

下一步，我们需要添加新的属性API到`ToggleableComponentProps`上，以便用户可以通过`<Toggleable props={...} />`来使用我们的`props`属性：

```typescript
export type ToggleableComponentProps<P extends object = object> = {
  show: State['show'];
  toggle: Toggleable['toggle'];
} & P;
```

然后我们需要更新我们的`render`函数：

```typescript
  render() {
    const {
      component: InjectedComponent,
      props,
      render,
      children,
    } = this.props;
    const renderProps = {
      show: this.state.show,
      toggle: this.toggle,
    };

    // 当 component 属性被使用时，children 是 ReactNode 而不是函数
    if (InjectedComponent) {
      return (
        <InjectedComponent {...props} {...renderProps}>
          {children}
        </InjectedComponent>
      );
    }

    if (render) {
      return render(renderProps);
    }

    return isFunction(children) ? children(renderProps) : null;
  }
```

__完整的Toggleable组件实现如下，支持 render 属性、children作为函数、组件注入功能：__

```typescript
import React, { Component, ReactNode, ComponentType, MouseEvent } from 'react';

import { isFunction, getHocComponentName } from '../utils';

const initialState = { show: false };
const defaultProps = { props: {} as { [name: string]: any } };

type State = Readonly<typeof initialState>;
type Props = Partial<
  {
    children: RenderCallback | ReactNode;
    render: RenderCallback;
    component: ComponentType<ToggleableComponentProps<any>>;
  } & DefaultProps
>;

type DefaultProps = typeof defaultProps;
type RenderCallback = (args: ToggleableComponentProps) => JSX.Element;

export type ToggleableComponentProps<P extends object = object> = {
  show: State['show'];
  toggle: Toggleable['toggle'];
} & P;

export class Toggleable extends Component<Props, State> {
  static readonly defaultProps: Props = defaultProps;
  readonly state: State = initialState;

  render() {
    const {
      component: InjectedComponent,
      props,
      render,
      children,
    } = this.props;
    const renderProps = {
      show: this.state.show,
      toggle: this.toggle,
    };

    if (InjectedComponent) {
      return (
        <InjectedComponent {...props} {...renderProps}>
          {children}
        </InjectedComponent>
      );
    }

    if (render) {
      return render(renderProps);
    }

    return isFunction(children) ? children(renderProps) : null;
  }

  private toggle = (event: MouseEvent<HTMLElement>) =>
    this.setState(updateShowState);
}

const updateShowState = (prevState: State) => ({ show: !prevState.show });
```

我们最终使用`component`属性的`ToggleableMenuViaComponentInjection`组件是这样的：

```typescript
const ToggleableMenuViaComponentInjection: SFC<ToggleableMenuProps> = ({
  title,
  children,
}) => (
  <Toggleable component={MenuItem} props={{ title }}>
    {children}
  </Toggleable>
);
```

__请注意__，这里我们的`props`属性没有严格的类型安全检查，因为它被定义成索引对象类型`{ [name: string]: any }`:


![77.gif | left | 827x279](https://cdn.yuque.com/yuque/0/2018/gif/99990/1527235918861-6dcb910f-df50-4e11-a84e-ed5b40773e80.gif)


我们可以还是像之前一样使用`ToggleableMenuViaComponentInjection`组件来实现菜单渲染：

```typescript

export class Menu extends Component {
  render() {
    return (
      <>
        <ToggleableMenuViaComponentInjection title="First Menu">
          Some content
        </ToggleableMenuViaComponentInjection>
        <ToggleableMenuViaComponentInjection title="Second Menu">
          Another content
        </ToggleableMenuViaComponentInjection>
        <ToggleableMenuViaComponentInjection title="Third Menu">
          More content
        </ToggleableMenuViaComponentInjection>
      </>
    );
  }
}
```

## 泛型组件

在我们视线“组件注入模式”的时候，我们失去了对`props`属性严格的类型安全检查。我们怎样修复这个问题呢？对，你猜到了！我们可以把我们的`Toggleable`组件实现为一个泛型组件！

首先我们需要把我们的属性泛型化。我们使用默认的泛型参数，所以我们不需要在没必要的时候显式地提供类型（针对 render 属性和 children 作为函数）。

```typescript
type Props<P extends object = object> = Partial<
  {
    children: RenderCallback | ReactNode;
    render: RenderCallback;
    component: ComponentType<ToggleableComponentProps<P>>;
  } & DefaultProps<P>
>;
```

我们也需要把`ToggleableComponnetProps`更新成泛型的。不，等等，它已经是泛型啦！所以还不需要做任何更改。

需要更新的是`type DefaultProps`，因为不支持从声明实现推倒出泛型类型定义，所以需要把它重构成传统的类型定义->实现：

```typescript
type DefaultProps<P extends object = object> = { props: P };
const defaultProps: DefaultProps = { props: {} };
```

*就快好啦！*

现在让我们把组件类也泛型化。再次说明，我们使用了默认的属性，所以在没有使用组件注入的时候不需要去指定泛型参数！

```typescript
export class Toggleable<T = {}> extends Component<Props<T>, State> {}
```

这样就完成了吗？嗯…，我们可以在JSX中使用泛型类型吗？

坏消息是，不能...

但我们可以在泛型组件上引入`ofType`的工场模式：

```typescript
export class Toggleable<T = {}> extends Component<Props<T>, State> {
  static ofType<T extends object>() {
    return Toggleable as Constructor<Toggleable<T>>;
  }
}
```

__完整的 Toggleable 组件实现，支持 Render 属性、Children 作为函数、带泛型 props 属性支持的组件注入：__

```typescript
import React, {
  Component,
  ReactNode,
  ComponentType,
  MouseEvent,
  SFC,
} from 'react';

import { isFunction, getHocComponentName } from '../utils';

const initialState = { show: false };
// const defaultProps = { props: {} as { [name: string]: any } };

type State = Readonly<typeof initialState>;
type Props<P extends object = object> = Partial<
  {
    children: RenderCallback | ReactNode;
    render: RenderCallback;
    component: ComponentType<ToggleableComponentProps<P>>;
  } & DefaultProps<P>
>;

type DefaultProps<P extends object = object> = { props: P };
const defaultProps: DefaultProps = { props: {} };
type RenderCallback = (args: ToggleableComponentProps) => JSX.Element;

export type ToggleableComponentProps<P extends object = object> = {
  show: State['show'];
  toggle: Toggleable['toggle'];
} & P;

export class Toggleable<T = {}> extends Component<Props<T>, State> {
  static ofType<T extends object>() {
    return Toggleable as Constructor<Toggleable<T>>;
  }
  static readonly defaultProps: Props = defaultProps;
  readonly state: State = initialState;

  render() {
    const {
      component: InjectedComponent,
      props,
      render,
      children,
    } = this.props;
    const renderProps = {
      show: this.state.show,
      toggle: this.toggle,
    };

    if (InjectedComponent) {
      return (
        <InjectedComponent {...props} {...renderProps}>
          {children}
        </InjectedComponent>
      );
    }

    if (render) {
      return render(renderProps);
    }

    return isFunction(children) ? children(renderProps) : null;
  }

  private toggle = (event: MouseEvent<HTMLElement>) =>
    this.setState(updateShowState);
}

const updateShowState = (prevState: State) => ({ show: !prevState.show });
```

有了`static ofType`工厂函数后，我们可以创建正确类型的泛型组件了。

```typescript
type MenuItemProps = { title: string };
// ofType 是一种标识函数，返回的是相同实现的 Toggleable 组件，但带有制定的 props 类型
const ToggleableWithTitle = Toggleable.ofType<MenuItemProps>();

type ToggleableMenuProps = MenuItemProps;
const ToggleableMenuViaComponentInjection: SFC<ToggleableMenuProps> = ({
  title,
  children,
}) => (
  <ToggleableWithTitle component={MenuItem} props={{ title }}>
    {children}
  </ToggleableWithTitle>
);
```

并且所有的东西都还像一起一样工作，但这次我有的 `props={}` 属性有了正确的类型检查。鼓掌吧！



![Type Safe | left](https://cdn-images-1.medium.com/max/1600/1*cafUgvdK5GHafMKy3ZhWUQ.gi")


## 高阶组件

因为我们已经创建了带render回调功能的`Toggleable`组件，实现HOC也会很容易。（这也是 render 回调函数模式的一个大优势，因为我们可以使用HOC来实现）

> 让我们开始实现我们的HOC组件吧：

我们需要创建：

* displayName (以便我们在devtools可以很好地调试)
* WrappedComponent (以便我们能够获取原始的组件——对测试很有用)
* 使用`hoist-non-react-statics`npm包中的`hoistNonReactStatics`

```typescript
import React, { ComponentType, Component } from 'react';
import hoistNonReactStatics from 'hoist-non-react-statics';

import { getHocComponentName } from '../utils';

import {
  Toggleable,
  Props as ToggleableProps,
  ToggleableComponentProps,
} from './RenderProps';

// OwnProps 是内部组件上任意公开的属性
type OwnProps = object;
type InjectedProps = ToggleableComponentProps;

export const withToggleable = <OriginalProps extends object>(
  UnwrappedComponent: ComponentType<OriginalProps & InjectedProps>,
) => {
  // 我们使用 TS 2.8 中的条件映射类型来得到我们最终的属性类型
  type Props = Omit<OriginalProps, keyof InjectedProps> & OwnProps;

  class WithToggleable extends Component<Props> {
    static readonly displayName = getHocComponentName(
      WithToggleable.displayName,
      UnwrappedComponent,
    );
    static readonly UnwrappedComponent = UnwrappedComponent;

    render() {
      const { ...rest } = this.props;

      return (
        <Toggleable
          render={renderProps => (
            <UnwrappedComponent {...rest} {...renderProps} />
          )}
        />
      );
    }
  }

  return hoistNonReactStatics(WithToggleable, UnwrappedComponent);
};
```

现在我们可以使用HOC来创建我们的`Toggleable`菜单组件了，并有正确的类型安全检查！

```typescript
const ToggleableMenuViaHOC = withToggleable(MenuItem)
```

*一切正常，还有类型安全检查！好极了！*


![99.gif | left | 812x293](https://cdn.yuque.com/yuque/0/2018/gif/99990/1527235945932-3b808e24-17c6-4911-92f8-f054279dfe6f.gif)


## 受控组件

这是最后一个组件模式了！假设我们想从父组件中控制我们的`Toggleable`组件，我们需要`Toggleable`组件配置化。这是一种很强大的模式。让我们来实现它吧。

当我说受控组件时，我指的是什么？我想从`Menu`组件内控制所以的`ToggleableManu`组件的内容是否显示。



![100.gif | left | 656x512](https://cdn.yuque.com/yuque/0/2018/gif/99990/1527235954911-5ce75b6c-1b57-4d22-a6b2-cea2437729db.gif)


我们需要像这样更新我们的`ToggleableMenu`组件的实现：

```typescript
// 更新我们的属性类型，以便我们可以通过 show 属性来控制是否显示
type Props = MenuItemProps & { show?: boolean };

// 注意：这里我们使用了结构来创建变量别，为了不和 render 回调函数的 show 参数冲突
// -> { show: showContent }

// Render 属性
export const ToggleMenu: SFC<ToggleableComponentProps> = ({
  title,
  children,
  show: showContent,
}) => (
  <Toggleable show={showContent}>
    {({ show, toggle }) => (
      <MenuItem title={title} toggle={toggle} show={show}>
        {children}
      </MenuItem>
    )}
  </Toggleable>
);

// 组件注入
const ToggleableWithTitle = Toggleable.ofType<MenuItemProps>();

export const ToggleableMenuViaComponentInjection: SFC<Props> = ({
  title,
  children,
  show: showContent,
}) => (
  <ToggleableWithTitle
    component={MenuItem}
    props={{ title }}
    show={showContent}
  >
    {children}
  </ToggleableWithTitle>
);

// HOC不需要更改
export const ToggleMenuViaHOC = withToggleable(MenuItem);
```

有了这些更新后，我们可以在`Menu`中添加状态，并传递给`ToggleableMenu`

```typescript
const initialState = { showContents: false };
type State = Readonly<typeof initialState>;

export class Menu extends Component<object, State> {
  readonly state: State = initialState;
  render() {
    const { showContents } = this.state;
    return (
      <>
        <button onClick={this.toggleShowContents}>toggle showContent</button>
        <hr />
        <ToggleableMenu title="First Menu" show={showContents}>
          Some Content
        </ToggleableMenu>
        <ToggleableMenu title="Second Menu" show={showContents}>
          Another Content
        </ToggleableMenu>
        <ToggleableMenu title="Third Menu" show={showContents}>
          More Content
        </ToggleableMenu>
      </>
    );
  }
}
```

让我们为了最终的功能和灵活性最后一次更新`Toggleable`组件。为了让 Toggleable 变成受控组件我们需要：

1. 添加`show`属性到`Props`API上
2. 更新默认的属性（因为show是可选的）
3. 从Props.show更新组件的初始化state，因为现在我们状态中值可能取决于父组件传来的属性
4. 在componentWillReceiveProps生命周期函数中从props更新state

__1 & 2__：

```typescript
const initialState = { show: false }
const defaultProps: DefaultProps = { ...initialState, props: {} }
type State = Readonly<typeof initialState>
type DefaultProps<P extends object = object> = { props: P } & Pick<State, 'show'>
```

__3 & 4__：

```typescript
export class Toggleable<T = {}> extends Component<Props<T>, State> {
  static readonly defaultProps: Props = defaultProps
  // Bang operator used, I know I know ...
  state: State = { show: this.props.show! }
  componentWillReceiveProps(nextProps: Props<T>) {
    const currentProps = this.props
    if (nextProps.show !== currentProps.show) {
      this.setState({ show: Boolean(nextProps.show) })
    }
  }
}
```

最终支持所有所有模式（Render属性/Children作为函数/组件注入/泛型组件/受控组件）的 Toggleable 组件：

```typescript
import React, { Component, MouseEvent, ComponentType, ReactNode } from 'react'

import { isFunction, getHocComponentName } from '../utils'

const initialState = { show: false }
const defaultProps: DefaultProps = { ...initialState, props: {} }
type State = Readonly<typeof initialState>
export type Props<P extends object = object> = Partial<
  {
    children: RenderCallback | ReactNode
    render: RenderCallback
    component: ComponentType<ToggleableComponentProps<P>>
  } & DefaultProps<P>
>
type RenderCallback = (args: ToggleableComponentProps) => JSX.Element
export type ToggleableComponentProps<P extends object = object> = {
  show: State['show']
  toggle: Toggleable['toggle']
} & P
type DefaultProps<P extends object = object> = { props: P } & Pick<State, 'show'>

export class Toggleable<T extends object = object> extends Component<Props<T>, State> {
  static ofType<T extends object>() {
    return Toggleable as Constructor<Toggleable<T>>
  }
  static readonly defaultProps: Props = defaultProps
  readonly state: State = { show: this.props.show! }

  componentWillReceiveProps(nextProps: Props<T>, nextContext: any) {
    const currentProps = this.props

    if (nextProps.show !== currentProps.show) {
      this.setState({ show: Boolean(nextProps.show) })
    }
  }
  render() {
    const { component: InjectedComponent, children, render, props } = this.props
    const renderProps = { show: this.state.show, toggle: this.toggle }

    if (InjectedComponent) {
      return (
        <InjectedComponent {...props} {...renderProps}>
          {children}
        </InjectedComponent>
      )
    }

    if (render) {
      return render(renderProps)
    }

    return isFunction(children) ? children(renderProps) : new Error('asdsa()')
  }
  private toggle = (event: MouseEvent<HTMLElement>) => this.setState(updateShowState)
}

const updateShowState = (prevState: State) => ({ show: !prevState.show })
```

__最终的Toggleable HOC 组件 withToggleable__

只需要稍作修改 -> 我们需要在HOC组件中传递 `show` 属性，并更新我们的`OwnProps`API

```typescript
import React, { ComponentType, Component } from 'react'
import hoistNonReactStatics from 'hoist-non-react-statics'

import { getHocComponentName } from '../utils'

import {
  Toggleable,
  Props as ToggleableProps,
  ToggleableComponentProps as InjectedProps,
} from './toggleable'

// OwnProps is for any public props that should be available on internal Component.props
// and for WrappedComponent
type OwnProps = Pick<ToggleableProps, 'show'>

export const withToogleable = <OriginalProps extends object>(
  UnwrappedComponent: ComponentType<OriginalProps & InjectedProps>
) => {
  // we are leveraging TS 2.8 conditional mapped types to get proper final prop types
  type Props = Omit<OriginalProps, keyof InjectedProps> & OwnProps
  class WithToggleable extends Component<Props> {
    static readonly displayName = getHocComponentName(
      WithToggleable.displayName,
      UnwrappedComponent
    )
    static readonly WrappedComponent = UnwrappedComponent
    render() {
      // Generics and spread issue
      // https://github.com/Microsoft/TypeScript/issues/10727
      const { show, ...rest } = this.props as Pick<Props, 'show'> // we need to explicitly pick props we wanna destructure, rest is gonna be type `{}`
      return (
        <Toggleable
          show={show}
          render={renderProps => <UnwrappedComponent {...rest} {...renderProps} />}
        />
      )
    }
  }

  return hoistNonReactStatics(WithToggleable, UnwrappedComponent as any) as ComponentType<Props>
}
```

## 总结

使用 TypeScript 和 React 时，实现恰当的类型安全组件可能会很棘手。但随着 TypeScript 2.8中新加入的功能，我们几乎可以在所有的 React 组件模式中编写类型安全的组件。

在这遍非常长（对此十分抱歉）文章中，感谢TypeScript，我们已经学会了在各种各样的模式下怎么编写严格类型安全检查的组件。

在这些模式中最强的应该是Render属性模式，它让我们可以在此基础上不需要太多改动就可以实现其他常见的模式，如组件注入、高阶组件等。

文中所有的demo都可以在[我的 Github 仓库](https://github.com/Hotell/blogposts/tree/master/2018-02/ultimate-react-component-patterns/src)中找到。

此外，需要明白的是，本文中演示的模版类型安全，只能在使用 VDOM/JSX 的库中实现。

* Angular 模版有 Language service 提供类型安全，但像 ngFor 等简单的构造检查好像都不行...
* Vue 的模版不像 Angular，它们的模版和数据绑定只是神奇的字符串（但这有可能在未来会改变。尽管你可以在模版中使用VDOM，但因为各种类型的属性定义，它使用起来十分笨重（这怪 snabdom...））