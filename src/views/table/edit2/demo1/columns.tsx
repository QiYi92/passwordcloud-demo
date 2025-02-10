import type {
  LoadingConfig,
  AdaptiveConfig,
  PaginationProps
} from "@pureadmin/table";
import { ref, onMounted, reactive, watch } from "vue";

import { delay, clone } from "@pureadmin/utils";
import axios from "axios";
import { ContractStateOptions } from "@/views/table/edit2/data";

import { message } from "@/utils/message"; // 适当调整路径
import { CustomMouseMenu } from "@howdyjs/mouse-menu";
import dayjs from "dayjs"; // 添加新依赖

export function useColumns() {
  const dataList = ref([]);
  const loading = ref(true);
  const searchField = ref("contract_id");
  const searchQuery = ref("");
  const editRowData = ref(null);
  const deleteContractId = ref(null);
  const editDialogVisible = ref(false);
  const deleteDialogVisible = ref(false);

  // 获取 contract_type 的 label
  const getContractTypeLabel = value => {
    const option = ContractStateOptions.find(opt => opt.value === value);
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
    { label: "合同ID", prop: "contract_id" },
    { label: "合同名称", prop: "contract_name" },
    { label: "项目名称", prop: "project_name" },
    { label: "合同乙方", prop: "contract_member" },
    { label: "合同类型", prop: "contract_type" },
    {
      label: "合同金额（万元）",
      prop: "contract_money",
      formatter: row => formatToTenThousand(row.contract_money)
    },
    {
      label: "合同日期",
      prop: "contract_date",
      formatter: row => dayjs(row.contract_date).format("YYYY年MM月DD日")
    },
    { label: "合同备注", prop: "contract_remark" },
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
        label: ({ contract_id }) => `合同ID为：${contract_id}`,
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
          deleteContractId.value = row.contract_id;
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

  /** 获取数据并转换 contract_type 的值为 label */
  async function fetchData() {
    loading.value = true;
    try {
      const response = await axios.get(
        import.meta.env.VITE_APP_SERVER + "/api/contracts"
      );
      dataList.value = response.data.map((item, index) => ({
        ...item,
        id: item.contract_id || index,
        contract_type: getContractTypeLabel(item.contract_type)
      }));
      pagination.total = dataList.value.length;
    } catch (error) {
      console.error("获取数据时发生错误:", error);
    } finally {
      loading.value = false;
    }
  }

  /** 搜索数据函数：对于 contract_type 字段采用精确匹配；如果下拉选择为空则不过滤 */
  const selectData = async () => {
    loading.value = true;
    try {
      const response = await axios.get(
        import.meta.env.VITE_APP_SERVER + "/api/contracts"
      );
      dataList.value = clone(response.data, true)
        .filter(item => {
          if (!searchQuery.value) return true;
          if (searchField.value === "contract_type") {
            return item.contract_type === searchQuery.value;
          }
          return (item[searchField.value] || "")
            .toString()
            .includes(searchQuery.value);
        })
        .map(item => ({
          ...item,
          contract_type: getContractTypeLabel(item.contract_type)
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
    deleteContractId,
    deleteDialogVisible,
    fetchData
  };
}
