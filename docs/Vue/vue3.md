---
title: vue3的探讨
date: 2020-5-12 10:55:30
author: 'lyq'
categories:
  - vue
tags: 
  - Vue.js
---
# 一、优化
## 1. 响应式系统提升
```js
vue2在初始化的时候，对data中的每个属性使用definepropery调用getter和setter使之变为响应式对象。如果属性值为对象，还会递归调用defineproperty使之变为响应式对象。
vue3使用proxy对象重写响应式。proxy的性能本来比defineproperty好，proxy可以拦截属性的访问、赋值、删除等操作，不需要初始化的时候遍历所有属性，另外有多层属性嵌套的话，只有访问某个属性的时候，才会递归处理下一级的属性。
```
## 2.编译优化compile
```js
1. 优化编译和重写虚拟dom，让首次渲染和更新dom性能有更大的提升
2. vue2 通过标记静态根节点,优化 diff 算法
   vue3 标记和提升所有静态根节点,diff 的时候只比较动态节点内容
3. Fragments, 模板里面不用创建唯一根节点,可以直接放同级标签和文本内容
4. 静态提升，
// 当使用 hoistStatic 时,所有静态的节点都被提升到 render 方法之外.只会在应用启动的时候被创建一次,之后使用只需要应用提取的静态节点，随着每次的渲染被不停的复用。
// patch flag, 跳过静态节点,直接对比动态节点
patchFlag 被定义为一个数字枚举类型。
当 patchFlag 的值大于 0 时，代表所对应的元素在 patchVNode 时或 render 时是可以被优化生成或更新的。
当 patchFlag 的值小于 0 时，代表所对应的元素在 patchVNode 时，是需要被 full diff，即进行递归遍历 VNode tree 的比较更新过程。
`vue3`  Compile 过程：baseParse===>transform===>generate
`vue2`  Compile 过程：parse===>optimize===>generate


缓存事件处理函数，cacheHandler,避免每次触发都要重新生成全新的function去更新之前的函数
```
## 3. 源码体积的优化
vue3移除了一些不常用的api，例如：inline-template、filter等
使用tree-shaking
# 二. Vue 3.0 所采用的 Composition Api 与 Vue 2.x使用的Options Api 有什么区别？
```js
Options Api
包含一个描述组件选项（data、methods、props等）的对象 options；
API开发复杂组件，同一个功能逻辑的代码被拆分到不同选项 ；
使用mixin重用公用代码，也有问题：命名冲突，数据来源不清晰；minxin是对组件的方法，钩子函数的合并

composition Api
vue3 新增的一组 api，它是基于函数的 api，可以更灵活的组织组件的逻辑。
解决options api在大型项目中，options api不好拆分和重用的问题。

```