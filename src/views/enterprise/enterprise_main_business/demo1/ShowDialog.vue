<script setup lang="ts">
import { ref, defineProps, watchEffect, defineEmits } from "vue";
import dayjs from "dayjs";

// 接收父组件传递的 props
const props = defineProps({
  visible: Boolean, // 控制对话框的显示状态
  data: Object // 传入的主营业务数据
});

// 定义 emits
const emit = defineEmits(["update:visible"]);

// 本地状态
const localVisible = ref(false);

// 显示数据
const formattedData = ref<Array<{ field: string; value: any }>>([]);

// 字段映射表
const fieldMap = {
  id: "记录ID",
  enterprise_name: "企业名称",
  business_name: "业务&产品名称",
  business: "主营业务",
  remark: "备注",
  update_time: "更新时间"
};

// 格式化数据
watchEffect(() => {
  localVisible.value = props.visible;

  if (props.visible && props.data) {
    formattedData.value = Object.entries(props.data).map(([key, value]) => {
      let formattedValue = value;

      if (key === "update_time" && value) {
        formattedValue = dayjs(value).format("YYYY-MM-DD HH:mm:ss");
      }

      return {
        field: fieldMap[key] || key,
        value: formattedValue
      };
    });
  } else {
    formattedData.value = [];
  }
});

// 关闭弹窗
const handleClose = () => {
  localVisible.value = false;
  emit("update:visible", false);
};
</script>

<template>
  <el-dialog
    v-model="localVisible"
    title="预览主营业务记录"
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
