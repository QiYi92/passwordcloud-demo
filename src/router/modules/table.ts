// import { $t } from "@/plugins/i18n";
import { table } from "@/router/enums";

export default {
  path: "/table",
  redirect: "/table/high",
  meta: {
    icon: "ri:table-line",
    title: "表格菜单",
    rank: table
  },
  children: [
    {
      path: "/table/high",
      name: "PureTableHigh",
      component: () => import("@/views/table/high.vue"),
      meta: {
        title: "表格总览"
      }
    },
    {
      path: "/table/edit",
      name: "PureTableEdit",
      component: () => import("@/views/table/edit.vue"),
      meta: {
        title: "表格编辑",
        extraIcon: "IF-pure-iconfont-new svg"
      }
    }
  ]
} satisfies RouteConfigsTable;
