---
title: element $confirm
date: 2021-5-27 18:55:30
categories:
  - element
tags:
  - element
---

# 1.问题：$confirm提交之后，焦点还在原位置，导致点击空格一直在删除
```js
// 解决方法：阻止回车或者空格选中确定按钮，删除数据，在$confirm的finally中将焦点置到其他地方
this.$confirm('此操作将永久删除课程, 是否继续?', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      center: true,
      closeOnClickModal: false,
      closeOnPressEscape: false,
      customClass: 'blankDel5',
      beforeClose: (action, instance, done) => { 
      // 取消回车和空格确认事件
      // console.log('进入beforeClose事件');
        if (action === 'confirm') {
            let dom=document.getElementsByClassName('blankDel5')[0];
            let btn=dom.getElementsByClassName('el-button el-button--default el-button--small el-button--primary')[0]
            btn.onclick = function (e) {
                e = e || window.event;
                if (e.detail !== 0) {
                    done();
                }
            }();
        } else {
            done();
        }
      }
    }).then(() => {
      deletePunch({punchCardId: row.id}).then(res => {
        if(res[0]) {
          this.$message({
            type: 'success',
            message: '删除成功'
          });
          this.getCourseList()
        } else {
          this.$message({
            type: 'error',
            message: res[1].msg|| 'error'
          });
        }
      });
    }).catch(() => {
      this.$message({
        type: 'info',
        message: '已取消删除'
      });
    }).finally(()=>{
      console.log('11111111111');
      var form = document.getElementById("courseFocus");
      console.log('form',form);
      form.focus();
    });
```
# 2.问题：vue中禁止浏览器的回退，
```js
// 在app.vue中加
mounted(){
       history.pushState(null, null, document.URL);
       window.addEventListener('popstate', function () {
         history.pushState(null, null, document.URL);
       });
   }
   //但是会出现this.$router.go(-1)无效
   解决方法：根据router的钩子函数，进行相应的判断进行跳转。
  //  this.$router和this.$route的区别
  this.$route是一个当前路由对象(只读)有query, params, name, path 
  this.$router是VueRouter实例(全局路由对象)其中包括不同的方法 push() replace() go()
  // params和query的区别
  1. 使用params传参只能使用name进行引入 和定义路由时的定义的参数(必须) ，是路由的一部分必须在路由后边添加参数名。
  2. query相当于拼接在url的后边，传不传不会影响路由的跳转。query可以使用name和path来引用。
```
# 3.问题： vue中报错。避免冗余的路由跳转
```js
// 获取原型对象上的push函数
const originalPush = Router.prototype.push
// 修改原型对象中的push方法
Router.prototype.push = function push(location) {
  return originalPush.call(this, location).catch(err => err)
}
```