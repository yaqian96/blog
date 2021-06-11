---
title: element $confirm
date: 2021-5-27 18:55:30
categories:
  - element
tags:
  - element
---

# 问题：$confirm提交之后，焦点还在原位置，导致点击空格一直在删除
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