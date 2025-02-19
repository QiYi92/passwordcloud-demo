import type {
  LoadingConfig,
  AdaptiveConfig,
  PaginationProps
} from "@pureadmin/table";
import { ref, onMounted, reactive, watch, computed } from "vue";
import axios from "axios";
import { delay, clone } from "@pureadmin/utils";
import { message } from "@/utils/message";
import { CustomMouseMenu } from "@howdyjs/mouse-menu";
import { LargeScaleOptions } from "@/views/enterprise/enterprise_management/data";
import provincesJson from "@/views/enterprise/enterprise_management/provinces.json";
import citiesJson from "@/views/enterprise/enterprise_management/cities.json";

export function useColumns() {
  const dataList = ref([]);
  const loading = ref(true);
  const searchField = ref("enterprise_name");
  const searchQuery = ref("");
  const editRowData = ref(null);
  const deleteEnterpriseId = ref(null);
  const editDialogVisible = ref(false);
  const deleteDialogVisible = ref(false);

  // 获取是否上规的label

  const getLargeScaleLabel = value => {
    const region = LargeScaleOptions.find(item => item.value === value);
    return region ? region.label : "未知";
  };

  /** 获取省份名称 */
  function getProvinceName(provinceCode) {
    const province = provincesJson.find(item => item.code === provinceCode);
    return province ? province.name : provinceCode; // 返回省份名称，找不到时返回原始值
  }

  /** 获取地市名称 */
  function getCityName(cityCode) {
    const city = citiesJson.find(item => item.code === cityCode);
    return city ? city.name : cityCode; // 返回地市名称，找不到时返回原始值
  }

  const columns: TableColumnList = [
    // { label: "企业ID", prop: "enterprise_id", width: 100 },
    { label: "企业名称", prop: "enterprise_name" },
    { label: "联系人", prop: "contact_person", width: 150 },
    { label: "是否上规", prop: "is_large_scale", width: 100 },
    { label: "省份", prop: "province", width: 120 },
    { label: "地市", prop: "city", width: 120 },
    { label: "备注", prop: "remarks", width: 200 },
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

  /** 右键菜单配置 */
  const menuOptions = {
    menuList: [
      {
        label: ({ enterprise_id }) => `企业ID为：${enterprise_id}`,
        disabled: true
      },
      {
        label: "修改",
        fn: async row => {
          editRowData.value = row;
          editDialogVisible.value = true;
        }
      },
      {
        label: "删除",
        fn: row => {
          deleteEnterpriseId.value = row.enterprise_id;
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

  /** 自适应配置 */
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
        import.meta.env.VITE_APP_SERVER + "/api/enterprise"
      );
      dataList.value = response.data.map((item, index) => ({
        ...item,
        id: item.enterprise_id || index,
        province: getProvinceName(item.province), // 获取省份名称
        city: getCityName(item.city), // 获取地市名称
        is_large_scale: getLargeScaleLabel(item.is_large_scale) // 调用转换函数
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
        import.meta.env.VITE_APP_SERVER + "/api/enterprise"
      );

      dataList.value = clone(response.data, true)
        .filter(item => {
          if (searchQuery.value === "") return true;

          if (searchField.value === "is_large_scale") {
            return item.is_large_scale === searchQuery.value;
          }
          return (item[searchField.value] || "")
            .toString()
            .includes(searchQuery.value);
        })
        .map(item => ({
          ...item,
          is_large_scale: getLargeScaleLabel(item.is_large_scale)
        }));

      pagination.total = dataList.value.length;
    } catch (error) {
      console.error("搜索数据失败:", error);
    } finally {
      loading.value = false;
    }
  };

  // 监听搜索字段和查询字符串的变化
  watch([searchField, searchQuery], selectData);

  // 监听 searchField，当切换回可输入字段时清空 searchQuery
  watch(searchField, newField => {
    if (newField !== "is_large_scale") {
      searchQuery.value = ""; // 清空之前的搜索内容
    }
  });

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
    deleteEnterpriseId,
    deleteDialogVisible,
    fetchData
  };
}
