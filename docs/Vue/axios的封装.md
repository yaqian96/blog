---
title: axios的封装
date: 2020-08-12 18:55:30
categories:
  - vue
tags:
  - axios
---

如今的项目基本都是采用axios库进行http接口请求。axios 是一个基于 promise 的 HTTP 库，可以用在浏览器和 node.js 中，拥有拦截请求和响应、转换JSON数据、客户端防御XSRF等优秀的特性。在实际项目中，通常还是需要对axios再做一次封装，方便我们简化代码和利于后期的更新维护。

<!-- more -->

#  axios的封装

## 安装

```bash
npm install axios;
或
yarn add axios;
```

## 引入

一般我会在src目录中新建一个request文件夹，然后新建一个index.js文件用来封装我们的axios。

```javascript
// request/index.js
import axios from "axios";
import { MessageBox, Message } from "element-ui";
import store from "@/store";
```

## 创建实例

```javascript
const service = axios.create({
  // 配置服务地址
  baseURL: process.env.BASE_URL,
  // 请求超时时间
  timeout: 10000,
});
```

## 添加请求拦截器

请求拦截器一般主要是在请求头中塞一条token数据。

```javascript
service.interceptors.request.use(
  (config) => {
    if (store.getters.token) {
      config.headers["authorization"] = `Bearer ${getToken()}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
```

至于token是放在请求头中还是请求体中，还得看后台是从哪里接收，一般是放在请求头中，示例中请求头的key是使用egg-jwt的接收关键字，不同的服务器语言接收的关键字也可能不一样。

## 添加响应拦截器

封装axios最多的操作其实还是对响应数据的拦截封装，响应拦截器也主要是对错误的响应数据做一个统一的处理。在这里我只是对异常的请求使用elementUI的消息框做了统一的提示，并且当token失效时引导用户重新登录。

```javascript
service.interceptors.response.use(
  (response) => {
    const res = response.data;
    // 如果返回的code不是200，说明请求出现问题
    if (res.code !== 200) {
      Message({
        message: res.message || "Error",
        type: "error",
        duration: 3000,
      });

      // 508: 无效的token; 514: token已过期;
      if (res.code === 508 || res.code === 514) {
        // 前往登录页面
        MessageBox.confirm(
          "登录失效，请重新登录",
          {
            confirmButtonText: "重新登录",
            cancelButtonText: "取消",
            type: "warning",
          }
        ).then(() => {
          // 重置本地保存的token，然后回到登录页
          store.dispatch("user/resetToken").then(() => {
            // 因为没有了token，重新加载会回到登录页
            location.reload();
          });
        });
      }
      return Promise.reject(new Error(res.message || "Error"));
    } else {
      return response;
    }
  },
  (error) => {
    Message({
      message: error.message,
      type: "error",
      duration: 3000,
    });
    return Promise.reject(error);
  }
);
```

## 业务调用

封装号axios后当然就要写业务接口去调用了，网上很多文章都对接口管理也足了封装，但是我认为这其实是没必要的，因为axios本身就已经封装好了get、post等api接口，可以使用axios.get()或者axios.psot()等接口去请求，也可以直接使用axios()方法通过配置method来请求数据，与jQuery的ajax()方法挺像的，只要管理好接口文件，统一格式，完全没必要再封装一次了。

```javascript
// api/role.js
import request from "@/request";
export function getRoutes() {
  return request({
    url: "/api/routes",
    method: "get",
  });
}
export function getRoles() {
  return request({
    url: "/api/roles",
    method: "get",
  });
}
export function addRole(data) {
  return request({
    url: "/api/role",
    method: "post",
    data,
  });
}
```

## 相关

axios源码:[github.com/axios/axios](https://github.com/axios/axios)

中文文档:[www.kancloud.cn/yunye/axios/234845](https://www.kancloud.cn/yunye/axios/234845)