/*
 * @Author: Gavin ZHANG
 * @Date: 2022-03-30 09:20:33
 * @Description: 离开二次弹框确认 dailog drawer
 */

import { foo } from "@/utils";
import { isEqual } from "lodash";

const props = {
  isEdit: {
    type: Boolean,
    default: true,
  },
  // 新的数据
  formData: Object,
  // 备份数据
  formDataBak: Object,
  // 是否需要强制二次弹窗
  needConfirm: {
    type: Boolean,
    default: false,
  },
  confirmTitle: {
    type: String,
    default: "提示",
  },
  confirmContent: {
    type: String,
    default: "数据未保存，确认退出？",
  },
  confirmOptions: {
    type: Object,
    default: () => ({
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    }),
  },
};

const handleBeforeClose = function (done) {
  if (this.beforeClose) {
    this.beforeClose(done);
    return;
  }

  if (!this.isEdit) {
    done();
    return;
  }

  let next = true;
  if (this.formData && this.formDataBak) {
    next = isEqual(this.formData, this.formDataBak);
  }

  if (this.needConfirm || !next) {
    const params = [
      this.confirmContent,
      this.confirmTitle,
      this.confirmOptions,
    ];
    this.$confirm(...params)
      .then(() => {
        done();
      })
      .catch(foo);
    return;
  }

  done();
};
const handleClose = function () {
  this.$refs.elementVM.handleClose();
};

const handleBeforeLeave = function (activeName, oldActiveName) {
  if (oldActiveName == undefined) {
    return true;
  }

  if (this.beforeLeave) {
    return this.beforeLeave(activeName, oldActiveName);
  }

  if (!this.isEdit) {
    return true;
  }

  let next = true;
  if (this.formData && this.formDataBak) {
    next = isEqual(this.formData, this.formDataBak);
  }

  if (this.needConfirm || !next) {
    const params = [
      this.confirmContent,
      this.confirmTitle,
      this.confirmOptions,
    ];

    return this.$confirm(...params);
  }

  return true;
};

export const beforeClose = {
  inheritAttrs: false,
  props: {
    ...props,
    beforeClose: Function,
  },
  methods: {
    handleBeforeClose,
    handleClose,
  },
};

export const beforeLeave = {
  inheritAttrs: false,
  props: {
    ...props,
    beforeLeave: Function,
  },
  methods: {
    handleBeforeLeave,
  },
};
