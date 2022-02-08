---
title: position
date: 2022-01-26
permalink:
categories:
  - css
tags:
  - null
---

# 1. static

默认值。没有定位，元素出现在正常的流中（忽略 top, bottom, left, right 或者 z-index 声明）。

# 2. relative

生成相对定位的元素，相对于其正常位置进行定位。

因此，"left:20" 会向元素的 LEFT 位置添加 20 像素。

# 3. absolute

生成绝对定位的元素，相对于 static 定位以外的第一个父元素进行定位。

元素的位置通过 "left", "top", "right" 以及 "bottom" 属性进行规定。

# 4. fixed

生成绝对定位的元素，相对于浏览器窗口进行定位。

元素的位置通过 "left", "top", "right" 以及 "bottom" 属性进行规定。

# 4. sticky

```js
relative和固定定位fixed的结合
在滑动过程中，某个元素距离其父元素的距离达到sticky粘性定位的要求时(比如top：100px)；position:sticky这时的效果相当于fixed定位，固定到适当位置
使用条件：
1、父元素不能overflow:hidden或者overflow:auto属性。
2、必须指定top、bottom、left、right4个值之一，否则只会处于相对定位
3、父元素的高度不能低于sticky元素的高度
4、sticky元素仅在其父元素内生效
使用场景：某个元素固定在一个位置
```
