// import { $t } from "@/plugins/i18n";
import { feedback } from "@/router/enums";
import info_icon from "@iconify-icons/ri/file-info-fill";
export default {
  path: "/feedback/issues",
  meta: {
    icon: info_icon,
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
        icon: info_icon
      }
    }
  ]
} satisfies RouteConfigsTable;
