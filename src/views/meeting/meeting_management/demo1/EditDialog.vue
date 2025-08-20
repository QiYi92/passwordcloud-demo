<script setup lang="ts">
import { ref, defineProps, watchEffect, defineEmits, onMounted } from "vue";
import axios from "axios";
import { ElMessage } from "element-plus"; // 新增：提示
import "plus-pro-components/es/components/dialog-form/style/css";
import {
  type PlusColumn,
  type FieldValues,
  PlusDialogForm
} from "plus-pro-components";
import dayjs from "dayjs";

// 列的定义
const columns: PlusColumn[] = [
  {
    label: "会议名称",
    labelWidth: 150,
    width: 120,
    prop: "meeting_name",
    valueType: "copy"
  },
  {
    label: "会议地点",
    labelWidth: 150,
    width: 120,
    prop: "meeting_location",
    valueType: "copy"
  },
  {
    label: "会议时间",
    labelWidth: 150,
    prop: "meeting_date",
    valueType: "date-picker"
  },
  {
    label: "会议正文",
    labelWidth: 150,
    width: 120,
    prop: "meeting_body",
    valueType: "textarea",
    fieldProps: {
      maxlength: 5000,
      showWordLimit: true,
      autosize: { minRows: 5, maxRows: 15 }
    }
  },
  {
    label: "摘要",
    labelWidth: 150,
    width: 120,
    prop: "summary",
    valueType: "textarea",
    fieldProps: {
      maxlength: 500,
      showWordLimit: true,
      autosize: { minRows: 2, maxRows: 5 }
    }
  },
  {
    label: "正文附件",
    labelWidth: 150,
    prop: "meeting_files",
    valueType: "input"
  }
];

const props = defineProps({
  initialData: Object,
  visible: Boolean
});

const emit = defineEmits(["update:visible", "data-updated"]);

const values = ref<FieldValues>({});
const localVisible = ref(false);
const uploadedFiles = ref([]); // 文件列表
const uploadUrl = ref(`${import.meta.env.VITE_APP_SERVER}/api/meeting/upload`);

// 加载附件列表
const loadUploadedFiles = async () => {
  if (props.initialData && props.initialData.meeting_id) {
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_APP_SERVER}/api/meeting/files/${props.initialData.meeting_id}`
      );
      uploadedFiles.value = data.files.map(file => ({
        name: file.name,
        url: file.url
      }));
    } catch (error) {
      console.error("加载附件失败:", error);
    }
  }
};

watchEffect(() => {
  localVisible.value = props.visible;
  if (props.visible && props.initialData) {
    values.value = { ...props.initialData };
    loadUploadedFiles(); // 加载附件
  }
});

const handleSubmit = async () => {
  if (!values.value.meeting_id) {
    console.error("No meeting ID provided for updating.");
    return;
  }

  // 格式化日期
  if (values.value.meeting_date) {
    values.value.meeting_date = dayjs(
      values.value.meeting_date as string
    ).format("YYYY-MM-DD");
  }

  // 如果没有附件，则设置 meeting_files 为 0
  if (uploadedFiles.value.length === 0) {
    values.value.meeting_files = 0;
  }

  try {
    await axios.put(
      `${import.meta.env.VITE_APP_SERVER}/api/meeting/${values.value.meeting_id}`,
      values.value
    );
    emit("update:visible", false);
    emit("data-updated");
    alert("会议更新成功！");
  } catch (error) {
    console.error("Failed to update meeting:", error);
    alert("会议更新失败！");
  }
};

const handleUploadSuccess = async (response, file, fileList) => {
  const filePath = response.path || file.url; // 确保使用返回的文件路径
  values.value.meeting_files = filePath.split("/").pop(); // 仅保存文件名

  // 更新文件列表
  uploadedFiles.value = fileList.map(f => ({
    name: f.name,
    url: f.response?.path || f.url
  }));
};

const handleRemoveFile = async file => {
  try {
    await axios.post(
      `${import.meta.env.VITE_APP_SERVER}/api/meeting/deleteFile`,
      { path: file.url }
    );
    uploadedFiles.value = uploadedFiles.value.filter(f => f.url !== file.url);

    // 如果删除后没有文件，更新 meeting_files 为 0
    if (uploadedFiles.value.length === 0) {
      values.value.meeting_files = 0;
      await axios.put(
        `${import.meta.env.VITE_APP_SERVER}/api/meeting/${values.value.meeting_id}`,
        { meeting_files: 0 }
      );
    }

    alert("文件删除成功！");
  } catch (error) {
    console.error("删除文件失败:", error);
    alert("删除文件失败！");
  }
};

// 上传前校验：格式 & 大小
const beforeUpload = (file: File) => {
  const validExt = /\.(doc|docx|pdf|png|jpg|jpeg|wps)$/i.test(file.name);
  if (!validExt) {
    ElMessage.error(
      "只能上传 Word(doc/docx/wps)、PDF、PNG、JPG、JPEG 格式文件"
    );
    return false;
  }
  const isLt3M = file.size / 1024 / 1024 < 3;
  if (!isLt3M) {
    ElMessage.error("上传文件大小不能超过 3MB");
    return false;
  }
  return true;
};

// 超出数量限制时的提示
const handleExceed = (files: File[], fileList: any[]) => {
  ElMessage.warning("最多只能上传 1 个文件");
};
</script>

<template>
  <PlusDialogForm
    v-model:visible="localVisible"
    v-model="values"
    :form="{ columns }"
    title="编辑会议数据"
    confirm-text="更新"
    cancel-text="取消"
    @confirm="handleSubmit"
    @update:visible="emit('update:visible', $event)"
  >
    <!-- 文件上传的自定义插槽 -->
    <template #plus-field-meeting_files>
      <el-upload
        :action="uploadUrl"
        list-type="text"
        multiple
        :limit="1"
        :file-list="uploadedFiles"
        accept=".doc,.docx,.pdf,.png,.jpg,.jpeg,.wps"
        :before-upload="beforeUpload"
        @exceed="handleExceed"
        @success="handleUploadSuccess"
        @remove="handleRemoveFile"
      >
        <el-button type="primary">上传附件</el-button>
        <template #tip>
          <div class="el-upload__tip">
            只能上传 Word(doc, docx, wps)、PDF、PNG、JPG、JPEG 文件，且不超过
            3MB
          </div>
        </template>
      </el-upload>
    </template>
  </PlusDialogForm>
</template>
