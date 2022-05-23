<template>
  <ids-tooltip :auto-tip="!!tooltipContent" :content="tooltipContent">
    <el-switch
      v-model="localValue"
      v-loading="loading"
      :class="{ pointer: !immediateChange && !$attrs.disabled }"
      v-bind="$attrs"
      :disabled="disabled"
      :active-value="activeValue"
      :inactive-value="inactiveValue"
      v-on="$listeners"
      @click.native="handleClick"
    >
    </el-switch>
  </ids-tooltip>
</template>

<script>
import { FORM_TYPE_ENUM } from "@/service/const/common.js";
export default {
  name: FORM_TYPE_ENUM.SWITCH,
  model: {
    prop: "value",
    event: "update",
  },
  props: {
    confirmVisible: {
      default: true,
      type: Boolean,
    },
    confirmTitle: {
      default: "是否切换状态",
      type: String,
    },
    value: {
      default: false,
      type: [String, Number, Boolean],
    },
    tooltipContent: {
      default: "",
      type: String,
    },
    activeValue: {
      default: true,
      type: [String, Number, Boolean],
    },
    inactiveValue: {
      default: false,
      type: [String, Number, Boolean],
    },
    immediateChange: {
      default: true,
      type: Boolean,
    },
  },
  data() {
    return {
      loading: false,
    };
  },
  computed: {
    disabled() {
      return this.$attrs.disabled || !this.immediateChange;
    },
    localValue: {
      get() {
        return this.value;
      },
      set(val) {
        this.$emit("update", val);
      },
    },
  },
  methods: {
    async handleClick() {
      if (this.confirmVisible) {
        try {
          await this.confirmStatus();
          this.submit();
        } catch (error) {}
      } else {
        this.submit();
      }
    },
    async submit() {
      const val = this.getVal();
      if (this.$listeners.click && !this.loading) {
        this.loading = true;
        const res = await this.$listeners.click(val).finally(() => {
          this.loading = false;
        });
        if (res.success) {
          this.localValue = val;
        }
      }
    },
    getVal() {
      let val = this.activeValue;
      if (this.value === this.activeValue) {
        val = this.inactiveValue;
      }
      return val;
    },
    async confirmStatus() {
      await this.$confirm(this.confirmTitle, "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      });
    },
  },
};
</script>
<style lang="scss" scoped>
.el-switch.pointer {
  opacity: 1;

  ::v-deep {
    .el-switch__core,
    .el-switch__label {
      cursor: pointer;
    }
  }
}

::v-deep {
  .el-loading-spinner {
    margin-top: -10px;
  }

  .circular {
    width: 20px;
    height: 20px;
  }
}
</style>
