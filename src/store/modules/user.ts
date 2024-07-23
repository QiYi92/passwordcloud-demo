import { defineStore } from "pinia";
import { store } from "@/store";
import type { userType } from "./types";
import { routerArrays } from "@/layout/types";
import { router, resetRouter } from "@/router";
import { storageLocal } from "@pureadmin/utils";
import { getLogin, refreshTokenApi } from "@/api/user";
import type { UserResult, RefreshTokenResult } from "@/api/user";
import { useMultiTagsStoreHook } from "@/store/modules/multiTags";
import { type DataInfo, setToken, removeToken, userKey } from "@/utils/auth";

export const useUserStore = defineStore({
  id: "pure-user",
  state: (): userType => ({
    // 用户名
    username: storageLocal().getItem<DataInfo<number>>(userKey)?.username ?? "",
    // 页面级别权限
    roles: storageLocal().getItem<DataInfo<number>>(userKey)?.roles ?? [],
    // 是否勾选了登录页的免登录
    isRemembered: false,
    // 登录页的免登录存储几天，默认7天
    loginDay: 7
  }),
  actions: {
    /** 存储用户名 */
    SET_USERNAME(username: string) {
      this.username = username;
    },
    /** 存储角色 */
    SET_ROLES(roles: Array<string>) {
      this.roles = roles;
    },
    /** 存储是否勾选了登录页的免登录 */
    SET_ISREMEMBERED(bool: boolean) {
      this.isRemembered = bool;
    },
    /** 设置登录页的免登录存储几天 */
    SET_LOGINDAY(value: number) {
      this.loginDay = Number(value);
    },
    /** 登入 */
    async loginByUsername(data) {
      return new Promise<UserResult>((resolve, reject) => {
        // 调用 getLogin 接口，传入用户数据
        getLogin(data)
          .then(data => {
            // 如果数据存在
            if (data) {
              // 设置 token
              setToken(data.data);
              // 解析并返回数据
              resolve(data);
            }
          })
          .catch(error => {
            // 如果接口调用失败，拒绝并返回错误
            reject(error);
          });
      });
    },
    /** 前端登出（不调用接口） */
    logOut() {
      // 清空用户名
      this.username = "";
      // 清空角色数组
      this.roles = [];
      // 移除 token
      removeToken();
      // 重置多标签状态
      useMultiTagsStoreHook().handleTags("equal", [...routerArrays]);
      // 重置路由
      resetRouter();
      // 跳转到登录页面
      router.push("/login");
    },
    /** 刷新`token` */
    async handRefreshToken(data) {
      return new Promise<RefreshTokenResult>((resolve, reject) => {
        // 调用 refreshTokenApi 接口，传入数据
        refreshTokenApi(data)
          .then(data => {
            // 如果数据存在
            if (data) {
              // 设置新的 token
              setToken(data.data);
              // 解析并返回数据
              resolve(data);
            }
          })
          .catch(error => {
            // 如果接口调用失败，拒绝并返回错误
            reject(error);
          });
      });
    }
  }
});

export function useUserStoreHook() {
  return useUserStore(store);
}
