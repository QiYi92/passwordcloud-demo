import type {
  LoadingConfig,
  AdaptiveConfig,
  PaginationProps
} from "@pureadmin/table";
import { ref, onMounted, reactive, watch } from "vue";

import { delay, clone } from "@pureadmin/utils";
import axios from "axios";
import {
  PaymentTypeOptions,
  PaymentStateOptions
} from "@/views/table/edit3/data";

import { message } from "@/utils/message"; // 适当调整路径
import { CustomMouseMenu } from "@howdyjs/mouse-menu"; // 添加新依赖
import dayjs from "dayjs";

export function useColumns() {
  const dataList = ref([]);
  const loading = ref(true);
  const searchField = ref("pay_id");
  const searchQuery = ref("");
  const editRowData = ref(null);
  const deletePaymentId = ref(null);
  const editDialogVisible = ref(false);
  const deleteDialogVisible = ref(false);

  // 创建一个帮助函数来将【支付类型】的值转换为对应的标签
  const getPaymentTypeLabel = value => {
    const StateOption = PaymentTypeOptions.find(opt => opt.value === value);
    return StateOption ? StateOption.label : "未知"; // 如果找不到对应的选项，返回"未知"
  };
  // 创建一个帮助函数来将【支付状态】的值转换为对应的标签
  const getPaymentStateLabel = value => {
    const TypeOption = PaymentStateOptions.find(opt => opt.value === value);
    return TypeOption ? TypeOption.label : "未知";
  };

  const columns: TableColumnList = [
    {
      label: "支付项ID",
      prop: "pay_id"
    },
    {
      label: "关联项目名称",
      width: "240",
      prop: "project_name"
    },
    {
      label: "关联合同名称",
      width: "240",
      prop: "contract_name"
    },
    {
      label: "支付情况",
      width: "150",
      prop: "pay_type",
      formatter: row => getPaymentTypeLabel(row.pay_type)
    },
    {
      label: "支付金额（万元）",
      prop: "pay_money"
    },
    {
      label: "支付时间",
      prop: "pay_time",
      formatter: row => dayjs(row.pay_time).format("YYYY年MM月DD日")
    },
    {
      label: "支付状态",
      prop: "pay_state",
      formatter: row => getPaymentStateLabel(row.pay_state)
    },
    {
      label: "支付备注",
      prop: "pay_remark"
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
        label: ({ pay_id }) => `项目ID为：${pay_id}`,
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
          deletePaymentId.value = row.pay_id;
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
        import.meta.env.VITE_APP_SERVER + "/api/payments"
      );
      console.log("数据成功获取:", response.data); // 日志输出获取到的数据
      dataList.value = response.data.map((item, index) => ({
        ...item,
        id: item.pay_id || index // 使用 pay_id 或索引作为唯一ID
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
        import.meta.env.VITE_APP_SERVER + "/api/payments"
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
    deletePaymentId,
    deleteDialogVisible,
    fetchData
  };
}
