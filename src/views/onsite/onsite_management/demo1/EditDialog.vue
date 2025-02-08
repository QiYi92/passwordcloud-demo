<template>
  <PlusDialogForm
    v-model:visible="localVisible"
    v-model="values"
    :form="{ columns }"
    title="编辑驻场数据"
    confirm-text="更新"
    cancel-text="取消"
    @confirm="handleSubmit"
    @update:visible="emit('update:visible', $event)"
  >
    <template #plus-field-related_files>
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
            只能上传 Word (doc, docx)、PDF、PNG、JPG、JPEG 文件，且不超过 500kb
          </div>
        </template>
      </el-upload>
    </template>
  </PlusDialogForm>
</template>

<script setup lang="ts">
import { ref, defineProps, watchEffect, defineEmits, onMounted } from "vue";
import axios from "axios";
import "plus-pro-components/es/components/dialog-form/style/css";
import {
  type PlusColumn,
  type FieldValues,
  PlusDialogForm
} from "plus-pro-components";
import { OnsiteTypeOptions } from "@/views/onsite/onsite_management/data";

const props = defineProps({
  initialData: Object,
  visible: Boolean,
  editingField: String
});

const emit = defineEmits(["update:visible", "data-updated"]);

const values = ref<FieldValues>({});
const localVisible = ref(false);
const uploadUrl = ref(`${import.meta.env.VITE_APP_SERVER}/api/onsite/upload`); // 修改 URL
const uploadedFiles = ref([]);

// 加载指定字段的附件列表
const loadUploadedFiles = async () => {
  if (
    props.initialData &&
    props.initialData.personnel_id &&
    props.editingField
  ) {
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_APP_SERVER}/api/onsite/files/${props.initialData.personnel_id}/${props.editingField}`
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

const reverseConvertType = (label: string): string => {
  const option = OnsiteTypeOptions.find(opt => opt.label === label);
  return option ? option.value : label;
};

onMounted(() => {
  localVisible.value = props.visible;
  if (props.visible) {
    loadUploadedFiles();
    const initialData = { ...props.initialData };
    if (initialData.type) {
      // 如果 type 字段是 label，则转换成对应的 value
      initialData.type = reverseConvertType(initialData.type);
    }
    values.value = initialData;
  }
});

watchEffect(() => {
  localVisible.value = props.visible;
  if (props.visible) {
    loadUploadedFiles();
    const initialData = { ...props.initialData };
    if (initialData.type) {
      initialData.type = reverseConvertType(initialData.type);
    }
    values.value = initialData;
  }
});
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
  if (!values.value.personnel_id) {
    console.error("缺少驻场人员 ID，无法更新。");
    return;
  }

  // 将 onSite_time 保留为字符串，不再进行日期格式化
  if (values.value.onSite_time) {
    values.value.onSite_time = values.value.onSite_time.toString(); // 直接作为字符串处理
  }

  try {
    await axios.put(
      `${import.meta.env.VITE_APP_SERVER}/api/onsite/${values.value.personnel_id}`,
      values.value
    );
    emit("update:visible", false);
    emit("data-updated");
    alert("驻场数据更新成功！");
  } catch (error) {
    console.error("更新驻场数据失败:", error);
    alert("驻场数据更新失败！");
  }
};

// 处理上传成功
const handleUploadSuccess = async (response, file, fileList) => {
  const filePath = response.path || file.url;
  values.value.related_files = filePath.split("/").pop(); // 仅保存文件名

  // 删除旧文件（假设只保留最新的一个文件）
  if (uploadedFiles.value.length > 0) {
    const oldFile = uploadedFiles.value[0];
    try {
      await axios.post(
        `${import.meta.env.VITE_APP_SERVER}/api/onsite/deleteFile`,
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
      `${import.meta.env.VITE_APP_SERVER}/api/onsite/deleteFile`,
      { path: file.url }
    );
    uploadedFiles.value = uploadedFiles.value.filter(f => f.url !== file.url);

    // 更新数据库中的相关文件栏
    if (uploadedFiles.value.length === 0) {
      values.value.related_files = 0;
      await axios.put(
        `${import.meta.env.VITE_APP_SERVER}/api/onsite/${values.value.personnel_id}`,
        { related_files: 0 }
      );
    }

    alert("文件删除成功");
  } catch (error) {
    console.error("删除文件失败:", error);
    alert("删除文件失败！");
  }
};

// 更新字段：新增 onSite_project 和 onSite_work，删除 onSite_reason
const columns: PlusColumn[] = [
  {
    label: "驻场人员ID",
    prop: "personnel_id",
    valueType: "input"
  },
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
    label: "办公室位置",
    prop: "location",
    valueType: "input"
  },
  {
    label: "相关函件",
    prop: "related_files",
    valueType: "input"
  }
];
</script>
