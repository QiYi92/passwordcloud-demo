import type {
  LoadingConfig,
  AdaptiveConfig,
  PaginationProps
} from "@pureadmin/table";
import { ref, onMounted, reactive, watch } from "vue";

import { delay, clone } from "@pureadmin/utils";
import axios from "axios";
import { FundsTypeOptions } from "@/views/table/edit4/data"; // 确保路径正确

import { message } from "@/utils/message"; // 适当调整路径
import { CustomMouseMenu } from "@howdyjs/mouse-menu"; // 添加新依赖
import dayjs from "dayjs";

export function useColumns() {
  const dataList = ref([]);
  const loading = ref(true);
  const searchField = ref("pass_id");
  const searchQuery = ref("");
  const editRowData = ref(null);
  const deletePassId = ref(null);
  const editDialogVisible = ref(false);
  const deleteDialogVisible = ref(false);

  // 获取资金类型的 label
  const getFundsTypeLabel = value => {
    const option = FundsTypeOptions.find(opt => opt.value === value);
    return option ? option.label : "未知";
  };

  const columns: TableColumnList = [
    { label: "资金下达ID", prop: "pass_id" },
    { label: "项目名称", prop: "project_name" },
    { label: "资金类型", prop: "money_type" },
    {
      label: "下达时间",
      prop: "pass_time",
      formatter: row => dayjs(row.pass_time).format("YYYY年MM月DD日")
    },
    { label: "备注", prop: "pass_remark" },
    { label: "操作", width: "150", fixed: "right", slot: "operation" }
  ];

  /** 分页配置 */
  const pagination = reactive<PaginationProps>({
    pageSize: 20,
    currentPage: 1,
    pageSizes: [20, 40, 60],
    total: 0,
    align: "right",
    background: true,
    small: false
  });

  /** 右键编辑菜单配置 */
  const menuOptions = {
    menuList: [
      {
        label: ({ pass_id }) => `资金下达ID：${pass_id}`,
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
          deletePassId.value = row.pass_id;
          deleteDialogVisible.value = true;
        }
      }
    ]
  };

  /** 加载动画配置 */
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

  /** 撑满内容区自适应高度相关配置 */
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

  /** 获取数据并转换 `value` 为 `label` */
  async function fetchData() {
    loading.value = true;
    try {
      const response = await axios.get(
        import.meta.env.VITE_APP_SERVER + "/api/passes"
      );
      dataList.value = response.data.map((item, index) => ({
        ...item,
        id: item.pass_id || index,
        money_type: getFundsTypeLabel(item.money_type) // 这里转换 value 为 label
      }));
      pagination.total = dataList.value.length;
    } catch (error) {
      console.error("获取数据时发生错误:", error);
    } finally {
      loading.value = false;
    }
  }

  /** 仅支持 label 搜索 */
  const selectData = async () => {
    loading.value = true;
    try {
      const response = await axios.get(
        import.meta.env.VITE_APP_SERVER + "/api/passes"
      );

      dataList.value = clone(response.data, true)
        .filter(item => {
          if (searchField.value === "money_type") {
            return getFundsTypeLabel(item.money_type).includes(
              searchQuery.value
            );
          }
          return (item[searchField.value] || "")
            .toString()
            .includes(searchQuery.value);
        })
        .map(item => ({
          ...item,
          money_type: getFundsTypeLabel(item.money_type)
        }));

      pagination.total = dataList.value.length;
    } catch (error) {
      console.error("搜索数据失败:", error);
    } finally {
      loading.value = false;
    }
  };

  // 监听搜索字段和查询字符串的变化
  watch([searchField, searchQuery], selectData, { deep: true });

  // 组件挂载时执行
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
    deletePassId,
    deleteDialogVisible,
    fetchData
  };
}
