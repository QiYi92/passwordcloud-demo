// 模拟后端动态生成路由
import { defineFakeRoute } from "vite-plugin-fake-server/client";
import { system } from "@/router/enums";
import system_icon from "@iconify-icons/ri/settings-5-line";

/**
 * roles：页面级别权限，这里模拟二种 "admin"、"common"
 * admin：管理员角色
 * common：普通角色
 */

const systemManagementRouter = {
  path: "/system",
  meta: {
    icon: "ri:settings-3-line",
    title: "系统管理",
    rank: system
  },
  children: [
    // {
    //   path: "/system/user/index",
    //   name: "SystemUser",
    //   meta: {
    //     icon: "ri:admin-line",
    //     title: "用户管理",
    //     roles: ["admin"]
    //   }
    // },
    {
      path: "/system/role/index",
      name: "SystemRole",
      meta: {
        icon: "ri:admin-fill",
        title: "用户管理",
        roles: ["admin"]
      }
    },
    {
      path: "/system/logs/demo1/index",
      name: "UserLogs",
      meta: {
        icon: "ri:admin-fill",
        title: "用户日志管理",
        roles: ["admin"]
      }
    },
    {
      path: "/system/loginStats/demo1/index",
      name: "loginStats",
      meta: {
        icon: "ri:admin-fill",
        title: "用户登录统计",
        roles: ["admin"]
      }
    }
  ]
};

const permissionRouter = {
  path: "/permission",
  meta: {
    title: "权限管理",
    icon: "ep:lollipop",
    rank: 10,
    showLink: false // 控制菜单显示
  },
  children: [
    {
      path: "/permission/page/index",
      name: "PermissionPage",
      meta: {
        title: "页面权限",
        roles: ["admin", "common"]
      }
    },
    {
      path: "/permission/button/index",
      name: "PermissionButton",
      meta: {
        title: "按钮权限",
        roles: ["admin", "common"],
        auths: [
          "permission:btn:add",
          "permission:btn:edit",
          "permission:btn:delete"
        ]
      }
    }
  ]
};

export default defineFakeRoute([
  {
    url: "/get-async-routes",
    method: "get",
    response: () => {
      return {
        success: true,
        data: [permissionRouter, systemManagementRouter]
      };
    }
  }
]);
