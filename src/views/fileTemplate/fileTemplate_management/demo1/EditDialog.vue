<template>
  <PlusDialogForm
    v-model:visible="localVisible"
    v-model="values"
    :form="{ columns }"
    title="编辑文档模板"
    confirm-text="更新"
    cancel-text="取消"
    @confirm="handleSubmit"
    @update:visible="emit('update:visible', $event)"
  >
    <template #plus-field-attachment_files>
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
import { ref, defineProps, defineEmits, watch } from "vue";
import axios from "axios";
import {
  PlusDialogForm,
  type FieldValues,
  type PlusColumn
} from "plus-pro-components";
import { ElMessage } from "element-plus";
import dayjs from "dayjs";

const props = defineProps({
  initialData: Object,
  visible: Boolean
});

const emit = defineEmits(["update:visible", "data-updated"]);

const values = ref<FieldValues>({});
const localVisible = ref(false);
const uploadedFiles = ref([]);
const uploadUrl = `${import.meta.env.VITE_APP_SERVER}/api/file_templates/upload`;

// 加载附件信息（从服务器获取）
const loadUploadedFiles = async () => {
  const id = props.initialData?.id;
  if (!id) return;

  try {
    const { data } = await axios.get(
      `${import.meta.env.VITE_APP_SERVER}/api/file_templates/files/${id}`
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

// 监听 visible 打开时初始化
watch(
  () => props.visible,
  newVal => {
    localVisible.value = newVal;
    if (newVal && props.initialData) {
      values.value = { ...props.initialData };
      loadUploadedFiles();
    }
  },
  { immediate: true }
);

// 上传前校验
const beforeUpload = file => {
  const allowedTypes = [
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/pdf",
    "image/png",
    "image/jpeg"
  ];
  const isAllowed = allowedTypes.includes(file.type);
  const isLt500k = file.size / 1024 < 500;
  if (!isAllowed) {
    ElMessage.error("只支持上传 Word、PDF、图片格式文件");
  }
  if (!isLt500k) {
    ElMessage.error("文件大小不能超过 500KB");
  }
  return isAllowed && isLt500k;
};

// 上传成功处理（删除旧文件 + 更新列表）
const handleUploadSuccess = async (response, file, fileList) => {
  const filePath = response.path || file.url;
  values.value.attachment_files = filePath.split("/").pop();

  // 删除旧文件（只保留 1 个）
  if (uploadedFiles.value.length > 0) {
    const oldFile = uploadedFiles.value[0];
    try {
      await axios.post(
        `${import.meta.env.VITE_APP_SERVER}/api/file_templates/deleteFile`,
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

// 删除文件处理
const handleRemoveFile = async file => {
  try {
    await axios.post(
      `${import.meta.env.VITE_APP_SERVER}/api/file_templates/deleteFile`,
      { path: file.url }
    );
    uploadedFiles.value = uploadedFiles.value.filter(f => f.url !== file.url);

    // 更新数据库字段为 0
    if (uploadedFiles.value.length === 0) {
      values.value.attachment_files = "0";
      await axios.put(
        `${import.meta.env.VITE_APP_SERVER}/api/file_templates/${values.value.id}`,
        { attachment_files: "0" }
      );
    }

    ElMessage.success("文件删除成功");
  } catch (error) {
    console.error("文件删除失败:", error);
    ElMessage.error("删除文件失败！");
  }
};

// 表单字段
const columns: PlusColumn[] = [
  {
    label: "模板名称",
    prop: "template_name",
    required: true,
    span: 24
  },
  {
    label: "文档说明",
    prop: "template_description",
    span: 24,
    valueType: "textarea",
    fieldProps: {
      placeholder: "请输入说明",
      maxlength: 300,
      showWordLimit: true,
      autosize: { minRows: 3, maxRows: 6 }
    }
  },
  {
    label: "附件",
    prop: "attachment_files",
    span: 24
  }
];

// 提交表单
const handleSubmit = async () => {
  try {
    const dataToSubmit = {
      ...values.value,
      updated_time: dayjs().format("YYYY-MM-DD HH:mm:ss") // 自动更新时间
    };
    await axios.put(
      `${import.meta.env.VITE_APP_SERVER}/api/file_templates/${values.value.id}`,
      dataToSubmit
    );
    emit("data-updated");
    emit("update:visible", false);
    ElMessage.success("更新成功");
  } catch (error) {
    console.error(error);
    ElMessage.error("更新失败");
  }
};
</script>
