<script setup lang="ts">
import { reactive, onMounted } from "vue";
import axios from "axios";

// 定义项目和合同的接口
interface Project {
  project_name: string;
  contracts: Contract[];
}

interface Contract {
  contract_id: number;
  contract_name: string;
  contract_date: string;
  contract_money: string;
  contract_member: string;
}

// 定义响应式状态
const state = reactive<{
  loading: boolean;
  projects: Project[];
}>({
  loading: true,
  projects: []
});

// 日期格式化函数：将 ISO 日期转换为 "xxxx年xx月xx日" 格式
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}年${month}月${day}日`;
};

// 计算合同金额小计
const getSubtotal = (contracts: Contract[]) => {
  return contracts.reduce(
    (total, contract) => total + parseFloat(contract.contract_money || "0"),
    0
  );
};

// 异步加载项目和合同数据
const loadProjectData = async () => {
  state.loading = true;
  try {
    const [projectRes, contractRes] = await Promise.all([
      axios.get(import.meta.env.VITE_APP_SERVER + "/api/projects"),
      axios.get(import.meta.env.VITE_APP_SERVER + "/api/contracts")
    ]);

    const projectData = projectRes.data;
    const contractData = contractRes.data;

    // 将合同按项目名称分组
    state.projects = projectData.map(project => ({
      ...project,
      contracts: contractData.filter(
        contract => contract.project_name === project.project_name
      )
    }));
  } catch (error) {
    console.error("Failed to load project or contract data:", error);
  } finally {
    state.loading = false;
  }
};

// 在组件挂载时加载数据
onMounted(loadProjectData);
</script>

<template>
  <div v-if="state.loading">加载中...</div>
  <div v-else>
    <table border="1" width="100%" class="contract-table">
      <tbody>
        <template v-for="(project, index) in state.projects" :key="index">
          <!-- 项目名称行 -->
          <tr class="project-header">
            <td colspan="5">{{ project.project_name }}</td>
          </tr>

          <!-- 表头行 -->
          <tr class="header-row">
            <th>项目名称</th>
            <th>合同名称</th>
            <th>合同日期</th>
            <th>合同金额</th>
            <th>中标单位</th>
          </tr>

          <!-- 遍历项目的每个合同 -->
          <template
            v-for="(contract, contractIndex) in project.contracts"
            :key="contract.contract_id"
          >
            <tr>
              <!-- 合并项目名称单元格，仅在第一行显示 -->
              <td
                v-if="contractIndex === 0"
                :rowspan="project.contracts.length"
                class="merged-project-name"
              >
                {{ project.project_name }}
              </td>
              <td>{{ contract.contract_name }}</td>
              <td>{{ formatDate(contract.contract_date) }}</td>
              <td>{{ contract.contract_money }}</td>
              <td>{{ contract.contract_member }}</td>
            </tr>
          </template>

          <!-- 小计行 -->
          <tr class="subtotal-row">
            <td colspan="3" class="subtotal">小计</td>
            <td class="subtotal-amount">
              {{ getSubtotal(project.contracts) }}
            </td>
            <td />
          </tr>
        </template>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.project-header {
  padding: 10px;
  font-weight: bold;
  text-align: left;
  background-color: #f5b7b1;
}

.header-row {
  font-weight: bold;
  background-color: #fff;
}

.contract-table {
  width: 100%;
  margin-bottom: 20px;
  border-collapse: collapse;
}

th,
td {
  padding: 8px;
  text-align: left;
  border: 1px solid #ddd;
}

.merged-project-name {
  font-weight: bold;
  text-align: center;
  vertical-align: middle;
}

.subtotal {
  font-weight: bold;
  text-align: left;
}

.subtotal-amount {
  font-weight: bold;
  text-align: right;
}

.subtotal-row {
  background-color: #ddd;
}
</style>
