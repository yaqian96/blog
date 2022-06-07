<!--
 * @Author: yaqian2
 * @Date: 2022-06-07 15:47:22
 * @Description: Description
-->
<template>
  <div class="footer" :class="{ 'drawer-footer': isDrawer }">
    <template v-if="type === POPUP_TYPE_ENUM.ADD">
      <el-button @click="cancel"> 取消 </el-button>
      <el-button type="primary" @click="submit"> 提交 </el-button>
    </template>
    <template v-else-if="type === POPUP_TYPE_ENUM.DETAIL">
      <el-button type="primary" @click="handleToEdit">
        {{ editText }}
      </el-button>
    </template>
    <template v-else>
      <el-button @click="handleBackToDetail"> 取消 </el-button>
      <el-button type="primary" @click="handleEditSubmit"> 保存 </el-button>
    </template>
  </div>
</template>
<script>
import { POPUP_TYPE_ENUM } from "@/service/const/common.js";
export default {
  name: "IdsFooterSubmit",
  props: {
    query: {
      default: () => ({}),
      type: Object,
    },
    type: {
      type: [String, Number],
      default: "",
    },
    editText: {
      type: String,
      default: "修改",
    },
    isDrawer: {
      type: Boolean,
      default: true,
    },
    relationId: {
      default: "",
      type: String,
    },
  },
  data() {
    return {
      POPUP_TYPE_ENUM,
    };
  },
  methods: {
    submit() {
      this.$emit("addSubmit");
    },
    async handleEditSubmit() {
      this.$emit("editSubmit");
    },
    handleToEdit() {
      this.$emit("toEdit");
    },
    handleBackToDetail() {
      this.$emit("backToDetail");
    },
    cancel() {
      this.$emit("closeDrawer");
    },
  },
};
</script>
<style lang="scss" scoped>
.drawer-footer {
  position: fixed;
  right: 0;
  bottom: 0;
  z-index: 99;
  width: 1000px;
  padding: 30px;
  text-align: right;
  background: #fff;
  border-top: 1px solid #e4e5ef;
}
</style>
