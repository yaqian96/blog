# knex连接数据库响应回调
```js
环境是Node.js，
```

# 介绍异步方案
```js
1. 回调函数
缺点：就是容易写出回调地狱（Callback hell）
2. 事件监听 每个事件可以指定多个回调函数
缺点是整个程序都要变成事件驱动型，运行流程会变得很不清晰。
f1.on('done', f2);
function f1() {
  setTimeout(function () {
  // ...
  f1.trigger('done');
  }, 1000);
}
3. 发布订阅
jQuery.subscribe('done', f2);
function f1() {
  setTimeout(function () {
  // ...
  jQuery.publish('done');
  }, 1000);
}
4. Promise
5. 生成器Generators/ yield
function *foo(x) {
let y = 2 * (yield (x + 1))
let z = yield (y / 3)
return (x + y + z)
}
let it = foo(5)
console.log(it.next()) // => {value: 6, done: false}
console.log(it.next(12)) // => {value: 8, done: false}
console.log(it.next(13)) // => {value: 42, done: true}
6. async/await
优点：将异步代码像同步编码实现
```
# 如何处理异常捕获
```js
(1) try …catch
(2) try…finally
(3) try…catch…finally
```
# 项目如何管理模块
```js
项目内的管理
1. 可扩展性：能够很方便、清晰的扩展一个页面、组件、模块
2. 组件化：多个页面之间共用的大块代码可以独立成组件，多个页面、组件之间共用的小块代码可以独立成公共模块
3. 可阅读性：阅读性良好（包括目录文件结构、代码结构），能够很快捷的找到某个页面、组件的文件，也能快捷的看出项目有哪些页面、组件
4. 可移植性：能够轻松的对项目架构进行升级，或移植某些页面、组件、模块到其他项目
5. 可重构性：对某个页面、组件、模块进行重构时，能够保证在重构之后功能不会改变、不会产生新 bug
6. 开发友好：开发者在开发某一个功能时，能够有比较好的体验（不好的体验比如：多个文件相隔很远）
7. 协作性：多人协作时，很少产生代码冲突、文件覆盖等问题
8. 可交接性：当有人要离开项目时，交接给其他人是很方便的
多个项目之间的管理
1. 组件化：多个项目共用的代码应当独立出来，成为一个单独的组件项目
2. 版本化：组件项目与应用项目都应当版本化管理，特别是组件项目的版本应当符合 semver 语义化版本规范
版本格式：主版本号.次版本号.修订号
3. 统一性：多个项目之间应当使用相同的技术选型、UI 框架、脚手架、开发工具、构建工具、测试库、目录规范、代码规范等，相同功能应指定使用固定某一个库
4. 文档化：组件项目一定需要相关的文档，应用项目在必要的时候也要形成相应的文档
```
前端性能优化

JS继承方案

# 如何判断一个变量是不是数组
```js
1. Array.isArray
2. instanceof Array
3. Object.prototype.toString.call
4. arr.constructor === Array
```

# 变量a和b，如何交换
```js
1. 采用中间temp
2. 采用加减法，缺点只能互换整数
    // a = a + b;
    // b = a - b;
    // a = a - b;
3. 按位XOR运算 只能互换整数
    // a = a ^ b;
    // b = a ^ b;
    // a = a ^ b;
4. 解构
```
# 事件委托
```js
1. 支持为同一个DOM元素注册多个同类型事件
2. 可将事件分成事件捕获和事件冒泡机制
```
标签生成的Dom结构是一个类数组
# 类数组和数组的区别
```js
拥有length属性，并且不大于Math.pow(2,32)。其它属性（索引）为非负整数，
document.getElementsByTagName()
`如何判断是否为类数组`
function isArrayLike(o) {
    if (o &&                                // o is not null, undefined, etc.
        typeof o === 'object' &&            // o is an object
        isFinite(o.length) &&               // o.length is a finite number
        o.length >= 0 &&                    // o.length is non-negative
        o.length===Math.floor(o.length) &&  // o.length is an integer
        o.length < 4294967296)              // o.length < 2^32
        return true;                        // Then o is array-like
    else
        return false;                       // Otherwise it is not
}
`为啥设计类数组对象？`
设计目的更多是只让你遍历和访问下标,而不是去添加或删除元素。
```
# dom的类数组如何转成数组
```js
1. forEach()方法
Array.prototype.forEach.call(odivs,function(item,index){
    console.log(item,index);
})
2. slice()方法
 odivs=Array.prototype.slice.call(odivs);
 odivs1=[].slice.call(odivs);
3. map()方法
 var odivs1=Array.prototype.map.call(odivs,function(item,index){
    return item;
})
4. concat
[].concat.apply([],arr)
5. Object.keys()
```
# 介绍单⻚面应用和多⻚面应用
```js
单页面应用（SPA），通俗一点说就是指只有一个主页面的应用，浏览器一开始要加载所有必须的 html, js, css。所有的页面内容都包含在这个所谓的主页面中。但在写的时候，还是会分开写（页面片段），然后在交互的时候由路由程序动态载入，单页面的页面跳转，仅刷新局部资源。多应用于pc端。
多页面（MPA），就是指一个应用中有多个页面，页面跳转时是整页刷新
单页面的优点：
1，用户体验好，快，内容的改变不需要重新加载整个页面，基于这一点spa对服务器压力较小
2，前后端分离
3，页面效果会比较炫酷（比如切换页面内容时的专场动画）
单页面缺点：
1，不利于seo
2，导航不可用，如果一定要导航需要自行实现前进、后退。（由于是单页面不能用浏览器的前进后退功能，所以需要自己建立堆栈管理）
3，初次加载时耗时多
4，页面复杂度提高很多
```

redux状态树的管理

介绍localstorage的API
