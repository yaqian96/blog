---
title: 你不知道的js(中)(第一部分)
date: 2021-05-13
permalink:
categories: 
  - 你不知道的js(中)
tags: 
  - 你不知道的js(中)
---
# 第一部分 类型和语法
## 第一章 类型
### 1.类型
#### 1.1 类型
#### 1.2内置类型
  - null 
  - undefined
  - boolean
  - String
  - number 
  - object
  - symbol(ES6 新增)
```js
typeof function a (){}==='function'
typeof [1,2,3]==='object'
typeof null === 'object'
```
#### 1.3 值和类型
- js中的变量没有类型，而是值有类型
- undefined是声明但是未赋值
- typeof undeclared==='undefined'
   - 通过typeof的安全防范机制来检查undeclared变量。
## 第二章 值
### 2.1 数组  
  - 数组可以通过数字进行索引，也可以包含字符串键值和属性，但这些并不计算在数组的长度内
     - 如果使用字符串键值，则会被强制转换成十进制数字。
  - 类数组 
  ```js
  Array.prototype.slice.call(arguments)
  ```
### 2.2 字符串
  - 是不可变的
  - 可以借助数组的方法来处理字符串的值 
  ```js
  Array.prototype.join.call(a,'.')
  ```
### 2.3 数字
  1. 没有小数的十进制数。"双精度"（64位二进制）
  ```js
  toExponential() //指数转换
  tofixed()    //保留几位小数
  toPrecision(..) //方法用来指定有效数位的显示位数：
  ```
  2. 较小的数值
  ```js
  0.1+0.2===0.3 //在机器精度为2^-52
  ```
  3. 整数的安全范围
     - 2^53 - 1，即 9007199254740991，在 ES6 中被定义为Number.MAX_SAFE_INTEGER。最小整数是 -9007199254740991，在 ES6 中被定义为 Number.MIN_SAFE_INTEGER
  4. 整数的检测
     ```js
      Number.isInteger( 42.000 ); // true
      Number.isInteger( 42.3 ); // false  
     ```
  5. 32位有符号整数
    a|0 //可将数字转换成32位有符号整数
  6. 特殊数值
    - null
    - undefinded
    - NaN
    - Infinity
    - 零值
    - 特殊等式
      ```js
      Object.is(..) // 来判断两个值是否绝对相等，主要用于特殊值的比较
      ```
  7. 值和引用
     - 通过复制的方式来复制/传递，包括 基本类型值
     - 对象，则总是通过引用复制的方式来赋值 / 传递。
## 第三章 原生函数
### 3.1 内部属性 [[Class]]
  - 所有 typeof 返回值为 "object" 的对象（如数组）都包含一个内部属性 [[Class]]
    ```js
    Object.prototype.toString.call( [1,2,3] ) // "[object Array]"
    ```
### 3.2 封装对象包装
  - 将基本类型封装，然后使用对象中的值
### 3.3 拆封
  ```js
  valueOf() //获取封装对象中的基本类型值
  ```
### 3.4 原生函数作为构造函数
  ```js
  Array() 
  Object()
  Function()
  RegExp()
  Date()  //Date.now
  Error()
  Symbol() //常用来命名对象属性
  ```
  - 原生原型
    - .prptotype对象
    ```js
    //Function.prototype 是一个函数，RegExp.prototype 是一个正则表达式，而 Array.prototype 是一个数组。
    ```
## 第四章 强制类型转换
### 4.1 值类型转换
  - 类型转换发生在静态类型语言的编译阶段，强制类型转换则发生在动态类型语言的运行时。
      - 显示强制类型转换
      - 隐式强制类型转换
### 4.2 抽象值操作
  - ToString 
      - null转换"null",undefined 转换"undefined"
      - JSON字符串化
        - toJSON() 返回一个能够被字符串化的安全的JSON值
      ```js
      //JSON.stringify(..) 传递一个可选参数 replacer，它可以是数组或者函数，用来指定对象序列化过程中哪些属性应该被处理，哪些应该被排除，
      JSON.stringify( a, function(k,v){
      if (k !== "c") return v;
      } );
      // "{"b":42,"d":[1,2,3]}"
      //JSON.string 还有一个可选参数 space，用来指定输出的缩进格式。也可以传入特殊字符用于首行的缩入
      var a = { 
          b: 42,
          c: "42",
          d: [1,2,3] 
          };
          JSON.stringify( a, null, 3 );
          // "{
          // "b": 42,
          // "c": "42",
          // "d": [
          // 1, 
          // 2,
          // 3
          // ]
          // }"
      ```
  - ToNumber
      - true 转换为 1，false 转换为 0。undefined 转换为 NaN，null 转换为 0。[] 转换为0,""转换为0,['a','b','c']转换成NaN
      - 对于0开头的十六进制数按照十进制进行处理
  - ToBoolean
      - 假值(falsy value)
      ```js
      undefined
      null
      false
      +0、-0 和 NaN
      ""
      ```
      - 假值对象（falsy object）----包装了假值的封装对象
      - 真值(truthy value)
### 4.3 显示强制类型转换
  - 字符串和数字之间的显式转换 String() Number()  toString() 
  ```js
    var c = "3.14";
    var d = +c; 
    <!-- d===3.14 -->
  ```
  ```js
  //日期显示转换为数字
  var d = new Date( "Mon, 18 Aug 2014 08:53:06 CDT" );
  +d; // 1408369986000
  ```
  - 奇特的~运算符  ~42===-43
  - 字位截除~~
  - 显示解析数字字符串  返回的结果都是数字
    - parseInt() parseFloat()
  - 显示转换为布尔值 Boolean()
### 4.4 隐式强制类型转换
  - 字符串和数字之间的隐式强制类型转换
      ```js
      []+{} //"[object Object]"
      {}+[] //0
      42+""===""+42 //42
      [3]-[1] //2
      ```
  - 布尔值到数字的隐式强制类型转换
  - 隐式强制类型转换为布尔值
    - (1) if (..) 语句中的条件判断表达式。
    - (2) for ( .. ; .. ; .. ) 语句中的条件判断表达式（第二个）。
    - (3) while (..) 和 do..while(..) 循环中的条件判断表达式。
    - (4) ? : 中的条件判断表达式。
    - (5) 逻辑运算符 ||（逻辑或）和 &&（逻辑与）左边的操作数（作为条件判断表达式）。
  - ||和&&
    - a||b 类似a?a:b   a&&b 类似a?b:a
  - 符号的强制类型转换
   ```js
    var s1 = Symbol( "cool" );
    String( s1 ); // "Symbol(cool)"
    var s2 = Symbol( "not cool" );
    s2 + ""; // TypeError
   ```
### 4.5 宽松相等和严格相等
  - == 允许在相等比较中进行强制类型转换，而 === 不允许。
      - NaN 不等于 NaN 
      - +0 等于 -0
  ```js
  var a = "42";
  var b = true;
  a == b; // false (1) 如果 Type(x) 是布尔类型，则返回 ToNumber(x) == y 的结果；(2) 如果 Type(y) 是布尔类型，则返回 x == ToNumber(y) 的结果。
  // null和undefined的比较 
  //  (1) 如果 x 为 null，y 为 undefined，则结果为 true。
  // (2) 如果 x 为 undefined，y 为 null，则结果为 true。
  // 对象与非对象相等比较
  // (1) 如果 Type(x) 是字符串或数字，Type(y) 是对象，则返回 x == ToPrimitive(y) 的结果；
  // (2) 如果 Type(x) 是对象，Type(y) 是字符串或数字，则返回 ToPromitive(x) == y 的结果。
  var a = 42;
  var b = [ 42 ];
  a == b; // true
  ```
  比较少见的情况
  ```js
  Number.prototype.valueOf = function() {
    return 3;
  };
  new Number( 2 ) == 3; // true
  "0" == null; // false
  "0" == undefined; // false
  "0" == false; // true -- 晕！
  "0" == NaN; // false
  "0" == 0; // true
  "0" == ""; // false
  false == null; // false
  false == undefined; // false
  false == NaN; // false
  false == 0; // true -- 晕！
  false == ""; // true -- 晕！
  false == []; // true -- 晕！
  false == {}; // false
  "" == null; // false
  "" == undefined; // false
  "" == NaN; // false
  "" == 0; // true -- 晕！
  "" == []; // true -- 晕！
  "" == {}; // false
  0 == null; // false
  0 == undefined; // false
  0 == NaN; // false
  0 == []; // true -- 晕！
  0 == {}; // false
  []==![]  //true
  2 == [2]; // true
  "" == [null]; // true
  ```
### 4.6 抽象关系比较
  - `ToPrimitive抽象规则`: 将对象转换为基本数据类型。
  ```js
    <!-- 如何让a===1&&a===2&&a===3    -----true -->
    let val = 1
    Object.defineProperty(window, 'a', {
      get () {
        return this.val++ // 这里的this就是全局对象window
      }
    })
    console.log(a === 1 && a === 2 && a === 3) // true
    <!-- 类型执行的三种方法 -->
  ```
  - 执行的机制
    - 会传递一个参数hint,表示这是一个什么类型的运算。根据参数的值，则进行计算。srring、number、default
      - 如果存在，调用 obj[Symbol.toPrimitive](hint)；否则，如果 hint 取值是 "string"：
        无论是否存在，调用 obj.toString() 和 obj.valueOf()。否则（也就是 hint 取值是 "number" 或 "default" 的情况）：
        无论是否存在，调用 obj.valueOf() 和 obj.toString()。
    ```js
     let user = {
        name: "John",
        money: 1000,

        [Symbol.toPrimitive](hint) {
          console.log(`hint: ${hint}`);
        }
      };

      alert(user) // hint: string 
      +user // hint: number
      user + 500 // hint: default
      // 但要注意下面两点：
      // 1. Symbol.toPrimitive 和 toString 方法的返回值必须是基本类型值。
      // 2. valueOf 方法除了可以返回基本类型值，也可以返回其他类型值。

      <!-- 对于一般的普通对象到基本类型值的运算，一般按照以下场景
       1. `hint` 值为 "string" 时，先调用 `toString`，`toString` 如果返回一个基本类型值了，则返回、终止运算；否则接着调用 `valueOf` 方法。
       2. 否则，先调用 `valueOf`，`valueOf` 如果返回一个基本类型值了，则返回、终止运算；否则接着调用 `toString` 方法。
       -->
    ```
## 第五章 语法
### 5.1 语句和表达式
  - 语句的结果值(每个语句都有一个具体的值)
  - 表达式的副作用,指的是表达式中的值有时改变，导致再次调用的值不一致
  - 上下文规则 
    - 1. 大括号
        - 对象常量
        - 标签
    - 2. 代码块
    - 3. 对象结构
    - 4. else if和可选代码块
        - js中没有else if,但是if和else只包含单条语句的时候可以省略代码块
### 5.2 运算符优先级
  - 短路 && ||
  - 更强的绑定
  - 关联(与运算符的执行顺序不一致)
### 5.3 自动分号
  - ASI,缺少分号会自动补齐，但是一些必要的分号必须填补完整，否则会报错
### 5.4 错误
  - 使用try catch用于捕获错误。
  - 提前使用变量TDZ(暂时性死区，由于代码中的变量还没有初始化而不能被引用的情况)
### 5.5 函数参数
  - ES6的参数默认值
### 5.6 try..finally
  - finally 会覆盖掉try和catch中return的返回值
### 5.7 switch
