<template>
  <el-button type="primary" @click="handleOpen">添加文档模板</el-button>
  <PlusDialogForm
    v-model:visible="visible"
    v-model="values"
    :form="{ columns }"
    title="添加文档模板"
    confirm-text="确认"
    cancel-text="取消"
    @confirm="handleSubmit"
  >
    <!-- 上传附件插槽 -->
    <template #plus-field-attachment_files>
      <el-upload
        :action="uploadUrl"
        list-type="text"
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
            只能上传 Word(doc/docx/wps)、PDF、PNG、JPG、JPEG 文件，且不超过 3MB
          </div>
        </template>
      </el-upload>
    </template>
  </PlusDialogForm>
</template>

<script setup lang="ts">
import { ref, defineEmits } from "vue";
import axios from "axios";
import {
  PlusDialogForm,
  type FieldValues,
  type PlusColumn
} from "plus-pro-components";
import { ElMessage } from "element-plus";
import dayjs from "dayjs";

const emit = defineEmits(["update:visible", "data-updated"]);
const values = ref<FieldValues>({});
const visible = ref(false);
const uploadUrl = `${import.meta.env.VITE_APP_SERVER}/api/file_templates/upload`;
const uploadedFiles = ref([]);

const handleOpen = () => {
  visible.value = true;
};

/** 上传前校验：格式 & 大小（3MB） */
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

/** 超出数量限制时的提示（最多 1 个） */
const handleExceed = (_files: File[], _fileList: any[]) => {
  ElMessage.warning("最多只能上传 1 个文件");
};

const handleUploadSuccess = (response, file) => {
  values.value.attachment_files = response.path.split("/").pop();
  uploadedFiles.value = [{ name: file.name, url: response.path }];
};

const handleRemoveFile = () => {
  values.value.attachment_files = null;
};

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

const handleSubmit = async () => {
  try {
    const dataToSubmit = {
      ...values.value,
      updated_time: dayjs().format("YYYY-MM-DD HH:mm:ss") // 自动加上当前时间
    };
    await axios.post(
      `${import.meta.env.VITE_APP_SERVER}/api/file_templates`,
      dataToSubmit
    );
    emit("data-updated");
    visible.value = false;
    ElMessage.success("添加成功");
  } catch (error) {
    console.error(error);
    ElMessage.error("添加失败");
  }
};
</script>
