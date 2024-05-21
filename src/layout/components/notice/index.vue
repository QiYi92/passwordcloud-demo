<script setup lang="ts">
import { ref } from "vue";
import NoticeList from "./noticeList.vue";
import Bell from "@iconify-icons/ep/bell";
import { TabItem } from "@/layout/components/notice/data";

const noticesNum = ref(0);
const notices = ref<TabItem[]>([]);
const activeKey = ref<string>("");

// 初始化一个空的TabItem数组
notices.value = [
  {
    key: "1",
    name: "通知",
    list: []
  },
  {
    key: "2",
    name: "消息",
    list: []
  },
  {
    key: "3",
    name: "待办",
    list: []
  }
];

activeKey.value = notices.value[0].key;
</script>

<template>
  <el-dropdown trigger="click" placement="bottom-end">
    <span class="dropdown-badge navbar-bg-hover select-none">
      <el-badge v-if="noticesNum > 0" :value="noticesNum" :max="99">
        <span class="header-notice-icon">
          <IconifyIconOffline :icon="Bell" />
        </span>
      </el-badge>
      <span v-else class="header-notice-icon">
        <IconifyIconOffline :icon="Bell" />
      </span>
    </span>
    <template #dropdown>
      <el-dropdown-menu>
        <el-tabs
          v-model="activeKey"
          :stretch="true"
          class="dropdown-tabs"
          :style="{ width: notices.length === 0 ? '200px' : '330px' }"
        >
          <el-empty
            v-if="notices.every(item => item.list.length === 0)"
            description="暂无消息"
            :image-size="60"
          />
          <span v-else>
            <template v-for="item in notices" :key="item.key">
              <el-tab-pane
                :label="`${item.name}(${item.list.length})`"
                :name="`${item.key}`"
              >
                <el-scrollbar max-height="330px">
                  <div class="noticeList-container">
                    <NoticeList :list="item.list" />
                  </div>
                </el-scrollbar>
              </el-tab-pane>
            </template>
          </span>
        </el-tabs>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<style lang="scss" scoped>
.dropdown-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 48px;
  margin-right: 10px;
  cursor: pointer;

  .header-notice-icon {
    font-size: 18px;
  }
}

.dropdown-tabs {
  .noticeList-container {
    padding: 15px 24px 0;
  }

  :deep(.el-tabs__header) {
    margin: 0;
  }

  :deep(.el-tabs__nav-wrap)::after {
    height: 1px;
  }

  :deep(.el-tabs__nav-wrap) {
    padding: 0 36px;
  }
}
</style>
