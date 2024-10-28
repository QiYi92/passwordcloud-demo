import type {
  LoadingConfig,
  AdaptiveConfig,
  PaginationProps
} from "@pureadmin/table";
import { ref, onMounted, reactive, watch } from "vue";

import { delay, clone } from "@pureadmin/utils";
import axios from "axios";
import {
  FundsTypeOptions // 使用新的资金类型选项
} from "@/views/table/edit4/data"; // 确保路径正确

import { message } from "@/utils/message"; // 适当调整路径
import { CustomMouseMenu } from "@howdyjs/mouse-menu"; // 添加新依赖
import dayjs from "dayjs";

export function useColumns() {
  const dataList = ref([]);
  const loading = ref(true);
  const searchField = ref("pass_id");
  const searchQuery = ref("");
  const editRowData = ref(null);
  const deletePassId = ref(null); // 修改变量名以反映pass
  const editDialogVisible = ref(false);
  const deleteDialogVisible = ref(false);

  // 创建一个帮助函数来将【类型】的值转换为对应的标签
  const getFundsTypeLabel = value => {
    const TypeOption = FundsTypeOptions.find(opt => opt.value === value);
    return TypeOption ? TypeOption.label : "未知"; // 如果找不到对应的选项，返回"未知"
  };

  const columns: TableColumnList = [
    {
      label: "资金下达ID",
      prop: "pass_id"
    },
    {
      label: "项目名称",
      prop: "project_name"
    },
    {
      label: "资金类型",
      prop: "money_type"
    },
    {
      label: "下达时间",
      prop: "pass_time",
      formatter: row => dayjs(row.pass_time).format("YYYY年MM月DD日")
    },
    {
      label: "备注",
      prop: "pass_remark"
    },
    {
      label: "操作",
      width: "150",
      fixed: "right",
      slot: "operation" // 指定操作列的插槽
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
        label: ({ pass_id }) => `项目ID为：${pass_id}`,
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
          deletePassId.value = row.pass_id; // 使用pass_id
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

  // 定义一个函数用于重新获取数据
  async function fetchData() {
    console.log("开始获取数据..."); // 日志输出，表示开始数据获取
    loading.value = true;
    try {
      const response = await axios.get(
        import.meta.env.VITE_APP_SERVER + "/api/passes" // 修改为新的API路径
      );
      console.log("数据成功获取:", response.data); // 日志输出获取到的数据
      dataList.value = response.data.map((item, index) => ({
        ...item,
        id: item.pass_id || index, // 使用 pass_id 或索引作为唯一ID
        money_type: getFundsTypeLabel(item.money_type) // 资金类型
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
        import.meta.env.VITE_APP_SERVER + "/api/passes" // 修改为新的API路径
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
    deletePassId,
    deleteDialogVisible,
    fetchData
  };
}
