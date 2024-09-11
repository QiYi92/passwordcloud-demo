// import { $t } from "@/plugins/i18n";
import { feedback } from "@/router/enums";

export default {
  path: "/feedback/issues",
  meta: {
    icon: "ep:info-filled",
    title: "需求",
    rank: feedback
  },
  children: [
    {
      path: "/feedback/issues",
      name: "issues",
      component: () => import("@/views/feedback/index_issues.vue"),
      meta: {
        title: "需求&问题反馈",
        icon: "ep:info-filled"
      }
    }
  ]
} satisfies RouteConfigsTable;
