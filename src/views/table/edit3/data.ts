const PaymentTypeOptions = [
  { value: "0", label: "其他" },
  { value: "1", label: "已支付并到账" },
  { value: "2", label: "已支付在财政" },
  { value: "3", label: "已支付中心流程中" }
];
const PaymentStateOptions = [
  { value: "0", label: "暂定" },
  { value: "1", label: "已支付" },
  { value: "2", label: "未支付" }
];

export { PaymentTypeOptions, PaymentStateOptions };
