<script setup lang="ts">
import Motion from "./utils/motion"; // 导入动画组件
import { useRouter } from "vue-router"; // 导入 vue-router 的 useRouter 钩子
import axios from "axios"; // 导入 axios 库，用于发送 HTTP 请求
import { message } from "@/utils/message"; // 导入自定义消息提示工具
import { loginRules } from "./utils/rule"; // 导入登录表单验证规则
import { useNav } from "@/layout/hooks/useNav"; // 导入导航相关的钩子
import type { FormInstance } from "element-plus"; // 导入 Element Plus 中的表单实例类型
import { useLayout } from "@/layout/hooks/useLayout"; // 导入布局相关的钩子
import { useUserStoreHook } from "@/store/modules/user"; // 导入用户存储相关的钩子
import { initRouter, getTopMenu } from "@/router/utils"; // 导入路由初始化和获取顶部菜单的函数
import { bg, avatar, illustration } from "./utils/static"; // 导入静态资源
import { useRenderIcon } from "@/components/ReIcon/src/hooks"; // 导入图标渲染钩子
import { ref, reactive, toRaw, onMounted, onBeforeUnmount } from "vue"; // 导入 Vue 的相关函数
import { useDataThemeChange } from "@/layout/hooks/useDataThemeChange"; // 导入主题切换相关的钩子

import dayIcon from "@/assets/svg/day.svg?component"; // 导入白天模式图标
import darkIcon from "@/assets/svg/dark.svg?component"; // 导入夜间模式图标
import Lock from "@iconify-icons/ri/lock-fill"; // 导入锁图标
import User from "@iconify-icons/ri/user-3-fill"; // 导入用户图标
import { storageLocal } from "@pureadmin/utils"; // 导入本地存储工具
import { userKey, DataInfo } from "@/utils/auth"; // 导入用户键和数据类型
import Cookies from "js-cookie"; // 导入 js-cookie 库
defineOptions({
  name: "Login" // 定义组件名称
});

const router = useRouter(); // 获取路由实例
const loading = ref(false); // 定义加载状态
const ruleFormRef = ref<FormInstance>(); // 定义表单实例的引用

const { initStorage } = useLayout(); // 获取初始化存储函数
initStorage(); // 调用初始化存储函数

const { dataTheme, dataThemeChange } = useDataThemeChange(); // 获取主题相关的数据和函数
dataThemeChange(); // 调用主题切换函数
const { title } = useNav(); // 获取导航标题

const ruleForm = reactive({
  username: "", // 定义用户名默认值
  password: "", // 定义密码默认值
  captcha: "" // 定义验证码默认值
});

const captchaUrl = ref(`${import.meta.env.VITE_APP_SERVER}/api/captcha`); // 定义验证码 URL

// 重新加载验证码
const reloadCaptcha = () => {
  captchaUrl.value = `${import.meta.env.VITE_APP_SERVER}/api/captcha?${Date.now()}`; // 重新设置验证码 URL，添加时间戳以避免缓存
};

// 登录函数
const onLogin = async (formEl: FormInstance | undefined) => {
  loading.value = true; // 设置加载状态为 true
  if (!formEl) return; // 如果表单实例不存在，直接返回

  await formEl.validate(async valid => {
    // 验证表单
    if (valid) {
      // 如果表单验证通过
      const requestData = {
        username: ruleForm.username, // 获取用户名
        password: ruleForm.password, // 获取密码
        captcha: ruleForm.captcha // 获取验证码
      };

      try {
        const res = await axios.post(
          `${import.meta.env.VITE_APP_SERVER}/api/login`,
          requestData,
          {
            withCredentials: true // 确保请求携带 cookie
          }
        );

        if (res.data.success) {
          // 如果登录成功
          const { id, username, code, roles } = res.data.data; // 从响应中获取所需的数据
          console.log("Response data:", { id, username, code, roles }); // 打印响应数据

          if (roles) {
            storageLocal().setItem(userKey, { roles }); // 存储用户角色信息
            console.log("Stored roles in local storage:", roles); // 打印存储的角色信息
          }
          if (code) {
            const userInfo = { roles: [code], id, username }; // 创建用户信息对象
            storageLocal().setItem(userKey, userInfo); // 存储用户信息
            Cookies.set("auth-code", code); // 存储认证码
          }
          initRouter().then(() => {
            const menu = getTopMenu(true); // 获取顶部菜单
            if (menu && menu.path) {
              console.log("Redirecting to:", menu.path); // 打印跳转路径
              router.push({ path: menu.path }); // 跳转到菜单路径
              message("登录成功", { type: "success" }); // 显示登录成功消息
            } else {
              message("登录失败: 无法获取导航路径", { type: "error" }); // 显示登录失败消息
            }
          });
        } else {
          message("登录失败: " + res.data.message, { type: "error" }); // 显示登录失败消息
          reloadCaptcha(); // 登录失败时重新加载验证码
        }
      } catch (error) {
        if (error.response) {
          message("登录失败: " + error.response.data.message, {
            type: "error"
          }); // 显示登录失败消息
        } else {
          message("登录失败: " + error.message, { type: "error" }); // 显示登录失败消息
        }
        reloadCaptcha(); // 请求出错时重新加载验证码
      } finally {
        loading.value = false; // 重置加载状态
      }
    } else {
      loading.value = false; // 如果表单验证失败，重置加载状态
    }
  });
};

function onkeypress({ code }: KeyboardEvent) {
  // 处理键盘事件
  if (code === "Enter") {
    // 如果按下回车键
    onLogin(ruleFormRef.value); // 调用登录函数
  }
}

onMounted(() => {
  // 组件挂载时
  window.document.addEventListener("keypress", onkeypress); // 添加键盘事件监听
});

onBeforeUnmount(() => {
  // 组件卸载前
  window.document.removeEventListener("keypress", onkeypress); // 移除键盘事件监听
});
</script>

<template>
  <div class="select-none">
    <img :src="bg" class="wave" />
    <!-- 背景图 -->
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
        <!-- 插图 -->
      </div>
      <div class="login-box">
        <div class="login-form">
          <avatar class="avatar" />
          <!-- 头像 -->
          <Motion>
            <h2 class="outline-none">{{ title }}</h2>
            <!-- 标题 -->
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
                  {
                    required: true,
                    message: '请输入账号',
                    trigger: 'blur'
                  }
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
              <el-form-item
                :rules="[
                  {
                    required: true,
                    message: '请输入密码',
                    trigger: 'blur'
                  }
                ]"
                prop="password"
              >
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
                  {
                    required: true,
                    message: '请输入验证码',
                    trigger: 'blur'
                  }
                ]"
                prop="captcha"
              >
                <el-input
                  v-model="ruleForm.captcha"
                  clearable
                  placeholder="验证码"
                />
                <img
                  :src="captchaUrl"
                  class="captcha-img"
                  @click="reloadCaptcha"
                />
                <!-- 验证码图片 -->
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
  height: 40px; /* 验证码图片高度 */
  vertical-align: middle; /* 垂直对齐方式 */
  cursor: pointer; /* 指针悬停在图片上时显示手型光标 */
}
</style>

<style lang="scss" scoped>
:deep(.el-input-group__append, .el-input-group__prepend) {
  padding: 0;
}
</style>
