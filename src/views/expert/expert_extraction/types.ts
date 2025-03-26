// expert_extraction/types.ts

/** 单个专家 */
export interface Expert {
  expert_id: number;
  name: string;
  expertise_area: string;
  title: string;
  contact_info: string;
  work_unit: string;
  remarks: string;
}

/** 专业字段 */
export interface AreaOption {
  value: string;
  label: string;
}
