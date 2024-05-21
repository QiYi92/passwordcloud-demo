import { reactive } from "vue";
import type { FormRules } from "element-plus";

/** 自定义表单规则校验 */
export const formRules = reactive(<FormRules>{
  username: [{ required: true, message: "用户名为必填项", trigger: "blur" }], // 修改为 username
  code: [{ required: true, message: "用户标识为必填项", trigger: "blur" }] // 修改提示信息
});
