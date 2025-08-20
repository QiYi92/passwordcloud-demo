import type {
  LoadingConfig,
  AdaptiveConfig,
  PaginationProps
} from "@pureadmin/table";
import { ref, onMounted, reactive, watch } from "vue";
import axios from "axios";
import dayjs from "dayjs";
import { message } from "@/utils/message";
import { CustomMouseMenu } from "@howdyjs/mouse-menu";
import { FilesTypeOptions } from "@/views/fileTemplate/fileTemplate_management/data";
import { clone, delay } from "@pureadmin/utils";

// 获取附件名显示标签
const getFilesLabel = value => {
  if (!value || value === "0") {
    return "无附件";
  }
  return value;
};

export function useColumns() {
  const dataList = ref([]);
  const loading = ref(true);
  const searchField = ref("template_name");
  const searchQuery = ref("");
  const editRowData = ref(null);
  const deleteId = ref(null);
  const editDialogVisible = ref(false);
  const deleteDialogVisible = ref(false);

  const columns: TableColumnList = [
    { label: "ID", prop: "id", width: 80 },
    { label: "模板名称", prop: "template_name" },
    { label: "文档说明", prop: "template_description" },
    {
      label: "最后更新时间",
      prop: "updated_time",
      formatter: row =>
        row.updated_time
          ? dayjs(row.updated_time).format("YYYY-MM-DD HH:mm:ss")
          : "未填写"
    },
    {
      label: "附件",
      prop: "attachment_files",
      formatter: row => getFilesLabel(row.attachment_files),
      slot: "attachment_files"
    },
    { label: "操作", width: "150", fixed: "right", slot: "operation" }
  ];

  const pagination = reactive<PaginationProps>({
    pageSize: 20,
    currentPage: 1,
    pageSizes: [20, 40, 60],
    total: 0,
    align: "right",
    background: true,
    small: false
  });

  const menuOptions = {
    menuList: [
      {
        label: ({ id }) => `模板ID：${id}`,
        disabled: true
      },
      {
        label: "编辑",
        tips: "Edit",
        fn: async row => {
          editRowData.value = row;
          editDialogVisible.value = true;
        }
      },
      {
        label: "删除",
        tips: "Delete",
        fn: row => {
          deleteId.value = row.id;
          deleteDialogVisible.value = true;
        }
      }
    ]
  };

  const loadingConfig = reactive<LoadingConfig>({
    text: "正在加载第一页...",
    viewBox: "-10, -10, 50, 50",
    spinner: `
        <path class="path" d="
          M 30 15
          L 28 17
          M 25.61 25.61
          A 15 15, 0, 0, 1, 15 30
          A 15 15, 0, 1, 1, 27.99 7.5
          L 15 15
        " style="stroke-width: 4px; fill: rgba(0, 0, 0, 0)"/>
      `
  });

  const adaptiveConfig: AdaptiveConfig = { offsetBottom: 110 };

  function showMouseMenu(row, column, event) {
    event.preventDefault();
    const { x, y } = event;
    CustomMouseMenu({
      el: event.currentTarget,
      params: row,
      menuWrapperCss: { background: "var(--el-bg-color)" },
      menuItemCss: {
        labelColor: "var(--el-text-color)",
        hoverLabelColor: "var(--el-color-primary)",
        hoverTipsColor: "var(--el-color-primary)"
      },
      ...menuOptions
    }).show(x, y);
  }

  function onSizeChange(val) {
    console.log("onSizeChange", val);
  }

  function onCurrentChange(val) {
    loadingConfig.text = `正在加载第${val}页...`;
    loading.value = true;
    delay(600).then(() => {
      loading.value = false;
    });
  }

  async function fetchData() {
    loading.value = true;
    try {
      const response = await axios.get(
        import.meta.env.VITE_APP_SERVER + "/api/file_templates"
      );
      dataList.value = response.data.map((item, index) => ({
        ...item,
        id: item.id || index,
        attachment_files: getFilesLabel(item.attachment_files)
      }));
      pagination.total = dataList.value.length;
    } catch (error) {
      console.error("数据获取失败:", error);
    } finally {
      loading.value = false;
    }
  }

  const selectData = async () => {
    loading.value = true;
    try {
      const response = await axios.get(
        import.meta.env.VITE_APP_SERVER + "/api/file_templates"
      );
      dataList.value = clone(response.data, true)
        .filter(item => {
          if (!searchQuery.value) return true;
          if (searchField.value === "attachment_files") {
            return item.attachment_files === searchQuery.value;
          }
          return (item[searchField.value] || "")
            .toString()
            .includes(searchQuery.value);
        })
        .map(item => ({
          ...item,
          attachment_files: getFilesLabel(item.attachment_files)
        }));
      pagination.total = dataList.value.length;
    } catch (error) {
      console.error("搜索失败:", error);
    } finally {
      loading.value = false;
    }
  };

  watch([searchField, searchQuery], selectData, { deep: true });

  onMounted(async () => {
    await fetchData();
    if (searchField.value && searchQuery.value) {
      await selectData();
    }
  });

  return {
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
    editDialogVisible,
    editRowData,
    deleteId,
    deleteDialogVisible,
    fetchData
  };
}
