module.exports = {
	permalink: "/:year/:month/:day/:slug",
	// 统一配置永久链接
	title: 'lyq的小小世界',
	base:'/blog/',
	description: '记录工作中的问题和学习',
	head: [
		['meta', {name: 'viewport', content: 'width=device-width,initial-scale=1,user-scalable=no'}],
	],
	locales: {
		'/': {lang: 'zh-CN'}
	},
	sidebar: 'auto',
	// theme: 'reco',
	plugins: [
		[ require("./plugin/live2d") ]
	],
	themeConfig: {
		type: 'blog',
		blogConfig: {
			category: {location:2, text:'分类'},
			tag: {location:2, text:'标签', link:'/tags/', icon:'reco-tag'},
			
		},
		nav:[
			{ text: '时间轴', link: '/timeline/', icon: 'reco-date' }
		],
		author: 'lyq',
		authorAvatar: '/lyq.jpg',
		friendLink: [
		  {
		    title: 'vuepress',
		    desc: 'Vue 驱动的静态网站生成器',
		    link: 'https://vuepress.vuejs.org/zh/'
		  },
		  {
		    title: 'Vue.js',
		    desc: '渐进式 JavaScript 框架',
		    link: 'https://cn.vuejs.org/'
		  },
		  {
			title: 'Egg.js',
			desc: '为企业级框架和应用而生的node.js框架',
			link: 'https://eggjs.org/zh-cn/'
		  }
		]
	}
}