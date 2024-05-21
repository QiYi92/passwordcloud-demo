// 虽然字段很少 但是抽离出来 后续有扩展字段需求就很方便了

interface FormItemProps {
  id: string;
  /** 用户名 */
  username: string; // 修改为 username
  /** 用户标识 */
  code: string;
  password: string;
  /** 备注 */
  remark: string;
}
interface FormProps {
  formInline: FormItemProps;
}

export type { FormItemProps, FormProps };
