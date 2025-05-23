// import { $t } from "@/plugins/i18n";
import { workTaskForce } from "@/router/enums";
import workTaskForce_icon from "@iconify-icons/ri/folder-user-fill";

export default {
  path: "/workTaskForce/workTaskForce_management",
  meta: {
    icon: workTaskForce_icon,
    title: "工作专班",
    rank: workTaskForce
  },
  children: [
    {
      path: "/workTaskForce/workTaskForce_management",
      name: "workTaskForce_management",
      component: () =>
        import("@/views/workTaskForce/workTaskForce_management.vue"),
      meta: {
        title: "工作专班",
        icon: workTaskForce_icon
      }
    }
  ]
} satisfies RouteConfigsTable;
