<template>
  <PlusDialogForm
    v-model:visible="localVisible"
    v-model="values"
    :form="{ columns }"
    title="编辑催款项数据"
    confirm-text="更新"
    cancel-text="取消"
    @confirm="handleSubmit"
    @update:visible="emit('update:visible', $event)"
  >
    <template #plus-field-prompt_files>
      <el-upload
        :action="uploadUrl"
        list-type="text"
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
            只能上传 DOC、DOCX、PDF、PNG、JPG、JPEG 文件，且不超过 500kb
          </div>
        </template>
      </el-upload>
    </template>
  </PlusDialogForm>
</template>

<script setup lang="ts">
import {
  ref,
  defineProps,
  watchEffect,
  defineEmits,
  onMounted,
  computed,
  watch
} from "vue";
import axios from "axios";
import "plus-pro-components/es/components/dialog-form/style/css";
import {
  type PlusColumn,
  type FieldValues,
  PlusDialogForm
} from "plus-pro-components";
import dayjs from "dayjs";

// 响应式变量，存储项目名称和合同名称选项
const projectOptions = ref([]);
const contractOptions = ref([]);
const allContracts = ref([]); // 保存所有合同数据，包括对应项目名称

// 从父组件接收的初始数据和可见性状态
const props = defineProps({
  initialData: Object,
  visible: Boolean,
  editingField: String // 确定当前编辑的字段名
});

// 发射事件到父组件的方法
const emit = defineEmits(["update:visible", "data-updated"]);

// 本地表单值的响应式状态
const values = ref<FieldValues>({});
const localVisible = ref(false);

// 定义上传 URL
const uploadUrl = ref(`${import.meta.env.VITE_APP_SERVER}/api/prompts/upload`);

// 已上传的文件列表
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

// 加载指定字段的附件列表
const loadUploadedFiles = async () => {
  if (props.initialData && props.initialData.prompt_id && props.editingField) {
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_APP_SERVER}/api/prompts/files/${props.initialData.prompt_id}/${props.editingField}`
      );
      uploadedFiles.value = data.files
        .filter(file => file.name !== "0") // 过滤掉名称为 "0" 的文件
        .map(file => ({
          name: file.name,
          url: file.url
        }));
    } catch (error) {
      console.error("加载已上传文件失败:", error);
    }
  } else {
    uploadedFiles.value = []; // 清空文件列表
  }
};

// 组件初始化时加载数据
onMounted(() => {
  loadProjectNames();
  loadContractNames();
  if (props.visible) {
    loadUploadedFiles(); // 在组件加载时获取附件
  }
});

// 监视 visible 属性的变化来加载数据
watch(
  () => props.visible,
  newVisible => {
    if (newVisible) {
      loadUploadedFiles(); // 在弹窗打开时加载附件
    } else {
      uploadedFiles.value = []; // 清空列表防止展示错误文件
    }
  }
);

// 监视 props.initialData 变化来更新本地显示状态
watchEffect(() => {
  localVisible.value = props.visible;
  if (props.initialData) {
    values.value = { ...props.initialData };
  }
});

// 动态筛选合同选项并清空合同选择
watch(
  () => values.value.project_name,
  newProjectName => {
    contractOptions.value = allContracts.value.filter(
      contract => contract.project_name === newProjectName
    );
    values.value.contract_name = ""; // 清空已有的合同选择
  }
);

// 使用computed确保类型匹配
const computedProjectOptions = computed(() => projectOptions.value);
const computedContractOptions = computed(() => contractOptions.value);

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

// 提交表单的事件处理函数
const handleSubmit = async () => {
  if (!values.value.prompt_id) {
    console.error("缺少催款项 ID，无法更新。");
    return;
  }
  if (values.value.prompt_time) {
    values.value.prompt_time = dayjs(values.value.prompt_time as string).format(
      "YYYY-MM-DD"
    );
  }
  try {
    await axios.put(
      `${import.meta.env.VITE_APP_SERVER}/api/prompts/${values.value.prompt_id}`,
      values.value
    );
    emit("update:visible", false);
    emit("data-updated");
    alert("催款项更新成功！");
  } catch (error) {
    console.error("更新催款项失败:", error);
    alert("催款项更新失败！");
  }
};

// 处理上传成功
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

// 处理文件移除
const handleRemoveFile = async file => {
  try {
    await axios.post(
      `${import.meta.env.VITE_APP_SERVER}/api/prompts/deleteFile`,
      { path: file.url }
    );
    uploadedFiles.value = uploadedFiles.value.filter(f => f.url !== file.url);

    // 更新数据库中的催款函件栏为 0
    if (uploadedFiles.value.length === 0) {
      values.value.prompt_files = 0;
      await axios.put(
        `${import.meta.env.VITE_APP_SERVER}/api/prompts/${values.value.prompt_id}`,
        { prompt_files: 0 }
      );
    }

    alert("文件删除成功");
  } catch (error) {
    console.error("删除文件失败:", error);
    alert("删除文件失败！");
  }
};

// 列的定义
const columns: PlusColumn[] = [
  {
    label: "催款项名称",
    width: 120,
    labelWidth: 100,
    prop: "prompt_name",
    valueType: "input"
  },
  {
    label: "项目名称",
    width: 120,
    labelWidth: 100,
    prop: "project_name",
    valueType: "select",
    options: computedProjectOptions
  },
  {
    label: "合同名称",
    width: 120,
    labelWidth: 100,
    prop: "contract_name",
    valueType: "select",
    options: computedContractOptions
  },
  {
    label: "催款金额",
    labelWidth: 100,
    prop: "prompt_money",
    valueType: "input-number",
    fieldProps: { precision: 2, step: 100 }
  },
  {
    label: "登记时间",
    labelWidth: 100,
    prop: "prompt_time",
    valueType: "date-picker"
  },
  {
    label: "备注",
    labelWidth: 100,
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
    labelWidth: 100,
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
    labelWidth: 100,
    prop: "prompt_files",
    valueType: "input" // 插槽会覆盖这个类型
  }
];
</script>
