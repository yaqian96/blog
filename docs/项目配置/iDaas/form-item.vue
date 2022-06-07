<template>
  <el-form-item v-bind="props" :error="error">
    <template v-slot:label>
      <slot v-if="props && props.label" :name="`${props.prop}Label`">
        <ids-tooltip :content="props.label" placement="top"></ids-tooltip>
      </slot>
      <slot v-else name="label">
        <ids-tooltip :content="$attrs.label" placement="top"></ids-tooltip>
      </slot>
    </template>
    <slot></slot>
  </el-form-item>
</template>

<script>
export default {
  name: "IdsFormItem",
  props: {
    props: {
      default: () => ({}),
      type: Object,
    },
    error: {
      default: "",
      type: String,
    },
  },
};
</script>
<style lang="scss" scoped>
::v-deep .el-form-item__label {
  display: flex;
}
</style>
