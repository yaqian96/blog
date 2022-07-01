# vue.js设计与实现（第二部分：响应系统）

[TOC]

## 1. 响应系统的设计与实现

###  1.1 响应式数据与副作用函数

   **副作用函数**指的是会产生副作用的函数

​       **响应式数据**：函数可以更改对象中的值，其他地方更改了某值的话，这个值就会跟着更改

```js
const obj = {text: 'hello world'}
function effect(){
	// effect 函数的执行会读取obj.text
	document.body.innerText = obj.text
}
```

 **响应式数据的基本实现**：1. 当副作用执行的时候，触发读取obj.text操作。2.当修改obj.text的值时，会触发obj.text的设置操作。

​	**读取**obj.text `->` **存储**函数effect 到桶
​	**设置**obj.text `->` 从桶里**取出执行**函数effect

```js
// 存储副作用函数的桶
const bucket = new Set();

// 原始数据
const data = { text: 'hello world' }
// 对原始数据的代理
const obj = new Proxy(data, {
  // 拦截读取操作
  get(target, key) {
    // 将副作用函数 effect 添加到存储副作用函数的桶中
    bucket.add(effect)
    // 返回属性值
    return target[key]
  },
  // 拦截设置操作
  set(target, key, newVal) {
    // 设置属性值
    target[key] = newVal
    // 把副作用函数从桶里取出并执行
    bucket.forEach(fn => fn())
    return true
  }
})
// get(target, propKey, receiver)：拦截对象属性的读取，比如proxy.foo和proxy['foo']。
// set(target, propKey, value, receiver)：拦截对象属性的设置，比如proxy.foo = v或proxy['foo'] = v，返回一个布尔值。
```

完善的响应系统：

1. 不依赖副作用函数的名字

   ```js
   // 用一个全局变量存储被注册的副作用函数
   let activeEffect
   // effect 函数用于注册副作用函数
   function effect(fn){
   	// 当调用 effect 注册副作用函数时，将副作用函数fn赋值给 activeEffect
   	activeEffect = fn
   	// 执行副作用函数
   	fn()
   }
   ```

2. 针对后边新增的属性，不应该重复执行effect函数，没有在副作用函数与被操作的目标字段之间建立明确的联系，**重新设计“桶”的数据结构：使用WeakMap**

   ```js
   //完整的响应式设计
   let bucket= new WeakMap();
   const obj = new Proxy(data, {
     // 拦截读取操作
     get(target, key) {
       // 将副作用函数 activeEffect 添加到存储副作用函数的桶中
       track(target, key)
       // 返回属性值
       return target[key]
     },
     // 拦截设置操作
     set(target, key, newVal) {
       // 设置属性值
       target[key] = newVal
       // 把副作用函数从桶里取出并执行
       trigger(target, key)
     }
   })
   // 在get拦截函数内调用track函数追踪变化,在get中收集依赖。
   function track(target, key) {
     let depsMap = bucket.get(target)
     if (!depsMap) {
       bucket.set(target, (depsMap = new Map()))
     }
     let deps = depsMap.get(key)
     if (!deps) {
       depsMap.set(key, (deps = new Set()))
     }
     deps.add(activeEffect)
   }
   
   // 在set拦截函数内调用trigger函数触发变化,set中触发依赖。
   function trigger(target, key) {
     const depsMap = bucket.get(target)
     if (!depsMap) return
     const effects = depsMap.get(key)
     const effectsToRun = new Set(effects) //新增，防止新增的时候，cleanUp时无限循环。
     effectsToRun.forEach(effectFn => effectFn())
   }
   
   ```

### 1.2 分支切换和cleanup

​		**分支切换**：代码执行的分支会跟着变化，这就是分支切换。

```js
const data = {ok:true, text:'hello world'}
const obj = new Proxy(data,{/*...*/})
effect(function effectFn(){
	document.body.innerText = obj.ok? obj.text : 'not'
})
// 当上述obj.ok===false时，false对应的副作用函数将会遗留。
//解决方法：就是每次副作用函数执行时，可以先将其从所有与之关联的依赖集合中删除。
//在effect内部我们定义新的effectFn函数，并为其添加effectFn.deps属性，该属性时一个数组，用来存储所有包含当前副作用函数的依赖集合。
//effect函数
let activeEffect
function effect(fn){
	const effectFn = () =>{
		//调用 clearnup函数完成清除工作
		cleanup(effectFn)
		activeEffect = effectFn
		fn()
	}
	effectFn.deps = []
	effectFn()
}
function cleanup(effectFn){
	//遍历 effectFn.deps数组
	for(let i=0;i<effectFn.deps.length;i++){
		const deps = effectFn.deps[i]
		// 将 effectFn从依赖集合中移除
		deps.delete(effectFn)
	}
	// 最后需要重置effectFn.deps数组
	effect.deps.length = 0
}
```

### 1.3 嵌套effect和effect栈

1. 嵌套effect

   出现的场景：当组件1中嵌套组件2时，会导致更改组件1的值，触发组件1的effect函数，则会使得组件2的effect2的函数执行。

   理想情况下，更改每个组件则只改变相对应的effect副作用函数。

   解决方法：同一时刻只需要一个effect副作用函数，采用入栈出栈的方式。

   **将当前副作用函数压入栈中，待副作用函数执行完后将其从栈中弹出，并始终让activeEffect指向栈顶的副作用函数**

   ```js
   let activeEffect
   // effect 栈
   const effectStack = []
   
   function effect(fn){
   	const effectFn = () =>{
   		cleanup(effectFn)
   		activeEffect = effectFn
   		// 在调用副作用函数之前将当前副作用函数压入栈中
   		effectStack.push(effectFn) // 新增
   		fn()
   		// 在当前副作用函数执行完毕后，将当前副作用函数弹出栈，并把activeEffect还原为之前的值
   		effectStack.pop()
   		activeEffect = effectStack[effectStack.length - 1]
   	}
   	effectFn.deps = []
   	effectFn()
   }
   ```

### 1.4 避免无限递归循环&调度执行

1.  避免无限递归循环

   解决方法：**trigger所执行的副作用函数与当前正在执行的副作用函数相同，则不触发执行**

2. 调度执行

   可调度性指的是trigger动作触发副作用函数重新执行时，**有能力决定副作用函数执行的时机，次数的方式**。

   effect函数中设置options。

   ```js
   //trigger
   if(effectFn.options.scheduler){
   			effectFn.options.scheduler(effectFn)
   		}else{
   			// 否则直接执行副作用函数（之前的默认行为）
   			effectFn()
   		}
   //effect
   effectFn.options = options
   ```

### 1.5 计算属性computed与lazy

```js
function effect(fn, options =>{}){
	const effectFn = () => {
		cleanup(effectFn)
		activeEffect = effectFn
		effectStack.push(effectFn)
		// 将fn()的执行结果存储到res中
		const res = fn()
		effectStack.pop()
		activeEffect = effectStack[effectStack.length - 1]
		// 将res作为effectFn的返回值
		return res
	}
	effectFn.options = options
	effectFn.deps = []
	// 只有非lazy的时候，才执行
	if(!options.lazy){
		effectFn()
	}
	// 将副作用函数作为返回值返回
	return effectFn
}
function computed(getter){
	// value用来缓存上一次计算的值
	let value
	// dirty标志，用来标识是否需要重新计算值，为true标识需要重新计算
	let dirty = true
	const effectFn = effect(getter, {
		lazy: true,
        // 添加调度器，在调度器中将dirty重置为true
		scheduler(){
			if(!dirty){
				dirty = true
				// 当计算属性依赖的响应式数据变化时，手动调用trigger函数触发响应,解决外部的effect调用computed值
				trigger(obj,'value')
			}
		}
	})

	const obj = {
		get value(){
			// 只有“脏”时才计算值，并将得到的值缓存到value中
			if(dirty){
				value = effectFn()
				dirty = false
			}
			return value
		}
	}
	return obj
}
```

### 1.6 watch的实现原理

watch值的就是观测一个响应式数据，当数据发生变化时通知并执行相应的回调函数。

实现原理：采用effect函数的scheduler调度函数。定义新旧值

```js
watch(obj, () => {
	console.log('数据变了')
})
// 修改响应数据的值，会导致回调函数执行
obj.foo++
function watch(source, cb){
	//定义getter
	let getter
	//如果source时函数，说明用户传递的是getter，所以直接吧source赋值给getter
	if(typeof source === 'function'){
		getter = source
	}else{
		// 否则就按原来的实现调用traverse递归地读取
		getter = () => traverse(source)
	}
	//定义旧值和新值
	let oldValue, newValue
	// 使用effect注册副作用函数时，开启lazy选项，并把返回值存储到effectFn中以便后续手动调用
	const effectFn = effect(
		// 执行getter
		()=>getter,
		{
			lazy:true
			scheduler(){
				// 在scheduler中重新执行副作用函数，得到的是新值
				newValue = effectFn()
				//将旧值和新值作为回调函数的参数
				cb(newValue, oldValue)
				//更新旧值，不然下次会得到错误的旧值
				oldValue = newValue
			}	
		})
	// 手动调用作用函数，得到旧值
	oldValue = effectFn()
}
```

### 1.7 立即执行的watch与回调执行时机

```js
1. 立即执行的回调函数。
watch(obj,()=>{
	console.log('变化了')
},{
	// 回调函数会在watch创建时立即执行一次,通过immediate是否为true,代表立即执行。
	immediate:true
})
2. 回调函数的执行时机。
watch(obj, ()=>{
	console.log('变化了')
}，{
	// 回调函数会在watch创建是立即执行一次
	flush: 'pre' // 还可以指定为 'post' | 'sync'		
})
当flush的值为’post’时，代表调度函数需要将副作用函数放到一个微任务队列中，并等待DOM更新结束后再执行，
```

### 1.8 过期的副作用

解决方法：将把最后一次请求B的结果视为“最新的”，把请求A的视为“过期”的。

```js
watch(obj, async(newValue, oldValue, onInvalidate)=>{
	// 定义一个标志，代表当前副作用函数是否过期，默认为false，代表没有过期
	let expired = false
	// 调用 onInvalidate() 函数注册一个过期回调
	onInvalidate(()=>{
		// 当过期时，将expired设置为true
		expired = true
	})

	// 发送并等待网络请求
	const res = await fetch('/path/to/request')
	// 只有当该副作用函数的执行没有过期时，才会执行后续操作
	if (!expired){
		finalData = res
	}

})
function watch(source, cb, options = {}){
	let getter
	if(typeof source === 'function'){
		getter = source
	}else{
		getter = () => traverse(source)
	}
	
	let oldValue, newValue

	// cleanup 用来存储用户注册的过期回调
	let cleanup
	// 定义 onInvalidate函数
	function onInvalidate(fn){
		// 将过期回调存储到cleanup中 (fn)
		cleanup = fn
	}
	const job = ()=>{
		newVlue = effectFn()
		// 在调用回调函数cb之前，先调用过期回调
		if(cleanup){
			cleanup()
		}
		//将 onInvalidate作为回调函数的第三个参数，以便用户使用
		cb(oldValue, newValue, onInvalidate)
		oldValue = newValue
	}
	
	const effectFn = effect(
		()=> getter(),
		{
			lazy: true,
			scheduler: ()=>{
				if(options.flush === 'post'){
					const p = Promise.resolve()
					p.then(job)
				}else{
					job()
				}
			}
		}
	)

	if(options.immediate){
		job()
	}else{
		oldValue = effectFn()
	}
	
}
```



## 2. 非原始值的响应式方案

### 2.1 理解Proxy和Reflect

```js
1. proxy:拦截并重新定义对一个对象的基本操作。
Proxy只能代理对象，无法代理非对象值。属性的获取与设置，通过get和set。代理函数，通过apply改变this的指向。
2. Reflect是一个全局对象
Reflect是一个内建的对象，用来提供方法去拦截JavaScript的操作。Reflect不是一个函数对象，所以它是不可构造的，也就是说它不是一个构造器，你不能通过`new`操作符去新建或者将其作为一个函数去调用Reflect对象。Reflect的所有属性和方法都是静态的。
//反射机制
Reflect.get ( target, propertyKey [ , receiver ]) //receiver代表this的指向
Reflect.set ( target, propertyKey, V [ , receiver ] )
Reflect.has ( target, propertyKey ) //该方法类似于in操作符，返回布尔值来表明该属性是否存在该对象上或者其原型链上
Reflect.apply(target, thisArgument [, argumentsList]) //等同于Function.prototype.apply()
Reflect.ownKeys(o) //返回了目标对象已有的所有属性(不包括原型链)的一个数组
Reflect.construct(target, argumentsList [, constructorToCreateThis]) //等同于new target(...args)
Reflect.defineProperty ( target, propertyKey, attributes ) //等同于Object.defineProperty()，不同的是该方法返回的是布尔值
Reflect.getOwnPropertyDescriptor ( target, propertyKey ) //等同于Object.getOwnPropertyDescriptor(),
Reflect.deleteProperty ( target, propertyKey ) //等同于调用delete target[name]
3. 问题：副作用函数内通过原始对象访问它的某个属性是不会建立响应联系
解决方法：使用Reflect可以指定this的值。
```

### 2.2 JavaScript对象及Proxy的工作

js中有两种对象，一种是常规对象，一种是异质对象。

**内部方法**：指的是当我们对一个对象进行操作时在引擎内部调用的方法，这些方法对于JavaScript使用者来说是不可见的。

在ECMAScript规范中使用[[xxx]]来代表内部方法或内部槽。

| **内部方法**          | **签名**                                    | **描述**                                                     |
| --------------------- | ------------------------------------------- | ------------------------------------------------------------ |
| [[GetPrototypeof]]    | （）→object │ Null                          | 查明为该对象提供继承属性的对象，null代表没有继承属性         |
| [[SetPrototypeof]]    | (Object│ Null)→Boolean                      | 将该对象与提供继承属性的另一个对象相关联。传递nuul表示没有继承属性，返回true表示操作成功完成，返回false表示操作失败 |
| [[ISExtensible]]      | （）→Boolean                                | 查明是否允许向该对象添加其他属性                             |
| [[PreventExtensions]] | （）→Boolean                                | 控制能否向该对象添加新属性。如果操作成功则返回true，如果操作失败则返回false |
| [[GetOwnProperty]]    | (propertyKey)→Undefined │PropertyDescriptor | 返回该对象自身属性的描述符，其键为propertyKey，如果不存在这样的属性，则返回undefined |
| [[DefineOwnProperty]] | （propertyKey,PropertyDescriptor)→Boolean   | 创建或更改自己的属性，其键为propertyKey,以具有由 PropertyDescriptor描述的状态。如果该属性已成功创建或更新，则返回true;如果无法创建或更新该属性，则返回false |
| [[HasProperty]]       | (propertyKey)→Boolean                       | 返回一个布尔值，指示该对象是否已经拥有键为propertyKey的自己的或继承的属性 |
| [[Get]]               | (propertyKey，Receiver)→any                 | 从该对象返回键为propertyKey 的属性的值。如果必须运行 ECMAScript代码来检索属性值,则在运行代码时使用Receiver作为this值 |
| [[Set]]               | (propertyKey，value，Receiver)→Boolean      | 将键值为propertyKey 的属性的值设置为value如果必须运行ECMAScript代码来设置属性值，则在运行代码时使用Receiver作为this值。如果成功设置了属性值,则返回true;如果无法设置，则返回false |
| [[Delete]]            | (propertyKey)→Boolean                       | 从该对象中刷除属于自身的键为propertyKey的属性。如果该属性未被删除并且仍然存在，则返回false;如果该属性已被删除或不存在，则返回true |
| [[OwnPropertyKeys]]   | （）→List of propertyKey                    | 返回一个List，其元素都是对象自身的属性键                     |

除此之外还有两个额外的必要内部方法：[[Call]]和[[Construct]]

| **内部方法**  | **签名**                       | **描述**                                                     |
| ------------- | ------------------------------ | ------------------------------------------------------------ |
| [[Call]]      | (any, a List of any) -> any    | 将运行的代码与this对象关联。由函数调用触发。该内部方法的参数是一个this值和参数列表 |
| [[Construct]] | (a List of any，object)→Object | 创建一个对象。通过new运算符或 super调用触发。该内部方法的第一个参数是一个List，该List的元素是构造函数调用或super调用的参数，第二个参数是最初应用new运算符的对象。实现该内部方法的对象称为构造函数 |

**如何判断对象是一个函数调用还是普通函数？**

如果一个对象需要作为函数调用，那么这个对象就必须部署内部方法[[Call]]，**所以可以通过内部方法和内部槽来区分对象，例如函数对象会部署内部方法[[Call]]，而普通对象则不会**。

内部方法具有多态性，不同类型的对象可能部署了相同的内部方法，却具有不同的逻辑。

常规对象和异质对象的判断方法：

1. 对于必要的内部方法11个（第一个图标列出的内部方法），必须使用ECMA规范10.1x节给出的定义实现
2. 对于内部方法[[Call]]，必须使用ECMA规范10.2.1节给出的定义实现
3. 对于内部方法[[Construct]]，必须使用ECMA规范10.2.2节给出的定义实现

**Proxy就是一个异质对象**

代理对象的内部方法[Get]]会调用原始对象的内部方法[[Get]]来获取属性值，这其实就是**代理透明性质**。

创建代理对象时指定的拦截函数,**实际上是用来`自定义代理对象本身`的内部方法和行为的,而不是用来指定`被代理对象`的内部方法和行为的**。

下表示Proxy对象部署的所有内部方法

| **内部方法**          | **处理器函数**           |
| --------------------- | ------------------------ |
| [[GetPrototypeof]]    | getPrototypeof           |
| [[SetPrototypeof]]    | setPrototypeof           |
| [[IsExtensible]]      | isExtensible             |
| [[PreventExtensions]] | preventExtensions        |
| [[GetOwnProperty]]    | getOwnPropertyDescriptor |
| [[DefineOwnProperty]] | defineProperty           |
| [[HasProperty]]       | has                      |
| [[Get]]               | get                      |
| [[Set]]               | set                      |
| [[Delete]]            | deleteProperty           |
| [[OwnPropertyKeys]]   | ownKeys                  |
| [[Call]]              | apply                    |
| [[Construct]]         | construct                |

### 2.3 如何代理Object

响应系统应该拦截一切读取操作，以便当数据变化时能够正确地触发响应，对一个对象可能的读取操作如下：

1. 访问属性：obj.foo   
2. 判断对象或原型上是否存在给定的key: key in obj
3. 使用for…in循环遍历对象：for(const key in obj)

| obj.foo               | get拦截函数实现                 |
| --------------------- | ------------------------------- |
| key in obj            | has拦截函数实现对in操作符的代理 |
| for(const key in obj) | Reflect.ownKeys                 |

```js
//**has拦截函数实现对in操作符的代理**：
const obj = {foo:1}
const p = new Proxy(obj, {
	has(target, key){
		track(target, key)
		return Reflect.has(target, key)
	}
})
//Reflect.ownKeys
const obj = { foo: 1}
const ITERATE_KEY = Symbol()

const p = new Proxy(obj, {
	ownKeys(target){
		// 将副作用函数与ITERATE_KEY 关联
		track(target, ITERATE_KEY )
		return Reflect.ownKeys(target)
	}
})
//for..in 循环在新增和修改时的区别。新增时增加关联key,会增加循环次数。
const p = new Proxy(obj, {
	set(target, key, newVal, receiver){
		// 如果属性不存在，则说明时在添加新属性，否则时设置已有属性
		const type = Object.prototype.hasOwnProperty.call(target,key) ? 'SET' : 'ADD'
		// 设置属性值
		const res = Reflect.set(target, key, newVal, receiver)
		// 将type作为第三个参数传递给trigger函数
		trigger(target, key, type)
	}
	
})
function trigger(target, key, type){
	const depsMap = bucket.get(target)
	if(!depsMap) return
	const effects = depsMap.get(key)
	
	const effectsToRun = new Set()
	effects && effects.forEach(effectFn => {
		if(effectFn != activeEffect){
			effectsToRun.add(effectFn)
		}
	})

	console.log(type, key)
	// 只有当操作类型'ADD'时，才触发与ITERATE_KEY相关联的副作用函数重新执行
	if(type === 'ADD'){
		const iterateEffects = depsMap.get(ITERATE_KEY)
		iterateEffects && iterateEffects .forEach(effectFn => {
			if(effectFn != activeEffect){
				effectsToRun.add(effectFn)
			}
		})
	}
	
	effectsToRun.forEach(effectFn => {
		if(effectFn.options.scheduler){
			effectFn.options.scheduler(effectFn)
		}else{
			effectFn()
		}
	})
	
}
```

```js
//删除属性操作
const p = new Proxy(obj, {
	deleteProperty(target, key){
		const hadKey = Object.prototype.hasOwnProperty.call(target, key)
		const res = Reflect.deteleProperty(target, key)
	
		if(res && hadKey){
			// 只有当被删除的属性是对象自己的属性并且成功删除时，才触发更新
			trigger(target, key, 'DELETE')
		}
		return res
	}

})
function trigger(target, key, type){
	const depsMap = bucket.get(target)
	if(!depsMap) return
	const effects = depsMap.get(key)
	
	const effectsToRun = new Set()
	effects && effects.forEach(effectFn => {
		if(effectFn != activeEffect){
			effectsToRun.add(effectFn)
		}
	})

	console.log(type, key)
	if(type === 'ADD' || type==='DELETE'){
		const iterateEffects = depsMap.get(ITERATE_KEY)
		iterateEffects && iterateEffects .forEach(effectFn => {
			if(effectFn != activeEffect){
				effectsToRun.add(effectFn)
			}
		})
	}
	
	effectsToRun.forEach(effectFn => {
		if(effectFn.options.scheduler){
			effectFn.options.scheduler(effectFn)
		}else{
			effectFn()
		}
	})
	
}
```

### 2.4 合理地触发响应

首先当值没有发生变化时，应该不需要触发响应。

```js
//NaN !== NaN是总是返回true
const p = new Proxy(obj, {
	set(target, key, newVal, receiver){
		// 先获取旧值
		const oldVal = target[key]
		const type = Object.propotype.hasOwnProperty.call(target, call)?''SET':'ADD'
		const res = Reflect.set(target, key, newVal, receiver)
		// 比较新值与旧值，只要当不全等的时候，并且都不是NaN的时候才触发响应
		if(oldVal !== newVal && (oldVal === oldVal || newVal === newVal)){
			trigger(target, key, type)
		}
		return res
	}
})
//原型上继承属性
//reactive函数对proxy进行一层封装
function reactive(obj){
	return new Proxy(obj, {
		// 省略前文讲解的拦截函数
	})
}
const obj = {}
const proto = {bar:1}
const child = reactive(obj)
const parent = reactive(proto)
// 使用parent作为child的原型
Object.setPrototypeOf(child, parent)

effect(()=>{
	console.log(child.bar) // 1
})
// 修改child.bar的值
child.bar = 2 // 会导致副作用函数重新执行两次
//根据规范可以知道如果设置的属性不存在对象上，那么会取得其原型，并调用原型的[[Set]]方法
function reactive(obj){
	return new Proxy(obj, {
		set(target, key, newVal, receiver){
			const oldVal = target[key]
			const type = Object.prototype.hasOwnProperty.cal(target, key)?'SET','ADD'
			// target === receiver.raw 说明receiver就是target的代理对象
			if(target === receiver.raw){
				if(oldVal !== newVal && (oldVal === oldVAL || newVal === newVal)){
					trigger(target, key, type)
				}
			}
			return res
		}
	})
}
```

### 2.5 浅响应和深响应

**reactive**与**shallowReactive**的区别，也就是深响应和浅响应的区别

```js
const obj = reactive{
	foo: {bar:1}
}
effect(()=>{
	console.log(obj.foo.bar)
})
//修改obj.foo.bar的值，并不能触发响应
obj.foo.bar = 2
//解决方案：判断返回监听的对象是复杂对象与否
function reactive(obj){
	return new Proxy(obj, {
		get(target, key, receiver){
			if(key === 'raw'){
				return target
			}
			track(target, key)
			// 当读取属性值时，直接返回结果
			const res = Reflect.get(target, key, receiver)
			if(typeof res === 'object' && res !== null){
				// 调用reactive将结果包装成响应式数据并返回
				return reactive(res)
			}
			return res
		}
	})
}
```

```js
//浅响应，指的是只有对象的第一层属性时响应的
// 封装createReactive函数，接收一个参数isShallow，代表是否为浅响应，默认为false
function createReactive(obj, isShallow = false){
	return new Proxy(obj, {
		get(target, key, receiver){
			if(key === 'raw'){
				return target
			}
			const res = Reflect.get(target, key, receiver)
			//如果时浅响应，则直接返回原始值
			if(isShallow){
				return res
			}
			track(traget, key)
			if(typeof res === 'object' && res !== null){
				return reactive(res)
			}
			return res
		}
	})
}
function reactive(obj){
	return createReactive(obj)
}
function shallowReactive(obj){
	return createReactive(obj, true)
}
```

### 2.6只读和浅只读

只读信息，当用户尝试修改时就会有警告错误。

```js
//只读意味着既不可以设置，又不可以删除。
// 增加第三个参数isReadonly
function createReactive(obj, isShallow = false, isReadonly = false){
	return new Proxy(obj, {
		set(target, key, newVal, receiver){
			// 如果是只读的就打印警告信息并返回
			if(isReadonly){
				console.warn(`属性${key}是只读的`)
				return true
			}
			const oldVal = target[key]
			const type = Object.prototype.hasOwnProperty.call(target, key)?"EDIT":"ADD"
			const res = Reflect.set(target, key, newVal, receiver)
			if(target === receiver.raw){
				if(oldVal !== newVal && (oldVal === oldVal || newVal === newVal)){
					trigger(target, key, type)
				}
			}
			return res
		},
		deleteProperty(target,key){
			// 如果是只读的就打印警告信息并返回
			if(isReadonly){
				console.warn(`属性${key}是只读的`)
				return true
			}
			const hasKey = Object.prototype.hasOwnProperty.call(target, key)
			const res = Reflect.deleteProperty(traget, key)
			if(res && hadKey){
				trigger(target, key, 'DELETE')
			}
			return res
		}
	})
}
//如果一个数据是只读的，也就意味着没有必要为只读数据建立响应联系。
//浅只读
function readonly(obj){
	return createReactive(obj, false, true) 
}
function createReactive(obj, isShallow = false, isReadonly = false){
	return new Proxy(obj, {
		get(target, key, receiver){
			if(key === 'raw'){
				return target
			}
			if(!isReadonly){
				track(target, key)
			}
			
			const res = Reflect.get(target, key, receiver)
			if(isShallow){
				return res
			}
			if(typeof res === 'objcet' && res !== null){
				// 如果数据为只读，则调用readonly对值进行包装
				return isReadonly?readonly(res):reactive(res)
			}
			return res
		}
	})
}
//深只读
//还应该在get函数内递归地调用readonly将数据包装成只读的代理对象，并将其作为返回值返回。
function createReactive(obj, isShallow = false, isReadonly = false){
	return new Proxy(obj, {
		get(target, key, receiver){
			if(key === 'raw'){
				return target
			}
			if(!isReadonly){
				track(target, key)
			}
			
			const res = Reflect.get(target, key, receiver)
			if(isShallow){
				return res
			}
			if(typeof res === 'objcet' && res !== null){
				// 如果数据为只读，则调用readonly对值进行包装
				return isReadonly?readonly(res):reactive(res)
			}
			return res
		}
	})
}
//第二个参数的区别
function readonly(obj){
	return createReactive(obj, false, true)
}
function shallowReadonly(obj){
	return createReactive(obj, true, true)
}
```

### 2.7 遍历数组

因为数组也是对象，所以可以使用for…in循环遍历
但是在实际中，应**尽量避免使用for… in 循环遍历数组**，虽然在语法上是可行的。前面提到过，数组对象和常规对象的不同仅仅体现在**[[DefineOwnProperty]]上，也就是说，使用for…in循环遍历数组与遍历常规对象没有差异，所以同样可以使用ownKeys**拦截。最初为了追踪对普通对象的for…in操作，人为创建了ITERATE_KEY作为追踪的key， 但是这样只适用于普通对象。但是对于数组来说情况有所不同，首先来看看那些操作会影响for…in循环对数组的遍历

| 数组读取操作                                                 | 数组设置操作                         |
| ------------------------------------------------------------ | ------------------------------------ |
| arr.length                                                   | arr.length=1                         |
| arr[0]                                                       | arr[0]=1                             |
| for..in                                                      | push、pop、shift、unshift            |
| for..of                                                      | 修改原型数组的方法splice、fill、sort |
| 数组的原型方法，concat,join，every,includes,some,find,findIndex以及不改变数组长度的方法 |                                      |

和for…in不同，for…of是用来遍历可迭代对象的。而一个对象能否被迭代，取决于该对象或者该对象的原型是否实现@@iterator方法，@@iterator指的是Symbol.iterator这个值。如果一个对象实现了Symbol.iterator方法，那么这个对象就是可以迭代的。

```js
const arr = [1,2,3,4,5]
const itr = arr[Symbol.iterator]()

console.log(itr.next()) // {value: 1, done: false}
console.log(itr.next()) // {value: 2, done: false}
console.log(itr.next()) // {value: 3, done: false}
console.log(itr.next()) // {value: 4, done: false}
console.log(itr.next()) // {value: 5, done: false}
console.log(itr.next()) // {value: undefined, done: true}

```

实际上，要实现对数组进行for…of遍历操作的拦截，关键点在for…of操作依赖的基本语义。
通过分析基本语义可以看到，数组迭代器的执行会读取数组的length属性，如果迭代的是数组元素值，还会读取数组的索引。
也就是说迭代数组时，只需要在副作用函数与数组的长度和索引之间建立响应联系，就能够实现响应式的for…of迭代

```js
const arr = reactive([1,2,3,4,5])

effect(()=>{
	for(const val of arr){
		console.log(val)
	}
})

arr[1] = 'bar'
arr.length = 0
const arr = reactive([1,2,3,4,5])

effect(()=>{
	for(const val of arr.values()){
		console.log(val)
	}
})

arr[1] = 'bar'
arr.length = 0
```

其实需要指出的是，无论是使用for…of循环，还是调用values等等方法，都会读取到数组的Symbol.iterator属性。该属性时一个symbol值，为了避免发生意外，以及性能上的考虑，不应该在副作用函数与Symbol.iterator这类symbol值之间建立响应联系（原因？），因此需要修改get拦截函数，如一下代码所示：

```js
function createReactive(obj, isShallow = false, isReadonly = false){
	return new Proxy(obj, {
		get(target, key, receiver){
			if(key === 'raw'){
				return target
			}
            //如果存在的是数组，并且key存在于arrayInstrumentantions上。
            //那么返回定义在arrayInstrumentantions的值
            if(Array.isArray(taraget)&&arrayInstrumentantions.hasOwnProperty(key)){
                return Reflect.get(arrayInstrumentantions,key,receiver)
            }
			// 添加判断，如果key的类型的symbol，则不进行追踪
			if(!isReadonly && typeof key !=='symbol'){
				track(target, key)
			}
			const res = Reflect.get(target, key, receiver)
			
			if(isShallow){
				return res
			}
	
			if(typeof res === 'object' && res !== null){
				return isReadonly? readonly(res) : reactive(res)
			}

			return res
		}
	})
}

const arrayInstrumentantions={
    includes:function(){}
}
```

数组内部的方法进行重写

#### 1. 数组的查找方法

1. includes    (arrayInstrumentantions)

   ```js
   const arr = reactive([1,2])
   
   effect(()=>{
   	console.log(arr.includes(1)) // 初始打印 true
   })
   
   arr[0] = 3 // 副作用函数重新执行，并打印false
   
   
   const obj = {}
   const arr = reactive([obj])
   console.log(arr.includes(arr[0])) 	// false
   //解决方法
   function reactive(obj){
   	// 即使obj相同，还是会创建新的代理对象
   	return createReactive(obj)
   }
   // 定义一个Map实例，存储原始对象到代理对象的映射
   const reactiveMap = new Map()
   
   function reactive(obj){
   	// 先通过原始对象obj寻找之前创建的代理对象，如果找到了直接返回已有的代理对象
   	const existionProxy = reactiveMap.get(obj)
   	if(existionProxy) return existionProxy 
   	
   	// 如果没找到，则创建新的代理对象
   	const proxy = createReactive(obj)
   	// 存储到Map中，帮助重复创建
   	reactiveMap.set(obj, proxy)
   	return proxy 
   }
   const arrayInstrumentations = {
   	includes: function(){/*...*/}
   }
   
   function createReactive(obj, isShallow = false, isReadonly = false){
   	return new Proxy(obj, {
   		get(target, key, receiver){
   			if(key === 'raw'){
   				return target
   			}
   			// 如果操作的目标对象时数组，并且key存在于arrayInstrumentations上
   			// 那么返回定义在arrayInstrumentations上的值
   			if(Array.isArray(target) && arrayInstrumentations.hasOwnProperty(key)){
   				return Reflect.get(arrayInstrumentations, key, receiver)
   			}
   			
   			if(!isReadonly && typeof key !== 'symbol'){
   				track(target, key)
   			}
   		
   			const res = Reflect.get(target, key, receiver)
   		
   			if(!isShallow){
   				return res
   			}
   
   			if(typeof res === 'object' && res !== null){
   				return isReadonly?readonly(res):reactice(res)
   			}
   			
   			return res
   		}
   	})
   }
   //includes函数
   const originMethod = Array.prototype.includes
   const arrayInstrumentations = {
   	includes: function(...args){
   		// this是代理对象，现在代理对象中查找，将结果存储到res中
   		let res = originMethod.apply(this, args)
   		if(res === false){
   			// res为false说明没有找到，通过this.raw拿到原始数组，再去其中查找并更新res值
   			res = originMethod.apply(this.raw, args)
   			
   		}
   		return res
   	}
   }
   ```

   

2. indexOf和lastIndexOf

   判断原型对象中是否存在该方法，然后进行数据组装重写

   ```js
   const arrayInstrumentations = {}
   ;['includes','indexOf','lastIndexOf'].forEach(method => {
   	// this是代理对象，现在代理对象中查找，将结果存储到res中
   	let res = originMethod.apply(this, args)
   	if(res === false){
   		// res为false说明没有找到，通过this.raw拿到原始数组，再去其中查找并更新res值
   		res = originMethod.apply(this.raw, args)
   		
   	}
   	return res
   })
   ```

   

#### 2. 隐式修改数组长度的原型方法

这次主要了解那些会隐式修改[数组长度](https://so.csdn.net/so/search?q=数组长度&spm=1001.2101.3001.7020)的方法，主要指的是数组的栈方法，如**push/pop/shift/unshift以及splice**

比如push

过阅读规范得知当调用数组的push方法向数组中添加元素时，既会读取数组的length属性值，也会设置length的值，这就导致两个独立的副作用函数互相影响。这样会导致**栈溢出**的错误
所以通过“屏蔽”对length属性的读取，就能避免其与副作用函数建立响应联系，问题就解决了，毕竟push方法主要是修改操作而不是读取操作，这样不通过读取建立响应联系不会产生其他问题。所以我们要重写数组的push方法，如下面代码所示：

```js
// 设置一个标记变量代表是否进行追踪，默认为true表示允许追踪
let shouldTrack = true;
// 重写数组的push方法
['push'].forEach(method => {
	// 取得原始push方法
	const originMethod = Array.prototype[method]
	// 重写
	arrayInstrumentations[method] = function(...args){
		// 在调用原始方法之前，禁止追踪
		shouldTrack = false
		// push方法的默认行为
		let res = originMethod.apply(this,args)
		// 在调用原始方法后，恢复允许追踪
		shouldTrack = true
		return res
	}
})
function track(target, key){
	// 当禁止追踪时，直接返回
	if(!activeEffect || !shouldTrack) return
}
let shouldTrack = true
;['push','pop','shift','unshift','splice'].forEach(method => {
	const originMethod = Array.prototype[method]
	// 重写
	arrayInstrumentations[method] = function(...args){
		shouldTrack = false
		let res = originMethod.apply(this,args)
		shouldTrack = true
		return res
	}
})
```

| call与apply区别 | 相同点         | 不同点                                   | 性能                                         |
| --------------- | -------------- | ---------------------------------------- | -------------------------------------------- |
| call            | 改变this的指向 | call 第二个参数开始接受一个参数列表      | 参数在三个以内，call 和 apply 的性能差不多， |
| apply           | 改变this的指向 | apply第二个参数开始接受一个参数[数组]    | 参数超过三个，call 的性能要比 apply 的好一点 |
| bind            |                | 没有把函数立即执行，而是预先处理改变this |                                              |

### 5.8 如何代理Set和Map

set和map与普通对象的区别：前者使用特定的属性和方法操作自身。本质不变：track建立响应联系，trigger函数触发响应。

```js
const s = new Set([1,2,3])
const p = new Proxy(s,{})
console.log(p.size)
//Uncaught TypeError: Method get Set.prototype.size called on incompatible receiver #<Set>
//    at get size (<anonymous>)
//    at <anonymous>:3:15

Set.property.size // 访问器属性
//作为方法调用，并且size的set函数是undefined。以下为解决方法：
const s = new Set([1,2,3])
const p = new Proxy(s,{
	get(target, key, receiver){
		if(key==='size'){
			// 如果读取的是size属性
			// 通过指定第三个参数receiver为原始对象target从而修复问题
			return Reflect.get(target, key, target)
		}
        // 将方法与原始数据对象target绑定后返回
		return target[key].bind(target)
		// 读取其他属性则是默认行为
		return Reflect.get(target, key, target)
		
	}
})

//最后的代码
const reactiveMap = new Map()
function reactive(obj){
	const proxy = createReactive(obj)
	const existionProxy = reactiveMap.get(obj)
	reactiveMap.set(obj, proxy)
	return proxy
}

// 在createReactive里封装用于代理Set/Map类型数据的逻辑
function createReactive(obj, isShallow = false, isReadonly = false){
	return new Proxy(obj, {
		get(target, key, receiver){
			if(key === 'size'){
				return Reflect.get(target, key, target)
			}
			// 将方法雨原始数据对象target绑定后返回
			return target[key].bind(target)
		}	
	}
})
}

```

**Js对象的属性类型**

1. 数据属性

   ```js
   var Person = {
       name : "Lucy"
   }
   //相当于
   Object.defineProperty(Person, "name", {
       Configurable: true, //[[Configurable]]表示能否通过delete 删除属性从而重新定义属性，能否修改属性的特性，或者能否把属性修改为访问器属性
       					//直接在对象上定义的属性，这个特性的默认值为true；
                           //Object.defineProperty定义的属性，默认值为false。
       Enumerable: true, 
       //[[Enumerable]]表示能否通过for-in 循环返回属性。直接在对象上定义的属性，这个特性的默认值为true；Object.defineProperty定义的属性，默认值为false
       Writable: true,
       //[[Writable]]表示能否修改属性的值。直接在对象上定义的属性，这个特性的默认值为true；Object.defineProperty定义的属性，默认值为false
       value: "Lucy" //属性的数据值；默认值为undefined。
   })
   
   ```

2. 访问器属性

   ```js
   访问器的4个特性：
   //- [[Configurable]]：表示能否通过delete 删除属性从而重新定义属性，能否修改属性的特性，或者能否把属性修改为数据属性。
   直接在对象上定义的属性，这个特性的默认值为true；
   Object.defineProperty定义的属性，默认值为false
   //- [[Enumerable]]：表示能否通过for-in 循环返回属性。
   直接在对象上定义的属性，这个特性的默认值为true；
   Object.defineProperty定义的属性，默认值为false
   //- [[Get]]：在读取属性时调用的函数；默认值为undefined。
   //- [[Set]]：在写入属性时调用的函数；默认值为undefined。
   
   
   //定义单个属性特性
   var Person = {
       name : "Lucy",
       _age: 20
   }
   Object.defineProperty(Person, "age", {
       get: function(){
           return this._age
       },
       set: function(newVal){
           this._age = newVal;
       }
   })
   console.log(Person.age); //20
   Person.age = 30;
   console.log(Person.age); //30
   
   //同时定义多个属性特性
   var Person = {};
   Object.defineProperties(Person, {
       name: {
           value: "Lucy"
       },
       _age: {
           value: 20
       },
       age: {
           get: function(){
               return this._age;
           },
           set: function(newVal){
               this._age = newVal;
           }
       }
   })
   Person.age = 30;
   console.log(Person.age);//20,原因:通过Object.defineProperty定义的属性,configurable默认为false
   console.log(Object.getOwnPropertyDescriptor(Person,"_age").configurable) //false
   //不能直接定义，必须使用defineProperty定义
   ```

   **建立响应联系**

   ```js
   // 定义一个对象，将自定义的add方法定义到该对象下
   const mutableInstrumentations = {
   	add(key){/*...*/}
   }
   function createReactive(obj, isShallow = false, isReadonly = false){
   	return new Proxy(obj, {
   		get(target, key, receiver){
   			if(key === 'raw') return target 
   			if(key === 'size'){
   				// 调用track函数建立响应联系，响应联系需要建立在ITERATE_KEY于副作用函数之间
   				track(target, ITERATE_KEY)
   				return Reflect.get(target, key, target)
   			}
   			// 返回定义在mutableInstrumentations对象下的方法
   			return mutableInstrumentations[key]
   		}
   	})
   }
   const mutableInstrumentations = {
   	add(key){
   		// this仍然指向的是代理对象，通过raw属性获取原始数据对象
   		const target = this.raw
   		// 通过原始数据对象执行add方法
   		// 注意这里不需要使用bind方法了，因为是直接通过target调用
   		const res= target.add(key)
   		// 调用trigger函数触发响应，指定操作类型为ADD
   		trigger(target, key, 'ADD')
   		// 返回操作结果
   		return res
   	}
   }
   const mutableInstrumentations = {
   	delete(key){
   		const target = this.raw
   		const hadKey = target.has(key)
   		const res = target.delete(key)
   		// 当要删除的元素确实存在时，才触发响应
   		if(hadKey){
   			trigger(target, key, 'DELETE')
   		}
   		return res
   	}
   }
   
   ```

   #### 避免污染原数据

   响应数据设置到原始数据的方式叫数据污染

   ```js
   const m= new Map()
   const P1=reactive(m)
   const p2=reactive(new Map())
   p1.set('p2',p2)
   effect(()=>{
       console.log(m.get('p2').size)
   })
   m.get('p2').set('foo',1)
   //既可以操作原始数据，又可以操作响应数据。
   //解决方法在set之前检查是否为原始数据
   ```

   处理forEach

   ```js
   const m=new Map([
   	[{key:1},{value:1}]
   ])
   effect(()=>{
       m.forEach(function(value,key,n)){
        console.log(value)
        console.log(key)
       }
   })
   const mutableInstrumentations = {
   	forEach(callback,thisArg){
           const warp=(val)=>typeOf val==='object'?reactive(val):val;
           const target=this.raw;
           track(target, ITERATE_KEY)
           target.forEach((v,k)=>{
               callback(thisArg,wrap(v),wrap(k),this)
           })
       }
   }
   ```

   forEach和for..in对于集合遍历最大的区别在于for..in关注值是否变化。forEach关注值和key。

## 