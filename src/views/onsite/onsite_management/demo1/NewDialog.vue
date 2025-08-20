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
        accept=".doc,.docx,.pdf,.png,.jpg,.jpeg,.wps"
        :before-upload="beforeUpload"
        @exceed="handleExceed"
        @success="handleUploadSuccess"
        @remove="handleRemoveFile"
      >
        <el-button type="primary">上传</el-button>
        <template v-slot:tip>
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
import { ElMessage } from "element-plus";
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

/** 超出数量限制时的提示 */
const handleExceed = (_files: File[], _fileList: any[]) => {
  ElMessage.warning("最多只能上传 5 个文件"); // 或者 1 个，根据 limit 而定
};

const handleSubmit = async () => {
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

// 更新字段：新增 onSite_project 和 onSite_work，删除 onSite_reason
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
    valueType: "select",
    options: [
      {
        label: "暂定",
        value: "0",
        color: "yellow"
      },
      {
        label: "项目专职类",
        value: "1",
        color: "blue"
      },
      {
        label: "混合办公类",
        value: "2",
        color: "blue"
      },
      {
        label: "借用办公场地类",
        value: "3",
        color: "blue"
      }
    ]
  },
  {
    label: "联系方式",
    prop: "contact_info",
    valueType: "input"
  },
  {
    label: "驻场项目",
    prop: "onSite_project",
    valueType: "input"
  },
  {
    label: "实施项目业务",
    prop: "onSite_work",
    valueType: "input",
    fieldProps: {
      maxlength: 100,
      showWordLimit: true,
      autosize: { minRows: 1, maxRows: 5 }
    }
  },
  {
    label: "驻场时间",
    prop: "onSite_time",
    valueType: "input"
  },
  {
    label: "办公室位置",
    prop: "location",
    valueType: "input"
  },
  {
    label: "备注",
    prop: "remarks",
    valueType: "textarea",
    fieldProps: {
      maxlength: 500,
      showWordLimit: true,
      autosize: { minRows: 2, maxRows: 10 }
    }
  },
  {
    label: "相关函件",
    prop: "related_files",
    valueType: "input"
  }
];
</script>
