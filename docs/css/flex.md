---
title: flex布局
date: 2020-06-10
permalink:
categories:
  - css
tags:
  - null
---

# 使用 flex 布局左右布局如果有三个元素，前两个靠左，后一个靠右

```css
/* 将所有的元素靠左 ，父元素设置 */
justify-content: left;
/* 将最后一个靠左 */
margin-left: auto;
```

# flex 布局实现左边固定，右边自适应

```css
.left-div {
  flex: 0 0 200px;
}
.right-div {
  flex: 1;
  /* 右边超过宽度时的设置 */
  min-width: 0;
}
```

# 容器属性

1. flex-flow

```js
flex-flow = flex-drection + flex-wrap
默认值为row nowrap
```

2. flex-direction

```js
修改主轴的方向：row（默认值） row-reverse column column-reverse
```

3. flex-wrap

```js
是否换行：flex-wrap: nowrap（默认） | wrap | wrap-reverse
```

4. justify-content

```js
主轴上的对齐方式：justify-content: flex-start（默认） | flex-end | center | space-between | space-around;
```

5. align-items

```js
属性定义项目在交叉轴上如何对齐
flex-start | flex-end | center | baseline | stretch（默认）;
```

6. align-content

```js
定义了多根轴线的对齐方式
flex-start | flex-end | center | space-between | space-around | stretch（默认）;
```

# 元素属性

1. order

```js
排序：数值越小，越靠前，默认为0
值相同时，以dom中元素排列为准
```

2. flex-grow

```js
放大比例（容器宽度>元素总宽度时如何伸展）flex-grow: <number>; /* default 0 */
```

3. flex-shrink

```js
缩小比例（容器宽度<元素总宽度时如何收缩） flex-shrink: <number>; /* default 1 */
```

4. flex-basis

```js
设置的是元素在主轴上的初始尺寸。 flex-basis: <length> | auto; /* default auto */
width和flex-basis：
  1. 两者为0
  width: 0 —— 完全没显示
  flex-basis: 0 —— 根据内容撑开宽度
  2. 两者非0
  数值相同时两者等效
  同时设置，flex-basis优先级高
  3.  flex-basis为auto
  如设置了width则元素尺寸由width决定；没有设置则由内容决定
```

5. flex

```js
flex = flex-grow + flex-shrink + flex-basis 默认值（0 1 auto）
flex: 1 =>  flex: 1 1 0%
flex: 2 =>  flex: 2 1 0%
flex: auto => flex: 1 1 auto;
flex: none => flex: 0 0 auto;
```

6. align-self

```js
属性允许单个项目有与其他项目不一样的对齐方式，可覆盖align-items属性。默认值为auto，表示继承父元素的align-items属性，如果没有父元素，则等同于stretch。
 align-self: auto | flex-start | flex-end | center | baseline | stretch;
```
