<script setup lang="ts">
import { reactive, onMounted } from "vue";
import axios from "axios";
import { PaymentTypeOptions } from "@/views/table/high/data"; // 引入支付类型字典

// 定义项目、合同和支付的接口
interface Project {
  project_name: string;
  contracts: Contract[];
}

interface Contract {
  project_name: string; // 新增此字段
  contract_id: number;
  contract_name: string;
  contract_date: string;
  contract_money: string;
  contract_member: string;
  payments?: Payment[];
}

interface Payment {
  pay_id: number;
  project_name: string;
  contract_name: string;
  pay_type: string;
  pay_money: string;
  pay_time: string;
  pay_state: string;
  pay_remark: string;
}

// 定义响应式状态
const state = reactive<{
  loading: boolean;
  projects: Project[];
  payments: Payment[];
}>({
  loading: true,
  projects: [],
  payments: []
});

// 日期格式化函数
const formatDate = (dateString: string) => {
  if (!dateString) return "未知日期";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "未知日期";
  return `${date.getFullYear()}年${(date.getMonth() + 1)
    .toString()
    .padStart(2, "0")}月${date.getDate().toString().padStart(2, "0")}日`;
};

// 获取支付情况的显示值
const getPaymentLabel = (value: string) => {
  const option = PaymentTypeOptions.find(opt => opt.value === value);
  return option ? option.label : "未知";
};

// 计算支付金额总计
const getTotalPayment = (contracts: Contract[]) => {
  return contracts.reduce((total, contract) => {
    const paymentTotal = contract.payments?.reduce(
      (paymentSum, payment) =>
        paymentSum + parseFloat(payment.pay_money || "0"),
      0
    );
    return total + (paymentTotal || 0);
  }, 0);
};

// 计算合同金额总计
const getTotalContractAmount = (contracts: Contract[]) => {
  return contracts.reduce(
    (total, contract) => total + parseFloat(contract.contract_money || "0"),
    0
  );
};

// 异步加载项目、合同和支付数据
const loadProjectData = async () => {
  state.loading = true;
  try {
    const [projectRes, contractRes, paymentRes] = await Promise.all([
      axios.get(import.meta.env.VITE_APP_SERVER + "/api/projects"),
      axios.get(import.meta.env.VITE_APP_SERVER + "/api/contracts"),
      axios.get(import.meta.env.VITE_APP_SERVER + "/api/payments")
    ]);

    const projectData: Project[] = projectRes.data;
    const contractData: Contract[] = contractRes.data;
    const paymentData: Payment[] = paymentRes.data;

    // 将相关的payment数据提前关联到每个contract中
    const projectsWithContracts = projectData.map(project => {
      const relatedContracts = contractData
        .filter(contract => contract.project_name === project.project_name)
        .map(contract => ({
          ...contract,
          payments: paymentData.filter(
            payment => payment.contract_name === contract.contract_name
          )
        }));
      return {
        ...project,
        contracts: relatedContracts
      };
    });

    state.projects = projectsWithContracts;
    state.payments = paymentData;
  } catch (error) {
    console.error("加载数据失败:", error);
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
        <template v-for="project in state.projects" :key="project.project_name">
          <!-- 项目名称行 -->
          <tr class="project-header">
            <td colspan="8">{{ project.project_name }}</td>
          </tr>

          <!-- 表头行 -->
          <tr class="header-row">
            <th>项目名称</th>
            <th>合同名称</th>
            <th>合同日期</th>
            <th>合同金额</th>
            <th>支付情况</th>
            <th>支付时间</th>
            <th>支付金额</th>
            <th>中标单位</th>
          </tr>

          <!-- 遍历项目的每个合同 -->
          <template
            v-for="contract in project.contracts"
            :key="contract.contract_id"
          >
            <template
              v-for="(payment, paymentIndex) in contract.payments || []"
              :key="payment.pay_id"
            >
              <tr>
                <!-- 合并项目名称单元格 (仅在项目第一个合同的第一条支付信息时显示) -->
                <td
                  v-if="project.contracts[0] === contract && paymentIndex === 0"
                  :rowspan="
                    project.contracts.reduce(
                      (sum, c) => sum + (c.payments?.length || 0),
                      0
                    )
                  "
                  class="merged-project-name"
                >
                  {{ project.project_name }}
                </td>

                <!-- 合并合同名称单元格(仅在该合同第一条支付信息时显示) -->
                <td
                  v-if="paymentIndex === 0"
                  :rowspan="contract.payments?.length || 1"
                  class="merged-contract-name"
                >
                  {{ contract.contract_name }}
                </td>

                <!-- 合同日期 (仅在该合同第一条支付信息时显示) -->
                <td
                  v-if="paymentIndex === 0"
                  :rowspan="contract.payments?.length || 1"
                >
                  {{ formatDate(contract.contract_date) }}
                </td>

                <!-- 合同金额 (仅在该合同第一条支付信息时显示) -->
                <td
                  v-if="paymentIndex === 0"
                  :rowspan="contract.payments?.length || 1"
                >
                  {{ contract.contract_money }}
                </td>

                <!-- 支付信息 -->
                <td>{{ getPaymentLabel(payment.pay_type) }}</td>
                <td>{{ formatDate(payment.pay_time) }}</td>
                <td>{{ payment.pay_money }}</td>

                <!-- 中标单位 (仅在该合同的第一条支付信息时显示) -->
                <td
                  v-if="paymentIndex === 0"
                  :rowspan="contract.payments?.length || 1"
                >
                  {{ contract.contract_member }}
                </td>
              </tr>
            </template>
          </template>

          <!-- 小计行 -->
          <tr class="subtotal-row">
            <td colspan="3" class="subtotal">小计</td>
            <td class="subtotal-amount" style="text-align: right">
              {{ getTotalContractAmount(project.contracts).toFixed(2) }}
            </td>
            <td />
            <td class="subtotal" colspan="1" style="text-align: center">
              支付小计
            </td>
            <td class="subtotal-amount" style="text-align: right">
              {{ getTotalPayment(project.contracts).toFixed(2) }}
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
