import type {
  LoadingConfig,
  AdaptiveConfig,
  PaginationProps
} from "@pureadmin/table";
import { ref, onMounted, reactive, watch } from "vue";
import axios from "axios";
import { delay, clone } from "@pureadmin/utils";
import { message } from "@/utils/message";
import { CustomMouseMenu } from "@howdyjs/mouse-menu";
import {
  MeetingProgressOptions,
  MeetingTypeOptions
} from "@/views/meeting/meetingSplit_management/data";
import dayjs from "dayjs";
import { RegionOptions } from "@/views/energy/energy_management/data";

export function useColumns() {
  const dataList = ref([]);
  const loading = ref(true);
  const searchField = ref("split_id");
  const searchQuery = ref("");
  const editRowData = ref(null);
  const deleteMeetingId = ref(null);
  const editDialogVisible = ref(false);
  const deleteDialogVisible = ref(false);

  // 🌟 格式化函数：将 meeting_progress 的 value 转换为 label
  const getMeetingProgressLabel = value => {
    const MeetingProgress = MeetingProgressOptions.find(
      opt => opt.value === value
    );
    return MeetingProgress ? MeetingProgress.label : "未知进展"; // 如果找不到对应的选项，返回"未知"
  };

  // 🌟 格式化函数：将 meeting_type 的 value 转换为 label
  const getMeetingTypeLabel = value => {
    const MeetingType = MeetingTypeOptions.find(opt => opt.value === value);
    return MeetingType ? MeetingType.label : "未知类型"; // 如果找不到对应的选项，返回"未知"
  };

  const columns: TableColumnList = [
    {
      label: "拆分ID",
      prop: "split_id",
      width: 100
    },
    {
      label: "选择会议纪要清单",
      prop: "meeting_name",
      width: 150
    },
    {
      label: "类型",
      prop: "meeting_type",
      width: 120,
      formatter: row => getMeetingTypeLabel(row.meeting_type) // 🌟 添加格式化逻辑，显示类型标签
    },
    {
      label: "内容",
      prop: "meeting_content",
      width: 300,
      align: "left"
    },
    {
      label: "责任科室或人员",
      prop: "department_personnel",
      width: 150
    },
    {
      label: "完成时限",
      prop: "time_limit",
      width: 150,
      formatter: row => dayjs(row.time_limit).format("YYYY年MM月DD日")
    },
    {
      label: "当前进展",
      prop: "progress",
      width: 150,
      formatter: row => getMeetingProgressLabel(row.progress) // 🌟 添加格式化逻辑，显示进展标签
    },
    {
      label: "备注",
      prop: "remarks",
      width: 200
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

  /** 右键菜单配置 */
  const menuOptions = {
    menuList: [
      {
        label: ({ split_id }) => `拆分ID为：${split_id}`,
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
          deleteMeetingId.value = row.split_id;
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

  /** 获取数据 */
  async function fetchData() {
    console.log("开始获取数据...");
    loading.value = true;
    try {
      const response = await axios.get(
        import.meta.env.VITE_APP_SERVER + "/api/meeting-split"
      );
      dataList.value = response.data.map((item, index) => ({
        ...item,
        id: item.split_id || index
        // 🌟 不再格式化 progress 和 meeting_type，保留原始 value 值
      }));
      pagination.total = dataList.value.length;
    } catch (error) {
      console.error("获取数据时发生错误:", error);
    } finally {
      loading.value = false;
      console.log("数据获取完成。");
    }
  }

  /** 搜索功能 */
  const selectData = async () => {
    loading.value = true;
    try {
      const response = await axios.get(
        import.meta.env.VITE_APP_SERVER + "/api/meeting-split"
      );
      dataList.value = clone(response.data, true).filter(item =>
        (item[searchField.value] || "")
          .toString()
          .toLowerCase()
          .includes(searchQuery.value.toLowerCase())
      );
      pagination.total = dataList.value.length;
    } catch (error) {
      console.error("Failed to select data:", error);
    } finally {
      loading.value = false;
    }
  };

  // 监听搜索字段和查询字符串的变化
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
    deleteMeetingId,
    deleteDialogVisible,
    fetchData
  };
}
