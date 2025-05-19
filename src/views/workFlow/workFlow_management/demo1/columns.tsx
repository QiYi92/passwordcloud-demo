import type {
  LoadingConfig,
  AdaptiveConfig,
  PaginationProps
} from "@pureadmin/table";
import { ref, onMounted, reactive, watch } from "vue";
import { delay, clone } from "@pureadmin/utils";
import axios from "axios";
import { CustomMouseMenu } from "@howdyjs/mouse-menu";
import {
  FlowTypeOptions,
  FlowStatusOptions
} from "@/views/workFlow/workFlow_management/data";

export function useColumns() {
  /* -------------------------------- 反应式状态 ------------------------------- */
  const dataList = ref<any[]>([]);
  const loading = ref(true);

  /* ------- 搜索 ------- */
  const searchField = ref<"name" | "type" | "status" | "remark" | "owner">(
    "name"
  );
  const searchQuery = ref("");

  /* ------- 弹窗控制（右键菜单）------- */
  const editRowData = ref<any>(null);
  const deleteWorkflowId = ref<number | null>(null);
  const editDialogVisible = ref(false);
  const deleteDialogVisible = ref(false);

  /* -------------------------------- 列定义 ---------------------------------- */
  const getFlowTypeLabel = (v: string) =>
    FlowTypeOptions.find(o => o.value === v)?.label ?? "未知";

  const getFlowStatusLabel = (v: string) =>
    FlowStatusOptions.find(o => o.value === v)?.label ?? "未知";

  const columns: TableColumnList = [
    { label: "流程名称", prop: "name", width: 200 },
    {
      label: "流程类型",
      prop: "type",
      width: 150,
      formatter: row => getFlowTypeLabel(row.type)
    },
    {
      label: "状态",
      prop: "status",
      width: 100,
      formatter: row => getFlowStatusLabel(row.status)
    },
    { label: "工作流程图", slot: "workflowImage", width: 220 },
    { label: "备注", prop: "remark", width: 300 },
    { label: "流程责任", prop: "owner", width: 150 },
    { label: "操作", width: 150, fixed: "right", slot: "operation" }
  ];

  /* -------------------------------- 分页 ------------------------------------ */
  const pagination = reactive<PaginationProps>({
    pageSize: 20,
    currentPage: 1,
    pageSizes: [20, 40, 60],
    total: 0,
    align: "right",
    background: true,
    small: false
  });

  /* -------------------------------- 右键菜单 ------------------------------- */
  const menuOptions = {
    menuList: [
      { label: ({ id }) => `流程ID：${id}`, disabled: true },
      {
        label: "修改",
        tips: "Edit",
        fn: row => {
          editRowData.value = row;
          editDialogVisible.value = true;
        }
      },
      {
        label: "删除",
        tips: "Delete",
        fn: row => {
          deleteWorkflowId.value = row.id;
          deleteDialogVisible.value = true;
        }
      }
    ]
  };
  function showMouseMenu(row, _col, event) {
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

  /* -------------------------------- 加载动画 ------------------------------- */
  const loadingConfig: LoadingConfig = reactive({
    text: "正在加载第一页...",
    viewBox: "-10, -10, 50, 50",
    spinner: `
      <path class="path"
        d="M 30 15 L 28 17 M 25.61 25.61
           A 15 15 0 0 1 15 30
           A 15 15 0 1 1 27.99 7.5
           L 15 15"
        style="stroke-width:4px;fill:none"/>
    `
  });
  const adaptiveConfig: AdaptiveConfig = { offsetBottom: 110 };

  function onSizeChange() {
    loadingConfig.text = `正在加载第${pagination.currentPage}页...`;
  }
  function onCurrentChange(val: number) {
    loadingConfig.text = `正在加载第${val}页...`;
    loading.value = true;
    delay(600).then(() => (loading.value = false));
  }

  /* -------------------------------- 数据请求 ------------------------------- */
  async function fetchData() {
    loading.value = true;
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_APP_SERVER}/api/workflows`
      );
      dataList.value = data.map((it, idx) => ({ ...it, id: it.id ?? idx }));
      pagination.total = dataList.value.length;
    } catch (e) {
      console.error("获取流程数据失败:", e);
    } finally {
      loading.value = false;
    }
  }

  /* ---- 搜索筛选 ---- */
  const selectData = async () => {
    loading.value = true;
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_APP_SERVER}/api/workflows`
      );
      dataList.value = clone(data, true)
        .filter(item => {
          if (!searchQuery.value) return true;
          if (searchField.value === "type")
            return item.type === searchQuery.value;
          if (searchField.value === "status")
            return item.status === searchQuery.value;
          return (item[searchField.value] ?? "")
            .toString()
            .includes(searchQuery.value);
        })
        .map(it => ({ ...it }));
      pagination.total = dataList.value.length;
    } catch (e) {
      console.error("搜索流程失败:", e);
    } finally {
      loading.value = false;
    }
  };

  watch([searchField, searchQuery], selectData, { deep: true });

  onMounted(async () => {
    await fetchData();
    if (searchQuery.value) await selectData();
  });

  /* -------------------------------- return ------------------------------- */
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
    deleteDialogVisible,
    deleteWorkflowId,
    fetchData
  };
}
