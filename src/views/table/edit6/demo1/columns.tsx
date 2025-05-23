import type {
  LoadingConfig,
  AdaptiveConfig,
  PaginationProps
} from "@pureadmin/table";
import { ref, onMounted, reactive, watch } from "vue";
import { delay, clone } from "@pureadmin/utils";
import axios from "axios";
import { message } from "@/utils/message"; // 路径根据实际调整
import { CustomMouseMenu } from "@howdyjs/mouse-menu";
import dayjs from "dayjs";

export function useColumns() {
  const dataList = ref([]);
  const loading = ref(true);
  const searchField = ref("contract_name");
  const searchQuery = ref("");
  const editRowData = ref(null);
  const deletePlanId = ref(null);
  const editDialogVisible = ref(false);
  const deleteDialogVisible = ref(false);

  function formatToTenThousand(value: any): string {
    const num = parseFloat(value);
    if (isNaN(num)) return "未知";
    const tenThousandValue = num / 10000;
    return Number.isInteger(tenThousandValue)
      ? `${tenThousandValue}万元`
      : `${tenThousandValue.toFixed(6).replace(/\.?0+$/, "")}万元`;
  }

  const columns: TableColumnList = [
    { label: "合同名称", prop: "contract_name", width: "500" },
    {
      label: "约定支付月份",
      prop: "date",
      width: "150",
      formatter: row => dayjs(row.date).format("YYYY年MM月")
    },
    {
      label: "应付金额（万元）",
      prop: "payable_amount",
      width: "150",
      formatter: row => formatToTenThousand(row.payable_amount)
    },
    { label: "支付顺序", prop: "payment_order", width: "120" },
    { label: "备注", prop: "remark" },
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
        label: ({ id }) => `计划ID为：${id}`,
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
          deletePlanId.value = row.id;
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
        import.meta.env.VITE_APP_SERVER + "/api/pay-plans"
      );
      dataList.value = response.data.map((item, index) => ({
        ...item,
        id: item.id || index
      }));
      pagination.total = dataList.value.length;
    } catch (error) {
      console.error("获取支付计划数据失败:", error);
    } finally {
      loading.value = false;
    }
  }

  const selectData = async () => {
    loading.value = true;
    try {
      const response = await axios.get(
        import.meta.env.VITE_APP_SERVER + "/api/pay-plans"
      );

      dataList.value = clone(response.data, true).filter(item => {
        if (!searchQuery.value) return true;

        // ✅ 特别处理 date 字段：格式化成 YYYY年MM月 再匹配
        if (searchField.value === "date") {
          const formatted = dayjs(item.date).format("YYYY年MM月");
          return formatted.includes(searchQuery.value);
        }

        // 其他字段模糊匹配
        return (item[searchField.value] || "")
          .toString()
          .includes(searchQuery.value);
      });

      pagination.total = dataList.value.length;
    } catch (error) {
      console.error("搜索数据失败:", error);
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
    deleteDialogVisible,
    deletePlanId,
    fetchData
  };
}
