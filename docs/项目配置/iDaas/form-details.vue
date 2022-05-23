<!--
 * @Author: yaqian2
 * @Date: 2022-05-23 16:13:31
 * @Description: form的详情
-->
<template>
  <ids-dynamic-form :form-options="computedFormOptions" :form-model="formModel">
    <template v-for="item in computedFormOptions">
      <div :slot="item.prop" :key="item.prop">
        <template v-if="!computedFormDetail[item.prop]">-</template>
        <!-- 字段操作 -->
        <template v-else-if="computedFormDetail[item.prop].isFieldOps">
          <ids-field-opt
            v-model="computedFormDetail[item.prop].value"
            :data-field="computedFormDetail[item.prop].dataField"
            :ops-field="computedFormDetail[item.prop].opsField"
            :is-detail="true"
          />
        </template>
        <!-- 值为数组 -->
        <template v-else-if="Array.isArray(computedFormDetail[item.prop])">
          <span
            v-for="(value, index) in computedFormDetail[item.prop]"
            :key="index"
            class="tag"
            >{{ value | filterDetail }}</span
          >
        </template>
        <!-- 常规值 -->
        <template v-else>{{
          computedFormDetail[item.prop] | filterDetail
        }}</template>
      </div>
    </template>
  </ids-dynamic-form>
</template>

<script>
export default {
  name: "IdsFormDetail",
  filters: {
    filterDetail(val) {
      if (typeof val === "object") {
        return val.dictDataName || val.permName;
      }
      return val;
    },
  },
  props: {
    valueKey: {
      type: String,
      default: "paramValue",
    },
    valueExtKey: {
      type: String,
      default: "paramValueExt",
    },
    codeKey: {
      type: String,
      default: "paramCode",
    },
    formModel: {
      default: () => {},
      type: Object,
    },
    formOptions: {
      default: () => [],
      type: Array,
    },
    formDetail: {
      default: () => {},
      type: [Object, Array],
    },
  },
  computed: {
    computedFormOptions() {
      if (!this.formOptions) return [];
      return this.formOptions.map((item) => {
        if (item.editorType) {
          item.prop = item.paramCode;
        }
        return item;
      });
    },
    computedFormDetail() {
      if (Array.isArray(this.formDetail)) {
        return this.getFormDetailWithArray();
      }
      return this.formDetail;
    },
  },
  methods: {
    getFormDetailWithArray() {
      const detail = {};
      this.formDetail.forEach((item) => {
        let value;
        // 字段操作
        if (item.dataPermFieldOps) {
          value = this.getValueForFieldOps(item);
        } else {
          value = this.getValue(item);
        }
        detail[item[this.codeKey]] = value;
      });
      return detail;
    },
    getValue(item) {
      let value = item[this.valueKey];
      const valueExt = item[this.valueExtKey];
      if (valueExt && typeof valueExt === "object") {
        const keys = Object.keys(valueExt);
        value = keys.map((key) => {
          return valueExt[key];
        });
      }
      return Array.isArray(value) && value.length === 1 ? value[0] : value;
    },
    getValueForFieldOps(item) {
      let value = item[this.valueKey];
      const { dataField, opsField } = item.dataPermFieldOps;
      return {
        isFieldOps: true,
        dataField,
        opsField,
        value,
      };
    },
  },
};
</script>
<style lang="scss" scoped>
.tag {
  display: inline-block;
  height: 28px;
  padding: 0 10px;
  margin-right: 4px;
  line-height: 28px;
  background: #f2f3f5;
  border-radius: 2px;
}
</style>
