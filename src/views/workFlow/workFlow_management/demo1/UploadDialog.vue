<template>
  <PlusDialogForm
    v-model:visible="localVisible"
    v-model="values"
    :form="{ columns }"
    title="设置工作流程图"
    confirm-text="更新"
    cancel-text="取消"
    @confirm="handleSubmit"
    @update:visible="emit('update:visible', $event)"
  >
    <template #plus-field-workflow_image>
      <el-upload
        v-if="uploadedFiles.length === 0"
        :action="uploadUrl"
        list-type="picture-card"
        :limit="1"
        :file-list="uploadedFiles"
        accept=".png,.jpg,.jpeg"
        :before-upload="beforeUpload"
        @success="handleUploadSuccess"
        @remove="handleRemoveFile"
        @preview="handlePictureCardPreview"
      >
        <el-button type="primary">上传流程图</el-button>
        <template #tip>
          <div class="el-upload__tip">仅支持 PNG、JPG，大小不超过 2MB</div>
        </template>
      </el-upload>

      <!-- 已有图片时显示缩略图 + 删除按钮 -->
      <div v-else class="uploaded-image">
        <el-image
          :src="uploadedFiles[0].url"
          fit="cover"
          style="width: 150px; height: 150px; cursor: pointer"
          @click="handlePictureCardPreview(uploadedFiles[0])"
        />
        <el-button
          type="danger"
          size="small"
          style="margin-top: 8px"
          @click="handleRemoveFile(uploadedFiles[0])"
        >
          删除图片
        </el-button>
      </div>

      <!-- 大图预览弹窗 -->
      <el-dialog v-model="previewVisible" width="60%" :show-close="true">
        <img :src="previewImageUrl" alt="预览" style="width: 100%" />
      </el-dialog>
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

const props = defineProps({
  initialData: Object,
  visible: Boolean
});

const emit = defineEmits(["update:visible", "data-updated"]);

const values = ref<FieldValues>({});
const localVisible = ref(false);
const uploadedFiles = ref([]);
const uploadUrl = `${import.meta.env.VITE_APP_SERVER}/api/workflows/upload`;

const previewVisible = ref(false);
const previewImageUrl = ref("");

// 加载当前行的流程图（初始文件）
const loadUploadedFiles = async () => {
  const { id, workflow_image } = props.initialData || {};
  if (!id || !workflow_image) return;
  uploadedFiles.value = [
    {
      name: workflow_image.split("/").pop(),
      url: workflow_image
    }
  ];
};

// 监听弹窗打开时初始化
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
  const isImage = ["image/png", "image/jpeg"].includes(file.type);
  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isImage) ElMessage.error("仅支持 PNG、JPG 格式");
  if (!isLt2M) ElMessage.error("文件大小不能超过 2MB");
  return isImage && isLt2M;
};

// 上传成功处理
const handleUploadSuccess = (response, file, fileList) => {
  const filePath = response.path;
  values.value.workflow_image = filePath;
  uploadedFiles.value = fileList.map(f => ({
    name: f.name,
    url: f.response?.path || f.url
  }));
};

// 删除图片处理
const handleRemoveFile = async file => {
  try {
    const url = file.url;
    // 提取相对路径
    const relativePath = new URL(url).pathname;

    console.log("准备删除的图片信息：", file);
    console.log("提交到后端的相对路径：", relativePath);

    await axios.post(
      `${import.meta.env.VITE_APP_SERVER}/api/workflows/deleteFile`,
      {
        path: relativePath
      }
    );

    uploadedFiles.value = [];
    values.value.workflow_image = "";
    ElMessage.success("图片删除成功");
  } catch (error) {
    console.error("删除失败:", error);
    ElMessage.error("删除图片失败！");
  }
};

// 点击图片放大预览
const handlePictureCardPreview = file => {
  previewImageUrl.value = file.url || file.response?.path;
  previewVisible.value = true;
};

// 表单字段
const columns: PlusColumn[] = [
  {
    label: "流程图",
    prop: "workflow_image",
    span: 24
  }
];

// 提交保存
const handleSubmit = async () => {
  try {
    await axios.put(
      `${import.meta.env.VITE_APP_SERVER}/api/workflows/${values.value.id}`,
      {
        ...values.value,
        workflow_image: values.value.workflow_image
      }
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

<style scoped>
.uploaded-image {
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>
