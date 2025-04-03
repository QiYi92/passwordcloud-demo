// import { $t } from "@/plugins/i18n";
import { organizationContact } from "@/router/enums";
import organizationContact_icon from "@iconify-icons/ri/group-fill";

export default {
  path: "/organizationContact/organization_contact_management",
  meta: {
    icon: organizationContact_icon,
    title: "单位信息化联系人",
    rank: organizationContact
  },
  children: [
    {
      path: "/organizationContact/organization_contact_management",
      name: "organizationContact",
      component: () =>
        import(
          "@/views/organizationContact/organization_contact_management.vue"
        ),
      meta: {
        title: "单位信息化联系人",
        icon: organizationContact_icon
      }
    }
  ]
} satisfies RouteConfigsTable;
