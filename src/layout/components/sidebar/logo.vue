<script setup lang="ts">
import { getTopMenu } from "@/router/utils";
import { useNav } from "@/layout/hooks/useNav";
import { computed } from "vue";

const props = defineProps({
  collapse: Boolean
});

const { title, getLogo } = useNav();

// 拆分两行
const lines = computed(() => title.value.split("\n"));
const line1 = computed(() => lines.value[0] || "");
const line2 = computed(() => lines.value[1] || "");
</script>

<template>
  <div class="sidebar-logo-container" :class="{ collapses: props.collapse }">
    <transition name="sidebarLogoFade">
      <router-link
        v-if="props.collapse"
        key="props.collapse"
        :title="title"
        class="sidebar-logo-link"
        :to="getTopMenu()?.path ?? '/'"
      >
        <img :src="getLogo()" alt="logo" />
        <span class="sidebar-title">
          <span class="first-line">{{ line1 }}</span
          ><br />
          <span class="second-line">{{ line2 }}</span>
        </span>
      </router-link>
      <router-link
        v-else
        key="expand"
        :title="title"
        class="sidebar-logo-link"
        :to="getTopMenu()?.path ?? '/'"
      >
        <img :src="getLogo()" alt="logo" />
        <span class="sidebar-title">
          <span class="first-line">{{ line1 }}</span
          ><br />
          <span class="second-line">{{ line2 }}</span>
        </span>
      </router-link>
    </transition>
  </div>
</template>

<style lang="scss" scoped>
.sidebar-logo-container {
  position: relative;
  width: 100%;
  height: auto;
  padding: 8px 0;
  overflow: hidden;
}

.sidebar-logo-link {
  display: flex;
  align-items: center;
  padding-left: 18px;

  img {
    display: inline-block;
    height: 32px;
    margin-right: 22px;
  }

  .sidebar-title {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin: 0;
    line-height: 1.2;

    .first-line {
      font-size: 16px; /* 第一行小字体 */
      font-weight: 600;
      color: $subMenuActiveText;
    }

    .second-line {
      font-size: 18px; /* 第二行原字体 */
      font-weight: 600;
      color: $subMenuActiveText;
    }
  }
}
</style>
