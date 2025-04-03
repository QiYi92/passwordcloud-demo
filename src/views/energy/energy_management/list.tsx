import Demo1 from "@/views/energy/energy_management/demo1/index.vue";
import Stat from "@/views/energy/energy_management/stat/index.vue"; // ✅ 新增

const rendContent = (val: string) =>
  `代码位置：src/views/energy/energy_management/${val}/index.vue`;

export const list = [
  {
    key: "demo1",
    content: rendContent("demo1"),
    title: "数据编辑",
    component: Demo1
  },
  {
    key: "stat",
    content: rendContent("stat"),
    title: "数据统计",
    component: Stat
  }
];
