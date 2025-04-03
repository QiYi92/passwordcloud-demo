import type {
  LoadingConfig,
  AdaptiveConfig,
  PaginationProps
} from "@pureadmin/table";
import { ref, onMounted, reactive, watch, type Ref } from "vue";
import { delay, clone } from "@pureadmin/utils";
import axios from "axios";
import { CustomMouseMenu } from "@howdyjs/mouse-menu";
import {
  DepartmentOptions,
  TypeOptions,
  StatusOptions
} from "@/views/borrowed_equipment/borrowed_equipment_register/data";

export function useColumns() {
  const dataList = ref([]);
  const loading = ref(true);
  const searchField = ref("equipment_name");
  const searchQuery = ref("");
  const editRowData = ref(null);
  const deleteId = ref(null);
  const editDialogVisible = ref(false);
  const deleteDialogVisible = ref(false);

  /** 字段值转 label */
  const getLabel = (options, value) => {
    const match = options.find(opt => opt.value === String(value));
    return match ? match.label : "未知";
  };

  const columns: TableColumnList = [
    { label: "设备名称", prop: "equipment_name", width: 200 },
    { label: "品牌型号", prop: "brand_model", width: 180 },
    { label: "数量", prop: "quantity", width: 80 },
    {
      label: "类型",
      prop: "equipment_type",
      width: 100
    },
    {
      label: "固定资产编号",
      prop: "asset_number",
      width: 160
    },
    {
      label: "价值（元）",
      prop: "equipment_value",
      width: 120
    },
    {
      label: "存放位置",
      prop: "storage_location",
      width: 150
    },
    {
      label: "状态",
      prop: "status",
      width: 100
    },
    {
      label: "责任科室",
      prop: "responsible_department",
      width: 150
    },
    {
      label: "联系人",
      prop: "contact_person",
      width: 120
    },
    {
      label: "电话",
      prop: "phone_number",
      width: 140
    },
    {
      label: "备注",
      prop: "remarks",
      width: 200
    },
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
        label: ({ equipment_name }) => `设备：${equipment_name}`,
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
          deleteId.value = row.id;
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

  /** 请求数据 + 转换 label */
  async function fetchData() {
    loading.value = true;
    try {
      const response = await axios.get(
        import.meta.env.VITE_APP_SERVER + "/api/borrowed-equipment"
      );
      dataList.value = response.data.map(item => ({
        ...item,
        equipment_type: getLabel(TypeOptions, item.equipment_type),
        status: getLabel(StatusOptions, item.status),
        responsible_department: getLabel(
          DepartmentOptions,
          item.responsible_department
        )
      }));
      pagination.total = dataList.value.length;
    } catch (error) {
      console.error("获取设备数据失败:", error);
    } finally {
      loading.value = false;
    }
  }

  const selectData = async () => {
    loading.value = true;
    try {
      const response = await axios.get(
        import.meta.env.VITE_APP_SERVER + "/api/borrowed-equipment"
      );
      const raw = clone(response.data, true);
      dataList.value = raw
        .filter(item =>
          (item[searchField.value] || "").toString().includes(searchQuery.value)
        )
        .map(item => ({
          ...item,
          equipment_type: getLabel(TypeOptions, item.equipment_type),
          status: getLabel(StatusOptions, item.status),
          responsible_department: getLabel(
            DepartmentOptions,
            item.responsible_department
          )
        }));
      pagination.total = dataList.value.length;
    } catch (error) {
      console.error("搜索失败:", error);
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
    deleteId,
    deleteDialogVisible,
    fetchData
  };
}
