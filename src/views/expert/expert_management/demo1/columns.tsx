import type {
  LoadingConfig,
  AdaptiveConfig,
  PaginationProps
} from "@pureadmin/table";
import { ref, onMounted, reactive, watch } from "vue";

import { delay, clone } from "@pureadmin/utils";
import axios from "axios";
import { ProjectExpertiseArea } from "@/views/expert/expert_management/data"; // 导入专业领域数据

import { message } from "@/utils/message";
import { CustomMouseMenu } from "@howdyjs/mouse-menu";
import dayjs from "dayjs";

export function useColumns() {
  const dataList = ref([]);
  const loading = ref(true);
  const searchField = ref("expert_id");
  const searchQuery = ref("");
  const editRowData = ref(null);
  const deleteExpertId = ref(null);
  const editDialogVisible = ref(false);
  const deleteDialogVisible = ref(false);

  // 获取专业领域的 label
  const getExpertiseAreaLabel = value => {
    const option = ProjectExpertiseArea.find(opt => opt.value === value);
    return option ? option.label : "未知"; // 如果找不到对应的选项，返回"未知"
  };

  const columns: TableColumnList = [
    {
      label: "专家ID",
      prop: "expert_id"
    },
    {
      label: "姓名",
      prop: "name"
    },
    {
      label: "专业",
      prop: "expertise_area"
    },
    {
      label: "职称",
      prop: "title"
    },
    {
      label: "联系方式",
      prop: "contact_info"
    },
    {
      label: "工作单位",
      prop: "work_unit"
    },
    {
      label: "备注",
      prop: "remarks"
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

  /** 右键编辑菜单配置 */
  const menuOptions = {
    menuList: [
      {
        label: ({ expert_id }) => `专家ID为：${expert_id}`,
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
          deleteExpertId.value = row.expert_id;
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

  // 右键菜单显示
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

  // 获取数据
  async function fetchData() {
    loading.value = true;
    try {
      const response = await axios.get(
        import.meta.env.VITE_APP_SERVER + "/api/experts"
      );
      dataList.value = response.data.map((item, index) => ({
        ...item,
        id: item.expert_id || index,
        expertise_area: getExpertiseAreaLabel(item.expertise_area) // 映射专业领域
      }));
      pagination.total = dataList.value.length;
    } catch (error) {
      console.error("获取数据时发生错误:", error);
    } finally {
      loading.value = false;
    }
  }

  // 搜索数据
  const selectData = async () => {
    loading.value = true;
    try {
      const response = await axios.get(
        import.meta.env.VITE_APP_SERVER + "/api/experts"
      );

      dataList.value = clone(response.data, true)
        .filter(item => {
          // 如果 searchQuery 为空，表示选择了“全部”，不进行过滤
          if (searchQuery.value === "") return true;

          // 对专业领域字段进行精确匹配
          if (searchField.value === "expertise_area") {
            return item.expertise_area === searchQuery.value; // 匹配 value
          }
          return (item[searchField.value] || "")
            .toString()
            .includes(searchQuery.value);
        })
        .map(item => ({
          ...item,
          expertise_area: getExpertiseAreaLabel(item.expertise_area) // 映射专业领域
        }));

      pagination.total = dataList.value.length;
    } catch (error) {
      console.error("搜索数据失败:", error);
    } finally {
      loading.value = false;
    }
  };

  // 监听搜索字段和查询字符串变化
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
    deleteExpertId,
    deleteDialogVisible,
    fetchData
  };
}
