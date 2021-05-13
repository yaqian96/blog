---
title: Obsevable()方法简介
date: 2020-08-11 10:55:30
author: 'lyq'
categories:
  - vue
tags: 
  - Vue.js
---


<!-- more -->
# 关于observe的使用方式

## 介绍

[observable](https://cn.vuejs.org/v2/api/#Vue-observable)是vue.js在2.6.0版本新增的方法，功能类似于[vuex](https://vuex.vuejs.org/zh/)，可以对一些简单的跨组件数据做状态管理。

就像官方文档所说，如果不是构建中大型项目，使用vuex反而会是繁琐冗余的，而使用observable就会简洁很多。

## 使用

observable是vue自带的方法，所以不用像vuex那样引入外部依赖。

**首先创建一个store文件，包含一个store和mutations。**

```javascript
// store.js
import Vue from 'vue'

let store = Vue.observable({count: 0})
let mutations = {
	setCount(count){
		store.count = count;
	}
}
export {store, mutations}
```

observable接受一个对象作为参数，该对象会被处理为动态绑定的数据。

**然后创建一个vue文件并引入store的数据和方法。**

```vue
<!-- home.vue -->
<template>
  <div class='home'>
    home page
		<button @click='setCount(count+1)'>+ 1</button>
		<button @click='setCount(count-1)'>- 1</button>
		<div>{{count}}</div>
		<router-link to="/child">to child</router-link>
	</div>
</template>
<script>
	import {store, mutations} from '@/store/index.js'
	console.log(store, mutations);
	export default {
		name: 'home',
		computed: {
			count() {
				return store.count
			}
		},
		methods: {
			setCount: mutations.setCount
		}
	}
</script>

```

点击按钮，当前页面的数据会发生变化，**然后再建立一个页面，同样的引入store的数据和方法**。

```vue
<!-- child.vue -->
<template>
	<div class='child'>
		<p>{{count}}</p>
		<router-link to='/home'>to home</router-link>
	</div>
</template>
<script>
	import {store} from '@/store/index.js'
	export default {
		computed: {
			count() {
				return store.count
			}
		},
	}
</script>
```

在home页面修改count的值，然后跳转到child页面，可以发现child页面绑定的count值也发生了变化。

作为对较少数据做状态管理的方法，使用还是比较简单的。