<template>
  <ids-select
    ref="idsSelect"
    v-model="localValue"
    :multiple="multiple"
    :label="label"
    :filterable="filterable"
    :remote="remote"
    :immediate-remote="false"
    :remote-method="remoteMethod"
    :options="options"
    v-on="$listeners"
  >
    <el-option v-show="false" label="___" value="___"></el-option>
    <template v-for="item in selectOptions">
      <el-option
        v-show="query && !loading"
        :key="item[valueKey]"
        :label="item[labelKey]"
        :value="item[valueKey]"
      ></el-option>
    </template>
    <el-tree
      v-show="!query && !loading"
      ref="tree"
      :lazy="lazy"
      :check-strictly="checkStrictly"
      :data="treeData"
      :node-key="valueKey"
      :default-checked-keys="defaultCheckedKeys"
      :show-checkbox="multiple"
      v-bind="$attrs"
      @check-change="onCheckChange"
      @node-click="onNodeClick"
      v-on="$listeners"
    >
      <template #default="{ node, data }">
        <slot v-bind="{ node, data }">
          <span
            :class="{
              'el-tree-node__label': true,
              'el-tree-node__label-dis': data.disabled,
            }"
          >
            {{ node.label }}
          </span>
        </slot>
      </template>
    </el-tree>
  </ids-select>
</template>

<script>
/**
 * selectTree的联动关系
 * PART_LINKAGE1：勾选：父联动子，子不联动父；取消勾选：父联动子，子联动父；
 * PART_LINKAGE2：勾选：父联动子、子不联动父；取消勾选：不联动
 * PART_LINKAGE3：勾选：父不联动子，子联动父；取消勾选：父联动子，子不联动父。
 * PART_LINKAGE4：勾选：父联动子，子联动父；取消勾选：父联动子，子不联动父。
 * PART_LINKAGE5：勾选：父联动子，子不联动父；取消勾选：父联动子，子不联动父；
 * NO_LINKAGE:勾选/取消勾选都不联动
 * ALL_LINKAGE:勾选/取消勾选都联动
 */
export const SELECT_TREE_LINKAGE_ENUM = {
  PART_LINKAGE1: 1,
  PART_LINKAGE2: 2,
  PART_LINKAGE3: 3,
  PART_LINKAGE4: 4,
  PART_LINKAGE5: 5,
  NO_LINKAGE: 99,
};
/**
 * ALL:父联动子,子联动父
 * ALL_NOT:父不联动子,子不联动父
 * P_AND_C_C_NOT_P:父联动子,子不联动父
 * P_NOT_C_C_AND_P:父不联动子,子联动父
 */
export const LINKAGE_ENUM = {
  ALL: 1,
  ALL_NOT: 2,
  P_AND_C_C_NOT_P: 3,
  P_NOT_C_C_AND_P: 4,
};

import { cloneDeep } from "lodash";
import {
  SELECT_TREE_LINKAGE_ENUM,
  LINKAGE_ENUM,
  FORM_TYPE_ENUM,
} from "@/service/const/common.js";
export default {
  name: FORM_TYPE_ENUM.SELECT_TREE,
  model: {
    prop: "value",
    event: "update",
  },
  props: {
    value: {
      type: [Array, String, Object],
      default: "",
    },
    dictCode: {
      default: "",
      type: String,
    },
    dictScope: {
      default: "",
      type: String,
    },
    handOption: {
      type: Boolean,
      default: true,
    },
    options: {
      type: Array,
      default: () => [],
    },
    valueKey: {
      default: "value",
      type: String,
    },
    label: {
      default: "",
      type: String,
    },
    multiple: {
      type: Boolean,
      default: true,
    },
    linkageType: {
      type: Number,
      default: -1,
    },
    defaultCheckedOptions: {
      default: () => [],
      type: Array,
    },
  },
  data() {
    return {
      loading: false,
      selectValue: "",
      selectOptionsWithTree: [],
      query: "",
      defaultCheckedKeys: [],
    };
  },
  computed: {
    labelKey() {
      return this.$attrs.props?.label || "label";
    },
    checkStrictly() {
      if (this.linkageType === -1) {
        return !!this.$attrs.checkStrictly;
      }
      return true;
    },
    remote() {
      if (this.$attrs.remoteMethod === undefined) {
        return this.$attrs.remote;
      }
      return true;
    },
    filterable() {
      if (this.$attrs.remoteMethod === undefined) {
        return this.$attrs.filterable;
      }
      return true;
    },
    lazy() {
      if (this.$attrs.load === undefined) {
        return this.$attrs.lazy;
      }
      return true;
    },
    selectOptions() {
      return this.query ? this.options : this.selectOptionsWithTree;
    },
    localValue: {
      get() {
        let value = this.value || [];
        if (this.dictCode) {
          value = this.value?.dictDataValue || [];
        }
        return value;
      },
      set(val) {
        let value = val;
        // 如果是字典，就要把字典的相关信息返回出去
        if (this.dictCode) {
          value = {
            dictScope: this.dictScope,
            dictCode: this.dictCode,
            dictDataValue: val,
          };
        }
        this.$emit("update", value);
        this.$refs.tree.setCheckedKeys(Array.isArray(val) ? val : [val]);
      },
    },
    treeData() {
      if (this.query || this.loading) {
        return [];
      }
      return this.handOption
        ? this.listToTree(this.options, ["0", ""])
        : this.options;
    },
  },
  watch: {
    defaultCheckedOptions: {
      immediate: true,
      handler(value) {
        this.defaultCheckedKeys = Array.isArray(this.localValue)
          ? this.localValue
          : [this.localValue];
        this.selectOptionsWithTree =
          cloneDeep(this.defaultCheckedOptions) || [];
      },
    },
  },
  methods: {
    remoteMethod(query) {
      this.query = query;
      if (this.$attrs.remoteMethod) {
        this.loading = true;
        this.$attrs.remoteMethod(query).finally(() => {
          setTimeout(() => {
            this.loading = false;
          }, 300);
        });
      }
    },
    listToTree(data = [], rootCode = []) {
      let map = {};
      data.forEach((item) => {
        item.children = [];
        map[item[this.valueKey]] = item;
      });
      return data
        .filter((item) => {
          if (!rootCode.includes(item.parentCode)) {
            map[item.parentCode].children.push(item);
            return false;
          }
          return true;
        })
        .map((item) => map[item[this.valueKey]]);
    },
    onNodeClick(data) {
      // 因为单选没有checkbox框，所以没有check-change事件
      if (!this.multiple) {
        this.setSingleSelect(data);
        return;
      }
    },
    onCheckChange(data, isChecked) {
      // 单选触发onNodeClick事件
      if (!this.multiple) {
        return;
      }
      switch (this.linkageType) {
        case SELECT_TREE_LINKAGE_ENUM.PART_LINKAGE1:
          // 勾选：父联动子，子不联动父；取消勾选：父联动子，子联动父；
          this.setPartLinkage1(data, isChecked);
          break;
        case SELECT_TREE_LINKAGE_ENUM.PART_LINKAGE2:
          // 勾选：父联动子、子不联动父；取消勾选：不联动
          this.setPartLinkage2(data, isChecked);
          break;
        case SELECT_TREE_LINKAGE_ENUM.PART_LINKAGE3:
          // 勾选：父不联动子，子联动父；取消勾选：父联动子，子不联动父
          this.setPartLinkage3(data, isChecked);
          break;
        case SELECT_TREE_LINKAGE_ENUM.PART_LINKAGE4:
          // 勾选：父联动子，子联动父；取消勾选：父联动子，子不联动父。
          this.setPartLinkage4(data, isChecked);
          break;
        case SELECT_TREE_LINKAGE_ENUM.PART_LINKAGE5:
          // 勾选：父联动子，子不联动父；取消勾选：父联动子，子不联动父；
          this.setPartLinkage5(data, isChecked);
          break;
        default:
          // 联动和不联动需要按照element的check-strictly字段交互
          this.setOtherLinkage(data, isChecked);
          break;
      }
    },
    setOtherLinkage(data, isChecked) {
      // 父子的勾选和不勾选都联动或都不联动
      // 都联动时,el-tree组件会执行每一个关联节点的check-change事件,所以只需要传当前节点的data就行了
      isChecked
        ? this.treeChecked(LINKAGE_ENUM.ALL_NOT, data)
        : this.cancleChecked(LINKAGE_ENUM.ALL_NOT, data);
    },
    setPartLinkage1(data, isChecked) {
      // 勾选：父联动子，子不联动父；取消勾选：父联动子，子联动父；
      isChecked
        ? this.treeChecked(LINKAGE_ENUM.P_AND_C_C_NOT_P, data)
        : this.cancleChecked(LINKAGE_ENUM.ALL, data);
    },
    setPartLinkage2(data, isChecked) {
      // 勾选：父联动子、子不联动父；取消勾选：不联动
      isChecked
        ? this.treeChecked(LINKAGE_ENUM.P_AND_C_C_NOT_P, data)
        : this.cancleChecked(LINKAGE_ENUM.ALL_NOT, data);
    },
    setPartLinkage3(data, isChecked) {
      // 勾选：父不联动子，子联动父；取消勾选：父联动子，子不联动父
      isChecked
        ? this.treeChecked(LINKAGE_ENUM.P_NOT_C_C_AND_P, data)
        : this.cancleChecked(LINKAGE_ENUM.P_AND_C_C_NOT_P, data);
    },
    setPartLinkage4(data, isChecked) {
      // PART_LINKAGE4：勾选：父联动子，子联动父；取消勾选：父联动子，子不联动父。,
      isChecked
        ? this.treeChecked(LINKAGE_ENUM.ALL, data)
        : this.cancleChecked(LINKAGE_ENUM.P_AND_C_C_NOT_P, data);
    },
    setPartLinkage5(data, isChecked) {
      // 勾选：父联动子，子不联动父；取消勾选：父联动子，子不联动父；
      isChecked
        ? this.treeChecked(LINKAGE_ENUM.P_AND_C_C_NOT_P, data)
        : this.cancleChecked(LINKAGE_ENUM.P_AND_C_C_NOT_P, data);
    },
    treeChecked(type, data) {
      const allNodes = this.getAllNodesWithLinkType(type, data);
      const exAllNodes = allNodes.filter(
        (item) => !this.localValue.includes(item[this.valueKey])
      );
      const exAllValues = exAllNodes.map((item) => item[this.valueKey]);
      this.selectOptionsWithTree.push(...exAllNodes);
      this.localValue = this.localValue.concat(exAllValues);
    },
    cancleChecked(type, data) {
      const allNodes = this.getAllNodesWithLinkType(type, data);
      const allValues = allNodes.map((item) => item[this.valueKey]);
      this.localValue = this.localValue.filter(
        (item) => !allValues.includes(item)
      );
      this.selectOptionsWithTree = this.selectOptionsWithTree.filter(
        (item) => !allValues.includes(item[this.valueKey])
      );
    },
    getAllNodesWithLinkType(type, data) {
      const childrenNodes = this.getChildrenNodes(data);
      const parentNodes = this.getParentNodes(data);
      switch (type) {
        case LINKAGE_ENUM.ALL:
          return [...parentNodes, data, ...childrenNodes];
        case LINKAGE_ENUM.ALL_NOT:
          return [data];
        case LINKAGE_ENUM.P_AND_C_C_NOT_P:
          return [data, ...childrenNodes];
        case LINKAGE_ENUM.P_NOT_C_C_AND_P:
          return [...parentNodes, data];
        default:
          return [];
      }
    },
    getChildrenNodes(nodeData) {
      if (!nodeData || !nodeData.children || !nodeData.children.length) {
        return [];
      }
      return nodeData.children.filter((item) => !item.disabled);
    },
    getParentNodes(data) {
      const { parentCode } = data;
      if (!parentCode || parentCode === "0") {
        return [];
      }
      const currentNode = this.$refs.tree.getNode(data);
      const parent = currentNode.parent;
      if (!parent || !!parent.data.disabled) {
        return [];
      }
      return [parent.data];
    },
    setSingleSelect(data, isChecked) {
      let value = data[this.valueKey];
      this.selectOptionsWithTree = [data];
      this.localValue = value;
      this.$refs.idsSelect.$refs.select.blur();
    },
  },
};
</script>

<style scoped>
.id-select__footer {
  display: flex;
  justify-content: flex-end;
  padding: 10px 20px 8px;
  margin-top: 6px;
  border-top: 1px solid #ddd;
}

.id-select_empty {
  padding: 16px 0;
  text-align: center;
}

.el-tree-node__label-dis {
  color: #aaa;
}
</style>
