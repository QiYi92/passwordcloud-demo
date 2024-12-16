// import { $t } from "@/plugins/i18n";
import { energy } from "@/router/enums";
import energy_icon from "@iconify-icons/ri/dvd-fill";

export default {
  path: "/energy/energy_management",
  meta: {
    icon: energy_icon,
    title: "能耗记录管理",
    rank: energy
  },
  children: [
    {
      path: "/energy/energy_management",
      name: "energy_management",
      component: () => import("@/views/energy/energy_management.vue"),
      meta: {
        title: "能耗记录管理",
        icon: energy_icon
      }
    }
  ]
} satisfies RouteConfigsTable;
