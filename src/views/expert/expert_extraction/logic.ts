// expert_extraction/logic.ts

import type { Expert } from "./types";

/**
 * 根据专业从专家列表中抽取指定数量的专家
 * @param allExperts 全部专家数据
 * @param selectedAreas 用户选中的专业数组
 * @param extractCounts 每个专业对应的抽取数量
 * @returns 抽取后的专家列表
 */
export function extractExperts(
  allExperts: Expert[],
  selectedAreas: string[],
  extractCounts: Record<string, number>
): Expert[] {
  const results: Expert[] = [];

  selectedAreas.forEach(area => {
    const count = extractCounts[area] || 0;
    const candidates = allExperts.filter(e => e.expertise_area === area);
    const shuffled = candidates.sort(() => Math.random() - 0.5);
    results.push(...shuffled.slice(0, count));
  });

  return results;
}
