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
    <!-- 自定义字段渲染 -->
    <template #plus-field-workflow_image>
      <!-- 整个内容垂直排列 -->
      <el-space
        direction="vertical"
        :size="12"
        alignment="start"
        style="width: 100%"
      >
        <!-- 第一行：打开编辑器 -->
        <el-button type="primary" @click="openEditor">
          打开 Draw.io 流程图编辑器
        </el-button>

        <!-- 第二行：缩略图 + 删除 -->
        <template v-if="hasImage">
          <el-image
            :src="rowThumb"
            fit="cover"
            style="width: 150px; height: 150px"
            @click="previewImage(rowThumb)"
          />
          <el-button
            type="danger"
            size="small"
            @click="showDeleteConfirm = true"
          >
            删除流程图
          </el-button>
        </template>
      </el-space>

      <!-- 大图预览 -->
      <el-dialog v-model="previewVisible" width="60%">
        <img :src="previewSrc" style="width: 100%" alt="预览" />
      </el-dialog>

      <!-- 删除确认弹窗 -->
      <el-dialog
        v-model="showDeleteConfirm"
        title="确认删除"
        width="30%"
        :close-on-click-modal="false"
      >
        <span>确定要删除该流程图吗？此操作无法撤销。</span>
        <template #footer>
          <el-button @click="showDeleteConfirm = false">取消</el-button>
          <el-button type="danger" @click="confirmDelete">确认</el-button>
        </template>
      </el-dialog>
    </template>
  </PlusDialogForm>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits, watch, computed } from "vue";
import axios from "axios";
import {
  PlusDialogForm,
  type FieldValues,
  type PlusColumn
} from "plus-pro-components";
import { ElMessage } from "element-plus";
import { openDrawio, setCurrentRowId, loadXmlIntoDrawio } from "@/utils/drawio";

/* -------- props & emits -------- */
const props = defineProps({ initialData: Object, visible: Boolean });
const emit = defineEmits(["update:visible", "data-updated"]);

/* -------- 弹窗可视 -------- */
const localVisible = ref(false);
watch(
  () => props.visible,
  v => {
    localVisible.value = v;
    if (v && props.initialData) values.value = { ...props.initialData };
  },
  { immediate: true }
);

/* -------- 计算字段 -------- */
const rowThumb = computed(() => props.initialData?.workflow_thumb || "");
const rowSvg = computed(() => props.initialData?.workflow_image || "");
const hasImage = computed(() => !!rowThumb.value);

/* -------- 缩略图预览 -------- */
const previewVisible = ref(false);
const previewSrc = ref("");
function previewImage(src: string) {
  previewSrc.value = src;
  previewVisible.value = true;
}

/* -------- 删除确认弹窗 -------- */
const showDeleteConfirm = ref(false);

/* -------- form 值 -------- */
const values = ref<FieldValues>({});
const columns: PlusColumn[] = [
  { label: "流程图", prop: "workflow_image", span: 24 }
];

/* -------- 打开编辑器 -------- */
async function openEditor() {
  const row = props.initialData;
  if (!row?.id) {
    return ElMessage.warning("请先保存记录后再设置流程图");
  }

  /* —— 旧 XML —— */
  let xml: string | undefined;
  if (row.workflow_xml) {
    try {
      // 直接 fetch workflow_xml URL
      const txt = await (await fetch(row.workflow_xml)).text();
      xml = txt.match(/<mxfile[\s\S]*<\/mxfile>/i)?.[0];
    } catch (e) {
      console.warn("[drawio] 旧 XML 读取失败", e);
    }
  }

  try {
    setCurrentRowId(row.id);
    await openDrawio();
    loadXmlIntoDrawio(xml);
  } catch (e) {
    console.error(e);
    ElMessage.error("编辑器打开失败，请检查 Draw.io 服务");
  }
}

/* -------- 删除流程图 -------- */
async function handleRemoveImage() {
  const row = props.initialData;
  const paths: string[] = [];
  if (row.workflow_thumb) paths.push(row.workflow_thumb);
  if (row.workflow_image) paths.push(row.workflow_image);
  if (row.workflow_xml) paths.push(row.workflow_xml);

  if (!paths.length) return;

  try {
    // ① 删除所有旧文件
    await axios.post(
      `${import.meta.env.VITE_APP_SERVER}/api/workflows/deleteFile`,
      { pathList: paths }
    );
    // ② 清空三字段
    await axios.put(
      `${import.meta.env.VITE_APP_SERVER}/api/workflows/${row.id}`,
      {
        ...row,
        workflow_thumb: "",
        workflow_image: "",
        workflow_xml: ""
      }
    );
    ElMessage.success("流程图已删除");
    emit("data-updated");
    emit("update:visible", false);
  } catch (e) {
    console.error(e);
    ElMessage.error("删除流程图失败");
  }
}

/* -------- 确认删除 -------- */
async function confirmDelete() {
  showDeleteConfirm.value = false;
  await handleRemoveImage();
}

/* -------- 提交 -------- */
async function handleSubmit() {
  try {
    await axios.put(
      `${import.meta.env.VITE_APP_SERVER}/api/workflows/${values.value.id}`,
      {
        ...values.value,
        workflow_thumb: props.initialData?.workflow_thumb || "",
        workflow_image: props.initialData?.workflow_image || "",
        workflow_xml: props.initialData?.workflow_xml || ""
      }
    );
    ElMessage.success("更新成功");
    emit("data-updated");
    emit("update:visible", false);
  } catch (e) {
    console.error(e);
    ElMessage.error("更新失败");
  }
}

/* -------- 关闭弹窗时归零行 ID -------- */
watch(localVisible, v => !v && setCurrentRowId(null));
</script>

<style scoped>
.ml-2 {
  margin-left: 8px;
}
</style>
