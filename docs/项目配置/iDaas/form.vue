<!--
 * @Author: yaqian2
 * @Date: 2022-05-23 16:09:54
 * @Description: Description
-->
<template>
  <el-form
    ref="elForm"
    :label-width="labelWidth"
    :label-position="labelPosition"
    v-bind="formProps"
    :model="formModel"
    :rules="computedRules"
    v-on="$listeners"
  >
    <slot>
      <template v-for="item in formOptions">
        <ids-form-item
          v-if="item.visible !== false"
          :key="item.prop"
          :props="item"
          :error="errorData ? errorData[item.prop] || '' : ''"
          v-on="item.formItemEvents || {}"
        >
          <slot :name="item.prop">
            <component
              :is="item.formType"
              v-model="formModel[item.prop]"
              :label="item.label"
              :required="item.required"
              :prop="item.prop"
              v-bind="item.elProps || {}"
              :form-model="formModel"
              :error-data="errorData"
              v-on="item.elEvents || {}"
            >
            </component>
          </slot>
          <!-- label的slot -->
          <template v-if="$slots[`${item.prop}Label`]">
            <slot :slot="`${item.prop}Label`" :name="`${item.prop}Label`">
            </slot>
          </template>
        </ids-form-item>
      </template>
    </slot>
  </el-form>
</template>

<script>
/**
 * form表单组件name
 * INPUT：输入框
 * PASSWORD：密码
 * TEXTAREA：文本域
 * NUMBER：数字输入框
 * NUMBER_RANGE：数字范围输入框
 * TIME：时间输入
 * TIME_RANGE：时间范围输入
 * DATE：日期输入
 * DATE_RANGE：日期范围输入
 * DATE_TIME：日期时间
 * DATE_TIME_RANGE：日期时间范围
 * TREE：树形
 * SELECT：select下拉选择
 * DICT_SELECT：字典的下拉选择
 * SELECT_TREE：选择树形
 * SWITCH：switch开关
 * CHECKBOX：多选框
 * CHECKBOX_GROUP：多选框组
 * RADIO：单选框
 * RADIO_GROUP：单选框组
 * SCONSTITUTE：组合formItem
 * MULTIPLE_INPUT：多值输入框
 * FIELD_OPT：字段操作
 */
export const FORM_TYPE_ENUM = {
  INPUT: "IdsInput",
  PASSWORD: "IdsPassword",
  TEXTAREA: "IdsTextarea",
  NUMBER: "IdsNumber",
  NUMBER_RANGE: "IdsNumberRange",
  TIME: "IdsTime",
  TIME_RANGE: "IdsTimeRange",
  DATE: "IdsDate",
  DATE_RANGE: "IdsDateRange",
  DATE_TIME: "IdsDateTime",
  DATE_TIME_RANGE: "IdsDateTimeRange",
  TREE: "IdsTree",
  SELECT: "IdsSelect",
  DICT_SELECT: "IdsDictSelect",
  SELECT_TREE: "IdsSelectTree",
  SWITCH: "IdsSwitch",
  CHECKBOX: "IdsCheckbox",
  CHECKBOX_GROUP: "IdsCheckboxGroup",
  RADIO: "IdsRadio",
  RADIO_GROUP: "IdsRadioGroup",
  SCONSTITUTE: "IdSconstitute",
  MULTIPLE_INPUT: "IdsMultipleInput",
  FIELD_OPT: "IdsFieldOpt",
};
import { FORM_TYPE_ENUM } from "@/service/const/common.js";
export default {
  name: "IdsForm",
  props: {
    formRef: {
      default: null,
      type: Object,
    },
    rules: {
      default: () => {},
      type: Object,
    },
    formModel: {
      default: () => {},
      type: Object,
    },
    errorData: {
      default: () => {},
      type: Object,
    },
    formOptions: {
      default: () => [],
      type: Array,
    },
    formProps: {
      default: () => {},
      type: Object,
    },
  },
  data() {
    return {
      FORM_TYPE_ENUM,
      elFormRef: null,
      formOptions: [
        {
          formType: FORM_TYPE_ENUM.INPUT,
          prop: "input",
          label: "输入框",
          elProps: {
            maxlength: 10,
          },
          elEvents: {
            input: (val) => {
              console.log("input-input:", val);
            },
          },
        },
      ],
    };
  },
  computed: {
    labelWidth() {
      return this.formProps?.labelWidth || "155px";
    },
    labelPosition() {
      return this.formProps?.labelPosition || "left";
    },
    computedRules() {
      return this.rules || this.formProps?.rules || {};
    },
  },
  mounted() {
    this.elFormRef = this.$refs.elForm;
    this.$emit("update:formRef", this.$refs.elForm);
  },
  methods: {},
};
</script>
