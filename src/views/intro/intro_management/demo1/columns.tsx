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
  IntroTypeOptions
} from "@/views/intro/intro_management/data"; // 引入选项数据

export function useColumns(departmentMap: Ref<UnwrapRef<{}>>) {
  const dataList = ref([]);
  const loading = ref(true);
  const searchField = ref("intro_id");
  const searchQuery = ref("");
  const editRowData = ref(null);
  const deleteIntroId = ref(null);
  const editDialogVisible = ref(false);
  const deleteDialogVisible = ref(false);

  // 获取责任科室的 label
  const getProjectRoomLabel = value => {
    const option = ProjectRoomOptions.find(opt => opt.value === value);
    return option ? option.label : "未知";
  };

  // 获取情况类型的 label
  const getIntroTypeLabel = value => {
    const option = IntroTypeOptions.find(opt => opt.value === value);
    return option ? option.label : "未知";
  };

  const columns: TableColumnList = [
    { label: "简介ID", prop: "intro_id", width: 70 },
    { label: "简介名称", prop: "intro_name", width: 200 },
    { label: "责任科室", prop: "intro_department", width: 150 },
    { label: "情况类型", prop: "intro_type", width: 150 },
    {
      label: "更新时间",
      prop: "update_time",
      width: 150,
      formatter: row => dayjs(row.update_time).format("YYYY年MM月DD日")
    },
    { label: "简介内容", prop: "intro_content", width: 300 },
    { label: "信息来源", prop: "info_source", width: 300 },
    { label: "更新周期", prop: "update_cycle", width: 150 },
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
        label: ({ intro_id }) => `简介ID为：${intro_id}`,
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
          deleteIntroId.value = row.intro_id;
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
        import.meta.env.VITE_APP_SERVER + "/api/intro"
      );
      dataList.value = response.data.map((item, index) => ({
        ...item,
        id: item.intro_id || index,
        intro_department: getProjectRoomLabel(item.intro_department),
        intro_type: getIntroTypeLabel(item.intro_type)
      }));
      pagination.total = dataList.value.length;
    } catch (error) {
      console.error("获取数据时发生错误:", error);
    } finally {
      loading.value = false;
    }
  }

  /** 搜索数据的函数，仅支持 label 搜索 */
  const selectData = async () => {
    loading.value = true;
    try {
      const response = await axios.get(
        import.meta.env.VITE_APP_SERVER + "/api/intro"
      );
      dataList.value = clone(response.data, true)
        .filter(item => {
          // 如果搜索内容为空，则不过滤
          if (!searchQuery.value) return true;
          // 对于责任科室和情况类型采用精确匹配
          if (searchField.value === "intro_department") {
            return item.intro_department === searchQuery.value;
          }
          if (searchField.value === "intro_type") {
            return item.intro_type === searchQuery.value;
          }
          // 其他字段使用模糊匹配
          return (item[searchField.value] || "")
            .toString()
            .includes(searchQuery.value);
        })
        .map(item => ({
          ...item,
          intro_department: getProjectRoomLabel(item.intro_department),
          intro_type: getIntroTypeLabel(item.intro_type)
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
    deleteIntroId,
    deleteDialogVisible,
    fetchData
  };
}
