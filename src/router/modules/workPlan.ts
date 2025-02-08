// import { $t } from "@/plugins/i18n";
import { workPlan } from "@/router/enums";
import workPlan_icon from "@iconify-icons/ri/bar-chart-box-fill";

export default {
  path: "/workPlan/workPlan_management",
  meta: {
    icon: workPlan_icon,
    title: "年度工作计划",
    rank: workPlan
  },
  children: [
    {
      path: "/workPlan/workPlan_management",
      name: "workPlan_management",
      component: () => import("@/views/workPlan/workPlan_management.vue"),
      meta: {
        title: "年度工作计划",
        icon: workPlan_icon
      }
    }
  ]
} satisfies RouteConfigsTable;
