const TypeOptions = [
  { value: "0", label: "BUG提交" },
  { value: "1", label: "新需求" },
  { value: "2", label: "功能完善" },
  { value: "3", label: "其他" }
];

const LevelOptions = [
  { value: "0", label: "常规" },
  { value: "1", label: "不急" },
  { value: "2", label: "紧急" },
  { value: "3", label: "特急" },
  { value: "4", label: "暂停" }
];

const CompletionOptions = [
  { value: "0", label: "待接收" },
  { value: "1", label: "已接收" },
  { value: "2", label: "已完成" },
  { value: "3", label: "不理解需求" },
  { value: "4", label: "开发中" }
];

export { TypeOptions, LevelOptions, CompletionOptions };
