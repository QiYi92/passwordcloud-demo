// log/loginStats/columns.tsx
import { ref, onMounted, reactive, watch } from "vue";
import type {
  PaginationProps,
  LoadingConfig,
  AdaptiveConfig
} from "@pureadmin/table";
import axios from "axios";
import dayjs from "dayjs";

export function useColumns() {
  const dataList = ref([]);
  const loading = ref(true);
  const searchField = ref("username");
  const searchQuery = ref("");

  const columns: TableColumnList = [
    { label: "用户ID", prop: "id", width: 60 },
    { label: "用户名", prop: "username", width: 120 },
    { label: "真实姓名", prop: "real_name", width: 120 },
    { label: "登录次数", prop: "login_count", width: 100 },
    {
      label: "最后登录时间",
      prop: "last_login",
      width: 180,
      formatter: row =>
        row.last_login
          ? dayjs(row.last_login).format("YYYY-MM-DD HH:mm:ss")
          : "未登录"
    },
    { label: "登录IP", prop: "login_ip" }
  ];

  const pagination = reactive<PaginationProps>({
    pageSize: 20,
    currentPage: 1,
    pageSizes: [20, 40, 60],
    total: 0,
    align: "right",
    background: true
  });

  const loadingConfig = reactive<LoadingConfig>({
    text: "正在加载登录统计数据...",
    viewBox: "-10, -10, 50, 50",
    spinner: `
      <path class="path" d="
        M30 15 L28 17
        M25.61 25.61 A15 15, 0,0,1,15 30
        A15 15, 0,1,1,27.99 7.5 L15 15
      " style="stroke-width:4px; fill: rgba(0, 0, 0, 0)"/>
    `
  });

  const adaptiveConfig: AdaptiveConfig = { offsetBottom: 110 };

  async function fetchData() {
    loading.value = true;
    try {
      const res = await axios.get(
        import.meta.env.VITE_APP_SERVER + "/api/login/stats"
      );
      dataList.value = res.data.data || [];
      pagination.total = dataList.value.length;
    } catch (error) {
      console.error("获取登录统计失败:", error);
    } finally {
      loading.value = false;
    }
  }

  const selectData = async () => {
    loading.value = true;
    try {
      const res = await axios.get(
        import.meta.env.VITE_APP_SERVER + "/api/login/stats"
      );
      dataList.value = (res.data.data || []).filter(item => {
        return (
          !searchQuery.value ||
          (item[searchField.value] || "").toString().includes(searchQuery.value)
        );
      });
      pagination.total = dataList.value.length;
    } catch (error) {
      console.error("搜索失败:", error);
    } finally {
      loading.value = false;
    }
  };

  watch([searchField, searchQuery], selectData, { deep: true });

  onMounted(fetchData);

  return {
    loading,
    columns,
    dataList,
    pagination,
    loadingConfig,
    adaptiveConfig,
    searchField,
    searchQuery,
    fetchData
  };
}
