<template>
  <div v-if="safeSvg" class="svg-container" v-html="safeSvg" />
  <div v-else class="svg-fallback">无法显示 SVG 内容</div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import DOMPurify from "dompurify";

const props = defineProps<{
  svgContent: string;
}>();

const safeSvg = computed(() => {
  if (!props.svgContent) return "";
  try {
    return DOMPurify.sanitize(props.svgContent, {
      USE_PROFILES: { svg: true, svgFilters: true }
    });
  } catch (e) {
    console.warn("[SvgRender] sanitize error", e);
    return "";
  }
});
</script>

<style scoped>
.svg-container {
  width: 100%;
  max-height: 80vh;
  overflow: auto;
}

.svg-fallback {
  padding: 20px;
  color: #999;
  text-align: center;
}
</style>
