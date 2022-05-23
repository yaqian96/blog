<template>
  <div class="cascader-wrap">
    <template v-for="(item, index) in options">
      <ids-form-item
        :key="item.prop"
        class="cascader-item"
        :props="{ ...defaultProps, ...item }"
        :error="errorData ? errorData[item.prop] || '' : ''"
        v-on="item.formItemEvents || {}"
      >
        <component
          :is="item.formType"
          v-model="formModel[item.prop]"
          :label="item.label"
          :required="item.required"
          :prop="item.prop"
          v-bind="item.elProps || {}"
          v-on="item.elEvents || {}"
          @change="handleChange(index)"
        >
        </component>
      </ids-form-item>
    </template>
  </div>
</template>

<script>
import { FORM_TYPE_ENUM } from "@/service/const/common.js";
export default {
  name: FORM_TYPE_ENUM.SCONSTITUTE,
  props: {
    relevancy: {
      default: true,
      type: Boolean,
    },
    options: {
      default: () => [],
      type: Array,
    },
    formModel: {
      default: () => {},
      type: Object,
    },
    errorData: {
      default: () => {},
      type: Object,
    },
    prop: {
      default: "",
      type: String,
    },
  },
  data() {
    return {
      defaultProps: {
        labelWidth: "0px",
      },
    };
  },
  created() {
    this.$set(this.formModel, this.prop, {});
  },
  methods: {
    handleChange(index) {
      if (!this.relevancy) return;
      const optionsBehind = this.options.slice(index + 1);
      optionsBehind.forEach((item) => {
        const { prop } = item;
        const value = this.getValue(prop);
        this.$set(this.formModel, prop, value);
      });
    },
    getValue(prop) {
      let value = "";
      const valueIsArrayTypes = [
        FORM_TYPE_ENUM.NUMBER_RANGE,
        FORM_TYPE_ENUM.TIME_RANGE,
        FORM_TYPE_ENUM.DATE_RANGE,
        FORM_TYPE_ENUM.DATE_TIME_RANGE,
        FORM_TYPE_ENUM.CHECKBOX_GROUP,
        FORM_TYPE_ENUM.MULTIPLE_INPUT,
      ];
      if (valueIsArrayTypes.includes(prop)) {
        value = [];
      }
    },
  },
};
</script>
<style lang="scss" scoped>
.cascader-wrap {
  display: flex;
  flex-wrap: wrap;
}

.cascader-item {
  margin-right: 10px;

  ::v-deep .el-form-item__label {
    padding: 0;
  }
}
</style>
