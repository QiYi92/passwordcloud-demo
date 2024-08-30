// import { $t } from "@/plugins/i18n";
import { table } from "@/router/enums";

export default {
  path: "/table",
  redirect: "/table/high",
  meta: {
    icon: "ri:table-line",
    title: "项目表格",
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
        title: "项目管理"
      }
    },
    {
      path: "/table/edit2",
      name: "PureTableEdit2",
      component: () => import("@/views/table/edit2.vue"),
      meta: {
        title: "项目合同管理"
      }
    },
    {
      path: "/table/edit3",
      name: "PureTableEdit3",
      component: () => import("@/views/table/edit3.vue"),
      meta: {
        title: "项目支付管理"
      }
    }
  ]
} satisfies RouteConfigsTable;
