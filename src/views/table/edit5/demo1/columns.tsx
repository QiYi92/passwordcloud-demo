import type {
  LoadingConfig,
  AdaptiveConfig,
  PaginationProps
} from "@pureadmin/table";
import { ref, onMounted, reactive, watch } from "vue";

import { delay, clone } from "@pureadmin/utils";
import axios from "axios";
import { message } from "@/utils/message"; // 适当调整路径
import { CustomMouseMenu } from "@howdyjs/mouse-menu";
import dayjs from "dayjs";
import { FilesTypeOptions } from "@/views/table/edit5/data"; // 引入 FilesTypeOptions

// 获取 prompt_files 的 label
const getFilesLabel = value => {
  const option = FilesTypeOptions.find(opt => opt.value === value);
  return option ? option.label : "无附件";
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

export function useColumns() {
  const dataList = ref([]);
  const loading = ref(true);
  const searchField = ref("prompt_id");
  const searchQuery = ref("");
  const editRowData = ref(null);
  const deletePromptId = ref(null);
  const editDialogVisible = ref(false);
  const deleteDialogVisible = ref(false);

  const columns: TableColumnList = [
    { label: "催款项ID", prop: "prompt_id" },
    { label: "催款项名称", prop: "prompt_name" },
    { label: "对应项目", width: "200", prop: "project_name" },
    { label: "对应合同", prop: "contract_name" },
    {
      label: "催款金额（万元）",
      width: "150",
      prop: "prompt_money",
      formatter: row => formatToTenThousand(row.prompt_money)
    },
    {
      label: "登记时间",
      prop: "prompt_time",
      formatter: row => dayjs(row.prompt_time).format("YYYY年MM月DD日")
    },
    { label: "备注", prop: "prompt_remark" },
    { label: "处理情况记录", prop: "prompt_record" },
    { label: "催款函件", prop: "prompt_files" },
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
        label: ({ prompt_id }) => `项目ID为：${prompt_id}`,
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
          deletePromptId.value = row.prompt_id;
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
        import.meta.env.VITE_APP_SERVER + "/api/prompts"
      );
      dataList.value = response.data.map((item, index) => ({
        ...item,
        id: item.prompt_id || index,
        prompt_files: getFilesLabel(item.prompt_files) // 转换 value 为 label
      }));
      pagination.total = dataList.value.length;
    } catch (error) {
      console.error("获取数据时发生错误:", error);
    } finally {
      loading.value = false;
    }
  }

  /** 搜索数据的函数，仅对 label 搜索进行精确匹配（下拉项），其他字段使用模糊匹配 */
  const selectData = async () => {
    loading.value = true;
    try {
      const response = await axios.get(
        import.meta.env.VITE_APP_SERVER + "/api/prompts"
      );
      dataList.value = clone(response.data, true)
        .filter(item => {
          // 若搜索内容为空，则不过滤
          if (!searchQuery.value) return true;
          if (searchField.value === "prompt_files") {
            return item.prompt_files === searchQuery.value;
          }
          return (item[searchField.value] || "")
            .toString()
            .includes(searchQuery.value);
        })
        .map(item => ({
          ...item,
          prompt_files: getFilesLabel(item.prompt_files)
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
    deletePromptId,
    deleteDialogVisible,
    fetchData
  };
}
