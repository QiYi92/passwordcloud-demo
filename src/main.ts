import { createApp, type Directive } from "vue";
import App from "./App.vue";
import router from "./router";
import { setupStore } from "@/store";
import { getPlatformConfig } from "./config";
import { MotionPlugin } from "@vueuse/motion";
import { useElementPlus } from "@/plugins/elementPlus";
import { injectResponsiveStorage } from "@/utils/responsive";
import Table from "@pureadmin/table";
import axios from "axios";

axios.defaults.withCredentials = true;

import "./style/reset.scss";
import "./style/index.scss";
import "./style/tailwind.css";
import "element-plus/dist/index.css";
import "./assets/iconfont/iconfont.js";
import "./assets/iconfont/iconfont.css";

// 禁用缓存的拦截器
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      console.warn("【全局 axios】检测到 401，执行统一登出流程");

      // 清除缓存（可省略，因为 logout 方法内已处理）
      // localStorage.removeItem("token");
      // sessionStorage.removeItem("user");

      // 弹出提示
      ElMessage.warning("登录已过期，请重新登录");

      // 延迟调用 logout，避免在中途冲突
      setTimeout(() => {
        import("@/store/modules/user").then(({ useUserStoreHook }) => {
          useUserStoreHook().logOut();
        });
      }, 300);
    }

    return Promise.reject(error);
  }
);

// 创建Vue应用实例
const app = createApp(App);

// 自定义指令注册
import * as directives from "@/directives";
Object.keys(directives).forEach(key => {
  app.directive(key, (directives as { [key: string]: Directive })[key]);
});

// 全局注册Iconify的离线图标组件
import IconifyIconOffline from "@/components/ReIcon/src/iconifyIconOffline";
app.component("IconifyIconOffline", IconifyIconOffline);

// 全局注册按钮级别权限组件
import { Auth } from "@/components/ReAuth";
app.component("Auth", Auth);

// 全局注册 vue-tippy，用于工具提示
import "tippy.js/dist/tippy.css";
import "tippy.js/themes/light.css";
import VueTippy from "vue-tippy";
import { ElMessage } from "element-plus";
app.use(VueTippy);

// 导入 echarts 库
import VueECharts from "vue-echarts";
import "echarts";
app.component("v-chart", VueECharts); // 注册 v-chart 组件

// 获取平台配置并进行初始化
getPlatformConfig(app).then(async config => {
  setupStore(app); // 设置全局状态管理
  app.use(router); // 使用路由
  await router.isReady(); // 等待路由准备好
  injectResponsiveStorage(app, config); // 注入响应式存储
  app.use(MotionPlugin).use(useElementPlus).use(Table); // 注册插件
  app.mount("#app"); // 挂载Vue应用
});
