import type {
  LoadingConfig,
  AdaptiveConfig,
  PaginationProps
} from "@pureadmin/table";
import { ref, onMounted, reactive, watch } from "vue";
import { delay, clone } from "@pureadmin/utils";
import axios from "axios";
import { message } from "@/utils/message"; // 适当调整路径
import { CustomMouseMenu } from "@howdyjs/mouse-menu"; // 添加新依赖
import dayjs from "dayjs";
import {
  FilesTypeOptions,
  OnsiteTypeOptions
} from "@/views/onsite/onsite_management/data";

export function useColumns() {
  const dataList = ref([]);
  const loading = ref(true);
  const searchField = ref("personnel_id");
  const searchQuery = ref("");
  const editRowData = ref(null);
  const deleteOnsiteId = ref(null);
  const editDialogVisible = ref(false);
  const deleteDialogVisible = ref(false);

  // 创建一个帮助函数来将【资金类型】的值转换为对应的标签
  const getOnsiteTypeLabel = value => {
    const TypeOption = OnsiteTypeOptions.find(opt => opt.value === value);
    return TypeOption ? TypeOption.label : "未知"; // 如果找不到对应的选项，返回"未知"
  };

  const columns: TableColumnList = [
    {
      label: "驻场人员ID",
      prop: "personnel_id"
    },
    {
      label: "姓名",
      prop: "name"
    },
    {
      label: "公司",
      prop: "company"
    },
    {
      label: "类型",
      prop: "type",
      formatter: row => getOnsiteTypeLabel(row.type)
    },
    {
      label: "联系方式",
      prop: "contact_info"
    },
    {
      label: "驻场项目",
      prop: "onSite_project"
    },
    {
      label: "实施项目业务",
      prop: "onSite_work"
    },
    {
      label: "办公室位置",
      prop: "location"
    },
    {
      label: "驻场时间",
      prop: "onSite_time",
      formatter: row => row.onSite_time
    },
    {
      label: "备注",
      prop: "remarks"
    },
    {
      label: "相关函件",
      prop: "related_files",
      formatter: row => {
        return row.related_files === 0 || row.related_files === "0"
          ? FilesTypeOptions.find(option => option.value === "0")?.label ||
              "无附件"
          : row.related_files;
      }
    },
    {
      label: "操作",
      width: "150",
      fixed: "right",
      slot: "operation"
    }
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
        label: ({ personnel_id }) => `人员ID为：${personnel_id}`,
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
          deleteOnsiteId.value = row.personnel_id;
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

  const adaptiveConfig: AdaptiveConfig = {
    offsetBottom: 110
  };

  function showMouseMenu(row, column, event) {
    event.preventDefault();
    const { x, y } = event;
    CustomMouseMenu({
      el: event.currentTarget,
      params: row,
      menuWrapperCss: {
        background: "var(--el-bg-color)"
      },
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
    console.log("开始获取数据...");
    loading.value = true;
    try {
      const response = await axios.get(
        import.meta.env.VITE_APP_SERVER + "/api/onsite" // 修改为 onsite 的 API 路径
      );
      console.log("数据成功获取:", response.data);
      dataList.value = response.data.map((item, index) => ({
        ...item,
        id: item.personnel_id || index // 🌟 保留原始数据，type 不进行格式化
      }));
      pagination.total = dataList.value.length;
    } catch (error) {
      console.error("获取数据时发生错误:", error);
    } finally {
      loading.value = false;
      console.log("数据获取完成。");
    }
  }

  const selectData = async () => {
    loading.value = true;
    try {
      const response = await axios.get(
        import.meta.env.VITE_APP_SERVER + "/api/onsite" // 修改为 onsite 的 API 路径
      );
      dataList.value = clone(response.data, true).filter(item =>
        (item[searchField.value] || "")
          .toString()
          .toLowerCase()
          .includes(searchQuery.value.toLowerCase())
      );
      pagination.total = dataList.value.length;
    } catch (error) {
      console.error("选择数据失败:", error);
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
    deleteOnsiteId,
    deleteDialogVisible,
    fetchData
  };
}
