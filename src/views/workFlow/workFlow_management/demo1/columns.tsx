import type {
  LoadingConfig,
  AdaptiveConfig,
  PaginationProps
} from "@pureadmin/table";
import { ref, onMounted, reactive, watch, type Ref, type UnwrapRef } from "vue";

import { delay, clone } from "@pureadmin/utils";
import axios from "axios";
import { message } from "@/utils/message";
import { CustomMouseMenu } from "@howdyjs/mouse-menu";
import {
  FlowTypeOptions,
  FlowStatusOptions
} from "@/views/workFlow/workFlow_management/data";
import dayjs from "dayjs";

export function useColumns() {
  const dataList = ref([]);
  const loading = ref(true);
  const searchField = ref("name");
  const searchQuery = ref("");
  const editRowData = ref(null);
  const deleteWorkflowId = ref(null);
  const editDialogVisible = ref(false);
  const deleteDialogVisible = ref(false);

  const getFlowTypeLabel = value => {
    const option = FlowTypeOptions.find(opt => opt.value === value);
    return option ? option.label : "未知";
  };

  const getFlowStatusLabel = value => {
    const option = FlowStatusOptions.find(opt => opt.value === value);
    return option ? option.label : "未知";
  };

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
      width: 150,
      formatter: row => getFlowStatusLabel(row.status)
    },
    { label: "备注", prop: "remark", width: 300 },
    { label: "流程责任", prop: "owner", width: 150 },
    { label: "操作", width: 150, fixed: "right", slot: "operation" }
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
        label: ({ id }) => `流程ID为：${id}`,
        disabled: true
      },
      {
        label: "修改",
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
          deleteWorkflowId.value = row.id;
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
    loadingConfig.text = `正在加载第${pagination.currentPage}页...`;
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
        import.meta.env.VITE_APP_SERVER + "/api/workflows"
      );
      dataList.value = response.data.map((item, index) => ({
        ...item,
        id: item.id || index
      }));
      pagination.total = dataList.value.length;
    } catch (error) {
      console.error("获取流程数据失败:", error);
    } finally {
      loading.value = false;
    }
  }

  const selectData = async () => {
    loading.value = true;
    try {
      const response = await axios.get(
        import.meta.env.VITE_APP_SERVER + "/api/workflows"
      );

      dataList.value = clone(response.data, true)
        .filter(item => {
          if (!searchQuery.value) return true;

          if (searchField.value === "type") {
            return item.type === searchQuery.value;
          }
          if (searchField.value === "status") {
            return item.status === searchQuery.value;
          }
          return (item[searchField.value] || "")
            .toString()
            .includes(searchQuery.value);
        })
        .map(item => ({
          ...item
        }));

      pagination.total = dataList.value.length;
    } catch (error) {
      console.error("搜索流程失败:", error);
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
    deleteWorkflowId,
    deleteDialogVisible,
    fetchData
  };
}
