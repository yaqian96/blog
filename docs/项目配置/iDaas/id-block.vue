<!--
 * @Author: yaqian2
 * @Date: 2022-05-23 16:15:18
 * @Description: id-block上中下布局
-->
<template>
  <div class="block-wrap">
    <header v-if="$slots.header" class="block-header">
      <slot name="header" />
    </header>
    <el-scrollbar>
      <div class="block-content">
        <slot />
      </div>
    </el-scrollbar>
    <footer v-if="$slots.footer" class="block-footer">
      <slot name="footer" />
    </footer>
  </div>
</template>

<script>
export default {
  name: "IdBlock",
  data() {
    return {};
  },
  methods: {},
};
</script>

<style lang="scss" scoped>
.block-wrap {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  height: 100%;
}

.block-content {
  flex-grow: 1;
  overflow: auto;
}

.block-footer {
  display: flex;
  justify-content: center;
  padding: 20px;
}
</style>
