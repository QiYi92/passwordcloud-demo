<script setup lang="ts">
import { ref } from "vue";
import { formRules } from "./utils/rule";
import { FormProps } from "./utils/types";

const props = withDefaults(defineProps<FormProps>(), {
  isEdit: false,
  formInline: () => ({
    id: null,
    username: "",
    code: "",
    password: "", // 添加密码字段
    phone_number: "", // 添加电话号码字段
    confirmPassword: "", // 添加确认密码字段
    remark: ""
  })
});

const ruleFormRef = ref();
const newFormInline = ref(props.formInline);
const errorMessage = ref("");

function getRef() {
  return ruleFormRef.value;
}

// 验证两个密码是否一致并且包含英文字母和数字
const validatePassword = () => {
  if (props.isEdit) return true;
  const password = newFormInline.value.password;
  const confirmPassword = newFormInline.value.confirmPassword;

  // 验证密码长度是否在 8-18 位之间
  if (password.length < 8 || password.length > 18) {
    errorMessage.value = "密码长度必须在 8 到 18 位之间";
    return false;
  }

  // 验证密码是否包含字母和数字
  const hasLetterAndNumber = /^(?=.*[A-Za-z])(?=.*\d).{6,}$/.test(password);
  if (!hasLetterAndNumber) {
    errorMessage.value = "密码必须包含英文字母和数字，请重新确认";
    return false;
  }

  // 验证两个密码是否一致
  if (password !== confirmPassword) {
    errorMessage.value = "两次输入的密码不一致，请重新确认";
    return false;
  }

  errorMessage.value = ""; // 清空错误信息
  return true;
};

defineExpose({ getRef, validatePassword }); // 暴露方法供外部调用
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

    <el-form-item label="真实姓名" prop="real_name">
      <el-input
        v-model="newFormInline.real_name"
        clearable
        placeholder="请输入真实姓名"
      />
    </el-form-item>

    <el-form-item label="权限组" prop="code">
      <el-select
        v-model="newFormInline.code"
        clearable
        placeholder="请选择角色标识"
      >
        <el-option label="admin" value="admin" />
        <el-option label="common" value="common" />
      </el-select>
    </el-form-item>

    <el-form-item label="电话号码" prop="phone_number">
      <el-input
        v-model="newFormInline.phone_number"
        placeholder="请输入电话号码"
      />
    </el-form-item>

    <el-form-item v-if="!props.isEdit" label="密码" prop="password">
      <el-input
        v-model="newFormInline.password"
        type="password"
        clearable
        placeholder="请输入密码（必须同时包含字母和数字）"
      />
    </el-form-item>

    <el-form-item v-if="!props.isEdit" label="确认密码" prop="confirmPassword">
      <el-input
        v-model="newFormInline.confirmPassword"
        type="password"
        clearable
        placeholder="请再次输入密码（两次密码输入必须一致）"
      />
    </el-form-item>

    <el-form-item label="备注">
      <el-input
        v-model="newFormInline.remark"
        placeholder="请输入备注信息"
        type="textarea"
      />
    </el-form-item>

    <!-- 显示错误提示信息 -->
    <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
  </el-form>
</template>

<style scoped>
.error-message {
  margin-top: 10px;
  margin-bottom: 10px;
  color: red;
}
</style>
