// import { $t } from "@/plugins/i18n";
import { table } from "@/router/enums";
import table_icon from "@iconify-icons/ri/layout-grid-fill";
import show_icon from "@iconify-icons/ri/layout-grid-line";
import show1_icon from "@iconify-icons/ri/layout-bottom-2-line";
import show2_icon from "@iconify-icons/ri/list-radio";
import show3_icon from "@iconify-icons/ri/list-check-3";
import show4_icon from "@iconify-icons/ri/money-cny-box-line";
import show5_icon from "@iconify-icons/ri/pages-line";
import show6_icon from "@iconify-icons/ri/layout-2-fill";

export default {
  path: "/table",
  redirect: "/table/high",
  meta: {
    icon: table_icon,
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
        icon: show_icon
      }
    },
    {
      path: "/table/edit",
      name: "PureTableEdit",
      component: () => import("@/views/table/edit.vue"),
      meta: {
        title: "项目管理",
        icon: show1_icon
      }
    },
    {
      path: "/table/edit2",
      name: "PureTableEdit2",
      component: () => import("@/views/table/edit2.vue"),
      meta: {
        title: "项目合同管理",
        icon: show2_icon
      }
    },
    {
      path: "/table/edit3",
      name: "PureTableEdit3",
      component: () => import("@/views/table/edit3.vue"),
      meta: {
        title: "项目支付管理",
        icon: show3_icon
      }
    },
    {
      path: "/table/edit6",
      name: "PureTableEdit6",
      component: () => import("@/views/table/edit6.vue"),
      meta: {
        title: "合同支付计划",
        icon: show6_icon
      }
    },
    {
      path: "/table/edit4",
      name: "PureTableEdit4",
      component: () => import("@/views/table/edit4.vue"),
      meta: {
        title: "项目资金下达情况管理",
        icon: show4_icon
      }
    },
    {
      path: "/table/edit5",
      name: "PureTableEdit5",
      component: () => import("@/views/table/edit5.vue"),
      meta: {
        title: "合同催款登记管理",
        icon: show5_icon
      }
    }
  ]
} satisfies RouteConfigsTable;
