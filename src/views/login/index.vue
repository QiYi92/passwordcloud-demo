<script setup lang="ts">
import axios from "axios";
import Motion from "./utils/motion";
import { useRouter } from "vue-router";
import { message } from "@/utils/message";
import { loginRules } from "./utils/rule";
import { useNav } from "@/layout/hooks/useNav";
import type { FormInstance } from "element-plus";
import { useLayout } from "@/layout/hooks/useLayout";
import { useUserStoreHook } from "@/store/modules/user";
import { initRouter, getTopMenu } from "@/router/utils";
import { bg, avatar, illustration } from "./utils/static";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { ref, reactive, toRaw, onMounted, onBeforeUnmount } from "vue";
import { useDataThemeChange } from "@/layout/hooks/useDataThemeChange";

import dayIcon from "@/assets/svg/day.svg?component";
import darkIcon from "@/assets/svg/dark.svg?component";
import Lock from "@iconify-icons/ri/lock-fill";
import User from "@iconify-icons/ri/user-3-fill";

defineOptions({
  name: "Login"
});

const router = useRouter();
const loading = ref(false);
const ruleFormRef = ref<FormInstance>();

const { initStorage } = useLayout();
initStorage();

const { dataTheme, dataThemeChange } = useDataThemeChange();
dataThemeChange();
const { title } = useNav();

const ruleForm = reactive({
  username: "",
  password: "",
  captcha: ""
});

const captchaSrc = ref("/api/captcha"); // 初始化验证码的 URL

const refreshCaptcha = () => {
  captchaSrc.value = `${import.meta.env.VITE_APP_SERVER}/api/captcha?${Date.now()}`;
};

onMounted(() => {
  refreshCaptcha(); // 页面加载时刷新验证码
});

const handleLoginSuccess = async () => {
  try {
    const routerInstance = await initRouter(); // 初始化路由
    console.log("Router instance after init:", routerInstance);
    const topMenu = getTopMenu(true); // 获取顶部菜单
    console.log("Top menu path:", topMenu?.path);
    if (topMenu && topMenu.path) {
      router.push(topMenu.path); // 跳转到顶部菜单路径
      message("登录成功", { type: "success" });
    } else {
      message("登录失败: 无法获取导航路径", { type: "error" });
    }
  } catch (error) {
    console.error("Login success handling error:", error);
    message("登录失败: 路由初始化错误", { type: "error" });
  }
};

const handleLoginError = (errorMessage: string) => {
  message("登录失败: " + errorMessage, { type: "error" });
  refreshCaptcha(); // 登录失败时刷新验证码
};

const onLogin = async (formEl: FormInstance | undefined) => {
  loading.value = true;
  if (!formEl) return;
  await formEl.validate(async valid => {
    if (valid) {
      useUserStoreHook()
        .loginByUsername({
          username: ruleForm.username,
          password: ruleForm.password
        })
        .then((res: { success: boolean; errorMessage?: string }) => {
          if (res.success) {
            initRouter().then(() => {
              const menu = getTopMenu(true);
              if (menu && menu.path) {
                router.push(menu.path);
                message("登录成功", { type: "success" });
              } else {
                message("登录失败: 无法获取导航路径", { type: "error" });
              }
            });
          } else {
            message("登录失败: " + res.errorMessage, { type: "error" });
          }
        });
    } else {
      loading.value = false;
    }
  });
};

const onkeypress = ({ code }: KeyboardEvent) => {
  if (code === "Enter") {
    onLogin(ruleFormRef.value);
  }
};

onMounted(() => {
  window.document.addEventListener("keypress", onkeypress);
  refreshCaptcha(); // 页面加载时刷新验证码
});

onBeforeUnmount(() => {
  window.document.removeEventListener("keypress", onkeypress);
});
</script>

<template>
  <div class="select-none">
    <img :src="bg" class="wave" />
    <div class="flex-c absolute right-5 top-3">
      <el-switch
        v-model="dataTheme"
        inline-prompt
        :active-icon="dayIcon"
        :inactive-icon="darkIcon"
        @change="dataThemeChange"
      />
    </div>
    <div class="login-container">
      <div class="img">
        <component :is="toRaw(illustration)" />
      </div>
      <div class="login-box">
        <div class="login-form">
          <avatar class="avatar" />
          <Motion>
            <h2 class="outline-none">{{ title }}</h2>
          </Motion>
          <el-form
            ref="ruleFormRef"
            :model="ruleForm"
            :rules="loginRules"
            size="large"
          >
            <Motion :delay="100">
              <el-form-item
                :rules="[
                  { required: true, message: '请输入账号', trigger: 'blur' }
                ]"
                prop="username"
              >
                <el-input
                  v-model="ruleForm.username"
                  clearable
                  placeholder="账号"
                  :prefix-icon="useRenderIcon(User)"
                />
              </el-form-item>
            </Motion>
            <Motion :delay="150">
              <el-form-item prop="password">
                <el-input
                  v-model="ruleForm.password"
                  clearable
                  show-password
                  placeholder="密码"
                  :prefix-icon="useRenderIcon(Lock)"
                />
              </el-form-item>
            </Motion>
            <Motion :delay="200">
              <el-form-item
                :rules="[
                  { required: true, message: '请输入校验码', trigger: 'blur' }
                ]"
                prop="captcha"
              >
                <el-input
                  v-model="ruleForm.captcha"
                  clearable
                  placeholder="校验码"
                />
                <img
                  :src="captchaSrc"
                  class="captcha-img"
                  alt="验证码"
                  @click="refreshCaptcha"
                />
              </el-form-item>
            </Motion>
            <Motion :delay="250">
              <el-button
                class="w-full mt-4"
                size="default"
                type="primary"
                :loading="loading"
                @click="onLogin(ruleFormRef)"
              >
                登录
              </el-button>
            </Motion>
          </el-form>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url("@/style/login.css");

.captcha-img {
  width: 100px;
  height: 40px;
  margin-left: 10px;
  cursor: pointer;
}
</style>
