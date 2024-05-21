import dayjs from "dayjs";
import editForm from "../form.vue";
import { handleTree } from "@/utils/tree";
import { message } from "@/utils/message";
import { ElMessageBox } from "element-plus";
import { usePublicHooks } from "../../hooks";
import { addDialog } from "@/components/ReDialog";
import type { FormItemProps } from "../utils/types";
import type { PaginationProps } from "@pureadmin/table";
import { getKeyList, deviceDetection } from "@pureadmin/utils";
import {
  getUserList,
  getRoleMenu,
  getRoleMenuIds,
  updateUser,
  addUser,
  deleteUser
} from "@/api/system";
import { type Ref, reactive, ref, onMounted, h, toRaw, watch } from "vue";

export function useUser(treeRef: Ref) {
  const form = reactive({
    username: "",
    code: ""
  });
  const curRow = ref();
  const formRef = ref();
  const dataList = ref([]);
  const treeIds = ref([]);
  const treeData = ref([]);
  const isShow = ref(false);
  const loading = ref(true);
  const isLinkage = ref(false);
  const treeSearchValue = ref();
  const isExpandAll = ref(false);
  const isSelectAll = ref(false);
  const { switchStyle } = usePublicHooks();
  const treeProps = {
    value: "id",
    label: "title",
    children: "children"
  };
  const pagination = reactive<PaginationProps>({
    total: 0,
    pageSize: 10,
    currentPage: 1,
    background: true
  });
  const columns: TableColumnList = [
    {
      label: "用户编号",
      prop: "id"
    },
    {
      label: "用户名",
      prop: "username"
    },
    {
      label: "用户标识",
      prop: "code"
    },
    {
      label: "备注",
      prop: "remark",
      minWidth: 160
    },
    {
      label: "操作",
      fixed: "right",
      width: 210,
      slot: "operation"
    }
  ];

  function handleSizeChange(val: number) {
    console.log(`${val} items per page`);
  }

  function handleCurrentChange(val: number) {
    console.log(`current page: ${val}`);
  }

  function handleSelectionChange(val) {
    console.log("handleSelectionChange", val);
  }

  async function onSearch() {
    loading.value = true;
    try {
      const response = await getUserList(toRaw(form));
      console.log("API Response:", response);

      if (response && response.data) {
        dataList.value = response.data.list;
        pagination.total = response.data.total;
        pagination.pageSize = response.data.pageSize;
        pagination.currentPage = response.data.currentPage;
      } else {
        console.error("Unexpected API response format:", response);
      }
    } catch (error) {
      console.error("Error fetching user list:", error);
    } finally {
      setTimeout(() => {
        loading.value = false;
      }, 500);
    }
  }

  const resetForm = formEl => {
    if (!formEl) return;
    formEl.resetFields();
    onSearch();
  };

  function openDialog(title = "新增", row?: FormItemProps) {
    addDialog({
      title: `${title}用户`,
      props: {
        formInline: {
          id: row?.id ?? null,
          username: row?.username ?? "",
          code: row?.code ?? "",
          password: row?.password ?? "", // 添加密码字段
          remark: row?.remark ?? ""
        }
      },
      width: "40%",
      draggable: true,
      fullscreen: deviceDetection(),
      fullscreenIcon: true,
      closeOnClickModal: false,
      contentRenderer: () => h(editForm, { ref: formRef }),
      beforeSure: async (done, { options }) => {
        const FormRef = formRef.value.getRef();
        const curData = options.props.formInline as FormItemProps;
        async function chores() {
          message(`您${title}了用户名为${curData.username}的这条数据`, {
            type: "success"
          });
          done();
          onSearch();
        }
        FormRef.validate(async valid => {
          if (valid) {
            console.log("curData", curData);
            if (title === "新增") {
              try {
                const response = await addUser(curData); // 添加用户
                console.log("Add Response:", response);
                chores();
              } catch (error) {
                console.error("Error adding user:", error);
              }
            } else {
              try {
                const response = await updateUser(curData); // 更新用户
                console.log("Update Response:", response);
                chores();
              } catch (error) {
                console.error("Error updating user:", error);
              }
            }
          }
        });
      }
    });
  }

  async function handleMenu(row?: any) {
    const { id } = row;
    if (id) {
      curRow.value = row;
      isShow.value = true;
      const { data } = await getRoleMenuIds({ id });
      treeRef.value.setCheckedKeys(data);
    } else {
      curRow.value = null;
      isShow.value = false;
    }
  }

  function rowStyle({ row: { id } }) {
    return {
      cursor: "pointer",
      background: id === curRow.value?.id ? "var(--el-fill-color-light)" : ""
    };
  }

  function handleSave() {
    const { id, username } = curRow.value;
    console.log(id, treeRef.value.getCheckedKeys());
    message(`用户名为${username}的菜单权限修改成功`, {
      type: "success"
    });
  }

  function handleDelete(row) {
    ElMessageBox.confirm(
      `此操作将永久删除用户名为 ${row.username} 的用户, 是否继续?`,
      "提示",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }
    )
      .then(async () => {
        try {
          await deleteUser(row.id); // 调用删除用户的 API
          message(`您删除了用户名为${row.username}的这条数据`, {
            type: "success"
          });
          onSearch(); // 重新获取用户列表
        } catch (error) {
          console.error("Error deleting user:", error);
          message("删除用户失败", { type: "error" });
        }
      })
      .catch(() => {
        message("已取消删除", { type: "info" });
      });
  }

  const onQueryChanged = (query: string) => {
    treeRef.value!.filter(query);
  };

  onMounted(async () => {
    onSearch();
    const { data } = await getRoleMenu();
    treeIds.value = getKeyList(data, "id");
    treeData.value = handleTree(data);
  });

  watch(isExpandAll, val => {
    val
      ? treeRef.value.setExpandedKeys(treeIds.value)
      : treeRef.value.setExpandedKeys([]);
  });

  watch(isSelectAll, val => {
    val
      ? treeRef.value.setCheckedKeys(treeIds.value)
      : treeRef.value.setCheckedKeys([]);
  });

  return {
    form,
    isShow,
    curRow,
    loading,
    columns,
    rowStyle,
    dataList,
    treeData,
    treeProps,
    isLinkage,
    pagination,
    isExpandAll,
    isSelectAll,
    treeSearchValue,
    onSearch,
    resetForm,
    openDialog,
    handleMenu,
    handleSave,
    handleDelete,
    onQueryChanged,
    handleSizeChange,
    handleCurrentChange,
    handleSelectionChange
  };
}
