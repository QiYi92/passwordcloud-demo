// import { $t } from "@/plugins/i18n";
import { borrowed_equipment } from "@/router/enums";
import borrowed_equipment_icon from "@iconify-icons/ri/hard-drive-3-fill";

export default {
  path: "/borrowed_equipment/borrowed_equipment_register",
  meta: {
    icon: borrowed_equipment_icon,
    title: "外借设备登记",
    rank: borrowed_equipment
  },
  children: [
    {
      path: "/borrowed_equipment/borrowed_equipment_register",
      name: "borrowed_equipment",
      component: () =>
        import("@/views/borrowed_equipment/borrowed_equipment_register.vue"),
      meta: {
        title: "外借设备登记",
        icon: borrowed_equipment_icon
      }
    }
  ]
} satisfies RouteConfigsTable;
