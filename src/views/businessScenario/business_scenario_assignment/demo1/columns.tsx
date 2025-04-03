import type {
  LoadingConfig,
  AdaptiveConfig,
  PaginationProps
} from "@pureadmin/table";
import { ref, onMounted, reactive, watch, type Ref, type UnwrapRef } from "vue";
import { delay, clone } from "@pureadmin/utils";
import axios from "axios";
import dayjs from "dayjs";
import { CustomMouseMenu } from "@howdyjs/mouse-menu";
import { ProjectRoomOptions } from "@/views/businessScenario/business_scenario_assignment/data"; // 可替换为业务模块路径

export function useColumns() {
  const dataList = ref([]);
  const loading = ref(true);
  const searchField = ref("scenario_name");
  const searchQuery = ref("");
  const editRowData = ref(null);
  const deleteId = ref(null);
  const editDialogVisible = ref(false);
  const deleteDialogVisible = ref(false);

  /** 获取责任科室 label */
  const getDeptLabel = (value: string | number) => {
    const match = ProjectRoomOptions.find(opt => opt.value === String(value));
    return match ? match.label : "未知";
  };

  const columns: TableColumnList = [
    { label: "业务场景名称", prop: "scenario_name", width: 220 },
    {
      label: "责任科室",
      prop: "responsible_dept",
      width: 180
    },
    { label: "业务场景说明", prop: "scenario_description", width: 350 },
    { label: "备注", prop: "remark", width: 250 },
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
        label: ({ scenario_name }) => `场景：${scenario_name}`,
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

  /** 加载原始数据并映射科室 label */
  async function fetchData() {
    loading.value = true;
    try {
      const response = await axios.get(
        import.meta.env.VITE_APP_SERVER + "/api/business-scenario"
      );
      dataList.value = response.data.map(item => ({
        ...item,
        responsible_dept: getDeptLabel(item.responsible_dept)
      }));
      pagination.total = dataList.value.length;
    } catch (error) {
      console.error("获取业务场景数据失败:", error);
    } finally {
      loading.value = false;
    }
  }

  /** 搜索过滤，仅支持模糊匹配 */
  const selectData = async () => {
    loading.value = true;
    try {
      const response = await axios.get(
        import.meta.env.VITE_APP_SERVER + "/api/business-scenario"
      );
      const raw = clone(response.data, true);
      dataList.value = raw
        .filter(item =>
          (item[searchField.value] || "").toString().includes(searchQuery.value)
        )
        .map(item => ({
          ...item,
          responsible_dept: getDeptLabel(item.responsible_dept)
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
