import { ref, onMounted, watch } from "vue";
import axios from "axios";
import { clone, delObjectProperty } from "@pureadmin/utils";
import { payStateOptions } from "@/views/table/edit3/data";

export function useColumns() {
  const editMap = ref({});
  const dataList = ref([]);
  const searchField = ref("pay_id"); // 默认搜索字段
  const searchQuery = ref("");

  const fetchData = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/payments");
      dataList.value = clone(response.data, true).filter(item =>
        (item[searchField.value] || "") // 使用空字符串作为默认值
          .toString()
          .toLowerCase()
          .includes(searchQuery.value.toLowerCase())
      );
    } catch (error) {
      console.error("Failed to fetch data:", error);
    }
  };
  onMounted(fetchData);
  watch([searchField, searchQuery], fetchData, { deep: true });

  const columns: TableColumnList = [
    // 定义表格列的配置
    {
      label: "支付id", // 列的标题
      prop: "pay_id", // 对应数据对象的属性名
      cellRenderer: (
        { row, index } // 自定义该列的单元格渲染函数
      ) => (
        <>
          {editMap.value[index]?.editable ? ( // 如果当前行处于编辑状态
            <el-input v-model={row.pay_id} /> // 渲染一个输入框,双向绑定该行的姓名数据
          ) : (
            <p>{row.pay_id}</p> // 否则渲染一个段落,显示姓名数据
          )}
        </>
      )
    },
    {
      label: "合同id", // 列的标题
      prop: "contract_id", // 对应数据对象的属性名
      cellRenderer: (
        { row, index } // 自定义该列的单元格渲染函数
      ) => (
        <>
          {editMap.value[index]?.editable ? ( // 如果当前行处于编辑状态
            <el-input v-model={row.contract_id} /> // 渲染一个输入框,双向绑定该行的姓名数据
          ) : (
            <p>{row.contract_id}</p> // 否则渲染一个段落,显示姓名数据
          )}
        </>
      )
    },
    {
      label: "支付金额", // 列的标题
      prop: "pay_money", // 对应数据对象的属性名
      cellRenderer: (
        { row, index } // 自定义该列的单元格渲染函数
      ) => (
        <>
          {editMap.value[index]?.editable ? ( // 如果当前行处于编辑状态
            <el-input v-model={row.pay_money} /> // 渲染一个输入框,双向绑定该行的姓名数据
          ) : (
            <p>{row.pay_money}</p> // 否则渲染一个段落,显示姓名数据
          )}
        </>
      )
    },
    {
      label: "支付日期", // 列的标题
      prop: "pay_time", // 对应数据对象的属性名
      cellRenderer: (
        { row, index } // 自定义该列的单元格渲染函数
      ) => (
        <>
          {editMap.value[index]?.editable ? ( // 如果当前行处于编辑状态
            <el-date-picker
              v-model={row.pay_time} // 双向绑定该行的日期数据
              type="date" // 日期选择器类型为日期
              format="YYYY/MM/DD" // 显示格式为 YYYY/MM/DD
              value-format="YYYY-MM-DD" // 存储格式为 YYYY-MM-DD
              placeholder="请选择日期" // 占位符
            />
          ) : (
            <p>{row.pay_time}</p> // 否则渲染一个段落,显示日期数据
          )}
        </>
      ),
      minWidth: 110 // 该列的最小宽度为 110 像素
    },
    {
      label: "支付状态",
      prop: "pay_state",
      cellRenderer: ({ row, index }) => (
        <>
          {editMap.value[index]?.editable ? (
            <el-select
              v-model={row.pay_state}
              clearable
              placeholder="选择状态"
              onChange={newVal => console.log(`支付状态变更为: ${newVal}`)} // 添加的onChange事件处理器
            >
              {payStateOptions.map(option => (
                <el-option
                  key={option.value}
                  label={option.label}
                  value={option.value}
                />
              ))}
            </el-select>
          ) : (
            <el-tag type="primary">
              {payStateOptions.find(opt => opt.value === row.pay_state)
                ?.label || "未知"}
            </el-tag>
          )}
        </>
      )
    },
    // {
    //   label: "性别",
    //   prop: "sex",
    //   cellRenderer: (
    //     { row, index } // 自定义该列的单元格渲染函数
    //   ) => (
    //     <>
    //       {editMap.value[index]?.editable ? ( // 如果当前行处于编辑状态
    //         <el-switch
    //           v-model={row.sex} // 双向绑定该行的性别数据
    //           inline-prompt
    //           active-value={0} // 0 代表男性
    //           inactive-value={1} // 1 代表女性
    //           active-text="男" // 激活状态(0)显示"男"
    //           inactive-text="女" // 非激活状态(1)显示"女"
    //         />
    //       ) : (
    //         <p>{row.sex === 0 ? "男" : "女"}</p> // 如果性别为 0,显示"男",否则显示"女"
    //       )}
    //     </>
    //   )
    // },
    // {
    //   label: "爱好", // 列的标题
    //   prop: "hobby", // 对应数据对象的属性名
    //   cellRenderer: (
    //     { row, index } // 自定义该列的单元格渲染函数
    //   ) => (
    //     <>
    //       {editMap.value[index]?.editable ? ( // 如果当前行处于编辑状态
    //         // 渲染一个选择框,双向绑定该行的爱好数据
    //         <el-select v-model={row.hobby} clearable placeholder="请选择爱好">
    //           {options.map(item => {
    //             // 遍历选项数据
    //             return (
    //               <el-option
    //                 key={item.value} // 选项的唯一键值
    //                 label={item.label} // 选项的显示标签
    //                 value={item.value} // 选项的值
    //               />
    //             );
    //           })}
    //         </el-select>
    //       ) : (
    //         // 如果不是编辑状态,显示一个主题标签
    //         // 找到对应的选项标签
    //         <el-tag type="primary">
    //           {options.filter(opt => opt.value == row.hobby)[0]?.label}
    //         </el-tag>
    //       )}
    //     </>
    //   )
    // },
    // {
    //   label: "日期", // 列的标题
    //   prop: "date", // 对应数据对象的属性名
    //   cellRenderer: (
    //     { row, index } // 自定义该列的单元格渲染函数
    //   ) => (
    //     <>
    //       {editMap.value[index]?.editable ? ( // 如果当前行处于编辑状态
    //         <el-date-picker
    //           v-model={row.date} // 双向绑定该行的日期数据
    //           type="date" // 日期选择器类型为日期
    //           format="YYYY/MM/DD" // 显示格式为 YYYY/MM/DD
    //           value-format="YYYY-MM-DD" // 存储格式为 YYYY-MM-DD
    //           placeholder="请选择日期" // 占位符
    //         />
    //       ) : (
    //         <p>{row.date}</p> // 否则渲染一个段落,显示日期数据
    //       )}
    //     </>
    //   ),
    //   minWidth: 110 // 该列的最小宽度为 110 像素
    // },
    {
      label: "操作", // 列的标题
      fixed: "right", // 该列固定在右侧
      slot: "operation" // 该列使用插槽渲染
    }
  ];

  function onEdit(row, index) {
    // 编辑该行数据的函数
    editMap.value[index] = Object.assign({ ...row, editable: true }); // 将该行数据标记为可编辑状态
  }

  function onSave(index) {
    const row = dataList.value[index];
    // 确保 pay_state 是字符串类型
    row.pay_state = String(row.pay_state);

    console.log("Sending data to server:", row); // 打印即将发送的数据

    axios
      .put(`http://localhost:3000/api/payments/${row.pay_id}`, row)
      .then(response => {
        console.log("更新成功", response.data);
        editMap.value[index].editable = false;
        dataList.value[index] = { ...row };
      })
      .catch(error => {
        console.error("数据更新失败:", error);
      });
  }

  function onCancel(index) {
    // 取消编辑的函数
    editMap.value[index].editable = false; // 将该行标记为不可编辑状态
    dataList.value[index] = delObjectProperty(editMap.value[index], "editable"); // 从编辑数据中删除 editable 属性,还原到原始数据
  }

  return {
    editMap,
    columns,
    dataList,
    onEdit,
    onSave,
    onCancel,
    searchField,
    searchQuery
  };
}
