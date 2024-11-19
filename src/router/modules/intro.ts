// import { $t } from "@/plugins/i18n";
import { intro } from "@/router/enums";
import intro_icon from "@iconify-icons/ri/article-fill";

export default {
  path: "/intro/intro_management",
  meta: {
    icon: intro_icon,
    title: "各种情况简介",
    rank: intro
  },
  children: [
    {
      path: "/intro/intro_management",
      name: "intro_management",
      component: () => import("@/views/intro/intro_management.vue"),
      meta: {
        title: "各种情况简介",
        icon: intro_icon
      }
    }
  ]
} satisfies RouteConfigsTable;
