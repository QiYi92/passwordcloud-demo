// import { $t } from "@/plugins/i18n";
import { workFlow } from "@/router/enums";
import workFlow_icon from "@iconify-icons/ri/align-left";

export default {
  path: "/workFlow/workFlow_management",
  meta: {
    icon: workFlow_icon,
    title: "工作流程",
    rank: workFlow
  },
  children: [
    {
      path: "/workFlow/workFlow_management",
      name: "workFlow_management",
      component: () => import("@/views/workFlow/workFlow_management.vue"),
      meta: {
        title: "工作流程",
        icon: workFlow_icon
      }
    }
  ]
} satisfies RouteConfigsTable;
