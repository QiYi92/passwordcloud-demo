<template>
  <el-button type="primary" @click="handleOpen">添加新数据</el-button>
  <PlusDialogForm
    v-model:visible="visible"
    v-model="values"
    :form="{ columns }"
    title="添加催款项"
    confirm-text="确认"
    cancel-text="取消"
    @confirm="handleSubmit"
    @update:visible="emit('update:visible', $event)"
  >
    <!-- 使用插槽实现上传按钮 -->
    <template #plus-field-prompt_files>
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
import { ref, defineEmits, onMounted, computed, watch } from "vue";
import axios from "axios";
import "plus-pro-components/es/components/dialog-form/style/css";
import {
  type PlusColumn,
  type FieldValues,
  PlusDialogForm
} from "plus-pro-components";
import dayjs from "dayjs";

const projectOptions = ref([]);
const contractOptions = ref([]);
const allContracts = ref([]);

const emit = defineEmits(["update:visible", "data-updated"]);
const values = ref<FieldValues>({});
const visible = ref(false);
const uploadUrl = ref(`${import.meta.env.VITE_APP_SERVER}/api/prompts/upload`);
const uploadedFiles = ref([]);

// 加载项目和合同名称数据
const loadProjectNames = async () => {
  try {
    const { data } = await axios.get(
      `${import.meta.env.VITE_APP_SERVER}/api/projects`
    );
    projectOptions.value = data.map(project => ({
      label: project.project_name,
      value: project.project_name
    }));
  } catch (error) {
    console.error("加载项目名称失败:", error);
  }
};

const loadContractNames = async () => {
  try {
    const { data } = await axios.get(
      `${import.meta.env.VITE_APP_SERVER}/api/contracts`
    );
    allContracts.value = data.map(contract => ({
      label: contract.contract_name,
      value: contract.contract_name,
      project_name: contract.project_name
    }));
    contractOptions.value = allContracts.value;
  } catch (error) {
    console.error("加载合同名称失败:", error);
  }
};

onMounted(() => {
  loadProjectNames();
  loadContractNames();
});

watch(
  () => values.value.project_name,
  newProjectName => {
    contractOptions.value = allContracts.value.filter(
      contract => contract.project_name === newProjectName
    );
    values.value.contract_name = "";
  }
);

const computedProjectOptions = computed(() => projectOptions.value);
const computedContractOptions = computed(() => contractOptions.value);

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
  // 如果没有选择登记时间，默认使用当前日期
  if (!values.value.prompt_time) {
    values.value.prompt_time = dayjs().format("YYYY-MM-DD");
  } else {
    values.value.prompt_time = dayjs(values.value.prompt_time as string).format(
      "YYYY-MM-DD"
    );
  }

  // 如果未上传文件，则设置 prompt_files 为 0
  if (uploadedFiles.value.length === 0) {
    values.value.prompt_files = 0;
  }

  try {
    await axios.post(
      `${import.meta.env.VITE_APP_SERVER}/api/prompts`,
      values.value
    );
    visible.value = false;
    emit("data-updated");
    alert("催款项添加成功！");
  } catch (error) {
    console.error("催款项添加失败:", error);
    alert("催款项添加失败！");
  }
};

const handleUploadSuccess = async (response, file, fileList) => {
  const filePath = response.path || file.url; // 确保使用返回的文件路径
  values.value.prompt_files = filePath.split("/").pop(); // 仅保存文件名

  // 删除旧文件（假设只保留最新的一个文件）
  if (uploadedFiles.value.length > 0) {
    const oldFile = uploadedFiles.value[0];
    try {
      await axios.post(
        `${import.meta.env.VITE_APP_SERVER}/api/prompts/deleteFile`,
        { path: oldFile.url }
      );
    } catch (error) {
      console.error("删除旧文件失败:", error);
    }
  }

  // 更新文件列表
  uploadedFiles.value = fileList.map(f => ({
    name: f.name,
    url: f.response?.path || f.url
  }));
};

const handleRemoveFile = async file => {
  try {
    await axios.post(
      `${import.meta.env.VITE_APP_SERVER}/api/prompts/deleteFile`,
      { path: file.url }
    );
    uploadedFiles.value = uploadedFiles.value.filter(f => f.url !== file.url);
    alert("文件删除成功");

    // 如果删除后没有文件，更新 prompt_files 为 0
    if (uploadedFiles.value.length === 0) {
      values.value.prompt_files = 0;
    }
  } catch (error) {
    console.error("删除文件失败:", error);
    alert("删除文件失败！");
  }
};

const columns: PlusColumn[] = [
  {
    label: "催款项名称",
    width: 120,
    labelWidth: 150,
    prop: "prompt_name",
    valueType: "input"
  },
  {
    label: "项目名称",
    width: 120,
    labelWidth: 150,
    prop: "project_name",
    valueType: "select",
    options: computedProjectOptions
  },
  {
    label: "合同名称",
    width: 120,
    labelWidth: 150,
    prop: "contract_name",
    valueType: "select",
    options: computedContractOptions
  },
  {
    label: "催款金额（元）",
    labelWidth: 150,
    prop: "prompt_money",
    valueType: "input-number",
    fieldProps: { precision: 2, step: 100 }
  },
  {
    label: "登记时间",
    labelWidth: 150,
    prop: "prompt_time",
    valueType: "date-picker"
  },
  {
    label: "备注",
    labelWidth: 150,
    prop: "prompt_remark",
    valueType: "textarea",
    fieldProps: {
      maxlength: 500,
      showWordLimit: true,
      autosize: { minRows: 2, maxRows: 10 }
    }
  },
  {
    label: "处理情况记录",
    labelWidth: 150,
    prop: "prompt_record",
    valueType: "textarea",
    fieldProps: {
      maxlength: 500,
      showWordLimit: true,
      autosize: { minRows: 2, maxRows: 10 }
    }
  },
  {
    label: "催款函件",
    labelWidth: 150,
    prop: "prompt_files",
    valueType: "input"
  }
];
</script>
