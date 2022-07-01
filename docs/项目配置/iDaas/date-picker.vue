<template>
  <div class="flex">
    <el-date-picker
      v-model="localValue"
      v-bind="$attrs"
      :disabled="disabled"
      :type="type"
      :range-separator="rangeSeparator"
      :start-placeholder="startPlaceholder"
      :end-placeholder="endPlaceholder"
      :format="format"
      :value-format="valueFormat"
      :clearable="clearable"
      v-on="$listeners"
    />
    <el-checkbox
      v-if="foreverVisible"
      v-model="forever"
      class="forever-check"
      :true-label="foreverValue"
      @change="handleForeverChange"
      >永久</el-checkbox
    >
  </div>
</template>

<script>
import { FORM_TYPE_ENUM } from "@/service/const/common.js";
export default {
  name: FORM_TYPE_ENUM.DATE_RANGE,
  model: {
    prop: "value",
    event: "update",
  },
  props: {
    foreverValue: {
      default: 1,
      type: [String, Number],
    },
    value: {
      default: "",
      type: [Array, String, Number],
    },
    valueFormat: {
      default: "yyyy/MM/dd",
      type: String,
    },
    foreverVisible: {
      default: false,
      type: Boolean,
    },
    format: {
      default: "yyyy/MM/dd",
      type: String,
    },
    rangeSeparator: {
      default: "至",
      type: String,
    },
    startPlaceholder: {
      default: "起始日期",
      type: String,
    },
    endPlaceholder: {
      default: "结束日期",
      type: String,
    },
    type: {
      default: "daterange",
      type: String,
    },
  },
  data() {
    return {
      localDateValue: "",
    };
  },
  computed: {
    disabled() {
      return (
        this.$attrs.disabled ||
        (this.foreverVisible && this.value === this.foreverValue)
      );
    },
    forever: {
      get() {
        if (Array.isArray(this.value)) {
          return "";
        }
        return this.value;
      },
      set(val) {
        let value = this.localValue;
        if (val === this.foreverValue) {
          value = val;
        }
        this.$emit("update", value);
      },
    },
    localValue: {
      get() {
        if (this.forever === this.foreverValue) {
          return this.localDateValue;
        }
        return this.value;
      },
      set(value) {
        this.$emit("update", value);
      },
    },
    clearable() {
      return this.$attrs.clearable === undefined ? true : this.$attrs.clearable;
    },
  },
  methods: {
    handleChange(val) {
      this.localDateValue = val;
    },
    handleForeverChange() {
      this.localDateValue = "";
    },
  },
};
</script>
<style lang="scss" scoped>
.el-date-editor--datetimerange.el-input,
.el-date-editor--datetimerange.el-input__inner,
.el-date-editor--daterange.el-input,
.el-date-editor--daterange.el-input__inner {
  width: 360px;
}

.el-date-editor {
  ::v-deep {
    .el-range-separator {
      font-size: 13px;
      line-height: 28px;
      color: #aaa;
    }

    .el-range__close-icon,
    .el-range__icon {
      line-height: 28px;
    }
  }
}

.forever-check {
  margin-left: 20px;
}
</style>
