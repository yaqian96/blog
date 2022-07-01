<template>
  <el-select
    ref="select"
    v-model="localValue"
    v-selectLoadmore="loadMore"
    v-bind="$attrs"
    :clearable="clearable"
    :filterable="filterable"
    :placeholder="placeholder"
    :no-data-text="noDataText"
    :remote-method="remoteMethod"
    v-on="$listeners"
    @click.native="handleClick"
    @change="handleChange"
  >
    <div
      v-loading="loading"
      :class="{ 'select-multiple': showAll && multiple }"
    >
      <slot>
        <el-option
          v-if="showAll & multiple && selectOptions.length"
          :disabled="true"
          class="all-option"
        >
          <div
            v-if="selectOptions.length > localValue.length"
            @click="handleChooseAll"
          >
            全部
          </div>
          <div v-else @click="handleCancleChoose">取消全部</div>
        </el-option>
        <el-option
          v-for="item in selectOptions"
          v-show="!item.hidden"
          :key="item.value"
          class="select-options"
          :value="item[valueKey]"
          :label="item[labelKey]"
          v-bind="item"
        >
          <slot name="optionContent" :scope="item">
            <ids-tooltip :content="item[labelKey]"></ids-tooltip>
          </slot>
        </el-option>
      </slot>
    </div>
    <slot v-if="$slots.prefix" slot="prefix" name="prefix"></slot>
    <slot v-if="$slots.empty" slot="empty" name="empty"></slot>
  </el-select>
</template>

<script>
import {
  FORM_TYPE_ENUM,
  FILTEER_PARAM_TYPE_ENUM,
} from "@/service/const/common.js";
import { cloneDeep } from "lodash";
export default {
  name: FORM_TYPE_ENUM.SELECT,
  model: {
    prop: "value",
    event: "update",
  },
  props: {
    value: {
      default: "",
      type: [String, Array, Number],
    },
    filterable: {
      default: true,
      type: Boolean,
    },
    filterParamType: {
      default: FILTEER_PARAM_TYPE_ENUM.STRING,
      type: String,
    },
    filterKeyName: {
      default: "",
      type: String,
    },
    valueKey: {
      default: "value",
      type: String,
    },
    labelKey: {
      default: "label",
      type: String,
    },
    noDataText: {
      default: "暂无数据",
      type: String,
    },
    label: {
      default: "",
      type: String,
    },
    showAll: {
      default: false,
      type: Boolean,
    },
    immediateRemote: {
      default: false,
      type: Boolean,
    },
    clickRemote: {
      default: true,
      type: Boolean,
    },
    max: {
      default: 500,
      type: Number,
    },
    options: {
      default: () => [],
      type: Array,
    },
    defaultCheckedOptions: {
      default: () => [],
      type: Array,
    },
  },
  data() {
    return {
      recordTotal: -1,
      pageData: {
        page: 1,
        size: 20,
      },
      query: "",
      optionsByLoad: [],
      loading: false,
    };
  },
  computed: {
    computedQuery() {
      if (this.filterParamType === FILTEER_PARAM_TYPE_ENUM.OBJECT) {
        return [
          {
            fieldName: this.filterKeyName,
            fieldValue: this.query ? [this.query] : [],
          },
        ];
      }
      return this.query;
    },
    reserveKeyword() {
      if (this.$attrs.reserveKeyword === undefined) {
        return true;
      }
      return this.$attrs.reserveKeyword;
    },
    selectOptions() {
      const options = cloneDeep(this.options);
      const { valueKey } = this;
      !this.query &&
        this.defaultCheckedOptions.forEach((item) => {
          if (!options.some((i) => i[valueKey] === item[valueKey])) {
            options.push(item);
          }
        });
      this.optionsByLoad.forEach((item) => {
        if (!options.some((i) => i[valueKey] === item[valueKey])) {
          options.push(item);
        }
      });
      return options;
    },
    multiple() {
      return !!this.$attrs.multiple;
    },
    placeholder() {
      return (
        this.$attrs.placeholder ||
        `请选择${this.label}${this.multiple ? "(多选)" : ""}`
      );
    },
    localValue: {
      get() {
        return this.value;
      },
      set(val) {
        this.$emit("update", val);
      },
    },
    clearable() {
      return this.$attrs.clearable === undefined ? true : this.$attrs.clearable;
    },
  },
  created() {
    if (this.immediateRemote) {
      this.remoteMethod();
    }
  },
  methods: {
    handleChooseAll() {
      this.localValue = this.selectOptions.map((item) => item[this.valueKey]);
    },
    handleCancleChoose() {
      this.localValue = [];
    },
    handleClick() {
      if (
        !this.options.length &&
        !this.optionsByLoad.length &&
        !this.$attrs.disabled &&
        this.clickRemote
      ) {
        this.remoteMethod();
      }
    },
    handleChange(list) {
      //获取选择的项
      let select = list instanceof Array ? list : [list];
      this.$emit(
        "changeItem",
        list,
        this.selectOptions.filter((v) => select.includes(v[this.valueKey]))
      );
      if (this.query) {
        // this.remoteMethod()
      }
    },
    async loadMore() {
      if (this.continueVisible()) return;
      this.isLoading = true;
      if (this.pageData.page === 1) {
        this.pageData.page++;
      }

      await this.$attrs
        .loadMore(this.computedQuery, this.pageData, (res) => {
          if (res?.dataList && Array.isArray(res.dataList))
            this.optionsByLoad.push(...res.dataList);
        })
        .finally(() => {
          setTimeout(() => {
            this.isLoading = false;
          }, 1000);
        });

      this.pageData.page++;
    },
    continueVisible() {
      return (
        this.isLoading ||
        !this.$attrs.loadMore ||
        this.selectOptions.length > this.max ||
        this.selectOptions.length === this.recordTotal
      );
    },
    setPage(page) {
      this.pageData.page = page;
    },
    initPage() {
      this.setPage(1);
      this.optionsByLoad = [];
      this.recordTotal = -1;
    },
    async remoteMethod(query = "") {
      this.loading = true;
      this.initPage();
      this.query = query;
      const method = this.$attrs.remoteMethod || this.$attrs["remote-method"];
      if (method) {
        try {
          await method(this.computedQuery, this.pageData, (res) => {
            if (res?.dataList && Array.isArray(res.dataList)) {
              this.optionsByLoad = res.dataList;
              this.recordTotal = res.recordTotal;
            }
          });
        } catch (error) {
          this.loading = false;
        }
        this.loading = false;
        this.pageData.page++;
      }
    },
  },
};
</script>
<style lang="scss" scoped>
.el-select {
  ::v-deep {
    .el-input {
      width: 360px;
    }

    .el-select__tags {
      max-width: 358px !important;
      max-height: 114px;
      overflow-x: hidden;
      overflow-y: auto;
    }
  }
}

.select-options {
  width: 360px;
}

.el-select--min {
  ::v-deep {
    .el-input {
      width: 175px;
    }

    .el-select__tags {
      max-width: 173px !important;
    }
  }
}

.attr-item {
  line-height: 20px;
}

.all-option {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  z-index: 99;
  height: 44px;
  padding-top: 10px;
  line-height: 34px;
  color: #606266;
  cursor: pointer;
  background: #fff;

  &:hover {
    background-color: #f5f7fa;
  }
}

.el-select-dropdown__wrap {
  position: relative;
}

.select-multiple {
  padding-top: 34px;
}
</style>
