---
title: 你不知道的js(下)(第二部分)
date: 2021-05-17 15:00:00
permalink:
categories:
  - 你不知道的js(下)
tags:
  - 你不知道的js(下)
---

# 第一章 ES? 现在与未来

## 1.1 版本

- ES2016(ES7)

## 1.2 transpiling

- 工具化(transpiling（transformation ＋ compiling，转换＋编译）的技术)
- shim/polyfill
  - 并非所有的 ES6 新特性都需要使用 transpiler，还有 polyfill（也称为 shim）这种模式。

## 1.3 小结

# 第二章 语法

## 2.1 块作用域声明

- 创建的方法：1.立即调用函数表达式 2.let
- let 声明
  - { } 可以创建一个块级作用域
  - 在 let 声明 / 初始化之前访问 let 声明的变量会导致错误，而使用 var 的话这个顺序是无关紧要的（除了代码风格方面）。

```js
var funcs = [];
for (let i = 0; i < 5; i++) {
  funcs.push(function() {
    console.log(i);
  });
}
funcs[3](); // 3
// for 循环头部的 let i 不只为 for 循环本身声明了一个 i，而是为循环的每一次迭代都重新声明了一个新的 i。
```

- const 声明
  - 设定了初始值之后就只读的变量
  - 如果这个值是复杂值，比如对象或者数组，其内容仍然是可以修改的。
- 块作用域函数
  - 块内声明的函数，其作用域在这个块内。会在块内提升。

## 2.2 spread/rest(展开或者收集)运算符

- arguments 数组转换成数组的方法
  - Array.prototype.slice.call( arguments );
  - 使用...args 收集数据

## 2.3 　默认参数值

```js
function foo(x = 11, y = 31) {
  console.log(x + y);
}
foo(); // 42
foo(5, 6); // 11
foo(0, 42); // 42
foo(5); // 36
foo(5, undefined); // 36 <-- 丢了undefined
foo(5, null); // 5 <-- null被强制转换为0
foo(undefined, 6); // 17 <-- 丢了undefined
foo(null, 6); // 6 <-- null被强制转换为0
// 设置默认参数值时会经过一些隐式转换，需要注意....
```

- 默认表达式
  - 形式参数只是在它们自己的作用域中。

## 2.4 　解构

- 对象属性赋值模式
- 不只是声明
- 重复赋值

```js
var {
  a: { x: X, x: Y },
  a,
} = { a: { x: 1 } };
```

```js
var o = { a: 1, b: 2, c: 3 },
  a,
  b,
  c,
  p;
p = { a, b, c } = o;
console.log(a, b, c); // 1 2 3
p === o; // true
```

## 2.5 　太多，太少，刚刚好

- 对于数组解构和对象解构赋值来说，按需进行赋值。
- undefined 就是缺失。
- 默认值赋值
- 嵌套解构
- 解构参数

```js
function foo([x, y]) {
  console.log(x, y);
}
foo([1, 2]); // 1 2
foo([1]); // 1 undefined
foo([]); // undefined undefined
```

## 2.6 对象字面量扩展

- 简洁属性 x:x 简写成 x
- 简洁方法 x:function() 简写成 x()
- 计算属性名
  - 最常用的是与 Symblod 共同使用，[Symbol.toStringTag]
  ```js
  var prefix = "user_";
  var o = {
  baz: function(..){ .. },
  [ prefix + "foo" ]: function(..){ .. },
  [ prefix + "bar" ]: function(..){ .. }
  ..
  };
  ```
- 设定 [[Prototype]]
  - Object.setPrototypeOf(..)
  - super 对象

## 2.7 　模板字面量

- ``

## 2.8 　箭头函数

- 箭头函数总是函数表达式；并不存在箭头函数声明。我们还应清楚箭头函数是匿名函数表达式

## 2.9 for..of 循环

- 循环的值实在迭代器产生的一系列值上循环。iterable 就是一个能够产生迭代器供循环使用的对象。
- js 中默认行为（或提供）iterable 的标准内建值包括：
  1.  Arrays
  2.  Strings
  3.  Generators
  4.  Collections / TypedArrays

## 2.10 　正则表达式

- Unicode 标识 /u
- 定点标识 y
- flags(用来判断正则表达式对象应用了哪些标识)

## 2.11 　数字字面量扩展

- 支持十进制、八进制、二进制

## 2.12 Unicode

- 支持一些特殊的'雪人'符号等

## 2.13 　符号

- Symbol
  • 不能也不应该对 Symbol(..) 使用 new。它并不是一个构造器，也不会创建一个对象。
  • 传给 Symbol(..) 的参数是可选的。如果传入了的话，应该是一个为这个 symbol 的用途
  给出用户友好描述的字符串。
  • typeof 的输出是一个新的值 ("symbol")，这是识别 symbol 的首选方法。

# 第三章 代码组织

## 3.1 　迭代器

- 迭代器是一种有序的、连续的、基于拉取的用于消耗数据的组织方式。
- 接口

```js
 Iterator [required]
 next() {method}: 取得下一个IteratorResult
 Iterator [optional]
 return() {method}: 停止迭代器并返回IteratorResult
 throw() {method}: 报错并返回IteratorResult
 IteratorResult
 value {property}: 当前迭代值或者最终返回值（如果undefined为可选的）
 done {property}: 布尔值，指示完成
 -------------------------------------
 // 还有一个 Iterable 接口，用来表述必需能够提供生成器的对象：
Iterable
  @@iterator() {method}: 产生一个 Iterator
```

- next() 迭代

```js
var arr = [1, 2, 3];
var it = arr[Symbol.iterator]();
it.next(); // { value: 1, done: false }
it.next(); // { value: 2, done: false }
it.next(); // { value: 3, done: false }
it.next(); // { value: undefined, done: true }
```

- 可选的 return(..) 和 throw(..)
  - throw(..) 用于向迭代器报告一个异常 / 错误，迭代器针对这个信号的反应可能不同于针对 return(..) 意味着的完成信号。
- 迭代器循环 for...of
- 自定义迭代器
- 迭代器消耗
  - 例如数组解构......

## 3.2 　生成器

- 每次暂停或者恢复循环都提供了一个双向信息传递的机会

```js
function* foo() {
  var x = 10;
  var y = 20;
  yield;
  var z = x + y;
}
// yield一般出现在赋值表达式的位置上，优先级别很低，几乎所有的值先执行，后边再执行。右结合。
// yield *function() yield委托
```

- 迭代器控制
  - 使用 next()与 yield 配合使用，next()比 yield 多调用一次
- 提前完成
  - 可以通过生成器上附着的迭代器支持可选的 return()和 throw()方法。立即终止一个暂停的生成器的效果。
  - 不要将 yield 放在 finally 里边
- 错误处理(使用 try catch 代码块)
- Transpile 生成器
- 使用场景

1. 产生一系列的值
2. 顺序执行的任务队列

## 3.3 　模块

- 概念

```js
//ES6 使用基于文件的模块，也就是说一个文件一个模块
//ES6模块的API是静态的
//ES6 模块是单例。
//模块的公开 API 中暴露的属性和方法并不仅仅是普通的值或引用的赋值。它们是到内部模块定义中的标识符的实际绑定
//导入模块和静态请求加载
```

- 新方法

```js
//import export  不能把 import 或 export 放在 if 条件中；它们必须出现在所有代码块和函数的外面
import FOOFN, { bar, baz as BAZ } from "foo"; //引入按需，将其中的函数解构出来。
```

- 模块依赖环（不同的引入，产生不同的包则作用域不同，之间不会相互影响）
- 模块加载
  - import 语句使用外部环境（浏览器、Node.js 等）提供的独立机制，来实际把模块标识符字符串解析成可用的指令，用于寻找和加载所需的模块。这个机制就是系统模块加载器
    <!-- <script type="module">
    <> -->

1. 模块之外加载模块
2. 自定义加载

## 3.4 　类

```js
class Foo {
  constructor(a, b) {
    this.x = a;
    this.y = b;
  }
  gimmeXY() {
    return this.x * this.y;
  }
}
class Bar extends Foo {
  constructor(a, b, c) {
    super(a, b);
    this.z = c;
  }
  gimmeXYZ() {
    return super.gimmeXY() * this.z;
  }
}
var b = new Bar(5, 15, 25);
b.x; // 5
b.y; // 15
b.z; // 25
b.gimmeXYZ(); // 1875
```

- new.target(元属性)
  - 在任何构造器中，new.target 总是指向 new 实际上直接调用的构造器
- static
  - 添加到类的函数对象上
  ```js
  class Foo {
    static cool() {
      console.log("cool");
    }
    wow() {
      console.log("wow");
    }
  }
  class Bar extends Foo {
    static awesome() {
      super.cool();
      console.log("awesome");
    }
    neat() {
      super.wow();
      console.log("neat");
    }
  }
  Foo.cool(); // "cool"
  Bar.cool(); // "cool"
  Bar.awesome(); // "cool"
  // "awesome"
  var b = new Bar();
  b.neat(); // "wow"
  // "neat"
  b.awesome; // undefined
  b.cool; // undefined
  ```

## 3.5 小结

# 第四章 异步流控制

- 参考`你不知道的js中`

# 第五章 集合

- 5.1 TypedArray
  - 大小端（Endianness）
    - 大小端的意思是多字节数字（比如前面代码片段中创建的 16 位无符号整型）中的低字节（8 位）位于这个数字字节表示中的右侧还是左侧。
    - 最常用的是小端表示方式
  - 多视图
    ```js
    var buf = new ArrayBuffer(2);
    var view8 = new Uint8Array(buf);
    var view16 = new Uint16Array(buf);
    view16[0] = 3085;
    view8[0]; // 13
    view8[1]; // 12
    view8[0].toString(16); // "d"
    view8[1].toString(16); // "c"
    // 交换（就像大小端变换一样！）
    var tmp = view8[0];
    view8[0] = view8[1];
    view8[1] = tmp;
    view16[0]; // 3340
    ```
  - 带类数组构造器
    • Int8Array（8 位有符号整型），Uint8Array（8 位无符号整型）
    ——Uint8ClampedArray（8 位无符号整型，每个值会被强制设置为在 0-255 内）；
    • Int16Array（16 位有符号整型）, Uint16Array（16 位无符号整型）；
    • Int32Array（32 位有符号整型）, Uint32Array（32 位无符号整型）；
    • Float32Array（32 位浮点数， IEEE-754）；
    • Float64Array（64 位浮点数， IEEE-754）。
- 5.2 Map
  - 因对象作为映射的主要缺点是不能使用非字符串值作为键。
  ```js
  var m = new Map():
  var x = { id: 1 },
  y = { id: 2 };
  m.set( x, "foo" );
  m.set( y, "bar" );
  m.get( x ); // "foo"
  m.get( y ); // "bar"
  m.delete( y );
  m.clear(); //清除所有
  m.size;    //长度
  m.values() //得到map所有的值
  m.keys()  //得到所有的键
  m.has() //map中有给定的键
  ```
- 5.3 WeakMap(Weak-KeyMap)
  - 与 Map 区别：区别在于内部内存分配（特别是其 GC）的工作方式。
  - WeakMap（只）接受对象作为键
    这些对象是被弱持有的，也就是说如果对象本身被垃圾回收的话，在 WeakMap 中的这个项目也会被移除。然而我们无法观测到这一点，因为对象被垃圾回收的唯一方式是没有对它的引用了。但是一旦不再有引用，你也就没有对象引用来查看它是否还存在于这个 WeakMap 中了。
  ```js
  var m = new WeakMap();
  var x = { id: 1 },
    y = { id: 2 };
  m.set(x, "foo");
  m.has(x); // true
  m.has(y); // false
  ```
- 5.4 Set(set 是一个值的集合，其中的值唯一（重复会被忽略）。)

```js
var s = new Set();
var x = { id: 1 },
  y = { id: 2 };
s.add(x);
s.add(y);
s.add(x);
s.size; // 2
s.delete(y);
s.size; // 1
s.clear();
s.size; // 0
s.has(x);
s.keys();
s.values();
s.entries();
```

set 的唯一性不允许强制转换，所以 1 和 "1" 被认为是不同的值

- 5.5 WeakSet
  - WeakSet 的值必须是对象，而并不像 set 一样可以是原生类型值。

# 第六章 新增 API

- Array

```js
var c = Array.of(1, 2, 3);
c.length; // 3
c;
Array.from() //将类数组转换成数组,第二个参数是映射回调
  [(1, 2, 3, 4, 5)].copyWithin(3, 0); //copyWithin(..) 从一个数组中复制一部分到同一个数组的另一个位置，覆盖这个位置所有原来的值。
var a = [null, null, null, null].fill(42, 1, 3); //fill(..) 可选地接收参数 start 和 end，它们指定了数组要填充的子集位置
a.find();
a.findIndex();
a.values();
a.keys();
a.entries();
```

- Object

```js
Object.is(..) // 执行比 === 比较更严格的值比较。
Object.getOwnPropertySymbols(..) //它直接从对象上取得所有的符号属性：
Object.setPrototypeOf(..)  //行为委托
Object.assign(..) // 对象的复制
```

- Math

```js
三角函数：
cosh(..)
双曲余弦函数
acosh(..)
双曲反余弦函数
sinh(..)
双曲正弦函数
asinh(..)
双曲反正弦函数
tanh(..)
双曲正切函数
atanh(..)
双曲反正切函数
hypot(..)
平方和的平方根（也即：广义勾股定理）
算术：
cbrt(..)
立方根
clz32(..)
计算 32 位二进制表示的前导 0 个数
expm1(..)
等价于 exp(x) - 1
log2(..)
二进制对数（以 2 为底的对数）
log10(..)
以 10 为底的对数
log1p(..)
等价于 log(x + 1)
imul(..)
两个数字的 32 位整数乘法
元工具：
sign(..)
返回数字符号
trunc(..)
返回数字的整数部分
fround(..)
向最接近的 32 位（单精度）浮点值取整
```

- Number

```js
Number.parseInt(..)
Number.parseFloat(..)
Number.EPSILON
Number.MAX_SAFE_INTEGER
Number.MIN_SAFE_INTEGER
Number.isNaN(..)
Number.isFinite(..)
Number.isInteger(..) ，
Number.isSafeInteger(..)
```

- 字符串

```js
String.fromCodePoint(..)
String#codePointAt(..)
String#normalize(..)
String.raw(..)
"foo".repeat( 3 );
startsWith(..)
endsWidth(..)
includes(..)
```

# 第七章 元编程

- 对程序的编程的编程
- 代码查看自身、代码修改自身、代码修改默认语言特性，以此影响其他代码。
- 7.1 函数名称

```js
(function(){ .. }); // name:
(function*(){ .. }); // name:
window.foo = function(){ .. }; // name:
class Awesome {
 constructor() { .. } // name: Awesome
 funny() { .. } // name: funny
}
var c = class Awesome { .. }; // name: Awesome
var o = {
 foo() { .. }, // name: foo
 *bar() { .. }, // name: bar
 baz: () => { .. }, // name: baz
 bam: function(){ .. }, // name: bam
 get qux() { .. }, // name: get qux
 set fuz() { .. }, // name: set fuz
 ["b" + "iz"]:
 function(){ .. }, // name: biz
 [Symbol( "buz" )]:
 function(){ .. } // name: [buz]
};
var x = o.foo.bind( o ); // name: bound foo
(function(){ .. }).bind( o ); // name: bound
export default function() { .. } // name: default
var y = new Function(); // name: anonymous
var GeneratorFunction =
 function*(){}.__proto__.constructor;
var z = new GeneratorFunction(); // name: anonymous
```

- 7.2 元属性
- 7.3 公开符号

```js
Symbol.iterator;
//Symbol.toStringTag 与 Symbol.hasInstance
function Foo(greeting) {
  this.greeting = greeting;
}
Foo.prototype[Symbol.toStringTag] = "Foo";
Object.defineProperty(Foo, Symbol.hasInstance, {
  value: function(inst) {
    return inst.greeting == "hello";
  },
});
var a = new Foo("hello"),
  b = new Foo("world");
b[Symbol.toStringTag] = "cool";
a.toString(); // [object Foo]
String(b); // [object cool]
a instanceof Foo; // true
b instanceof Foo; // false
//Symbol.species 这个符号控制要生成新实例时，类的内置方法使用哪一个构造器。
//Symbol.toPrimitive 抽象类型转换运算
//正则表达式符号
Symbol.match;
Symbol.replace;
Symbol.split;
Symbol.search;
Symbol.isConcatSpreadable;
Symbol.unscopables;
```

- 7.4 代理
- 在普通函数上进行一层拦截，进行处理函数，对数据进行处理

```js
// 在目标对象 / 函数代理上可以定义的处理函数，以及它们如何 / 何时被触发。
// get(..)
 通过 [[Get]]，在代理上访问一个属性（Reflect.get(..)、. 属性运算符或 [ .. ] 属性运算符）
// set(..)
通过 [[Set]]，在代理上设置一个属性值（Reflect.set(..)、赋值运算符 = 或目标为对象属性的解构赋值）
// deleteProperty(..)
通 过 [[Delete]]， 从 代 理 对 象 上 删 除 一 个 属 性（Reflect.deleteProperty(..) 或 delete）
// apply(..)（如果目标为函数）
 通 过 [[Call]]，将代理作为普通函数 / 方 法 调 用（Reflect.apply(..)、call(..)、apply(..) 或 (..) 调用运算符）
// construct(..)（如果目标为构造函数）
通过 [[Construct]]，将代理作为构造函数调用（Reflect.construct(..) 或 new）
//getOwnPropertyDescriptor(..)
通过 [[GetOwnProperty]]，从代理中提取一个属性描述符（Object.getOwnPropertyDescriptor(..)或 Reflect.getOwnPropertyDescriptor(..)）
//defineProperty(..)
通过 [[DefineOwnProperty]]，在代理上设置一个属性描述符（Object.defineProperty(..)或 Reflect.defineProperty(..)）
// getPrototypeOf(..)
通 过 [[GetPrototypeOf]]，得到代理的 [[Prototype]]（Object.getPrototypeOf(..)、Reflect.getPrototypeOf(..)、__proto__、Object#isPrototypeOf(..) 或 instanceof）
//setPrototypeOf(..)
通 过 [[SetPrototypeOf]]，设置代理的 [[Prototype]]（Object.setPrototypeOf(..)、Reflect.setPrototypeOf(..) 或 __proto__）
//preventExtensions(..)
通过 [[PreventExtensions]]，使得代理变成不可扩展的（Object.prevent Extensions(..)或 Reflect.preventExtensions(..)）
//isExtensible(..)
通过 [[IsExtensible]]，检测代理是否可扩展（Object.isExtensible(..) 或 Reflect.isExtensible(..)）
//ownKeys(..)
通过 [[OwnPropertyKeys]]，提取代理自己的属性和 / 或符号属性（Object.keys(..)、Object.getOwnPropertyNames(..)、Object.getOwnSymbolProperties(..)、Reflect.ownKeys(..) 或 JSON.stringify(..)）
//enumerate(..)
通过 [[Enumerate]]，取得代理拥有的和“继承来的”可枚举属性的迭代器（Reflect.enumerate(..) 或 for..in）
//has(..)
通过 [[HasProperty]]，检查代理是否拥有或者“继承了”某个属性（Reflect.has(..)、Object#hasOwnProperty(..) 或 "prop" in obj）
```

- 可取消代理

```js
var obj = { a: 1 },
  handlers = {
    get(target, key, context) {
      // 注意：target === obj,
      // context === pobj
      console.log("accessing: ", key);
      return target[key];
    },
  },
  { proxy: pobj, revoke: prevoke } = Proxy.revocable(obj, handlers);
pobj.a;
// accessing: a
// 1
// 然后：
prevoke();
pobj.a;
// TypeError
```

- 使用代理
  代理在先，完全跟代理进行交互，代理在后，将目标将代理进行交流。

```js
// 实现访问一个不存在的对象时，希望报错
// 代理在前
var obj = {
    a: 1,
    foo() {
      console.log("a:", this.a);
    },
  },
  handlers = {
    get(target, key, context) {
      if (Reflect.has(target, key)) {
        return Reflect.get(target, key, context);
      } else {
        throw "No such property/method!";
      }
    },
    set(target, key, val, context) {
      if (Reflect.has(target, key)) {
        return Reflect.set(target, key, val, context);
      } else {
        throw "No such property/method!";
      }
    },
  },
  pobj = new Proxy(obj, handlers);
pobj.a = 3;
pobj.foo(); // a: 3
// 代理在后
var handlers = {
    get() {
      throw "No such property/method!";
    },
    set() {
      throw "No such property/method!";
    },
  },
  pobj = new Proxy({}, handlers),
  obj = {
    a: 1,
    foo() {
      console.log("a:", this.a);
    },
  };
// 设定obj回退到pobj
Object.setPrototypeOf(obj, pobj);
obj.a = 3;
obj.foo(); // a: 3
obj.b = 4; // Error: No such property/method!
obj.bar(); // Error: No such property/method!
```

- Reflect API
- 属性排序
- 7.6 特性测试
  - 用来判断一个特性是否可用的测试
  - FeatureTests.io
- 7.7 尾递归调用
  - 尾调用是一个 return 函数调用的语句，除了调用后返回其返回值之外没有任何其他动作。
  - 尾调用重写
    - 在函数的结尾处，return 一个函数
  - 非 TCO 优化
  ```js
  "use strict";
  function trampoline(res) {
    while (typeof res == "function") {
      res = res();
    }
    return res;
  }
  var foo = (function() {
    function _foo(acc, x) {
      if (x <= 1) return acc;
      return function partial() {
        return _foo(x / 2 + acc, x - 1);
      };
    }
    return function(x) {
      return trampoline(_foo(1, x));
    };
  })();
  foo(123456); // 3810376848.5
  ```
  - 元在何处
    - 可以在运行时判断引擎支持哪些特性，特性中包含TCO
# 第八章 ES6 之后
## 8.1 异步编程
- async await 
## 8.2 Object.observe(..)
## 8.3 幂运算符
## 8.4 对象属性与 ...
## 8.5 Array#includes(..)
## 8.6 SIMD
## 8.7 WebAssembly (WASM)