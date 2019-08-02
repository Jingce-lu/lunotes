TypeScript 2 特性
===

<!-- TOC -->

- [TypeScript 2 特性](#typescript-2-特性)
  - [keyof 与查找类型](#keyof-与查找类型)
  - [映射类型](#映射类型)
  - [Partial, Readonly, Record 以及 Pick](#partial-readonly-record-以及-pick)
  - [动态导入 (import) 表达式](#动态导入-import-表达式)
  - [将返回类型作为推断目标](#将返回类型作为推断目标)

<!-- /TOC -->

## keyof 与查找类型
在 JavaScript 生态里常常会有 API 接受属性名称作为参数的情况, 但到目前为止还无法表达这类 API 的类型关系.

入口索引类型查询或者说 keyof; 索引类型查询 keyof T 会得出 T 可能的属性名称的类型. keyof T 类型被认为是 string 的子类型.

例子
```ts
interface Person {
    name: string;
    age: number;
    location: string;
}

type K1 = keyof Person; // "name" | "age" | "location"
type K2 = keyof Person[];  // "length" | "push" | "pop" | "concat" | ...
type K3 = keyof { [x: string]: Person };  // string
```

与之对应的是索引访问类型, 也叫作查找类型 (lookup types). 语法上, 它们看起来和元素访问完全相似, 但是是以类型的形式使用的:

例子
```ts
type P1 = Person["name"];  // string
type P2 = Person["name" | "age"];  // string | number
type P3 = string["charAt"];  // (pos: number) => string
type P4 = string[]["push"];  // (...items: string[]) => number
type P5 = string[][0];  // string
```

你可以将这种形式与类型系统中的其他功能组合, 来获得类型安全的查找.

```ts
function getProperty<T, K extends keyof T>(obj: T, key: K) {
    return obj[key];  // 推断的类型为 T[K]
}

function setProperty<T, K extends keyof T>(obj: T, key: K, value: T[K]) {
    obj[key] = value;
}

let x = { foo: 10, bar: "hello!" };

let foo = getProperty(x, "foo"); // number
let bar = getProperty(x, "bar"); // string

let oops = getProperty(x, "wargarbl"); // 错误! "wargarbl" 不满足类型 "foo" | "bar"

setProperty(x, "foo", "string"); // 错误! string 应该是 number
```


## 映射类型
一个常见的需求是取一个现有的类型, 并将他的所有属性转换为可选值. 假设我们有 Person 类型:
```ts
interface Person {
    name: string;
    age: number;
    location: string;
}
```

它的部分类型 (partial) 的版本会是这样:
```ts
interface PartialPerson {
    name?: string;
    age?: number;
    location?: string;
}
```

有了映射类型, PartialPerson 就可以被写作对于 Person 类型的一般化转换:
```ts
type Partial<T> = {
    [P in keyof T]?: T[P];
};

type PartialPerson = Partial<Person>;
```

映射类型是获取字面量类型的并集, 再通过计算新对象的属性集合产生的. 它们和 Python 中的列表解析 相似, 但不是在列表中创建新的元素, 而是在类型中创建新的属性.

除了 **Partial** 之外, 映射类型可以表达很多有用的类型转换:
```ts
// 保持类型一致, 但使每一个属性变为只读
type Readonly<T> = {
    readonly [P in keyof T]: T[P];
};

// 相同的属性名称, 但使值为 Promise 而不是具体的值
type Deferred<T> = {
    [P in keyof T]: Promise<T[P]>;
};

// 为 T 的属性添加代理
type Proxify<T> = {
    [P in keyof T]: { get(): T[P]; set(v: T[P]): void }
};
```


## Partial, Readonly, Record 以及 Pick
`Partial` 与 `Readonly`, 就像之前提到的, 是非常有用的结构. 你可以使用它们来描述一些常见的 JS 实践, 比如:

```ts
function assign<T>(obj: T, props: Partial<T>): void;
function freeze<T>(obj: T): Readonly<T>;
```

正因为如此, 它们现在默认被包含在了标准库中.

我们还引入了另外两种工具类型: `Record` 和 `Pick`.

```ts
// 从 T 挑选一些属性 K
declare function pick<T, K extends keyof T>(obj: T, ...keys: K[]): Pick<T, K>;

const nameAndAgeOnly = pick(person, "name", "age");  // { name: string, age: number }

// 对所有 T 类型的属性 K, 将它转换为 U
function mapObject<K extends string | number, T, U>(obj: Record<K, T>, f: (x: T) => U): Record<K, U>;

const names = { foo: "hello", bar: "world", baz: "bye" };
const lengths = mapObject(names, s => s.length);  // { foo: number, bar: number, baz: number }
```


## 动态导入 (import) 表达式
动态 `import` 表达式是 ECMAScript 的新特性之一, 它让用户可以在程序的任意位置异步地请求一个模块.

这意味着你可以在条件恰当的情况下延迟加载其他模块和库. 举例来说, 下面的 async 函数在需要的时候才会导入相应工具库:
```ts
async function getZipFile(name: string, files: File[]): Promise<File> {
    const zipUtil = await import('./utils/create-zip-file');
    const zipContents = await zipUtil.getContentAsBlob(files);
    return new File(zipContents, name);
}
```

很多打包工具支持基于这样的 import 表达式自动分割结果, 所以可以考虑搭配 esnext 编译目标来使用这一新功能.



## 将返回类型作为推断目标
其一, TypeScript 现在可以对函数调用的返回值进行推断. 这可以提升你的使用体验并捕获更多错误. 一个现在可用的例子:
```ts
function arrayMap<T, U>(f: (x: T) => U): (a: T[]) => U[] {
    return a => a.map(f);
}

const lengths: (a: string[]) => number[] = arrayMap(s => s.length);
```

另一个你可能会遇上的错误的例子:
```ts
let x: Promise<string> = new Promise(resolve => {
    resolve(10);
    //      ~~ 错误!
});
```