import Demo1 from "@/views/registrationInfo/registration_info/demo1/index.vue";

const rendContent = (val: string) =>
  `代码位置：src/views/registrationInfo/registration_info/${val}/index.vue`;

export const list = [
  {
    key: "demo1",
    content: rendContent("demo1"),
    title: "数据编辑",
    component: Demo1
  }
];
