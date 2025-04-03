import type {
  LoadingConfig,
  AdaptiveConfig,
  PaginationProps
} from "@pureadmin/table";
import { ref, onMounted, reactive, watch } from "vue";

import { delay, clone } from "@pureadmin/utils";
import axios from "axios";
import { message } from "@/utils/message"; // 适当调整路径
import { CustomMouseMenu } from "@howdyjs/mouse-menu";
import dayjs from "dayjs"; // 添加新依赖

export function useColumns() {
  const dataList = ref([]);
  const loading = ref(true);
  const searchField = ref("meeting_id");
  const searchQuery = ref("");
  const editRowData = ref(null);
  const deleteMeetingId = ref(null);
  const editDialogVisible = ref(false);
  const deleteDialogVisible = ref(false);

  const columns: TableColumnList = [
    {
      label: "会议ID",
      prop: "meeting_id",
      width: 100
    },
    {
      label: "会议名称",
      prop: "meeting_name",
      width: 150
    },
    {
      label: "会议正文",
      prop: "meeting_body",
      width: 300,
      align: "left",
      formatter: row => {
        const text = row.meeting_body || "";
        return text.length > 50 ? text.slice(0, 50) + "（省略）" : text;
      }
    },
    {
      label: "会议时间",
      prop: "meeting_date",
      width: 150,
      formatter: row => dayjs(row.meeting_date).format("YYYY年MM月DD日")
    },
    {
      label: "摘要",
      prop: "summary",
      width: 200,
      formatter: row => {
        const text = row.meeting_body || "";
        return text.length > 50 ? text.slice(0, 50) + "（省略）" : text;
      }
    },
    {
      label: "正文附件",
      prop: "meeting_files",
      width: 150,
      formatter: row => {
        // 映射数字类型的 0 为 "无附件"
        return row.meeting_files === 0 || row.meeting_files === "0"
          ? "无附件"
          : row.meeting_files;
      }
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
        label: ({ meeting_id }) => `项目ID为：${meeting_id}`,
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
          deleteMeetingId.value = row.meeting_id;
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
        import.meta.env.VITE_APP_SERVER + "/api/meeting"
      );
      console.log("环境变量：", import.meta.env);
      console.log("数据成功获取:", response.data); // 日志输出获取到的数据
      dataList.value = response.data.map((item, index) => ({
        ...item,
        id: item.meeting_id || index // 使用 meeting_id 或索引作为唯一ID
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
    loading.value = true;
    try {
      const response = await axios.get(
        import.meta.env.VITE_APP_SERVER + "/api/meeting"
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
    deleteMeetingId,
    deleteDialogVisible,
    fetchData
  };
}
