<template>
  <el-dialog
    v-model="localVisible"
    title="预览注册信息数据"
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
          :formatter="formatField"
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

<script setup lang="ts">
import { ref, defineProps, watchEffect, defineEmits } from "vue";
import dayjs from "dayjs";

const props = defineProps({
  visible: Boolean,
  data: Object
});

const emit = defineEmits(["update:visible"]);

const localVisible = ref(false);
const formattedData = ref<Array<{ field: string; value: any }>>([]);

const fieldMap = {
  project_id: "项目ID",
  project_name: "项目名称",
  registration_agency: "注册机构",
  contact_info: "联系方式",
  registration_department: "注册科室",
  validity_period: "有效期",
  is_renewable: "是否需要续费",
  remark: "备注"
};

// 格式化字段名
const formatField = row => {
  return fieldMap[row.field] || row.field;
};

// 格式化字段值
const formatValue = (key, value) => {
  if (key === "validity_period" && value) {
    return dayjs(value).format("YYYY年MM月DD日"); // 格式化日期
  }
  if (key === "is_renewable") {
    return value === 1 ? "是" : "否";
  }
  if (key === "registration_department") {
    const departmentMap = {
      "0": "其他",
      "1": "安全科",
      "2": "基建科",
      "3": "网站科",
      "4": "电子政务科",
      "5": "资源科"
    };
    return departmentMap[value] || "未知";
  }
  return value;
};

watchEffect(() => {
  localVisible.value = props.visible;

  if (props.visible && props.data) {
    formattedData.value = Object.entries(props.data)
      .map(([key, value]) => ({
        field: key,
        value: formatValue(key, value)
      }))
      .filter(item => item.field !== "project_id"); // 根据需要过滤字段
  } else {
    formattedData.value = [];
  }
});

const handleClose = () => {
  localVisible.value = false;
  emit("update:visible", false);
};
</script>

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
