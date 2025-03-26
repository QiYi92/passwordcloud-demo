<script setup lang="ts">
import Motion from "./utils/motion"; // 动画组件
import { useRouter } from "vue-router"; // vue-router
import axios from "axios"; // 用于发送 HTTP 请求
import { message } from "@/utils/message"; // 消息提示工具
import { ref, reactive, onMounted } from "vue"; // Vue 的相关钩子
import { useDataThemeChange } from "@/layout/hooks/useDataThemeChange"; // 主题切换相关的钩子
import dayIcon from "@/assets/svg/day.svg?component"; // 白天模式图标
import darkIcon from "@/assets/svg/dark.svg?component";
import { illustration } from "@/views/login/utils/static";
import { storageLocal } from "@pureadmin/utils";
import Cookies from "js-cookie";
import { userKey } from "@/utils/auth";
import { getTopMenu, initRouter } from "@/router/utils"; // 夜间模式图标
import { reportLogin } from "@/views/login/utils/reportLogin"; // 导入日志记录工具

const router = useRouter();
const loading = ref(false); // 加载状态
const phoneNumber = ref(""); // 手机号输入框
const smsCode = ref(""); // 短信验证码
const sendButtonText = ref("发送验证码"); // 发送验证码按钮文字
const isSending = ref(false); // 控制发送按钮是否处于发送状态
const isCodeSent = ref(false); // 控制验证码是否已发送
const countdown = ref(0); // 倒计时
const countdownTimer = ref(null); // 倒计时定时器

const { dataTheme, dataThemeChange } = useDataThemeChange();
dataThemeChange();

// 发送短信验证码
const sendSmsCode = async () => {
  if (isSending.value) return; // 防止重复点击
  isSending.value = true;
  sendButtonText.value = "发送中...";

  try {
    // 调用后端接口发送验证码
    const res = await axios.post(
      `${import.meta.env.VITE_APP_SERVER}/api/send-sms-code`,
      { phone: phoneNumber.value }
    );

    if (res.data.success) {
      isCodeSent.value = true;
      message("验证码已发送", { type: "success" });

      // 开始倒计时逻辑...
      countdown.value = 10;
      countdownTimer.value = setInterval(() => {
        if (countdown.value > 0) {
          countdown.value--;
          sendButtonText.value = `${countdown.value} 秒后重新发送`;
        } else {
          clearInterval(countdownTimer.value);
          sendButtonText.value = "重新发送";
          isCodeSent.value = false;
        }
      }, 1000);
    }
  } catch (error) {
    if (error.response && error.response.status === 404) {
      message("手机号不存在", { type: "error" });
    } else {
      message("发送失败，请稍后再试", { type: "error" });
    }
  } finally {
    isSending.value = false;
  }
};

// 验证短信验证码
const onSmsLogin = async () => {
  if (!phoneNumber.value || !smsCode.value) {
    message("请输入手机号和验证码", { type: "error" });
    return;
  }

  loading.value = true;

  try {
    const res = await axios.post(
      `${import.meta.env.VITE_APP_SERVER}/api/sms-login`,
      {
        phone: phoneNumber.value,
        smsCode: smsCode.value
      }
    );

    if (res.data.success) {
      const { id, username, code, roles } = res.data.data; // 获取后端返回的用户信息
      console.log("用户信息:", { id, username, code });

      await reportLogin(username); // 调用日志记录

      if (roles) {
        storageLocal().setItem(userKey, { roles }); // 存储用户角色信息
        console.log("本地存储中存储的角色：", roles); // 打印存储的角色信息
      }

      // 存储用户信息
      if (code) {
        const userInfo = { roles: [code], id, username }; // 创建用户信息对象
        storageLocal().setItem(userKey, userInfo); // 存储用户信息到 localStorage
        Cookies.set("auth-code", code); // 存储认证码到 Cookies
      }

      // 初始化路由并跳转
      initRouter().then(() => {
        const menu = getTopMenu(true); // 获取顶部菜单
        if (menu && menu.path) {
          console.log("Redirecting to:", menu.path);
          router.push({ path: menu.path }); // 跳转到菜单路径
          message("登录成功", { type: "success" });
        } else {
          message("登录失败: 无法获取导航路径", { type: "error" });
        }
      });
    } else {
      message(res.data.message || "验证码错误", { type: "error" });
    }
  } catch (error) {
    if (error.response && error.response.status === 400) {
      message(error.response.data.message || "验证码错误", { type: "error" });
    } else {
      message("登录失败，请稍后再试", { type: "error" });
    }
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="select-none">
    <img src="@/assets/login/bg.png" class="wave" />
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
        <component :is="illustration" />
      </div>
      <div class="login-box">
        <div class="login-form">
          <Motion>
            <h2 class="outline-none">短信验证登录</h2>
          </Motion>

          <el-form size="large">
            <Motion :delay="100">
              <el-form-item label="手机号" prop="phone">
                <el-input
                  v-model="phoneNumber"
                  clearable
                  placeholder="请输入手机号"
                />
              </el-form-item>
            </Motion>

            <Motion :delay="150">
              <el-form-item label="验证码" prop="smsCode">
                <el-input
                  v-model="smsCode"
                  clearable
                  placeholder="请输入验证码"
                />
              </el-form-item>
            </Motion>

            <Motion :delay="200">
              <el-button
                class="w-full mt-4"
                type="primary"
                :loading="loading"
                @click="onSmsLogin"
              >
                登录
              </el-button>
            </Motion>

            <Motion :delay="250">
              <el-button
                class="w-full mt-2"
                :loading="isSending"
                :disabled="isCodeSent"
                @click="sendSmsCode"
              >
                {{ sendButtonText }}
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
  height: 40px;
  vertical-align: middle;
  cursor: pointer;
}
</style>

<style lang="scss" scoped>
:deep(.el-input-group__append, .el-input-group__prepend) {
  padding: 0;
}
</style>
