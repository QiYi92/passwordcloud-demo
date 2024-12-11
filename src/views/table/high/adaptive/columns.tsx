import { ref, onMounted, reactive } from "vue";
import axios from "axios";
import { delay } from "@pureadmin/utils"; // 引入工具函数

export function useColumns() {
  const dataList = ref([]); // 分组后的项目、合同和支付数据
  const loading = ref(true); // 加载状态

  // 定义表格列配置
  const columns: TableColumnList = [
    { label: "项目名称", prop: "project_name" },
    { label: "合同名称", prop: "contract_name" },
    { label: "合同日期", prop: "contract_date" },
    { label: "合同金额", prop: "contract_money" },
    { label: "中标单位", prop: "contract_member" },
    { label: "支付情况", prop: "pay_type" }, // 新增支付情况列
    { label: "支付金额", prop: "pay_money" } // 新增支付金额列
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

  // 获取所有项目、合同和支付数据
  const fetchData = async () => {
    loading.value = true;
    try {
      const [projectsResponse, contractsResponse, paymentsResponse] =
        await Promise.all([
          axios.get(import.meta.env.VITE_APP_SERVER + "/api/projects"),
          axios.get(import.meta.env.VITE_APP_SERVER + "/api/contracts"),
          axios.get(import.meta.env.VITE_APP_SERVER + "/api/payments")
        ]);

      const projects = projectsResponse.data;
      const contracts = contractsResponse.data;
      const payments = paymentsResponse.data;

      // 分组：将合同和支付数据按项目名称和合同名称关联
      dataList.value = projects.map(project => ({
        ...project,
        contracts: contracts
          .filter(contract => contract.project_name === project.project_name)
          .map(contract => ({
            ...contract,
            payments: payments.filter(
              payment => payment.contract_name === contract.contract_name
            )
          }))
      }));

      // 更新分页总数
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
