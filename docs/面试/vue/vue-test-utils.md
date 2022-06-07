---
title: 单元测试
date: 2021-07-26
categories:
  - 单元测试
tags:
  - 单元测试
---
# 单元测试框架
```js
1.Qunit: 该框架诞生之初是为了jquery的单元测试，后来独立出来不再依赖于jquery本身，但是其身上还是脱离不开jquery的影子
2.jasmine: Behavior-Drive development(BDD)风格的测试框架，在业内较为流行,功能很全面，自带asssert、mock功能
3.mocha: node社区大神tj的作品，可以在node和browser端使用，具有很强的灵活性，可以选择自己喜欢的断言库，选择测试结果的report
4.intern: 看官方介绍该测试框架功能极其全面，似乎囊括了业内跟测试相关的所有功能
断言库：
1.chai：应该是目前组流行的断言库了，支持TDD(assert)、BDD(expect、should)两个风格的断言库
var chai = require('chai'); 
var assert = chai.assert; // typef assert === 'object'
chai.should(); // 对Obejct.prototype进行拓展
2. should.js: TJ的另外一个开源贡献
3.expect.js:BDD风格的另外一个断言库，基于should.js,是mini版的BDD库
4.assert(node自带核心模块): 可以在node中使用的断言模块
3、 mock库
sinon.js: 目前使用最多的mock库，将其分为spies、stub、fake XMLHttpRequest、Fake server、Fake time几种，根据不同的场景进行选择。
4、 test runner
karma: 设置测试需要的框架、环境、源文件、测试文件等，配置完后，就可以轻松地执行测试。
```
# 测试运行器
Jest 是功能最全的测试运行器。它所需的配置是最少的，默认安装了 JSDOM，内置断言且命令行的用户体验非常好。不过你需要一个能够将单文件组件导入到测试中的预处理器。我们已经创建了 vue-jest 预处理器来处理最常见的单文件组件特性，但仍不是 vue-loader 100% 的功能。
mocha-webpack 是一个 webpack + Mocha 的包裹器，同时包含了更顺畅的接口和侦听模式。这些设置的好处在于我们能够通过 webpack + vue-loader 得到完整的单文件组件支持，但这本身是需要很多配置的。
    