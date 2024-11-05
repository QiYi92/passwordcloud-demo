// role/api/userApi.ts
import { http } from "@/utils/http";

type Result = {
  success: boolean;
  data?: Array<any>;
};

type ResultTable = {
  success: boolean;
  data?: {
    /** 列表数据 */
    list: Array<any>;
    /** 总条目数 */
    total?: number;
    /** 每页显示条目个数 */
    pageSize?: number;
    /** 当前页数 */
    currentPage?: number;
  };
};

/** 获取系统管理-用户管理列表 */
export const getUserList = (data?: object) => {
  return http.request<ResultTable>(
    "post",
    import.meta.env.VITE_APP_SERVER + "/api/user",
    { data }
  );
};

/** 更新用户信息 */
export const updateUser = (data: object) => {
  return http.request<Result>(
    "put",
    import.meta.env.VITE_APP_SERVER + "/api/user",
    { data }
  );
};

/** 新增用户 */
export const addUser = (data: object) => {
  return http.request<Result>(
    "post",
    import.meta.env.VITE_APP_SERVER + "/api/user/add",
    { data }
  );
};

/** 删除用户 */
export const deleteUser = (id: number) => {
  return http.request<Result>(
    "delete",
    `${import.meta.env.VITE_APP_SERVER}/api/user/${id}`
  );
};
