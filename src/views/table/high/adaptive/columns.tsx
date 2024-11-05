// columns.tsx
import { ref, onMounted, reactive } from "vue";
import axios from "axios";
import { delay } from "@pureadmin/utils"; // 引入工具函数

export function useColumns() {
  const dataList = ref([]); // 分组后的项目和合同数据
  const loading = ref(true); // 加载状态

  // 定义表格列配置
  const columns: TableColumnList = [
    { label: "项目名称", prop: "project_name" },
    { label: "合同名称", prop: "contract_name" },
    { label: "合同日期", prop: "contract_date" },
    { label: "合同金额", prop: "contract_money" },
    { label: "中标单位", prop: "contract_member" }
  ];

  // 分页配置（如果需要分页，可按需添加）
  const pagination = reactive({
    pageSize: 20,
    currentPage: 1,
    pageSizes: [20, 40, 60],
    total: 0,
    align: "right",
    background: true,
    small: false
  });

  // 获取所有项目和合同，并将合同按项目分组
  const fetchData = async () => {
    loading.value = true;
    try {
      const [projectsResponse, contractsResponse] = await Promise.all([
        axios.get(import.meta.env.VITE_APP_SERVER + "/api/projects"),
        axios.get(import.meta.env.VITE_APP_SERVER + "/api/contracts")
      ]);

      const projects = projectsResponse.data;
      const contracts = contractsResponse.data;

      // 分组：将合同数据按项目名称关联
      dataList.value = projects.map(project => ({
        ...project,
        contracts: contracts.filter(
          contract => contract.project_name === project.project_name
        )
      }));

      pagination.total = dataList.value.length;
    } catch (error) {
      console.error("获取数据失败:", error);
    }
    loading.value = false;
  };

  // Vue 组件挂载时调用
  onMounted(fetchData);

  return {
    loading,
    columns,
    dataList,
    pagination
  };
}
