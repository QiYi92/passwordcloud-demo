// log/demo1/columns.tsx
import type {
  LoadingConfig,
  AdaptiveConfig,
  PaginationProps
} from "@pureadmin/table";
import { ref, onMounted, reactive, watch } from "vue";
import { delay, clone } from "@pureadmin/utils";
import axios from "axios";
import { CustomMouseMenu } from "@howdyjs/mouse-menu";
import dayjs from "dayjs";

export function useColumns() {
  const dataList = ref([]);
  const loading = ref(true);
  const searchField = ref("user_name");
  const searchQuery = ref("");
  const deleteLogId = ref(null);
  const deleteDialogVisible = ref(false);

  // 定义日志表格的列配置
  const columns: TableColumnList = [
    { label: "日志ID", prop: "id", width: 60 },
    {
      label: "时间",
      prop: "timestamp",
      width: 200,
      formatter: row => dayjs(row.timestamp).format("YYYY-MM-DD HH:mm:ss")
    },
    { label: "用户账号", prop: "user_name", width: 100 },
    { label: "用户名", prop: "real_name", width: 100 },
    { label: "操作", prop: "action", width: 100 },
    { label: "操作表单", prop: "resource", width: 100 },
    { label: "受影响记录ID", prop: "record_id", width: 80 },
    { label: "详情", prop: "details", width: 300 },
    { label: "操作", width: 120, fixed: "right", slot: "operation" }
  ];

  // 分页配置
  const pagination = reactive<PaginationProps>({
    pageSize: 20,
    currentPage: 1,
    pageSizes: [20, 40, 60],
    total: 0,
    align: "right",
    background: true,
    small: false
  });

  // 右键菜单配置，只提供删除功能
  const menuOptions = {
    menuList: [
      {
        label: ({ id }) => `日志ID：${id}`,
        disabled: true
      },
      {
        label: "删除日志",
        tips: "Delete",
        fn: row => {
          deleteLogId.value = row.id;
          deleteDialogVisible.value = true;
        }
      }
    ]
  };

  // 加载动画配置
  const loadingConfig = reactive<LoadingConfig>({
    text: "正在加载日志...",
    viewBox: "-10, -10, 50, 50",
    spinner: `
        <path class="path" d="
          M30 15 L28 17
          M25.61 25.61 A15 15, 0,0,1,15 30
          A15 15, 0,1,1,27.99 7.5 L15 15
        " style="stroke-width:4px; fill: rgba(0, 0, 0, 0)"/>
      `
  });

  // 自适应配置
  const adaptiveConfig: AdaptiveConfig = { offsetBottom: 110 };

  // 右键菜单显示方法
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

  // 获取日志数据
  async function fetchData() {
    loading.value = true;
    try {
      const response = await axios.get(
        import.meta.env.VITE_APP_SERVER + "/api/logs"
      );
      dataList.value = response.data.map((item, index) => ({
        ...item,
        id: item.id || index,
        timestamp: dayjs(item.timestamp).format("YYYY-MM-DD HH:mm:ss") // 格式化时间
      }));
      pagination.total = dataList.value.length;
    } catch (error) {
      console.error("获取日志数据失败:", error);
    } finally {
      loading.value = false;
    }
  }

  // 搜索日志数据
  const selectData = async () => {
    loading.value = true;
    try {
      const response = await axios.get(
        import.meta.env.VITE_APP_SERVER + "/api/logs"
      );

      dataList.value = clone(response.data, true)
        .filter(item => {
          if (!searchQuery.value) return true;

          if (searchField.value === "action") {
            // 精确匹配
            return item.action === searchQuery.value;
          }

          return (item[searchField.value] || "")
            .toString()
            .includes(searchQuery.value);
        })
        .map(item => ({
          ...item,
          timestamp: dayjs(item.timestamp).format("YYYY-MM-DD HH:mm:ss") // 统一格式化时间
        }));

      pagination.total = dataList.value.length;
    } catch (error) {
      console.error("搜索日志数据失败:", error);
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
    deleteLogId,
    deleteDialogVisible,
    fetchData
  };
}
