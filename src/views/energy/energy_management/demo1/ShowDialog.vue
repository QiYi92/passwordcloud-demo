<script setup lang="ts">
import { ref, defineProps, watchEffect, defineEmits } from "vue";
import dayjs from "dayjs";
import { RegionOptions } from "@/views/energy/energy_management/data"; // 区域字典

// 接收父组件传递的 props
const props = defineProps({
  visible: Boolean, // 控制对话框的显示状态
  data: Object // 传入的能耗记录数据
});

// 定义 emits，用于向父组件传递事件
const emit = defineEmits(["update:visible"]);

// 本地状态：控制对话框的可见性
const localVisible = ref(false);

// 格式化后的数据：显示在表格中
const formattedData = ref<Array<{ field: string; value: any }>>([]);

// 字段名称映射表：将英文字段映射为中文字段
const fieldMap = {
  energy_id: "记录ID",
  date: "日期",
  region: "区域",
  electricity_consumption: "耗电量（度）"
};

// 区域字典映射函数
const formatRegion = (value: string) => {
  const region = RegionOptions.find(item => item.value === value);
  return region ? region.label : "未知";
};

// 监听 props.visible 和数据变化，更新格式化数据
watchEffect(() => {
  localVisible.value = props.visible;

  if (props.visible && props.data) {
    formattedData.value = Object.entries(props.data)
      .map(([key, value]) => {
        let formattedValue = value;

        // 日期格式化
        if (key === "date" && value) {
          formattedValue = dayjs(value).format("YYYY年MM月");
        }

        // 区域转换
        if (key === "region") {
          formattedValue = formatRegion(value);
        }

        return {
          field: fieldMap[key] || key, // 字段映射为中文
          value: formattedValue
        };
      })
      .filter(item => item.field !== "id"); // 过滤掉 id 字段
  } else {
    formattedData.value = [];
  }
});

// 关闭弹窗
const handleClose = () => {
  localVisible.value = false;
  emit("update:visible", false); // 通知父组件更新状态
};
</script>

<template>
  <el-dialog
    v-model="localVisible"
    title="预览能耗记录"
    width="80%"
    @close="handleClose"
  >
    <div style="padding: 20px">
      <el-table
        :data="formattedData"
        style="width: 100%; border: 1px solid #ebeef5"
        border
        layout="fixed"
      >
        <el-table-column
          prop="field"
          label="字段"
          align="center"
          header-cell-style="{ backgroundColor: '#f5f7fa', fontWeight: 'bold' }"
          width="150"
        />
        <el-table-column
          prop="value"
          label="数据"
          align="left"
          header-cell-style="{ backgroundColor: '#f5f7fa', fontWeight: 'bold' }"
          width="600"
        >
          <template #default="scope">
            <div style="white-space: pre-wrap">{{ scope.row.value }}</div>
          </template>
        </el-table-column>
      </el-table>
      <div
        v-if="formattedData.length === 0"
        style="padding: 20px; text-align: center"
      >
        加载数据失败或数据为空
      </div>
    </div>
    <template #footer>
      <el-button type="primary" @click="handleClose">关闭</el-button>
    </template>
  </el-dialog>
</template>

<style scoped>
.el-table th {
  font-weight: bold !important;
  background-color: #f2f6fc !important;
  border-right: 1px solid #ebeef5;
}

.el-table th.is-leaf:last-child,
.el-table td.is-leaf:last-child {
  border-right: 1px solid #ebeef5;
}
</style>
