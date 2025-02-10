import type {
  LoadingConfig,
  AdaptiveConfig,
  PaginationProps
} from "@pureadmin/table";
import { ref, onMounted, reactive, watch } from "vue";

import { delay, clone } from "@pureadmin/utils";
import axios from "axios";
import {
  PaymentTypeOptions,
  PaymentStateOptions
} from "@/views/table/edit3/data";

import { message } from "@/utils/message"; // 适当调整路径
import { CustomMouseMenu } from "@howdyjs/mouse-menu";
import dayjs from "dayjs"; // 添加新依赖

export function useColumns() {
  const dataList = ref([]);
  const loading = ref(true);
  const searchField = ref("pay_id");
  const searchQuery = ref("");
  const editRowData = ref(null);
  const deletePaymentId = ref(null);
  const editDialogVisible = ref(false);
  const deleteDialogVisible = ref(false);

  // 获取支付类型的 label
  const getPaymentTypeLabel = value => {
    const option = PaymentTypeOptions.find(opt => opt.value === value);
    return option ? option.label : "未知";
  };

  // 获取支付状态的 label
  const getPaymentStateLabel = value => {
    const option = PaymentStateOptions.find(opt => opt.value === value);
    return option ? option.label : "未知";
  };

  // 精确把元转化为万元
  function formatToTenThousand(value: any): string {
    const num = parseFloat(value);
    if (isNaN(num)) return "未知";
    const tenThousandValue = num / 10000;
    return Number.isInteger(tenThousandValue)
      ? `${tenThousandValue}万元`
      : `${tenThousandValue.toFixed(6).replace(/\.?0+$/, "")}万元`;
  }

  const columns: TableColumnList = [
    { label: "支付项ID", prop: "pay_id" },
    { label: "关联项目名称", width: "240", prop: "project_name" },
    { label: "关联合同名称", width: "240", prop: "contract_name" },
    { label: "支付情况", width: "150", prop: "pay_type" },
    {
      label: "支付金额（万元）",
      width: "150",
      prop: "pay_money",
      formatter: row => formatToTenThousand(row.pay_money)
    },
    {
      label: "支付时间",
      width: "150",
      prop: "pay_time",
      formatter: row => dayjs(row.pay_time).format("YYYY年MM月DD日")
    },
    { label: "支付状态", prop: "pay_state" },
    { label: "支付备注", prop: "pay_remark" },
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
        label: ({ pay_id }) => `支付项ID为：${pay_id}`,
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
          deletePaymentId.value = row.pay_id;
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
        import.meta.env.VITE_APP_SERVER + "/api/payments"
      );
      dataList.value = response.data.map((item, index) => ({
        ...item,
        id: item.pay_id || index,
        pay_type: getPaymentTypeLabel(item.pay_type), // 转换 value 为 label
        pay_state: getPaymentStateLabel(item.pay_state)
      }));
      pagination.total = dataList.value.length;
    } catch (error) {
      console.error("获取数据时发生错误:", error);
    } finally {
      loading.value = false;
    }
  }

  /** 搜索数据的函数，仅对 label 搜索进行精确匹配（下拉项），其他字段仍模糊匹配 */
  const selectData = async () => {
    loading.value = true;
    try {
      const response = await axios.get(
        import.meta.env.VITE_APP_SERVER + "/api/payments"
      );

      dataList.value = clone(response.data, true)
        .filter(item => {
          // 如果搜索内容为空，则不过滤
          if (!searchQuery.value) return true;

          // 对于支付情况和支付状态采用精确匹配
          if (searchField.value === "pay_type") {
            return item.pay_type === searchQuery.value;
          }
          if (searchField.value === "pay_state") {
            return item.pay_state === searchQuery.value;
          }
          // 其他字段使用模糊匹配
          return (item[searchField.value] || "")
            .toString()
            .includes(searchQuery.value);
        })
        .map(item => ({
          ...item,
          pay_type: getPaymentTypeLabel(item.pay_type),
          pay_state: getPaymentStateLabel(item.pay_state)
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
    deletePaymentId,
    deleteDialogVisible,
    fetchData
  };
}
