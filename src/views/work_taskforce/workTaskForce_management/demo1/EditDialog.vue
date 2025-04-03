<template>
  <PlusDialogForm
    v-model:visible="localVisible"
    v-model="values"
    :form="{ columns }"
    title="编辑工作专班"
    confirm-text="更新"
    cancel-text="取消"
    @confirm="handleSubmit"
    @update:visible="emit('update:visible', $event)"
  >
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
            仅支持上传 Word、PDF、图片文件，大小不超过 500KB
          </div>
        </template>
      </el-upload>
    </template>
  </PlusDialogForm>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits, watchEffect, watch } from "vue";
import axios from "axios";
import dayjs from "dayjs";
import {
  PlusDialogForm,
  type FieldValues,
  type PlusColumn
} from "plus-pro-components";

const props = defineProps({
  initialData: Object,
  visible: Boolean
});

const emit = defineEmits(["update:visible", "data-updated"]);

const values = ref<FieldValues>({});
const localVisible = ref(false);
const uploadedFiles = ref([]);
const uploadUrl = `${import.meta.env.VITE_APP_SERVER}/api/taskforces/upload`;

// 监听对话框可见性和初始数据变化
watchEffect(() => {
  localVisible.value = props.visible;
  if (props.initialData) {
    values.value = { ...props.initialData };
    loadUploadedFiles();
  }
});

// 加载附件信息（从服务器获取）
const loadUploadedFiles = async () => {
  const id = props.initialData?.id;
  if (!id) return;

  try {
    const { data } = await axios.get(
      `${import.meta.env.VITE_APP_SERVER}/api/taskforces/files/${id}`
    );
    uploadedFiles.value = data.files.map(file => ({
      name: file.name,
      url: file.url
    }));
  } catch (error) {
    console.error("加载附件失败:", error);
    uploadedFiles.value = [];
  }
};

// 上传前类型验证
const beforeUpload = file => {
  const allowedTypes = [
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/pdf",
    "image/png",
    "image/jpeg"
  ];
  const isAllowed = allowedTypes.includes(file.type);
  if (!isAllowed) {
    alert("只能上传 Word、PDF、PNG、JPG、JPEG 文件！");
  }
  return isAllowed;
};

// 提交编辑表单
const handleSubmit = async () => {
  const id = values.value.id;
  if (!id) {
    alert("缺少 ID，无法更新！");
    return;
  }

  if (values.value.established_date) {
    values.value.established_date = dayjs(
      values.value.established_date as string
    ).format("YYYY-MM-DD");
  }

  try {
    await axios.put(
      `${import.meta.env.VITE_APP_SERVER}/api/taskforces/${id}`,
      values.value
    );
    emit("update:visible", false);
    emit("data-updated");
    alert("更新成功！");
  } catch (error) {
    console.error("更新失败:", error);
    alert("更新失败！");
  }
};

// 上传成功处理
const handleUploadSuccess = async (response, file, fileList) => {
  const filePath = response.path || file.url;
  values.value.taskforce_files = filePath.split("/").pop();

  // 删除旧文件（仅保留一个）
  if (uploadedFiles.value.length > 0) {
    const oldFile = uploadedFiles.value[0];
    try {
      await axios.post(
        `${import.meta.env.VITE_APP_SERVER}/api/taskforces/deleteFile`,
        { path: oldFile.url }
      );
    } catch (error) {
      console.error("旧文件删除失败:", error);
    }
  }

  uploadedFiles.value = fileList.map(f => ({
    name: f.name,
    url: f.response?.path || f.url
  }));
};

// 删除文件逻辑
const handleRemoveFile = async file => {
  try {
    await axios.post(
      `${import.meta.env.VITE_APP_SERVER}/api/taskforces/deleteFile`,
      { path: file.url }
    );
    uploadedFiles.value = uploadedFiles.value.filter(f => f.url !== file.url);

    // 数据字段置为 0
    if (uploadedFiles.value.length === 0) {
      values.value.taskforce_files = "0";
      await axios.put(
        `${import.meta.env.VITE_APP_SERVER}/api/taskforces/${values.value.id}`,
        { taskforce_files: "0" }
      );
    }

    alert("文件删除成功");
  } catch (error) {
    console.error("文件删除失败:", error);
    alert("删除文件失败！");
  }
};

// 表单字段定义
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
      autosize: { minRows: 2, maxRows: 6 }
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
