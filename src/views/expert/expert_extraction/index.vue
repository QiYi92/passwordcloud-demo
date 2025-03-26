<script setup lang="ts">
import { ref, onMounted } from "vue";
import axios from "axios";
import { ProjectExpertiseArea } from "@/views/expert/expert_management/data";
import { extractExperts } from "./logic";
import type { Expert } from "./types";

// 专业抽选逻辑变量
const allExperts = ref<Expert[]>([]);
const selectedAreas = ref<string[]>([]);
const extractCounts = ref<Record<string, number>>({});
const extractedExperts = ref<Expert[]>([]);

// 获取专家数据
async function fetchExperts() {
  try {
    const res = await axios.get(
      import.meta.env.VITE_APP_SERVER + "/api/experts"
    );
    allExperts.value = res.data;
  } catch (err) {
    console.error("获取专家失败", err);
  }
}

// 抽取逻辑
function startExtraction() {
  extractedExperts.value = extractExperts(
    allExperts.value,
    selectedAreas.value,
    extractCounts.value
  );
}

// 重置
function resetSelection() {
  selectedAreas.value = [];
  extractCounts.value = {};
  extractedExperts.value = [];
}

// 专业字段转换为标签
const getAreaLabel = (value: string) => {
  const match = ProjectExpertiseArea.find(i => i.value === value);
  return match ? match.label : value;
};

onMounted(fetchExperts);
</script>

<template>
  <div>
    <el-card shadow="never">
      <h3>请选择要抽取的专家专业：</h3>
      <el-checkbox-group v-model="selectedAreas">
        <el-checkbox
          v-for="area in ProjectExpertiseArea"
          :key="area.value"
          :label="area.value"
        >
          {{ area.label }}
        </el-checkbox>
      </el-checkbox-group>

      <div v-if="selectedAreas.length" style="margin-top: 20px">
        <h4>设置每个专业的抽取数量：</h4>
        <div
          v-for="area in selectedAreas"
          :key="area"
          style="display: flex; align-items: center; margin-bottom: 10px"
        >
          <span style="width: 100px">{{ getAreaLabel(area) }}</span>
          <el-input-number
            v-model="extractCounts[area]"
            :min="0"
            :max="50"
            controls-position="right"
          />
        </div>

        <div style="margin-top: 20px">
          <el-button type="primary" @click="startExtraction"
            >开始抽取</el-button
          >
          <el-button type="warning" @click="resetSelection">重置</el-button>
        </div>
      </div>
    </el-card>

    <div v-if="extractedExperts.length" style="margin-top: 30px">
      <el-table :data="extractedExperts" border stripe style="width: 100%">
        <el-table-column prop="expert_id" label="专家ID" width="100" />
        <el-table-column prop="name" label="姓名" width="120" />
        <el-table-column
          prop="expertise_area"
          label="专业"
          :formatter="row => getAreaLabel(row.expertise_area)"
        />
        <el-table-column prop="title" label="职称" />
        <el-table-column prop="contact_info" label="联系方式" />
        <el-table-column prop="work_unit" label="工作单位" />
      </el-table>
    </div>
  </div>
</template>
