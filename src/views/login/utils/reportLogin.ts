// utils/reportLogin.ts
// 登录信息统计工具函数
import axios from "axios";

export async function reportLogin(username: string) {
  try {
    await axios.post(`${import.meta.env.VITE_APP_SERVER}/api/login/stats`, {
      username
    });
  } catch (error) {
    console.error("登录统计失败", error);
  }
}
