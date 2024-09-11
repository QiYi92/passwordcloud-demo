// import { $t } from "@/plugins/i18n";
import { table } from "@/router/enums";

export default {
  path: "/table",
  redirect: "/table/high",
  meta: {
    icon: "ep:menu",
    title: "项目表格",
    rank: table
  },
  children: [
    {
      path: "/table/high",
      name: "PureTableHigh",
      component: () => import("@/views/table/high.vue"),
      meta: {
        title: "表格总览",
        icon: "ep:grid"
      }
    },
    {
      path: "/table/edit",
      name: "PureTableEdit",
      component: () => import("@/views/table/edit.vue"),
      meta: {
        title: "项目管理",
        icon: "ep:files"
      }
    },
    {
      path: "/table/edit2",
      name: "PureTableEdit2",
      component: () => import("@/views/table/edit2.vue"),
      meta: {
        title: "项目合同管理",
        icon: "ep:tickets"
      }
    },
    {
      path: "/table/edit3",
      name: "PureTableEdit3",
      component: () => import("@/views/table/edit3.vue"),
      meta: {
        title: "项目支付管理",
        icon: "ep:postcard"
      }
    },
    {
      path: "/table/edit4",
      name: "PureTableEdit4",
      component: () => import("@/views/table/edit4.vue"),
      meta: {
        title: "项目资金下达情况管理",
        icon: "ep:document"
      }
    },
    {
      path: "/table/edit5",
      name: "PureTableEdit5",
      component: () => import("@/views/table/edit5.vue"),
      meta: {
        title: "合同催款登记管理",
        icon: "ep:document"
      }
    }
  ]
} satisfies RouteConfigsTable;
