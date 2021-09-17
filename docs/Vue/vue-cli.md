---
title: vue-cli
date: 2020-09-08 10:55:30
author: 'lyq'
categories:
  - vue
tags: 
  - Vue.js
---
1. vue-cli
```js
vue --version 检查版本
1. @vue-cli
2. @vue/cli-service 开发环境依赖
   构建在webpack和webpack-dev-server之上的
  {
    "scripts": {
      "serve": "vue-cli-service serve",
      "build": "vue-cli-service build"
    }
  }
3. cli插件
   vue-cli-plugin- (社区插件) 开头
vue ui 以图形化界面创建和管理项目 //vue3.x以上
4. Preset
是一个包含创建新项目所需预定义选项和插件的 JSON 对象，让用户无需在命令提示中选择它们。
```
2. 开发
```js
1. 浏览器兼容性
  browserslist .browserslistrc文件
2. HTML和静态资源
  1. HTML
   `lodash template`语法插入内容
   <link rel="icon" href="<%= BASE_URL %>favicon.ico"/>
  2. 静态资源
  public文件夹下
3. css相关
  Vue CLI 项目天生支持 PostCSS、CSS Modules 和包含 Sass、Less、Stylus 在内的预处理器
4. webpack相关
  configureWebpack对象，最终将配置进行合并
  chainWebpack对象 //vue cli内部的webpack配置是通过webpack-chain维护。
  //提供了一个 webpack 原始配置的上层抽象，使其可以定义具名的 loader 规则和具名插件，并有机会在后期进入这些规则并对它们的选项进行修改。
5. 模式和环境变量
  1. 模式：
    development 模式用于 vue-cli-service serve
    test 模式用于 vue-cli-service test:unit
    production 模式用于 vue-cli-service build 和 vue-cli-service test:e2e
  2. 环境变量
    .env文件：配置BASE_URL、环境变量VUE_APP_ 前缀开头
    .env.local：配置只在本地文件有效的变量，在.gitignore中配置，忽略上传git
6. 构建目标
  vue-cli-service build --target 选项指定不同的构建目标
```

