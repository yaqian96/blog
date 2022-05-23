<!--
 * @Author: anne
 * @Date: 2022-06-15 09:16:09
 * @Description: tooltip组件 1. 超过可视宽度省略 2.超过传递的值省略
-->
<template>
  <el-tooltip
    v-model="tipValue"
    popper-class="ids-tooltip"
    :disabled="computedDisabled"
    :content="text"
    :open-delay="openDelay"
    :placement="placement"
    :effect="effect"
    v-bind="$attrs"
  >
    <template v-if="$slots.content">
      <div slot="content">
        <slot name="content"></slot>
      </div>
    </template>
    <slot>
      <div class="hideText" @mouseover="onMouseOver">
        <span ref="refName">
          {{ text || "-" }}
        </span>
      </div>
    </slot>
  </el-tooltip>
</template>

<script>
export default {
  name: "IdsTooltip",
  props: {
    // 显示的文字内容
    content: {
      type: [Number, String],
      default: "",
    },
    // 最大显示的字数
    max: {
      type: Number,
      default: 0,
    },
    // 默认开启自动提示
    autoTip: {
      type: Boolean,
      default: false,
    },
    // 默认关闭提示
    autoDisabeld: {
      type: Boolean,
      default: false,
    },
    openDelay: {
      type: Number,
      default: 300,
    },
    effect: {
      type: String,
      default: "dark",
    },
    placement: {
      type: String,
      default: "top-start",
    },
    value: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      disabled: false,
    };
  },
  computed: {
    computedDisabled() {
      if (this.autoTip) {
        return false;
      }
      return this.disabled || !this.content || this.autoDisabeld;
    },
    text() {
      if (typeof this.content === "number") {
        return this.content.toString();
      }
      return this.content;
    },
    tipValue: {
      get() {
        return this.value;
      },
      set(val) {
        this.$emit("input", val);
      },
    },
  },
  methods: {
    onMouseOver() {
      // 默认开启提示，不用判断max和宽度
      if (this.autoTip) {
        this.disabled = false;
        return;
      }
      // 如果有传max，则按照最多显示多少字决定是否开启tooltip功能
      if (this.max > 0) {
        this.disabled = this.text.length <= this.max;
        return;
      }
      // 未传max，根据宽度自行判断是否开启tooltip功能
      let parentWidth = this.$refs.refName.parentNode.offsetWidth;
      let contentWidth = this.$refs.refName.offsetWidth;
      this.disabled = contentWidth <= parentWidth;
    },
  },
};
</script>
<style lang="scss">
.ids-tooltip.el-tooltip__popper {
  &.is-dark {
    padding: 10px 15px;
    color: #fff;
    background: #333;
    border: none !important;

    .popper__arrow::after {
      border-top-color: #333 !important;
    }
  }

  &.is-light {
    .popper__arrow {
      border-top-color: #333 !important;
    }

    .popper__arrow::after {
      border-top-color: #fff !important;
    }
  }
}
</style>
