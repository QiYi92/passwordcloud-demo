// import { $t } from "@/plugins/i18n";
import { expert } from "@/router/enums";
import expert_icon from "@iconify-icons/ri/briefcase-4-fill";

export default {
  path: "/expert/expert_management",
  meta: {
    icon: expert_icon,
    title: "专家库管理",
    rank: expert
  },
  children: [
    {
      path: "/expert/expert_management",
      name: "expert_management",
      component: () => import("@/views/expert/expert_management.vue"),
      meta: {
        title: "专家库管理",
        icon: expert_icon
      }
    },
    {
      path: "/expert/expert_extraction",
      name: "expert_extraction",
      component: () => import("@/views/expert/expert_extraction/index.vue"),
      meta: {
        title: "专家抽取",
        icon: expert_icon
      }
    }
  ]
} satisfies RouteConfigsTable;
