import type {
  LoadingConfig,
  AdaptiveConfig,
  PaginationProps
} from "@pureadmin/table";
import { ref, onMounted, reactive, watch } from "vue";
import axios from "axios";
import { message } from "@/utils/message"; // 适当调整路径
import dayjs from "dayjs";
import { delay } from "@pureadmin/utils"; // 添加时间格式化
import { RegionOptions } from "@/views/energy/energy_management/data"; // 引入区域选项

export function useColumns() {
  const dataList = ref([]);
  const loading = ref(true);
  const searchField = ref("energy_id");
  const searchQuery = ref("");
  const editRowData = ref(null);
  const deleteEnergyId = ref(null);
  const editDialogVisible = ref(false);
  const deleteDialogVisible = ref(false);

  // 区域值格式化函数
  const formatRegion = (value: string) => {
    const region = RegionOptions.find(item => item.value === value);
    return region ? region.label : "未知";
  };

  const columns: TableColumnList = [
    {
      label: "记录ID",
      prop: "energy_id",
      width: 100
    },
    {
      label: "日期",
      prop: "date",
      width: 150,
      formatter: row => dayjs(row.date).format("YYYY年MM月")
    },
    {
      label: "区域",
      prop: "region",
      width: 150,
      formatter: row => formatRegion(row.region) // 显示对应的中文名称
    },
    {
      label: "耗电量（度）",
      prop: "electricity_consumption",
      width: 150
    },
    {
      label: "操作",
      width: "150",
      fixed: "right",
      slot: "operation"
    }
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
  const adaptiveConfig: AdaptiveConfig = {
    offsetBottom: 110
  };

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

  // 获取数据
  async function fetchData() {
    console.log("开始获取能耗数据...");
    loading.value = true;
    try {
      const response = await axios.get(
        import.meta.env.VITE_APP_SERVER + "/api/energy"
      );
      console.log("数据成功获取:", response.data);
      dataList.value = response.data.map((item, index) => ({
        ...item,
        id: item.energy_id || index // 使用 energy_id 或索引作为唯一ID
      }));
      pagination.total = dataList.value.length;
    } catch (error) {
      console.error("获取能耗数据时发生错误:", error);
    } finally {
      loading.value = false;
      console.log("能耗数据获取完成。");
    }
  }

  // 搜索数据
  const selectData = async () => {
    loading.value = true;
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_APP_SERVER}/api/energy`
      );
      dataList.value = response.data.filter(item =>
        (item[searchField.value] || "")
          .toString()
          .toLowerCase()
          .includes(searchQuery.value.toLowerCase())
      );
      pagination.total = dataList.value.length;
    } catch (error) {
      console.error("搜索数据时发生错误:", error);
    } finally {
      loading.value = false;
    }
  };

  // 监听搜索字段和查询字符串的变化
  watch([searchField, searchQuery], selectData, { deep: true });

  // 组件挂载时加载数据
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
    editDialogVisible,
    editRowData,
    onSizeChange,
    onCurrentChange,
    deleteEnergyId,
    deleteDialogVisible,
    fetchData
  };
}
