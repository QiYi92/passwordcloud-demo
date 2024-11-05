// import { $t } from "@/plugins/i18n";
import { meeting } from "@/router/enums";
import meeting_icon from "@iconify-icons/ri/archive-2-fill";

export default {
  path: "/meeting/meeting_management",
  meta: {
    icon: meeting_icon,
    title: "会议纪要整理",
    rank: meeting
  },
  children: [
    {
      path: "/meeting/meeting_management",
      name: "meeting_management",
      component: () => import("@/views/meeting/meeting_management.vue"),
      meta: {
        title: "会议纪要整理",
        icon: meeting_icon
      }
    }
  ]
} satisfies RouteConfigsTable;
