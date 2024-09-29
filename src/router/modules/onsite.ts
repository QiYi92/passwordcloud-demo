// import { $t } from "@/plugins/i18n";
import { onsite } from "@/router/enums";
import onsite_icon from "@iconify-icons/ri/contacts-fill";

export default {
  path: "/onsite/onsite_management",
  meta: {
    icon: onsite_icon,
    title: "外地驻场人员管理",
    rank: onsite
  },
  children: [
    {
      path: "/onsite/onsite_management",
      name: "onsite_management",
      component: () => import("@/views/onsite/onsite_management.vue"),
      meta: {
        title: "外地驻场人员管理",
        icon: onsite_icon
      }
    }
  ]
} satisfies RouteConfigsTable;
