---
title: nuxt框架
date: 2021-5-13
permalink: /nuxt框架
categories: 
  - nuxt
tags: 
  - nuxt
---
## 白屏时间
  白屏时间：即用户点击一个链接或打开浏览器输入URL地址后，从屏幕空白到显示第一个画面(字符)的时间。
  白屏时间 = firstPaint - performance.timing.navigationStart;
  首屏时间：首屏时间是指用户打开网站开始，到浏览器首屏内容渲染完成的时间。
## nuxt的配置信息
```
import config from './config'
const Timestamp=new Date().getTime()
export default {
  head: {
    title: config.title,
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=0' },
      { hid: 'description', name: 'description', content: '' },
    ],
    link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
  },
  script: [
    {
      src: 'http://res.wx.qq.com/open/js/jweixin-1.2.0.js'
    }
  ],
  css: [{ src: '~/assets/styles/common.scss', lang: 'scss' }, '@/assets/fontClass/css/iconfont.css'],

  plugins: [{src: '@/plugins/vant-ui', ssr: true}, '~/plugins/axios.plugin', {src: '@/plugins/filters.js', ssr: false}, {src: '@/assets/fontClass/js/iconfont.js', ssr: false}, {src: '@/plugins/vconsole.ts', ssr: false}],

  components: true,

  buildDir: 'jhd-mobile',

  generate: {
    crawler: false,
    dir: 'jhd-mobile'
  },

  env: {

  },

  router: {
    base: '/jhd-mobile/',
    middleware: ['auth'],
    scrollBehavior: (to, from, savedPosition) => {
      console.log('====: scrollBehavior', to, from, savedPosition)
      return {
        x: 0,
        y: 0,
      }
    },
  },
  // loading: {
  //   color: 'blue',
  //   height: '10px',
  // },
  target: 'static',
  ssr: false,
  // modern: 'client',
  loading: '~/components/geek-loading/index.vue',
  loadingIndicator: {
    name: 'cube-grid',
    color: '#3B8070',
    background: 'white',
  },
  // serverMiddleware: ['~/server-middleware/logger'],

  buildModules: ['@nuxt/typescript-build', '@nuxtjs/stylelint-module'],
  cli: {
    badgeMessages: ['GEEK FRONTEND!!!'],
  },
  modules: ['@nuxtjs/axios', '@nuxtjs/style-resources'],
  styleResources: {
    scss: [
      '@/assets/styles/variable.scss', // 全局 scss 变量
    ]
  },
  axios: {
    prefix: '/',
    credentials: true,
    baseURL: '/',
    browserBaseURL: '/',
    proxy: process.env.NODE_ENV === 'development',
    retry: { retries: 2 },
  },
  proxy: config.proxy || {},
  build: {
    // nuxt里定义的 url-loader不含有mp3还有wav后缀的解析。
    extend(config) {
      const vueLoader = config.module.rules.find(loader => loader.loader.includes('vue-loader'))
      /* 把audio标签在编译时转成src属性 */
      vueLoader.options.transformToRequire = {
        audio: 'src'
      };
      /* 对mp3等格式的文件用url-loader进行处理 */
      config.module.rules.push({
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          esModule: false
        },
      })
      // 项目打包，由于浏览器存在缓存不能热更新的原因，给打包后的js文件添加时间戳。
      config.output.filename=`js/[name].${Timestamp}.js`
      config.output.chunkFilename=`js/[name].${Timestamp}.js`
      // console.log('1', config.module.rules);
    },
    transpile: [/vant.*?less/],
    babel: {
      plugins: [
        [
          'import',
          {
            libraryName: 'vant',
            style: (name) => {
              return `${name}/style/less.js`
            },
          },
          'vant',
        ],
        ["@babel/plugin-proposal-private-methods", { "loose": true }]
      ],
    },
    postcss: {
      plugins: [
        // eslint-disable-next-line global-require
        require('postcss-px-to-viewport')({
          unitToConvert: 'px',
          viewportWidth: 375,
          viewportHeight: 667,
          unitPrecision: 5,
          propList: ['*'],
          viewportUnit: 'vw',
          fontViewportUnit: 'vw',
          selectorBlackList: ['.vant-', /^.geek-dev-.+/g, '.el-', '.ig*'],
          mediaQuery: false,
          minPixelValue: 3,
          replace: true,
          exclude: [],
          landscape: false,
          landscapeUnit: 'vw',
          landscapeWidth: 1334,
        }),
      ],
    },
    styleResources: {
      scss: ['@/assets/styles/common.scss']
    }
  },
  // 在微信浏览器下在window对象下有WeixinJSBridge对象
  global: {
    "wx": true,
    "WeixinJSBridge": true
  }
}
```
## process
process.env.NODE_ENV
process是node的全局变量，并且有env这个属性，process.env包含着关于系统环境的信息。
但是没有NODE_ENV这个属性，这个是webpack定义的。
作用：通过判断变量区分开发环境或者生产环境
设置mode,webpack将会自动分配一些插件，其默认的是production。
## nuxt中注意的地方
1. 
```
仅在客户端加载 js-cookie 包
process.client 是Nuxt中特殊提供的数据
运行在客户端为 true; 运行在服务端为 false
const Cookie = process.client ? require('js-cookie') : undefined
为了防止刷新页面数据丢失，需要将数据持久化
 Cookie.set('token', data.data)
```
2. vuex中的配置
```
nuxtServerInit 是一个特殊的 action 方法
这个 action 会在服务端渲染期间自动调用
作用：初始化容器数据，传递数据给客户端使用
nuxtServerInit({ commit }:any, { req }:any) {
let token = '';
if (req.headers.cookie) {
将请求头中的 Cookie 字符串解析为一个对象
const parsed = cookieparser.parse(req.headers.cookie);
token = parsed.token;
 }
   commit('SET_TOKEN', token);
 },
```
3. 配置
  - 自loading效果。process-bar
  - fetch 方法
    - fetch 方法在所有组件都可以使用，服务端和客户端都会被调用，在组件初始化之前，无法获取  	this实例。
    - 客户端在 created 之后，mounted 之前 被调用
    - 服务端在 validate 之后被调用
  - asyncData
    该方法只能在page目录下使用，且该方法不能获取到this对象，可以拿到context对象该方法返回值会合并到实例的data里面
    返回是promise,是在路由的transition期间处理的。
  - head
    设置当前页面的Meta标签
  - layouts目录下的每个文件都会创建一个可通过页面的自定义布局、默认布局、错误页面。
  - nuxt页面的生命周期：只有beforeCreate和created这两个方法同时在客户端和服务端被调用，其他在客户端调用。
  - 注入contex和vue的实例
   在nuxt.config.js中使用plugins配置，在页面相对应的地方使用。