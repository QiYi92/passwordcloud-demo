<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from "vue"; // ✅ 新增 onUnmounted

import axios from "axios";
import dayjs from "dayjs";
import { RegionOptions } from "@/views/energy/energy_management/data";

// 区域颜色映射（可根据需要自定义）
const regionColors = {
  "0": "#5470C6", // 文昌机房
  "1": "#91CC75", // 三中路办公区
  "2": "#EE6666" // 其他
};

const selectedRegions = ref(RegionOptions.map(item => item.value)); // 默认全选
const rawData = ref([]); // 原始数据

// 将原始数据转换为：每个区域 => 按月汇总后排序
const chartData = computed(() => {
  const grouped = {};

  for (const item of rawData.value) {
    const { date, region, electricity_consumption } = item;
    const month = dayjs(date).format("YYYY-MM");

    if (!grouped[region]) grouped[region] = {};

    // 累加每月耗电量
    if (!grouped[region][month]) {
      grouped[region][month] = 0;
    }
    grouped[region][month] += Number(electricity_consumption);
  }

  // 转成数组并按时间排序
  const result = {};
  for (const region in grouped) {
    result[region] = Object.entries(grouped[region])
      .map(([date, total]) => ({ date, electricity_consumption: total }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  return result;
});

// 获取后端数据
async function fetchData() {
  try {
    const res = await axios.get(
      import.meta.env.VITE_APP_SERVER + "/api/energy"
    );
    rawData.value = res.data;
  } catch (err) {
    console.error("加载数据失败", err);
  }
}

onMounted(() => {
  fetchData();
  window.addEventListener("energy-changed", fetchData); // ✅ 监听刷新事件
});

onUnmounted(() => {
  window.removeEventListener("energy-changed", fetchData); // ✅ 清理监听
});
</script>

<template>
  <div class="chart-wrapper">
    <!-- 区域多选 -->
    <div class="region-selector mb-2">
      <el-checkbox-group v-model="selectedRegions">
        <el-checkbox
          v-for="option in RegionOptions"
          :key="option.value"
          :label="option.label"
          :value="option.value"
        >
          {{ option.label }}
        </el-checkbox>
      </el-checkbox-group>
    </div>

    <!-- 每个区域一个独立图表 -->
    <div
      v-for="region in selectedRegions"
      :key="region"
      class="chart-container mb-4"
      style="height: 300px; padding: 10px; border: 1px solid #eee"
    >
      <div style="margin-bottom: 10px; font-weight: bold">
        {{ RegionOptions.find(r => r.value === region)?.label }}
      </div>
      <v-chart
        :option="{
          tooltip: { trigger: 'axis' },
          xAxis: {
            type: 'category',
            data: chartData[region]?.map(d => d.date) || [],
            boundaryGap: false
          },
          yAxis: {
            type: 'value',
            name: '耗电量（度）',
            axisLabel: {
              formatter: '{value}'
            }
          },
          series: [
            {
              data:
                chartData[region]?.map(d => d.electricity_consumption) || [],
              type: 'line',
              smooth: true,
              itemStyle: {
                color: regionColors[region] || '#409EFF'
              },
              lineStyle: {
                width: 3
              },
              showSymbol: true,
              symbolSize: 6
            }
          ]
        }"
        autoresize
        style="width: 100%; height: 250px"
      />
    </div>
  </div>
</template>

<style scoped>
.chart-wrapper {
  margin-bottom: 20px;
}
</style>
