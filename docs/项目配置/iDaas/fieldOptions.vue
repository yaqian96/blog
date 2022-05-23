<!--
 * @Author: yaqian2
 * @Date: 2022-05-23 16:09:01
 * @Description: 字段操作，多重数组
-->
<template>
  <div class="field-ops-wrap" :class="{ hidden: !isShow }">
    <div class="up-icon-wrap" type="text" @click="changeShow">
      <span class="rotate-wrap">
        <i class="iconfont icon-open"></i>
      </span>
    </div>
    <idaas-table
      style="width: 100%"
      :data="tableData"
      :columns="[
        {
          prop: '_handName',
          label: ' ',
          fixed: true,
        },
        ...columns,
      ]"
    >
      <template v-for="item in columns" v-slot:[item.slotName]="{ row }">
        <div v-if="localValue[row.fieldCode]" :key="item.slotName">
          <template v-if="isDetail">
            <i
              v-if="localValue[row.fieldCode][item.prop]"
              class="el-icon-check"
            ></i>
          </template>
          <ids-checkbox
            v-else
            v-model="localValue[row.fieldCode][item.prop]"
            @change="handleChange"
          ></ids-checkbox>
        </div>
      </template>
    </idaas-table>
  </div>
</template>

<script>
import { FORM_TYPE_ENUM } from "@/service/const/common.js";
export default {
  name: FORM_TYPE_ENUM.FIELD_OPT,
  model: {
    prop: "value",
    event: "update",
  },
  props: {
    value: {
      default: () => {},
      type: Object,
    },
    dataField: {
      default: () => [],
      type: Array,
    },
    opsField: {
      default: () => [],
      type: Array,
    },
    isDetail: {
      default: false,
      type: Boolean,
    },
  },
  data() {
    return {
      isShow: true,
    };
  },
  computed: {
    columns() {
      return this.dataField.map((item) => {
        return {
          label: item.fieldName,
          prop: item.fieldCode,
          slotName: item.fieldCode,
        };
      });
    },
    tableData() {
      return this.opsField.map((item) => {
        return {
          _handName: item.fieldName,
          fieldCode: item.fieldCode,
        };
      });
    },
    localValue: {
      get() {
        const valueObj = {};
        this.opsField.forEach((item) => {
          this.columns.forEach((col) => {
            valueObj[item.fieldCode] = valueObj[item.fieldCode] || {};
            valueObj[item.fieldCode][col.prop] =
              this.value && this.value[item.fieldCode]
                ? this.value[item.fieldCode].includes(col.prop)
                : false;
          });
        });
        return valueObj;
      },
      set(val) {
        this.$emit("update", val);
      },
    },
  },
  methods: {
    handleChange() {
      const obj = {};
      for (const key in this.localValue) {
        const value = this.localValue[key];
        const valueKeys = Object.keys(value);
        obj[key] = valueKeys.filter((item) => value[item]);
      }
      this.$emit("update", obj);
    },
    changeShow() {
      this.isShow = !this.isShow;
    },
  },
};
</script>
<style lang="scss" scoped>
.field-ops-wrap {
  position: relative;
  padding-right: 54px;

  .icon-open {
    font-size: 24px;
  }

  .rotate-wrap {
    display: block;
    width: 34px;
    height: 34px;
    line-height: 34px;
    transition: transform 300ms linear;
    transform: rotate(-180deg);
  }

  &.hidden {
    .rotate-wrap {
      transform: rotate(0deg);
    }

    ::v-deep .el-table {
      .el-table__body-wrapper {
        height: 0;
      }
    }
  }
}

.up-icon-wrap {
  position: absolute;
  top: 0;
  right: 0;
  width: 34px;
  height: 34px;
  line-height: 34px;
  color: #0083ff;
  text-align: center;
  cursor: pointer;
  border: 1px solid #e4e5ef;
  border-radius: 4px;
}

.dataRange {
  padding-left: 20px;
  border-bottom: 1px solid #ddd;

  .el-button {
    margin-left: 20px;
  }
}
</style>
