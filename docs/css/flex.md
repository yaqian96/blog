---
title: flex布局
date: 2020-06-10
permalink: 
categories: 
  - flex
tags: 
  - null
---
# 使用flex布局左右布局如果有三个元素，前两个靠左，后一个靠右
```css
/* 将所有的元素靠左 ，父元素设置 */
justify-content: left;
/* 将最后一个靠左 */
margin-left: auto;
```
# flex布局实现左边固定，右边自适应
```css
.left-div{
  flex: 0 0 200px;
}
.right-div{
    flex: 1;
    /* 右边超过宽度时的设置 */
    min-width: 0;
}
```