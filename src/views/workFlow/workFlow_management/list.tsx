import Demo1 from "@/views/workFlow/workFlow_management/demo1/index.vue";

const rendContent = (val: string) =>
  `代码位置：src/views/workFlow/workFlow_management/${val}/index.vue`;

export const list = [
  {
    key: "demo1",
    content: rendContent("demo1"),
    title: "数据编辑",
    component: Demo1
  }
];
