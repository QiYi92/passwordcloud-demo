// import { $t } from "@/plugins/i18n";
import { enterpriseInfo } from "@/router/enums";

import enterprise_icon from "@iconify-icons/ri/building-4-fill";
import enterpriseInfo_icon from "@iconify-icons/ri/building-fill";
import outputInfo_icon from "@iconify-icons/ri/book-read-fill";

export default {
  path: "/enterprise/enterprise_management",
  meta: {
    icon: enterprise_icon,
    title: "企业库",
    rank: enterpriseInfo
  },
  children: [
    {
      path: "/enterprise/enterprise_management",
      name: "enterprise_management",
      component: () => import("@/views/enterprise/enterprise_management.vue"),
      meta: {
        title: "企业管理",
        icon: enterpriseInfo_icon
      }
    },
    {
      path: "/enterprise/output_management",
      name: "output_management",
      component: () => import("@/views/enterprise/output_management.vue"),
      meta: {
        title: "产值记录",
        icon: outputInfo_icon
      }
    }
  ]
} satisfies RouteConfigsTable;
