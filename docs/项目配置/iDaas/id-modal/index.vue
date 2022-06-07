<!--
 * @Author: Gavin ZHANG
 * @Date: 2021-10-13 17:22:55
 * @Description: modal弹窗
-->

<template>
  <el-dialog
    ref="elementVM"
    v-bind="$attrs"
    :width="width"
    :before-close="handleBeforeClose"
    v-on="$listeners"
  >
    <slot></slot>
    <template v-slot:footer>
      <slot name="footer" v-bind="{ handleClose }"></slot>
    </template>
  </el-dialog>
</template>

<script>
import { beforeClose } from "../mixins/beforeClose";
export default {
  name: "IdDialog",
  mixins: [beforeClose],
  props: {
    width: {
      type: String,
      default: "590px",
    },
  },
};
</script>
