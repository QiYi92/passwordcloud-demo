// import { $t } from "@/plugins/i18n";
import { registrationInfo } from "@/router/enums";
import registrationInfo_icon from "@iconify-icons/ri/arrow-left-up-fill";

export default {
  path: "/registrationInfo/registrationInfo_management",
  meta: {
    icon: registrationInfo_icon,
    title: "注册相关",
    rank: registrationInfo
  },
  children: [
    {
      path: "/registrationInfo/registrationInfo_management",
      name: "registrationInfo_management",
      component: () =>
        import("@/views/registrationInfo/registrationInfo_management.vue"),
      meta: {
        title: "注册相关",
        icon: registrationInfo_icon
      }
    }
  ]
} satisfies RouteConfigsTable;
