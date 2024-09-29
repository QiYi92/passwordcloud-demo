<template>
  <el-button type="primary" @click="handleOpen">添加新数据</el-button>
  <PlusDialogForm
    v-model:visible="visible"
    v-model="values"
    :form="{ columns }"
    title="添加驻场数据"
    confirm-text="确认"
    cancel-text="取消"
    @confirm="handleSubmit"
    @update:visible="emit('update:visible', $event)"
  >
    <!-- 上传按钮 -->
    <template #plus-field-related_files>
      <el-upload
        :action="uploadUrl"
        list-type="text"
        multiple
        :limit="5"
        :file-list="uploadedFiles"
        accept=".doc,.docx,.pdf,.png,.jpg,.jpeg"
        :before-upload="beforeUpload"
        @success="handleUploadSuccess"
        @remove="handleRemoveFile"
      >
        <el-button type="primary">上传</el-button>
        <template v-slot:tip>
          <div class="el-upload__tip">
            只能上传 Word (doc, docx)、PDF、PNG、JPG、JPEG 文件，且不超过 500kb
          </div>
        </template>
      </el-upload>
    </template>
  </PlusDialogForm>
</template>

<script setup lang="ts">
import { ref, defineEmits } from "vue";
import axios from "axios";
import "plus-pro-components/es/components/dialog-form/style/css";
import {
  type PlusColumn,
  type FieldValues,
  PlusDialogForm
} from "plus-pro-components";
import dayjs from "dayjs";

const emit = defineEmits(["update:visible", "data-updated"]);
const values = ref<FieldValues>({});
const visible = ref(false);
const uploadUrl = ref(`${import.meta.env.VITE_APP_SERVER}/api/onsite/upload`);
const uploadedFiles = ref([]);

const handleOpen = () => {
  visible.value = true;
};

// 文件上传前检查
const beforeUpload = file => {
  const allowedTypes = [
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/pdf",
    "image/png",
    "image/jpeg"
  ];
  const isAllowedType = allowedTypes.includes(file.type);
  if (!isAllowedType) {
    alert("只能上传 Word (doc, docx)、PDF、PNG、JPG、JPEG 格式的文件！");
  }
  return isAllowedType;
};

const handleSubmit = async () => {
  if (!values.value.onSite_time) {
    values.value.onSite_time = dayjs().format("YYYY-MM-DD");
  } else {
    values.value.onSite_time = dayjs(values.value.onSite_time as string).format(
      "YYYY-MM-DD"
    );
  }

  // 处理相关文件
  if (uploadedFiles.value.length > 0) {
    values.value.related_files = uploadedFiles.value
      .map(file => file.name)
      .join(","); // 拼接文件名
  } else {
    values.value.related_files = 0; // 如果没有文件，则设置为 0
  }

  try {
    await axios.post(
      `${import.meta.env.VITE_APP_SERVER}/api/onsite`, // 修改为正确的新增路径
      values.value
    );
    visible.value = false;
    emit("data-updated");
    alert("驻场数据添加成功！");
  } catch (error) {
    console.error("驻场数据添加失败:", error);
    alert("驻场数据添加失败！");
  }
};

const handleUploadSuccess = (response, file) => {
  const filePath = response.path || file.url;
  uploadedFiles.value.push({ name: file.name, url: filePath });
};

const handleRemoveFile = file => {
  uploadedFiles.value = uploadedFiles.value.filter(f => f.name !== file.name);

  // 如果删除后没有文件，更新 related_files 为 0
  if (uploadedFiles.value.length === 0) {
    values.value.related_files = 0;
  }
};

const columns: PlusColumn[] = [
  {
    label: "姓名",
    prop: "name",
    valueType: "input"
  },
  {
    label: "公司",
    prop: "company",
    valueType: "input"
  },
  {
    label: "类型",
    prop: "type",
    valueType: "input"
  },
  {
    label: "联系方式",
    prop: "contact_info",
    valueType: "input"
  },
  {
    label: "驻场事由",
    prop: "onSite_reason",
    valueType: "input"
  },
  {
    label: "驻场时间",
    prop: "onSite_time",
    valueType: "date-picker"
  },
  {
    label: "办公室位置",
    prop: "location",
    valueType: "input"
  },
  {
    label: "备注",
    prop: "remarks",
    valueType: "textarea"
  },
  {
    label: "相关函件",
    prop: "related_files",
    valueType: "input"
  }
];
</script>
