import type {
  LoadingConfig,
  AdaptiveConfig,
  PaginationProps
} from "@pureadmin/table";
import { ref, onMounted, reactive, watch } from "vue";
import { delay, clone } from "@pureadmin/utils";
import axios from "axios";
import { message } from "@/utils/message";
import { CustomMouseMenu } from "@howdyjs/mouse-menu";
import dayjs from "dayjs";
import {
  FilesTypeOptions,
  OnsiteTypeOptions
} from "@/views/onsite/onsite_management/data";
import { FundsTypeOptions } from "@/views/table/edit4/data";

export function useColumns() {
  const dataList = ref([]);
  const loading = ref(true);
  const searchField = ref("personnel_id");
  const searchQuery = ref("");
  const editRowData = ref(null);
  const deleteOnsiteId = ref(null);
  const editDialogVisible = ref(false);
  const deleteDialogVisible = ref(false);

  // 获取驻场人员类型的 label
  const getOnsiteTypeLabel = value => {
    const TypeOption = OnsiteTypeOptions.find(opt => opt.value === value);
    return TypeOption ? TypeOption.label : "未知";
  };

  const columns: TableColumnList = [
    { label: "驻场人员ID", prop: "personnel_id" },
    { label: "姓名", prop: "name" },
    { label: "公司", prop: "company" },
    { label: "类型", prop: "type" },
    { label: "联系方式", prop: "contact_info" },
    { label: "驻场项目", prop: "onSite_project" },
    { label: "实施项目业务", prop: "onSite_work" },
    { label: "办公室位置", prop: "location" },
    {
      label: "驻场时间",
      prop: "onSite_time",
      formatter: row => row.onSite_time
    },
    { label: "备注", prop: "remarks" },
    {
      label: "相关函件",
      prop: "related_files",
      formatter: row =>
        row.related_files === 0 || row.related_files === "0"
          ? FilesTypeOptions.find(option => option.value === "0")?.label ||
            "无附件"
          : row.related_files
    },
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
        import.meta.env.VITE_APP_SERVER + "/api/onsite"
      );
      dataList.value = response.data.map((item, index) => ({
        ...item,
        id: item.personnel_id || index,
        type: getOnsiteTypeLabel(item.type) // 这里转换 value 为 label
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
        import.meta.env.VITE_APP_SERVER + "/api/onsite"
      );

      dataList.value = clone(response.data, true)
        .filter(item => {
          if (searchField.value === "type") {
            return getOnsiteTypeLabel(item.type).includes(searchQuery.value);
          }
          return (item[searchField.value] || "")
            .toString()
            .includes(searchQuery.value);
        })
        .map(item => ({
          ...item,
          type: getOnsiteTypeLabel(item.type)
        }));

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
    deleteOnsiteId,
    deleteDialogVisible,
    fetchData
  };
}
