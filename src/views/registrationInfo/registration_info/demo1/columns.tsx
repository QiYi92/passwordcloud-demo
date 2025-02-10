import type {
  LoadingConfig,
  AdaptiveConfig,
  PaginationProps
} from "@pureadmin/table";
import {
  ref,
  onMounted,
  reactive,
  watch,
  type Ref,
  type UnwrapRef,
  computed
} from "vue";
import axios from "axios";
import { delay, clone } from "@pureadmin/utils";
import { message } from "@/utils/message";
import { CustomMouseMenu } from "@howdyjs/mouse-menu";
import dayjs from "dayjs";
import { RegistrationRoomOptions } from "@/views/registrationInfo/registration_info/data";

export function useColumns(departmentMap: Ref<UnwrapRef<{}>>) {
  const dataList = ref([]);
  const loading = ref(true);
  const searchField = ref("project_id");
  const searchQuery = ref("");
  const editRowData = ref(null);
  const deleteProjectId = ref(null);
  const editDialogVisible = ref(false);
  const deleteDialogVisible = ref(false);

  const getRegistrationRoomLabel = value => {
    const option = RegistrationRoomOptions.find(opt => opt.value === value);
    return option ? option.label : "未知";
  };

  const isDropdownSearch = computed(() => {
    return ["registration_department"].includes(searchField.value);
  });

  const currentOptions = computed(() => {
    if (searchField.value === "registration_department") {
      return RegistrationRoomOptions;
    }
    return [];
  });

  const columns: TableColumnList = [
    { label: "项目ID", prop: "project_id", width: 70 },
    { label: "项目名称", prop: "project_name", width: 200 },
    { label: "注册机构", prop: "registration_agency", width: 200 },
    { label: "联系方式", prop: "contact_info", width: 150 },
    { label: "注册科室", prop: "registration_department", width: 150 },
    {
      label: "有效期",
      prop: "validity_period",
      width: 150,
      formatter: row => dayjs(row.validity_period).format("YYYY年MM月DD日")
    },
    {
      label: "是否续费",
      prop: "is_renewable",
      width: 100,
      formatter: row => (row.is_renewable === 1 ? "是" : "否")
    },
    { label: "备注", prop: "remark", width: 300 },
    { label: "操作", width: 150, fixed: "right", slot: "operation" }
  ];

  const pagination = reactive<PaginationProps>({
    pageSize: 20,
    currentPage: 1,
    pageSizes: [20, 40, 60],
    total: 0,
    align: "right",
    background: true,
    small: false
  });

  const menuOptions = {
    menuList: [
      {
        label: ({ project_id }) => `项目ID：${project_id}`,
        disabled: true
      },
      {
        label: "修改",
        tips: "Edit",
        fn: async row => {
          editRowData.value = row;
          editDialogVisible.value = true;
        }
      },
      {
        label: "删除",
        tips: "Delete",
        fn: row => {
          deleteProjectId.value = row.project_id;
          deleteDialogVisible.value = true;
        }
      }
    ]
  };

  const loadingConfig = reactive<LoadingConfig>({
    text: "正在加载第一页...",
    viewBox: "-10, -10, 50, 50",
    spinner: `
        <path class="path" d="
          M 30 15
          L 28 17
          M 25.61 25.61
          A 15 15, 0, 0, 1, 15 30
          A 15 15, 0, 1, 1, 27.99 7.5
          L 15 15
        " style="stroke-width: 4px; fill: rgba(0, 0, 0, 0)"/>
      `
  });

  const adaptiveConfig: AdaptiveConfig = { offsetBottom: 110 };

  function showMouseMenu(row, column, event) {
    event.preventDefault();
    const { x, y } = event;
    CustomMouseMenu({
      el: event.currentTarget,
      params: row,
      menuWrapperCss: { background: "var(--el-bg-color)" },
      menuItemCss: {
        labelColor: "var(--el-text-color)",
        hoverLabelColor: "var(--el-color-primary)",
        hoverTipsColor: "var(--el-color-primary)"
      },
      ...menuOptions
    }).show(x, y);
  }

  function onSizeChange(val) {
    console.log("onSizeChange", val);
  }

  function onCurrentChange(val) {
    loadingConfig.text = `正在加载第${val}页...`;
    loading.value = true;
    delay(600).then(() => {
      loading.value = false;
    });
  }

  async function fetchData() {
    loading.value = true;
    try {
      const response = await axios.get(
        import.meta.env.VITE_APP_SERVER + "/api/registration-info"
      );
      dataList.value = response.data.map((item, index) => ({
        ...item,
        id: item.project_id || index,
        registration_department: getRegistrationRoomLabel(
          item.registration_department
        )
      }));
      pagination.total = dataList.value.length;
    } catch (error) {
      console.error("获取数据失败:", error);
    } finally {
      loading.value = false;
    }
  }

  const selectData = async () => {
    loading.value = true;
    try {
      const response = await axios.get(
        import.meta.env.VITE_APP_SERVER + "/api/registration-info"
      );

      dataList.value = clone(response.data, true)
        .filter(item => {
          if (searchQuery.value === "") return true;

          if (searchField.value === "registration_department") {
            return item.registration_department === searchQuery.value;
          }
          return (item[searchField.value] || "")
            .toString()
            .includes(searchQuery.value);
        })
        .map(item => ({
          ...item,
          registration_department: getRegistrationRoomLabel(
            item.registration_department
          )
        }));

      pagination.total = dataList.value.length;
    } catch (error) {
      console.error("搜索数据失败:", error);
    } finally {
      loading.value = false;
    }
  };

  watch([searchField, searchQuery], selectData, { deep: true });

  onMounted(async () => {
    await fetchData();
    if (searchField.value && searchQuery.value) {
      await selectData();
    }
  });

  return {
    loading,
    columns,
    dataList,
    pagination,
    loadingConfig,
    adaptiveConfig,
    onSizeChange,
    onCurrentChange,
    searchField,
    searchQuery,
    showMouseMenu,
    editDialogVisible,
    editRowData,
    deleteProjectId,
    deleteDialogVisible,
    fetchData
  };
}
