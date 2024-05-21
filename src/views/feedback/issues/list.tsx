import Base from "./base.vue";
import Stripe from "./stripe.vue";
import Border from "./border.vue";
import Status from "./status.vue";
import FixHeader from "./fixHeader.vue";
import FixColumn from "./issues.vue";
import FluidHeight from "./fluidHeight.vue";
import GroupHeader from "./groupHeader.vue";
import Radio from "./radio.vue";
import MultipleChoice from "./multipleChoice.vue";
import Sortable from "./sortable.vue";
import Filters from "./filters.vue";
import ColumnTemplate from "./column-template/index.vue";
import HeaderRenderer from "./header-renderer/index.vue";
import Expand from "./expand.vue";
import TreeTable from "./tree.vue";
import TotalRow from "./totalRow.vue";
import Merge from "./merge.vue";
import CustomIndex from "./customIndex.vue";
import Layout from "./layout.vue";
import NestProp from "./nestProp.vue";
import ImgPreview from "./imgPreview.vue";

const rendContent = (val: string) => `${val}.vue`;

export const list = [
  {
    key: "fixColumnHeader",
    content: rendContent("fixColumn"),
    title: "问题反馈表",
    component: () => <FixColumn height={"360"} />
  }
];
