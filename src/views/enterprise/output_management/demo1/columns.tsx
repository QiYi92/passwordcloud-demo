import type {
  LoadingConfig,
  AdaptiveConfig,
  PaginationProps
} from "@pureadmin/table";
import { ref, onMounted, reactive, watch } from "vue";
import axios from "axios";
import { message } from "@/utils/message"; // 适当调整路径
import { CustomMouseMenu } from "@howdyjs/mouse-menu";
import dayjs from "dayjs";
import { delay } from "@pureadmin/utils"; // 添加新依赖

export function useColumns() {
  const dataList = ref([]);
  const loading = ref(true);
  const searchField = ref("enterprise_name");
  const searchQuery = ref("");
  const editRowData = ref(null);
  const deleteRecordId = ref(null);
  const previewData = ref(null);
  const editDialogVisible = ref(false);
  const deleteDialogVisible = ref(false);
  const showDialogVisible = ref(false);

  // 格式化产值字段，精确到万元
  function formatToTenThousand(value: any): string {
    const num = parseFloat(value);
    if (isNaN(num)) return "未知";
    const tenThousandValue = num / 10000;
    return Number.isInteger(tenThousandValue)
      ? `${tenThousandValue}万元`
      : `${tenThousandValue.toFixed(6).replace(/\.?0+$/, "")}万元`;
  }

  const columns: TableColumnList = [
    { label: "企业名称", prop: "enterprise_name" },
    {
      label: "年度",
      width: "150",
      prop: "year",
      formatter: row => dayjs(row.year).format("YYYY年")
    },
    {
      label: "产值（万元）",
      width: "150",
      prop: "output_value",
      formatter: row => formatToTenThousand(row.output_value)
    },
    { label: "备注", width: "200", prop: "remarks" },
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
        label: ({ record_id }) => `记录ID为：${record_id}`,
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
          deleteRecordId.value = row.record_id;
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

  /** 获取数据并转换 output_value 字段 */
  async function fetchData() {
    loading.value = true;
    try {
      const response = await axios.get(
        import.meta.env.VITE_APP_SERVER + "/api/output-record"
      );
      dataList.value = response.data.map((item, index) => ({
        ...item,
        id: item.record_id || index
      }));
      pagination.total = dataList.value.length;
    } catch (error) {
      console.error("获取数据时发生错误:", error);
    } finally {
      loading.value = false;
    }
  }

  /** 搜索数据函数 */
  const selectData = async () => {
    loading.value = true;
    try {
      const response = await axios.get(
        import.meta.env.VITE_APP_SERVER + "/api/output-record"
      );
      dataList.value = response.data.filter(item => {
        if (!searchQuery.value) return true;

        // 使用 dayjs 获取年份并进行匹配
        const year = dayjs(item.year).year();
        return year.toString().includes(searchQuery.value); // 将年份转换为字符串进行匹配
      });
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
    previewData,
    deleteRecordId,
    deleteDialogVisible,
    showDialogVisible,
    fetchData
  };
}
