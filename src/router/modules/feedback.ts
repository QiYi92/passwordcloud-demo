// import { $t } from "@/plugins/i18n";
import { feedback } from "@/router/enums";

export default {
  path: "/feedback/issues",
  name: "issues",
  component: () => import("@/views/feedback/index_issues.vue"),
  meta: {
    icon: "ri:table-line",
    rank: feedback,
    title: "需求&问题反馈"
  }
} satisfies RouteConfigsTable;
