import type {
  LoadingConfig,
  AdaptiveConfig,
  PaginationProps
} from "@pureadmin/table";
import { ref, onMounted, reactive, watch, type Ref, type UnwrapRef } from "vue";

import { delay, clone } from "@pureadmin/utils";
import axios from "axios";
import { message } from "@/utils/message"; // 调整路径
import { CustomMouseMenu } from "@howdyjs/mouse-menu";
import dayjs from "dayjs";
import {
  ProjectRoomOptions,
  ProjectStatusOptions
} from "@/views/workPlan/workPlan_management/data"; // 责任科室选项

export function useColumns(departmentMap: Ref<UnwrapRef<{}>>) {
  const dataList = ref([]);
  const loading = ref(true);
  const searchField = ref("plan_id");
  const searchQuery = ref("");
  const editRowData = ref(null);
  const deletePlanId = ref(null);
  const editDialogVisible = ref(false);
  const deleteDialogVisible = ref(false);

  // 获取责任科室的 label
  const getProjectRoomLabel = value => {
    const option = ProjectRoomOptions.find(opt => opt.value === value);
    return option ? option.label : "未知";
  };

  // 获取当前状态的 label
  const getProjectStatusLabel = value => {
    const option = ProjectStatusOptions.find(opt => opt.value === value);
    return option ? option.label : "未知";
  };

  const columns: TableColumnList = [
    { label: "计划ID", prop: "plan_id", width: 70 },
    { label: "计划名称", prop: "plan_name", width: 200 },
    { label: "责任科室", prop: "responsible_department", width: 150 },
    { label: "计划目标", prop: "plan_goal", width: 300, align: "left" },
    {
      label: "开始时间",
      prop: "start_month",
      width: 150,
      formatter: row => dayjs(row.start_month).format("YYYY年MM月")
    },
    {
      label: "结束时间",
      prop: "end_month",
      width: 150,
      formatter: row => dayjs(row.end_month).format("YYYY年MM月")
    },
    { label: "当前状态", prop: "current_status", width: 150 },
    { label: "备注", prop: "remark", width: 300 },
    { label: "更新人员", prop: "update_user", width: 120 },
    { label: "操作", width: 150, fixed: "right", slot: "operation" }
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
        label: ({ plan_id }) => `计划ID为：${plan_id}`,
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
          deletePlanId.value = row.plan_id;
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
        import.meta.env.VITE_APP_SERVER + "/api/work-plans"
      );
      dataList.value = response.data.map((item, index) => ({
        ...item,
        id: item.plan_id || index,
        responsible_department: getProjectRoomLabel(
          item.responsible_department
        ),
        current_status: getProjectStatusLabel(item.current_status)
      }));
      pagination.total = dataList.value.length;
    } catch (error) {
      console.error("获取数据时发生错误:", error);
    } finally {
      loading.value = false;
    }
  }

  /** 搜索数据的函数，仅对下拉项进行精确匹配，其余字段使用模糊匹配 */
  const selectData = async () => {
    loading.value = true;
    try {
      const response = await axios.get(
        import.meta.env.VITE_APP_SERVER + "/api/work-plans"
      );

      dataList.value = clone(response.data, true)
        .filter(item => {
          // 如果搜索内容为空，则不过滤
          if (!searchQuery.value) return true;

          if (searchField.value === "responsible_department") {
            // 采用精确匹配：比较原始值
            return item.responsible_department === searchQuery.value;
          }
          if (searchField.value === "current_status") {
            return item.current_status === searchQuery.value;
          }
          return (item[searchField.value] || "")
            .toString()
            .includes(searchQuery.value);
        })
        .map(item => ({
          ...item,
          responsible_department: getProjectRoomLabel(
            item.responsible_department
          ),
          current_status: getProjectStatusLabel(item.current_status)
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
    deletePlanId,
    deleteDialogVisible,
    fetchData
  };
}
