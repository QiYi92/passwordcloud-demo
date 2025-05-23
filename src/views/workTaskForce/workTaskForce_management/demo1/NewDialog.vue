<template>
  <el-button type="primary" @click="handleOpen">添加新专班</el-button>
  <PlusDialogForm
    v-model:visible="visible"
    v-model="values"
    :form="{ columns }"
    title="添加工作专班"
    confirm-text="确认"
    cancel-text="取消"
    @confirm="handleSubmit"
    @update:visible="emit('update:visible', $event)"
  >
    <!-- 上传附件插槽 -->
    <template #plus-field-taskforce_files>
      <el-upload
        :action="uploadUrl"
        list-type="text"
        :limit="1"
        :file-list="uploadedFiles"
        accept=".doc,.docx,.pdf,.png,.jpg,.jpeg"
        :before-upload="beforeUpload"
        @success="handleUploadSuccess"
        @remove="handleRemoveFile"
      >
        <el-button type="primary">上传附件</el-button>
        <template #tip>
          <div class="el-upload__tip">
            支持上传 Word、PDF、图片文件，大小不超过 500KB
          </div>
        </template>
      </el-upload>
    </template>
  </PlusDialogForm>
</template>

<script setup lang="ts">
import { ref, defineEmits } from "vue";
import axios from "axios";
import dayjs from "dayjs";
import {
  PlusDialogForm,
  type FieldValues,
  type PlusColumn
} from "plus-pro-components";

const emit = defineEmits(["update:visible", "data-updated"]);
const values = ref<FieldValues>({});
const visible = ref(false);
const uploadUrl = `${import.meta.env.VITE_APP_SERVER}/api/taskforces/upload`;
const uploadedFiles = ref([]);

const handleOpen = () => {
  visible.value = true;
};

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
    alert("仅支持 Word、PDF、PNG、JPG、JPEG 格式！");
  }
  return isAllowedType;
};

const handleSubmit = async () => {
  if (!values.value.established_date) {
    values.value.established_date = dayjs().format("YYYY-MM-DD");
  } else {
    values.value.established_date = dayjs(
      values.value.established_date as string
    ).format("YYYY-MM-DD");
  }

  if (uploadedFiles.value.length === 0) {
    values.value.taskforce_files = "0";
  }

  try {
    await axios.post(
      `${import.meta.env.VITE_APP_SERVER}/api/taskforces`,
      values.value
    );
    visible.value = false;
    emit("data-updated");
    alert("添加成功！");
  } catch (error) {
    console.error("添加失败:", error);
    alert("添加失败！");
  }
};

const handleUploadSuccess = async (response, file, fileList) => {
  const filePath = response.path || file.url;
  values.value.taskforce_files = filePath.split("/").pop();

  // 移除旧文件（只保留一个）
  if (uploadedFiles.value.length > 0) {
    const oldFile = uploadedFiles.value[0];
    try {
      await axios.post(
        `${import.meta.env.VITE_APP_SERVER}/api/taskforces/deleteFile`,
        { path: oldFile.url }
      );
    } catch (err) {
      console.error("旧文件删除失败:", err);
    }
  }

  uploadedFiles.value = fileList.map(f => ({
    name: f.name,
    url: f.response?.path || f.url
  }));
};

const handleRemoveFile = async file => {
  try {
    await axios.post(
      `${import.meta.env.VITE_APP_SERVER}/api/taskforces/deleteFile`,
      { path: file.url }
    );
    uploadedFiles.value = uploadedFiles.value.filter(f => f.url !== file.url);
    alert("文件已删除");

    if (uploadedFiles.value.length === 0) {
      values.value.taskforce_files = "0";
    }
  } catch (error) {
    console.error("文件删除失败:", error);
    alert("文件删除失败！");
  }
};

const columns: PlusColumn[] = [
  {
    label: "工作专班名称",
    prop: "taskforce_name",
    valueType: "input",
    labelWidth: 150,
    required: true
  },
  {
    label: "人员名称",
    prop: "member_name",
    valueType: "input",
    labelWidth: 150,
    required: true
  },
  {
    label: "成立时间",
    prop: "established_date",
    valueType: "date-picker",
    labelWidth: 150
  },
  {
    label: "备注",
    prop: "remark",
    valueType: "textarea",
    labelWidth: 150,
    fieldProps: {
      maxlength: 300,
      autosize: { minRows: 2, maxRows: 5 }
    }
  },
  {
    label: "附件",
    prop: "taskforce_files",
    valueType: "input",
    labelWidth: 150
  }
];
</script>
