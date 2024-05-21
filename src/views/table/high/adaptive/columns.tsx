// 导入相关类型和数据
import type {
  LoadingConfig,
  AdaptiveConfig,
  PaginationProps
} from "@pureadmin/table";
// import { tableData } from "../data"; // 引入模拟数据

import { ref, onMounted, reactive } from "vue"; // 引入 Vue 响应式 API
import axios from "axios";
import { delay } from "@pureadmin/utils"; // 引入工具函数

export function useColumns() {
  const dataList = ref([]); // 创建响应式数据列表
  const loading = ref(true); // 创建响应式加载状态

  // 定义表格列配置
  const columns: TableColumnList = [
    {
      label: "ID",
      prop: "id"
    },
    {
      label: "项目ID",
      prop: "project_id"
    },
    {
      label: "项目名称",
      prop: "project_name"
    },
    {
      label: "责任科室",
      prop: "project_room"
    },
    {
      label: "项目批复金额",
      prop: "money"
    }
  ];

  /** 分页配置 */
  const pagination = reactive<PaginationProps>({
    pageSize: 20, // 每页显示条数
    currentPage: 1, // 当前页码
    pageSizes: [20, 40, 60], // 可选择的每页显示条数
    total: 0, // 总条数
    align: "right", // 对齐方式
    background: true, // 是否展示背景色
    small: false // 是否使用小型分页
  });

  /** 加载动画配置 */
  const loadingConfig = reactive<LoadingConfig>({
    text: "正在加载第一页...", // 加载动画文字
    viewBox: "-10, -10, 50, 50", // 视口盒子大小
    spinner: `
      <path class="path" d="
        M 30 15
        L 28 17
        M 25.61 25.61
        A 15 15, 0, 0, 1, 15 30
        A 15 15, 0, 1, 1, 27.99 7.5
        L 15 15
      " style="stroke-width: 4px; fill: rgba(0, 0, 0, 0)"/>
    ` // 自定义加载动画SVG路径
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

  // 每页显示条数改变时的回调函数
  function onSizeChange(val) {
    console.log("onSizeChange", val);
  }

  // 页码改变时的回调函数
  function onCurrentChange(val) {
    loadingConfig.text = `正在加载第${val}页...`; // 更新加载动画文字
    loading.value = true; // 设置加载状态为true
    delay(600).then(() => {
      loading.value = false; // 延迟600ms后设置加载状态为false
    });
  }

  // 组件挂载时执行
  onMounted(async () => {
    loading.value = true;
    try {
      const response = await axios.get(
        import.meta.env.VITE_APP_SERVER + "/api/projects"
      );
      dataList.value = response.data.map((item, index) => ({
        id: index, // 从后端获取的数据通常已经包含了唯一ID，这里的映射可能不需要
        ...item
      }));
      pagination.total = dataList.value.length;
    } catch (error) {
      console.error("There was an error fetching the data:", error);
    }
    loading.value = false;
  });

  // 导出相关数据和方法
  return {
    loading,
    columns,
    dataList,
    pagination,
    loadingConfig,
    adaptiveConfig,
    onSizeChange,
    onCurrentChange
  };
}
