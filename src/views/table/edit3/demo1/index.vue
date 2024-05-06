<script setup lang="ts">
import { useColumns } from "./columns";

const {
  editMap,
  columns,
  dataList,
  onEdit,
  onSave,
  onCancel,
  searchField,
  searchQuery
} = useColumns();
</script>

<template>
  <div class="flex flex-col">
    <!-- 搜索控件区域 -->
    <div class="search-controls mb-4">
      <!-- mb-4 为 margin-bottom 的样式，用于添加一些间距 -->
      <el-select
        v-model="searchField"
        placeholder="选择搜索字段"
        style="width: 200px; margin-right: 10px"
      >
        <el-option label="支付ID" value="pay_id" />
        <el-option label="合同ID" value="contract_id" />
        <el-option label="支付金额" value="pay_money" />
        <el-option label="支付日期" value="pay_time" />
      </el-select>
      <el-input
        v-model="searchQuery"
        placeholder="输入搜索内容"
        style="width: 300px"
      />
    </div>

    <!-- 表格区域 -->
    <pure-table
      row-key="id"
      align-whole="center"
      :header-cell-style="{
        background: 'var(--el-fill-color-light)',
        color: 'var(--el-text-color-primary)'
      }"
      :data="dataList"
      :columns="columns"
    >
      <template #operation="{ row, index }">
        <el-button
          v-if="!editMap[index]?.editable"
          class="reset-margin"
          link
          type="primary"
          @click="onEdit(row, index)"
        >
          修改
        </el-button>
        <div v-else>
          <el-button
            class="reset-margin"
            link
            type="primary"
            @click="onSave(index)"
          >
            保存
          </el-button>
          <el-button class="reset-margin" link @click="onCancel(index)">
            取消
          </el-button>
        </div>
      </template>
    </pure-table>
  </div>
</template>
