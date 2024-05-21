<script setup lang="ts">
import { ref } from "vue";
import { formRules } from "./utils/rule";
import { FormProps } from "./utils/types";

const props = withDefaults(defineProps<FormProps>(), {
  formInline: () => ({
    id: null,
    username: "",
    code: "",
    password: "", // 添加密码字段
    remark: ""
  })
});

const ruleFormRef = ref();
const newFormInline = ref(props.formInline);

function getRef() {
  return ruleFormRef.value;
}

defineExpose({ getRef });
</script>

<template>
  <el-form
    ref="ruleFormRef"
    :model="newFormInline"
    :rules="formRules"
    label-width="82px"
  >
    <el-form-item label="角色名称" prop="username">
      <el-input
        v-model="newFormInline.username"
        clearable
        placeholder="请输入角色名称"
      />
    </el-form-item>

    <el-form-item label="角色标识" prop="code">
      <el-select
        v-model="newFormInline.code"
        clearable
        placeholder="请选择角色标识"
      >
        <el-option label="admin" value="admin" />
        <el-option label="common" value="common" />
      </el-select>
    </el-form-item>

    <el-form-item label="密码" prop="password">
      <!-- 添加密码输入框 -->
      <el-input
        v-model="newFormInline.password"
        type="password"
        clearable
        placeholder="请输入密码"
      />
    </el-form-item>

    <el-form-item label="备注">
      <el-input
        v-model="newFormInline.remark"
        placeholder="请输入备注信息"
        type="textarea"
      />
    </el-form-item>
  </el-form>
</template>
