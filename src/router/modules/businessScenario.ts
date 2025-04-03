// import { $t } from "@/plugins/i18n";
import { businessScenario } from "@/router/enums";
import businessScenario_icon from "@iconify-icons/ri/group-fill";

export default {
  path: "/businessScenario/business_scenario_assignment",
  meta: {
    icon: businessScenario_icon,
    title: "业务场景分工",
    rank: businessScenario
  },
  children: [
    {
      path: "/businessScenario/business_scenario_assignment",
      name: "businessScenario",
      component: () =>
        import("@/views/businessScenario/business_scenario_assignment.vue"),
      meta: {
        title: "业务场景分工",
        icon: businessScenario_icon
      }
    }
  ]
} satisfies RouteConfigsTable;
