// import "@/utils/sso"; // 注释掉的单点登录相关代码
import Cookies from "js-cookie"; // 导入 js-cookie 库
import { getConfig } from "@/config"; // 导入配置信息
import NProgress from "@/utils/progress"; // 导入进度条工具
import { buildHierarchyTree } from "@/utils/tree"; // 导入构建层级树的工具函数
import remainingRouter from "./modules/remaining"; // 导入剩余路由模块
import { useMultiTagsStoreHook } from "@/store/modules/multiTags"; // 导入多标签页存储钩子
import { usePermissionStoreHook } from "@/store/modules/permission"; // 导入权限存储钩子
import { isUrl, openLink, storageLocal, isAllEmpty } from "@pureadmin/utils"; // 导入实用工具函数
import {
  ascending,
  getTopMenu,
  initRouter,
  isOneOfArray,
  getHistoryMode,
  findRouteByPath,
  handleAliveRoute,
  formatTwoStageRoutes,
  formatFlatteningRoutes
} from "./utils"; // 导入路由相关工具函数
import {
  type Router,
  createRouter,
  type RouteRecordRaw,
  type RouteComponent
} from "vue-router"; // 导入 vue-router 相关类型和函数
import {
  type DataInfo,
  userKey,
  removeToken,
  multipleTabsKey
} from "@/utils/auth"; // 导入认证相关类型和函数

/** 自动导入全部静态路由，无需再手动引入！匹配 src/router/modules 目录（任何嵌套级别）中具有 .ts 扩展名的所有文件，除了 remaining.ts 文件
 * 如何匹配所有文件请看：https://github.com/mrmlnc/fast-glob#basic-syntax
 * 如何排除文件请看：https://cn.vitejs.dev/guide/features.html#negative-patterns
 */
const modules: Record<string, any> = import.meta.glob(
  ["./modules/**/*.ts", "!./modules/**/remaining.ts"],
  {
    eager: true // 立即加载匹配到的模块
  }
);

/** 原始静态路由（未做任何处理） */
const routes = [];

Object.keys(modules).forEach(key => {
  routes.push(modules[key].default); // 将所有导入的模块加入 routes 数组
});

/** 导出处理后的静态路由（三级及以上的路由全部拍成二级） */
export const constantRoutes: Array<RouteRecordRaw> = formatTwoStageRoutes(
  formatFlatteningRoutes(buildHierarchyTree(ascending(routes.flat(Infinity))))
);

/** 用于渲染菜单，保持原始层级 */
export const constantMenus: Array<RouteComponent> = ascending(
  routes.flat(Infinity)
).concat(...remainingRouter);

/** 不参与菜单的路由 */
export const remainingPaths = Object.keys(remainingRouter).map(v => {
  return remainingRouter[v].path;
});

/** 创建路由实例 */
export const router: Router = createRouter({
  history: getHistoryMode(import.meta.env.VITE_ROUTER_HISTORY), // 获取历史模式
  routes: constantRoutes.concat(...(remainingRouter as any)), // 合并静态路由和剩余路由
  strict: true, // 严格模式
  scrollBehavior(to, from, savedPosition) {
    return new Promise(resolve => {
      if (savedPosition) {
        return savedPosition; // 返回保存的滚动位置
      } else {
        if (from.meta.saveSrollTop) {
          const top: number =
            document.documentElement.scrollTop || document.body.scrollTop;
          resolve({ left: 0, top }); // 返回顶部位置
        }
      }
    });
  }
});

/** 重置路由 */
export function resetRouter() {
  router.getRoutes().forEach(route => {
    const { name, meta } = route;
    if (name && router.hasRoute(name) && meta?.backstage) {
      router.removeRoute(name); // 移除后台路由
      router.options.routes = formatTwoStageRoutes(
        formatFlatteningRoutes(
          buildHierarchyTree(ascending(routes.flat(Infinity)))
        )
      );
    }
  });
  usePermissionStoreHook().clearAllCachePage(); // 清除所有缓存页面
}

/** 路由白名单 */
const whiteList = ["/login", "/sms-login"];

const { VITE_HIDE_HOME } = import.meta.env;

router.beforeEach((to: ToRouteType, _from, next) => {
  if (to.meta?.keepAlive) {
    handleAliveRoute(to, "add");
    // 页面整体刷新和点击标签页刷新
    if (_from.name === undefined || _from.name === "Redirect") {
      handleAliveRoute(to);
    }
  }
  const userInfo = storageLocal().getItem<DataInfo<number>>(userKey); // 获取用户信息
  NProgress.start(); // 开始进度条
  const externalLink = isUrl(to?.name as string); // 判断是否是外部链接
  if (!externalLink) {
    to.matched.some(item => {
      if (!item.meta.title) return "";
      const Title = getConfig().Title;
      if (Title)
        document.title = `${item.meta.title} | ${Title}`; // 设置页面标题
      else document.title = item.meta.title as string;
    });
  }
  /** 如果已经登录并存在登录信息后不能跳转到路由白名单，而是继续保持在当前页面 */
  function toCorrectRoute() {
    whiteList.includes(to.fullPath) ? next(_from.fullPath) : next();
  }
  if ((Cookies.get(multipleTabsKey) && userInfo) || Cookies.get("auth-code")) {
    // 无权限跳转403页面
    if (to.meta?.roles && !isOneOfArray(to.meta?.roles, userInfo?.roles)) {
      next({ path: "/error/403" });
    }
    // 开启隐藏首页后在浏览器地址栏手动输入首页welcome路由则跳转到404页面
    if (VITE_HIDE_HOME === "true" && to.fullPath === "/welcome") {
      next({ path: "/error/404" });
    }
    if (_from?.name) {
      // name为超链接
      if (externalLink) {
        openLink(to?.name as string); // 打开外部链接
        NProgress.done(); // 结束进度条
      } else {
        toCorrectRoute(); // 跳转到正确的路由
      }
    } else {
      // 刷新
      if (
        usePermissionStoreHook().wholeMenus.length === 0 &&
        to.path !== "/login"
      ) {
        initRouter().then((router: Router) => {
          if (!useMultiTagsStoreHook().getMultiTagsCache) {
            const { path } = to;
            const route = findRouteByPath(
              path,
              router.options.routes[0].children
            );
            getTopMenu(true);
            // query、params模式路由传参数的标签页不在此处处理
            if (route && route.meta?.title) {
              if (isAllEmpty(route.parentId) && route.meta?.backstage) {
                // 此处为动态顶级路由（目录）
                const { path, name, meta } = route.children[0];
                useMultiTagsStoreHook().handleTags("push", {
                  path,
                  name,
                  meta
                });
              } else {
                const { path, name, meta } = route;
                useMultiTagsStoreHook().handleTags("push", {
                  path,
                  name,
                  meta
                });
              }
            }
          }
          // 确保动态路由完全加入路由列表并且不影响静态路由（注意：动态路由刷新时 router.beforeEach 可能会触发两次，第一次触发动态路由还未完全添加，第二次动态路由才完全添加到路由列表，如果需要在 router.beforeEach 做一些判断可以在 to.name 存在的条件下去判断，这样就只会触发一次）
          if (isAllEmpty(to.name)) router.push(to.fullPath);
        });
      }
      toCorrectRoute(); // 跳转到正确的路由
    }
  } else {
    if (to.path !== "/login") {
      if (whiteList.indexOf(to.path) !== -1) {
        next(); // 允许访问白名单中的路径
      } else {
        removeToken(); // 移除 token
        next({ path: "/login" }); // 跳转到登录页
      }
    } else {
      next(); // 跳转到登录页
    }
  }
});

router.afterEach(() => {
  NProgress.done(); // 结束进度条
});

// console.log("✅ 当前已注册的路由路径：", router.getRoutes().map(r => r.path));
// console.log("✅ constantRoutes 内容：", constantRoutes);

export default router;
