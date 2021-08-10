---
title: ts
date: 2021-08-09
permalink: 
categories: 
  - ts
tags: 
  - ts
---
# 如何将ts转换成js
```js
1. 安装步骤：npm/cnpm install -g typescript
2. tsc -v (查看版本是否安装成功)
3. demo文件下detail步骤操作
   i:新建一个demo.html 页面【引用demo.js】
   ii:新建一个demo.ts文件
   iii:在并列的此文件编译:tsc demo.ts ,此时会生成一个demo.js文件
备注：每次在ts文件里做修改后，运行tsc demo.ts命令即可
`将多个ts文件合并成一个js文件`
tsc --outfile compact.js file1.ts file2.ts file3.js
```
# ts与js的区别
```js
Typescript 是 JavaScript 的超集，可以被编译成 JavaScript 代码。 用 JavaScript 编写的合法代码，在 TypeScript 中依然有效。Typescript 是纯面向对象的编程语言，包含类和接口的概念。 程序员可以用它来编写面向对象的服务端或客户端程序，并将它们编译成 JavaScript 代码。
1. TS必须指定数据类型. 
tuple类型（元组类型）、enum类型（枚举类型）、any类型（任意类型）
void类型（没有任何类型）表示定义方法没有返回值
never类型：是其他类型（包括null和undefined）的子类型，代表从不会出现的值。
2. ts支持ES6,js不支持es6
3. ts编译时报错，js运行时报错
4. ts支持面向对象编程，js是一种脚本语言
```
# 什么是泛型
```js
泛型是指在定义函数、接口或类的时候，不预先指定具体的类型，使用时再去指定类型的一种特性。
用途：
主要作用是创建逻辑可复用的组件。
function greet<T>(name: T) {}
class createObj<T> {
    name: T
}
interface IF<T> {
    name: T
}
```
# 类型接口
```ts
1. 可索引类型接口：一般用来约束数组和对象
interface StringArray {
  // key 的类型为 number ，一般都代表是数组
  // 限制 value 的类型为 string
  [index:number]:string
}
interface StringObject {
  // key 的类型为 string ，一般都代表是对象
  // 限制 value 的类型为 string
  [index:string]:string
}
2. 函数类型接口
interface discount2{
  // 注意:
  // “:” 前面的是函数的签名，用来约束函数的参数
  // ":" 后面的用来约束函数的返回值
  (price:number):number
}
3. 类类型接口
// 接口可以在面向对象编程中表示为行为的抽象
interface Speakable {
    name: string;
  
     // ":" 前面的是函数签名，用来约束函数的参数
    // ":" 后面的用来约束函数的返回值
    speak(words: string): void
}
4. 混合类型接口
//一个对象可以同时做为函数和对象使用
interface Counter {
    (start: number): string;
    interval: number;
    reset(): void;
}
```
# ts中的类
```js
1. 继承
2. 多态
3. 抽象
4. 封装
5. 实例
```
# 模块
```js
import export
命名空间（之前叫做“内部模块”）：解决命名冲突时，引用文件的唯一性。内部包裹变量，export导出。
`模块解析`：Classic(默认)或Node
相对导入：../   
非相对导入
Classic策略：非相对导入，按照路径进行一级一级查找
Node策略：相对导入，先去找相对应的文件，然后去相对应的文件夹下查找package.json文件，main模块。
非相对导入：在node_modules文件夹中寻找，一级一级查找mian,index.js
```
# 装饰器
```js
装饰器是一种特殊类型的声明，它能够被附加到类声明，方法， 访问符，属性或参数上。 装饰器使用 @expression这种形式，expression求值后必须为一个函数，它会在运行时被调用，被装饰的声明信息做为参数传入。
```
# Mixins
# TSD
```js
TSD是Typescript的包管理工具，TSD就是帮我查找对应的三方库TS声明文件并下载安装。
```
# 什么是类型断言？
向编译器提供我们所希望的分析代码的提示。
```js
1：<类型>变量
2：变量 as 类型 （在tsx中只能使用这种方式）
```