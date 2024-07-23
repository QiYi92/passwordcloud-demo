import Cookies from "js-cookie"; // 导入 js-cookie 库
import { storageLocal } from "@pureadmin/utils"; // 导入本地存储工具
import { useUserStoreHook } from "@/store/modules/user"; // 导入用户存储钩子

export interface DataInfo<T> {
  /** token */
  accessToken: string; // 访问 token
  /** `accessToken`的过期时间（时间戳） */
  expires: T; // token 过期时间
  /** 用于调用刷新 accessToken 的接口时所需的 token */
  refreshToken: string; // 刷新 token
  /** 用户名 */
  username?: string; // 用户名
  /** 当前登陆用户的角色 */
  roles?: Array<string>; // 用户角色
}

export const userKey = "user-info"; // 用户信息键
export const TokenKey = "authorized-token"; // 授权 token 键
export const multipleTabsKey = "multiple-tabs"; // 多标签键，用于判断用户是否已登录

/** 获取 token */
export function getToken(): DataInfo<number> {
  // 此处与 TokenKey 相同，此写法解决初始化时 Cookies 中不存在 TokenKey 报错
  return Cookies.get(TokenKey)
    ? JSON.parse(Cookies.get(TokenKey))
    : storageLocal().getItem(userKey);
}

/**
 * @description 设置 token 以及一些必要信息并采用无感刷新 token 方案
 * 无感刷新：后端返回 accessToken（访问接口使用的 token）、refreshToken（用于调用刷新 accessToken 的接口时所需的 token，refreshToken 的过期时间（比如 30 天）应大于 accessToken 的过期时间（比如 2 小时））、expires（accessToken 的过期时间）
 * 将 accessToken、expires 这两条信息放在 key 值为 authorized-token 的 cookie 里（过期自动销毁）
 * 将 username、roles、refreshToken、expires 这四条信息放在 key 值为 user-info 的 localStorage 里（利用 multipleTabsKey 当浏览器完全关闭后自动销毁）
 */
export function setToken(data: DataInfo<Date>) {
  let expires = 0;
  const { accessToken, refreshToken } = data;
  const { isRemembered, loginDay } = useUserStoreHook();
  expires = new Date(data.expires).getTime(); // 如果后端直接设置时间戳，将此处代码改为 expires = data.expires，然后把上面的 DataInfo<Date> 改成 DataInfo<number> 即可
  const cookieString = JSON.stringify({ accessToken, expires });

  expires > 0
    ? Cookies.set(TokenKey, cookieString, {
        expires: (expires - Date.now()) / 86400000
      })
    : Cookies.set(TokenKey, cookieString);

  Cookies.set(
    multipleTabsKey,
    "true",
    isRemembered
      ? {
          expires: loginDay
        }
      : {}
  );

  function setUserKey(username: string, roles: Array<string>) {
    useUserStoreHook().SET_USERNAME(username);
    useUserStoreHook().SET_ROLES(roles);
    storageLocal().setItem(userKey, {
      refreshToken,
      expires,
      username,
      roles
    });
  }

  if (data.username && data.roles) {
    const { username, roles } = data;
    setUserKey(username, roles);
  } else {
    const username =
      storageLocal().getItem<DataInfo<number>>(userKey)?.username ?? "";
    const roles =
      storageLocal().getItem<DataInfo<number>>(userKey)?.roles ?? [];
    setUserKey(username, roles);
  }
}

/** 删除 token 以及 key 值为 user-info 的 localStorage 信息 */
export function removeToken() {
  Cookies.remove(TokenKey);
  Cookies.remove(multipleTabsKey);
  Cookies.remove("auth-code");
  storageLocal().removeItem(userKey);
}

/** 格式化 token（jwt 格式） */
export const formatToken = (token: string): string => {
  return "Bearer " + token;
};
