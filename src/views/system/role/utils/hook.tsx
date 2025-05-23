import dayjs from "dayjs"; // 引入日期处理库
import editForm from "../form.vue"; // 引入编辑表单组件
import { handleTree } from "@/utils/tree"; // 引入处理树形结构的工具函数
import { message } from "@/utils/message"; // 引入消息提示工具
import { ElMessageBox } from "element-plus"; // 引入 Element Plus 的消息确认框组件
import { usePublicHooks } from "../../hooks"; // 引入公共钩子
import { addDialog } from "@/components/ReDialog"; // 引入对话框组件
import type { FormItemProps } from "../utils/types"; // 引入表单项类型定义
import type { PaginationProps } from "@pureadmin/table"; // 引入分页类型定义
import { getKeyList, deviceDetection } from "@pureadmin/utils"; // 引入工具函数
import {
  getRoleMenu, // 获取角色菜单的 API
  getRoleMenuIds // 获取角色菜单 ID 的 API
} from "@/api/system"; // 引入系统 API

import {
  getUserList, // 获取用户列表的 API
  updateUser, // 更新用户的 API
  addUser, // 添加用户的 API
  deleteUser // 删除用户的 API
} from "../api/userApi"; // 更新为新的路径

import { type Ref, reactive, ref, onMounted, h, toRaw, watch } from "vue"; // 引入 Vue 相关的功能

/** 用户管理功能的钩子 */
export function useUser(treeRef: Ref) {
  const form = reactive({
    // 定义表单数据的响应式对象
    username: "",
    real_name: "",
    code: ""
  });

  const curRow = ref(); // 当前选中行的数据
  const formRef = ref(); // 表单引用
  const dataList = ref([]); // 用户列表数据
  const treeIds = ref([]); // 树形结构的 ID 列表
  const treeData = ref([]); // 树形结构的数据
  const isShow = ref(false); // 控制对话框显示与否
  const loading = ref(true); // 加载状态
  const isLinkage = ref(false); // 控制联动状态
  const treeSearchValue = ref(); // 树形搜索值
  const isExpandAll = ref(false); // 控制树形是否展开全部
  const isSelectAll = ref(false); // 控制树形是否全选
  const { switchStyle } = usePublicHooks(); // 使用公共钩子的样式切换功能

  // 定义树形结构的属性
  const treeProps = {
    value: "id",
    label: "title",
    children: "children"
  };

  const pagination = reactive<PaginationProps>({
    // 定义分页的响应式对象
    total: 0,
    pageSize: 10,
    currentPage: 1,
    background: true
  });

  // 定义表格列的结构
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
      label: "真实姓名",
      prop: "real_name", // 新增字段
      minWidth: 100
    },
    {
      label: "权限组",
      prop: "code"
    },
    {
      label: "电话号码",
      prop: "phone_number",
      minWidth: 80
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

  // 处理每页显示的条目数变化
  function handleSizeChange(val: number) {
    console.log(`${val} items per page`);
  }

  // 处理当前页码变化
  function handleCurrentChange(val: number) {
    console.log(`current page: ${val}`);
  }

  // 处理选择变化
  function handleSelectionChange(val) {
    console.log("handleSelectionChange", val);
  }

  // 搜索用户列表
  async function onSearch() {
    loading.value = true; // 开始加载
    try {
      const response = await getUserList(toRaw(form)); // 调用获取用户列表的 API
      console.log("API Response:", response);
      if (response && response.data) {
        dataList.value = response.data.list; // 更新用户列表
        pagination.total = response.data.total; // 更新总条目数
        pagination.pageSize = response.data.pageSize; // 更新每页条目数
        pagination.currentPage = response.data.currentPage; // 更新当前页码
      } else {
        console.error("Unexpected API response format:", response);
      }
    } catch (error) {
      console.error("Error fetching user list:", error);
    } finally {
      setTimeout(() => {
        loading.value = false; // 结束加载
      }, 500);
    }
  }

  // 重置表单
  const resetForm = formEl => {
    if (!formEl) return;
    formEl.resetFields(); // 重置表单字段
    onSearch(); // 重新搜索用户列表
  };

  // 打开新增或编辑用户的对话框
  function openDialog(title = "新增", row?: FormItemProps) {
    addDialog({
      title: `${title}用户`, // 对话框标题
      props: {
        formInline: {
          id: row?.id ?? null, // 用户 ID
          username: row?.username ?? "", // 用户名
          real_name: row?.real_name ?? "", // 真实姓名
          code: row?.code ?? "", // 用户标识
          password: row?.password ?? "", // 密码字段
          remark: row?.remark ?? "" // 备注
        }
      },
      width: "40%", // 对话框宽度
      draggable: true, // 可拖动
      fullscreen: deviceDetection(), // 根据设备检测全屏
      fullscreenIcon: true, // 全屏图标
      closeOnClickModal: false, // 点击遮罩不关闭对话框
      contentRenderer: () => h(editForm, { ref: formRef }), // 渲染编辑表单
      beforeSure: async (done, { options }) => {
        // 确认前的处理
        const FormRef = formRef.value.getRef(); // 获取表单引用
        const curData = options.props.formInline as FormItemProps; // 当前表单数据

        // 调用 validatePassword 方法进行校验
        const isPasswordValid = formRef.value.validatePassword();
        if (!isPasswordValid) {
          return; // 如果校验未通过，阻止表单提交
        }

        async function chores() {
          message(`您${title}了用户名为${curData.username}的这条数据`, {
            type: "success" // 提示成功信息
          });
          done(); // 完成对话框操作
          onSearch(); // 重新搜索用户列表
        }
        FormRef.validate(async valid => {
          // 验证表单
          if (valid) {
            console.log("curData", curData);
            if (title === "新增") {
              try {
                const response = await addUser(curData); // 添加用户
                console.log("Add Response:", response);
                chores(); // 处理成功后的操作
              } catch (error) {
                console.error("Error adding user:", error);
              }
            } else {
              try {
                const response = await updateUser(curData); // 更新用户
                console.log("Update Response:", response);
                chores(); // 处理成功后的操作
              } catch (error) {
                console.error("Error updating user:", error);
              }
            }
          }
        });
      }
    });
  }

  // 打开角色菜单的处理
  async function handleMenu(row?: any) {
    const { id } = row;
    if (id) {
      curRow.value = row; // 设置当前行数据
      isShow.value = true; // 显示对话框
      const { data } = await getRoleMenuIds({ id }); // 获取角色菜单 ID
      treeRef.value.setCheckedKeys(data); // 设置树形结构选中的节点
    } else {
      curRow.value = null; // 清空当前行数据
      isShow.value = false; // 隐藏对话框
    }
  }

  // 设置行样式
  function rowStyle({ row: { id } }) {
    return {
      cursor: "pointer", // 鼠标指针样式
      background: id === curRow.value?.id ? "var(--el-fill-color-light)" : "" // 高亮当前行
    };
  }

  // 保存菜单权限
  function handleSave() {
    const { id, username } = curRow.value; // 获取当前行数据
    console.log(id, treeRef.value.getCheckedKeys()); // 打印当前选中节点
    message(`用户名为${username}的菜单权限修改成功`, {
      type: "success" // 提示成功信息
    });
  }

  // 删除用户
  function handleDelete(row) {
    ElMessageBox.confirm(
      `此操作将永久删除用户名为 ${row.username} 的用户, 是否继续?`, // 删除确认提示
      "提示",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning" // 提示类型
      }
    )
      .then(async () => {
        try {
          await deleteUser(row.id); // 调用删除用户的 API
          message(`您删除了用户名为${row.username}的这条数据`, {
            type: "success" // 提示成功信息
          });
          onSearch(); // 重新获取用户列表
        } catch (error) {
          console.error("Error deleting user:", error);
          message("删除用户失败", { type: "error" }); // 提示错误信息
        }
      })
      .catch(() => {
        message("已取消删除", { type: "info" }); // 提示取消信息
      });
  }

  // 处理树形查询变化
  const onQueryChanged = (query: string) => {
    treeRef.value!.filter(query); // 过滤树形结构
  };

  // 组件挂载后执行
  onMounted(async () => {
    onSearch(); // 搜索用户列表
    const { data } = await getRoleMenu(); // 获取角色菜单数据
    treeIds.value = getKeyList(data, "id"); // 获取菜单 ID 列表
    treeData.value = handleTree(data); // 处理菜单树形结构
  });

  // 监视是否展开全部
  watch(isExpandAll, val => {
    val
      ? treeRef.value.setExpandedKeys(treeIds.value) // 展开全部节点
      : treeRef.value.setExpandedKeys([]); // 关闭所有节点
  });

  // 监视是否全选
  watch(isSelectAll, val => {
    val
      ? treeRef.value.setCheckedKeys(treeIds.value) // 选中全部节点
      : treeRef.value.setCheckedKeys([]); // 取消选中
  });

  // 返回钩子中的响应式数据和方法
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
