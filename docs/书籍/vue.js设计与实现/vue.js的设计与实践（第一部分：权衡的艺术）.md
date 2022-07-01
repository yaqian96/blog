# vue.js的设计与实践（第一部分：框架设计概览）

[TOC]

## 1. 权衡的艺术

### 1.1 命令式和声明式

**命令式框架**：类似 jQuery，特点：关注过程。

**声明式框架**：特点：关注结果。

vue.js实现，内部是**「命令式」**的，而暴露给用户的却**「更加声明式」**。

### 1.2 性能与可维护性的权衡

**声明式代码的性能不优于命令式代码的性能**

1. 性能方面

   原因：命令式代码，可以直接调用相关命令，声明式代码，得先比较更新前后的差异，比命令式的多了比较过程。

   **命令式代码的更新性能消耗=更新新内容的性能消耗；**

   **声明式代码的更新性能消耗=更新新内容的性能消耗+找出差异的性能消耗；**

2. 可维护方面

   声明式代码的只关注结果，维护性更强。

**在保持可维护性的同时让性能损失最小化**

### 1.3 虚拟DOM的性能到底如何

   减少找出差异的性能消耗，是提高声明式框架性能的主要方式，而所谓的**虚拟DOM**就是为了最小化找出差异性能损耗而出现的。

```html
原生JavaScript指的是像documen.createElement之类的DOM操作方法，并不包含innerHTML（模板），因为它比较特殊，需要单独讨论
```

1. 最佳选择

   - 使用innerHTML操作页面和虚拟DOM相比性能如何？

     **innerHTML创建页面时的性能**： **HTML字符串拼接的计算量+innerHTML的DOM计算量**。

     **虚拟DOM创建页面时的性能**: **创建JavaScript对象的计算量+创建真实DOM的计算量。**

     **innerHTML更新页面性能**：**重新构建HTML字符串，再重新设置DOM元素的innerHTML属性**

     **虚拟DOM更新页面时的性能**: **它需要重新创建JavaScript对象（虚拟DOM树），然后比较新旧虚拟DOM，找到变化的元素并更新它**。

   - innerHTML和document.createElement等DOM操作方法有何差异？

     无论是纯JavaScript层面的计算，还是DOM层面的计算， 其实两者差距并不大。 这里我们从宏观角度只看数量级上的差异。如果在同一个数量级，则认为没有差异。在创建页面的时候，都需要新建所有DOM元素。

     | 性能（低--高） | innerHTML模板 | 虚拟DOM    | 原生js     |
     | -------------- | ------------- | ---------- | ---------- |
     |                | 心智负担中等  | 心智负担小 | 心智负担大 |
     |                |               | 可维护性强 | 可维护性差 |
     |                | 性能差        | 性能不错   | 性能高     |

     原生JavaScript操作DOM的方法（document.createElement）、虚拟DOM和innerHTML三者操作页面的性能，不可以简单的下定论。

     - 与**页面大小、变更部分的大小**都有关系
     - 与**创建页面**还是**更新页面**也有关系

### 1.4 运行时和编译时

1. 运行时

   用户提供复杂的数据对象，使用render函数渲染界面。

2. 运行时+编译时

   提供complie对象，将html先转成树形结构的数据对象，然后使用render函数渲染

   优点：在构建的时候，将complie编译好数据，运行时直接渲染。

3. 编译时

   将输入的内容直接通过Compiler，渲染页面。用户的代码通过编译器后才能执行。

   |      | 运行时                                                       | 运行时+编译时                                                | 编译时                                       |
   | ---- | ------------------------------------------------------------ | ------------------------------------------------------------ | -------------------------------------------- |
   | 优点 | 直接输入想要的数据                                           | 在构建的时候就执行Compiler程序将用户提供的内容编译好，等运行时就无须编译了 | 性能好                                       |
   | 缺点 | 我们没办法分析用户提供的内容 。<br />用户需要提供很复杂的数据结构，很不方便。 | 性能差                                                       | 不灵活，灵活性，即用户的内容必须编译后才能用 |

   

### 1.5 总结

​     vue.js采用命令式+声明式的方式。

​    vue.js采用虚拟DOM。

​    vue.js采用运行时+编译时。

## 2.框架设计的核心要素

框架设计要注意：框架应该给用户提供哪些构建产物；**产物的模块格式**如何；**开发版本的构建和生产版本的构建有什么区别**；**热更新**要不要考虑；用户能否选择关闭其他功能从而减少最终资源的**打包体积**。

**提升用户的开发体验**：提示友好的错误信息

**控制框架代码的体积**：

```
__DEV__常量的检查，在dev环境提示警告，在生产环境不提示。
```

**框架要做到良好的Tree-Shaking**：Tree-Shaking指的就是消除那些永远不会被执行的代码，就是排除dead code。

实现满足的条件：模块必须是ESM（ES Module）

```js
/*#__PURE__*/表示代码没有副作用可以放心地对其进行Tree-Shaking
```

**框架应该输出怎么的构建产物**：不同环境下打包的内容依赖，大小不一样

**特性开关**：根据不同的使用场景，灵活地使用API

**错误处理**：

```js
// utils.js
let handleError = null
export default {
	foo(fn){
		callWithErrorHandling(fn)
	},
	// 用户可以调用该函数注册统一的错误处理函数
	registerErrorHandler(fn){
		handleError = fn
	}
}
function callWithErrorHandling(fn){
	try{
		fn && fn()
	}catch (e) {
		//将捕获到的错误传递给用户的错误处理程序
		handleError(e)
	}
}
```

## 3.vue.js3的设计思路

1. 声明式的描述UI

   Vue.js3是一个声明式的UI框架，意思说用户在使用 Vue.js3开发页面时是声明式地描述UI的。

   用js对象表示页面中的元素

   ```js
   
   const title = {
       tag: 'h1',
       props: {
           class: 'title',
           onclick: handler
       },
       children: [
           {
               tag: 'span'
           }
       ]
   }
   ```

   小知识点: h函数是一个辅助创建虚拟dom的工具函数，render函数中调用h函数生成了一个虚拟dom对象。

2. 渲染器

   虚拟DOM转换成真实DOM

   过程：创建元素、元素添加属性和事件、处理children、挂载到真实的DOM节点

   ```js
   // vnode 需要渲染的结构 container 需要挂载的节点
   function renderer(vnode,container){
     // 拿出 tag 作为标签类型
     const el = document.createElement(vnode.tag)
     // 遍历属性添加到 dom 元素中
     for(const key in vnode.props){
       if(/^on/.test(key)){
         // 如果 key 以 on 开头，那么是事件
         el.addEventListener(
           key.substr(2).toLowerCase(),
           vnode.props[key]
         )
       }
     }
     if(typeof vnode.children === 'string'){
       // 文本节点
       el.appendChild(document.createTextNode(vnode.children))
     }else if(Array.isArray(vnode.children)){
       vnode.children.forEach(child => {
         renderer(child,el)
       })
     }
     container.appendChild(el)
   }
   ```

3. 组件的本质

   vue组件就是一组DOM元素的封装。可以定义一个函数来代表组件，函数的返回值就代表组件要渲染的内容。也可以使用js来代表一个组件

   ```js
   const MyComponent = () => {
       return {
           tag: 'div',
           props: {
               onClick: () => alert('hello')
           },
           children: [
               'click me'
           ]
       }
   }
   const MyComponent = {
   	render() {
   		return {
   			tag: 'div',
   			props: {
   				onClick: () => alert('hello')
   			},
   			children: 'click me'
   		}
   	}
   }
   // render函数   
   function renderer(vnode, container) {
       if (typeof vnode.tag === 'string') {
           // 虚拟dom是标签元素
           mountElement(vnode, container);
       }
       else if (typeof vnode.tag === 'function') {
           // 说明vnode描述的是组件
           mountComponent(vnode, container)
       }
   }
    
   function mountComponent(vnode, container) {
       const subtree = vnode.tag()
       renderer(subtree, container)
   }
   ```

4. 模板的原理

   模板其实是通过编译器将其转换为渲染函数的

   ```js
   export default{
     data(){/*...*/}
     render(){
       return h('div',{ onClick:'handler' },'click me')
     }
   }
   ```

5. Vue.js 是各个模块组成的有机体