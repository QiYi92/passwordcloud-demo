// 虽然字段很少 但是抽离出来 后续有扩展字段需求就很方便了

interface FormItemProps {
  id: string;
  /** 用户名 */
  username: string;
  /** 真实姓名 */
  real_name?: string; // 新增字段
  /** 用户标识 */
  code: string;
  /** 手机号码 */
  phone_number?: string;
  /** 密码 */
  password: string;
  /** 确认密码 */
  confirmPassword?: string;
  /** 备注 */
  remark: string;
}

interface FormProps {
  formInline: FormItemProps;
  isEdit?: boolean; // 新增：是否编辑模式（编辑=不显示密码项）
}

export type { FormItemProps, FormProps };
