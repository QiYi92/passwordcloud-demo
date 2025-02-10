import type {
  LoadingConfig,
  AdaptiveConfig,
  PaginationProps
} from "@pureadmin/table";
import { ref, onMounted, reactive, watch } from "vue";

import { delay, clone } from "@pureadmin/utils";
import axios from "axios";
import {
  ProjectRoomOptions,
  ProjectStateOptions,
  ProjectTypeOptions
} from "@/views/table/edit/data";

import { message } from "@/utils/message"; // 适当调整路径
import { CustomMouseMenu } from "@howdyjs/mouse-menu";
import dayjs from "dayjs"; // 添加新依赖

export function useColumns() {
  const dataList = ref([]);
  const loading = ref(true);
  const searchField = ref("project_id");
  const searchQuery = ref("");
  const editRowData = ref(null);
  const deleteProjectId = ref(null);
  const editDialogVisible = ref(false);
  const deleteDialogVisible = ref(false);

  // 创建一个帮助函数来将 project_type 的值转换为对应的标签
  const getProjectTypeLabel = value => {
    const option = ProjectTypeOptions.find(opt => opt.value === value);
    return option ? option.label : "未知"; // 如果找不到对应的选项，返回"未知"
  };

  const getProjectRoomLabel = value => {
    const option = ProjectRoomOptions.find(opt => opt.value === value);
    return option ? option.label : "未知"; // 如果找不到对应的选项，返回"未知"
  };
  const getProjectStateLabel = value => {
    const option = ProjectStateOptions.find(opt => opt.value === value);
    return option ? option.label : "未知"; // 如果找不到对应的选项，返回"未知"
  };

  //精确把元转化为万元
  function formatToTenThousand(value: any): string {
    // 转换为数字
    const num = parseFloat(value);
    if (isNaN(num)) return "未知"; // 非数字直接返回"未知"
    // 转换为万元，使用精确的计算
    const tenThousandValue = num / 10000;
    // 判断是否为整数（保留实际小数位数）
    if (Number.isInteger(tenThousandValue)) {
      return `${tenThousandValue}万元`;
    } else {
      // 使用字符串精确截断方式来避免浮点数误差
      return `${tenThousandValue.toFixed(6).replace(/\.?0+$/, "")}万元`;
    }
  }

  const columns: TableColumnList = [
    {
      width: "60",
      label: "项目ID",
      prop: "project_id"
    },
    {
      label: "项目名称",
      width: "300",
      prop: "project_name"
    },
    {
      label: "责任科室",
      width: "100",
      prop: "project_room"
    },
    {
      label: "项目立项总投资（万元）",
      width: "150",
      prop: "project_money",
      formatter: row => formatToTenThousand(row.project_money)
    },
    {
      label: "计划总投资（万元）",
      width: "150",
      prop: "project_money_plan",
      formatter: row => formatToTenThousand(row.project_money_plan)
    },
    {
      label: "项目状态",
      prop: "project_state"
    },
    {
      label: "项目负责人",
      prop: "project_head"
    },
    {
      label: "项目类型",
      prop: "project_type"
    },
    {
      label: "项目立项完成时间",
      width: "150",
      prop: "project_time",
      formatter: row => dayjs(row.project_time).format("YYYY年MM月DD日")
    },
    {
      label: "项目备注",
      prop: "project_remark"
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
  /** 右键编辑菜单配置*/
  const menuOptions = {
    menuList: [
      {
        label: ({ project_id }) => `项目ID为：${project_id}`,
        disabled: true
      },
      {
        label: "修改",
        tips: "Edit",
        fn: async row => {
          editRowData.value = row; // 设置当前行数据
          editDialogVisible.value = true; // 打开编辑对话框
        }
      },
      {
        label: "删除",
        tips: "Delete",
        fn: row => {
          deleteProjectId.value = row.project_id;
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
    // svg: "",
    // background: rgba()
  });

  /** 撑满内容区自适应高度相关配置 */
  const adaptiveConfig: AdaptiveConfig = {
    /** 表格距离页面底部的偏移量，默认值为 `96` */
    offsetBottom: 110
    /** 是否固定表头，默认值为 `true`（如果不想固定表头，fixHeader设置为false并且表格要设置table-layout="auto"） */
    // fixHeader: true
    /** 页面 `resize` 时的防抖时间，默认值为 `60` ms */
    // timeout: 60
    /** 表头的 `z-index`，默认值为 `100` */
    // zIndex: 100
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

  // 定义一个函数用于重新获取数据
  async function fetchData() {
    console.log("开始获取数据..."); // 日志输出，表示开始数据获取
    loading.value = true;
    try {
      const response = await axios.get(
        import.meta.env.VITE_APP_SERVER + "/api/projects"
      );
      console.log("环境变量：", import.meta.env);
      console.log("数据成功获取:", response.data); // 日志输出获取到的数据
      dataList.value = response.data.map((item, index) => ({
        ...item,
        id: item.project_id || index, // 使用 project_id 或索引作为唯一ID
        project_room: getProjectRoomLabel(item.project_room), // 这里转换 value 为 label
        project_type: getProjectTypeLabel(item.project_type),
        project_state: getProjectStateLabel(item.project_state)
      }));
      pagination.total = dataList.value.length;
    } catch (error) {
      console.error("获取数据时发生错误:", error); // 日志输出错误信息
    } finally {
      loading.value = false;
      console.log("数据获取完成。"); // 日志输出，表示数据获取流程结束
    }
  }
  // 搜索数据的函数
  const selectData = async () => {
    console.log("开始执行搜索...");
    loading.value = true;
    try {
      const response = await axios.get(
        import.meta.env.VITE_APP_SERVER + "/api/projects"
      );

      dataList.value = clone(response.data, true)
        .filter(item => {
          // 如果没有选择搜索内容，则不过滤
          if (!searchQuery.value) return true;

          // 对于 data.ts 中的数据项，采用精确匹配
          if (searchField.value === "project_room") {
            return item.project_room === searchQuery.value;
          }
          if (searchField.value === "project_type") {
            return item.project_type === searchQuery.value;
          }
          if (searchField.value === "project_state") {
            return item.project_state === searchQuery.value;
          }
          // 其他字段使用模糊匹配
          return (item[searchField.value] || "")
            .toString()
            .includes(searchQuery.value);
        })
        .map(item => ({
          ...item,
          project_room: getProjectRoomLabel(item.project_room),
          project_type: getProjectTypeLabel(item.project_type),
          project_state: getProjectStateLabel(item.project_state)
        }));

      pagination.total = dataList.value.length;
    } catch (error) {
      console.error("搜索数据失败:", error);
    } finally {
      loading.value = false;
      console.log("搜索完成。");
    }
  };

  // 监听搜索字段和查询字符串的变化
  watch([searchField, searchQuery], selectData, { deep: true });
  // 组件挂载时执行
  onMounted(async () => {
    await fetchData();
    if (searchField.value && searchQuery.value) {
      await selectData(); // 只有当搜索字段和查询字符串都已设置时才执行
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
    deleteProjectId,
    deleteDialogVisible,
    fetchData
  };
}
