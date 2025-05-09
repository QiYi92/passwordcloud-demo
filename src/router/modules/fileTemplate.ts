// import { $t } from "@/plugins/i18n";
import { fileTemplate } from "@/router/enums";
import fileTemplate_icon from "@iconify-icons/ri/file-copy-fill";

export default {
  path: "/fileTemplate/fileTemplate_management",
  meta: {
    icon: fileTemplate_icon,
    title: "文档模板",
    rank: fileTemplate
  },
  children: [
    {
      path: "/fileTemplate/fileTemplate_management",
      name: "fileTemplate_management",
      component: () =>
        import("@/views/fileTemplate/fileTemplate_management.vue"),
      meta: {
        title: "文档模板",
        icon: fileTemplate_icon
      }
    }
  ]
} satisfies RouteConfigsTable;
