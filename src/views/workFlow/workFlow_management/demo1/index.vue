<script setup lang="ts">
import { ref, computed } from "vue";
import axios from "axios";
import { useColumns } from "./columns";
import EditDialog from "./EditDialog.vue";
import DeleteDialog from "./DeleteDialog.vue";
import NewDialog from "./NewDialog.vue";
import ShowDialog from "./ShowDialog.vue";
import UploadDialog from "./UploadDialog.vue";
import {
  FlowTypeOptions,
  FlowStatusOptions
} from "@/views/workFlow/workFlow_management/data";

/* draw.io 监听 */
import { initDrawioSaveListener, setCurrentRowId } from "@/utils/drawio";
import { ElMessage } from "element-plus";

/* ------------------- 局部状态 ------------------- */
const tableRef = ref();
const deleteWorkflowId = ref<number | null>(null);
const deleteDialogVisible = ref(false);
const editDialogVisible = ref(false);
const editRowData = ref<any>(null);
const showDialogVisible = ref(false);
const previewData = ref<any>(null);
const uploadDialogVisible = ref(false);
const currentRowForUpload = ref<any>(null);

/* ------------------- 操作回调 ------------------- */
const handleDelete = row => {
  deleteWorkflowId.value = row.id;
  deleteDialogVisible.value = true;
};
const handleEdit = row => {
  editRowData.value = row;
  editDialogVisible.value = true;
};
const handlePreview = row => {
  previewData.value = row;
  showDialogVisible.value = true;
};
const handleSetImage = row => {
  currentRowForUpload.value = row;
  uploadDialogVisible.value = true;
};

/* ------------------- 列表数据 & 分页 ------------------- */
const {
  loading,
  columns,
  dataList,
  pagination,
  loadingConfig,
  adaptiveConfig,
  onSizeChange,
  onCurrentChange,
  searchField,
  searchQuery,
  showMouseMenu,
  fetchData
} = useColumns();

/* ===== Draw.io 保存监听 ===== */
initDrawioSaveListener(async (rowId, xmlUrl, pngUrl, svgUrl) => {
  try {
    /* 1️⃣ 取旧路径 */
    const oldRow = dataList.value.find(r => r.id === rowId)!;
    const oldXml = oldRow.workflow_xml || "";
    const oldPng = oldRow.workflow_thumb || "";
    const oldSvg = oldRow.workflow_image || "";

    /* 2️⃣ 删除旧文件（XML + PNG + SVG） */
    const pathsToDelete: string[] = [];
    if (oldXml && oldXml !== xmlUrl) pathsToDelete.push(oldXml);
    if (oldPng && oldPng !== pngUrl) pathsToDelete.push(oldPng);
    if (oldSvg && oldSvg !== svgUrl) pathsToDelete.push(oldSvg);
    if (pathsToDelete.length) {
      await axios.post(
        `${import.meta.env.VITE_APP_SERVER}/api/workflows/deleteFile`,
        { pathList: pathsToDelete }
      );
    }

    /* 3️⃣ Patch 新的 XML + PNG + SVG 到数据库 */
    await axios.patch(
      `${import.meta.env.VITE_APP_SERVER}/api/workflows/${rowId}/image`,
      {
        workflow_xml: xmlUrl,
        workflow_thumb: pngUrl,
        workflow_image: svgUrl
      }
    );

    /* 4️⃣ 更新本地行 & 刷新表格 */
    oldRow.workflow_xml = xmlUrl;
    oldRow.workflow_thumb = pngUrl;
    oldRow.workflow_image = svgUrl;
    await fetchData();
    ElMessage.success("流程图已更新（XML/PNG/SVG）");
  } catch (e) {
    console.error(e);
    ElMessage.error("保存流程图失败");
  } finally {
    setCurrentRowId(null);
  }
});

/* ------------------- 搜索联动下拉 ------------------- */
const isDropdownSearch = computed(() =>
  ["type", "status"].includes(searchField.value)
);
const currentOptions = computed(() => {
  if (searchField.value === "type") return FlowTypeOptions;
  if (searchField.value === "status") return FlowStatusOptions;
  return [];
});
</script>

<template>
  <el-card shadow="never">
    <template #header>
      <div class="card-header">
        <span class="font-medium"> 工作流程 </span>
      </div>
    </template>
    <el-alert
      style="margin-bottom: 16px"
      title="重新编辑流程图后需要刷新一下页面，更新后的流程图才会在页面上刷新"
      type="info"
      :closable="false"
    />
    <div>
      <!-- ================= 搜索 ================= -->
      <div class="search-controls mb-4">
        <el-select
          v-model="searchField"
          placeholder="选择搜索字段"
          style="width: 200px; margin-right: 10px"
        >
          <el-option label="流程名称" value="name" />
          <el-option label="流程类型" value="type" />
          <el-option label="状态" value="status" />
          <el-option label="备注" value="remark" />
          <el-option label="流程责任" value="owner" />
        </el-select>

        <template v-if="isDropdownSearch">
          <el-select
            v-model="searchQuery"
            placeholder="请选择搜索内容"
            style="width: 300px; margin-right: 10px"
          >
            <el-option label="全部" value="" />
            <el-option
              v-for="opt in currentOptions"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>
        </template>
        <template v-else>
          <el-input
            v-model="searchQuery"
            placeholder="输入搜索内容"
            style="width: 300px; margin-right: 10px"
          />
        </template>

        <NewDialog @data-updated="fetchData" />
      </div>

      <!-- ================= 表格 ================= -->
      <div style="overflow-x: auto">
        <pure-table
          ref="tableRef"
          border
          adaptive
          :adaptiveConfig="adaptiveConfig"
          row-key="id"
          alignWhole="center"
          showOverflowTooltip
          :loading="loading"
          :loading-config="loadingConfig"
          :data="
            dataList.slice(
              (pagination.currentPage - 1) * pagination.pageSize,
              pagination.currentPage * pagination.pageSize
            )
          "
          :columns="columns"
          :pagination="pagination"
          style="min-width: 120px"
          @page-size-change="onSizeChange"
          @page-current-change="onCurrentChange"
          @row-contextmenu="showMouseMenu"
        >
          <!-- -------- 操作列 -------- -->
          <template #operation="{ row }">
            <el-button
              link
              type="primary"
              size="small"
              @click="handlePreview(row)"
              >预览</el-button
            >
            <el-button link type="primary" size="small" @click="handleEdit(row)"
              >修改</el-button
            >
            <el-button
              link
              type="primary"
              size="small"
              @click="handleDelete(row)"
              >删除</el-button
            >
            <el-button
              link
              type="primary"
              size="small"
              @click="handleSetImage(row)"
              >设置流程图</el-button
            >
          </template>

          <!-- -------- 缩略图列 -------- -->
          <template #workflowImage="{ row }">
            <el-image
              v-if="row.workflow_thumb"
              :key="row.workflow_thumb"
              preview-teleported
              loading="lazy"
              :src="row.workflow_thumb"
              :preview-src-list="[row.workflow_thumb]"
              :zoom-rate="1.04"
              fit="cover"
              class="w-[100px] h-[100px]"
            />
            <span v-else style="color: #999">暂无图片</span>
          </template>
        </pure-table>
      </div>

      <!-- ================= 弹窗 ================= -->
      <EditDialog
        :visible="editDialogVisible"
        :initialData="editRowData"
        @update:visible="editDialogVisible = $event"
        @data-updated="fetchData"
      />
      <DeleteDialog
        :visible="deleteDialogVisible"
        :workflowId="deleteWorkflowId"
        @update:visible="deleteDialogVisible = $event"
        @deleted="fetchData"
      />
      <ShowDialog
        :visible="showDialogVisible"
        :data="previewData"
        @update:visible="showDialogVisible = $event"
      />
      <UploadDialog
        :visible="uploadDialogVisible"
        :initialData="currentRowForUpload"
        @update:visible="uploadDialogVisible = $event"
        @data-updated="fetchData"
      />
    </div>
  </el-card>
</template>
