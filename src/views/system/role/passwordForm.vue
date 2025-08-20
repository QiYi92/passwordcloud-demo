<script setup lang="ts">
import { ref } from "vue";
import type { FormInstance, FormRules } from "element-plus";

const props = defineProps<{
  userId: string | number;
  username: string;
}>();

const formRef = ref<FormInstance>();
const form = ref({
  oldPassword: "",
  newPassword: "",
  confirmPassword: ""
});

const rules: FormRules = {
  oldPassword: [{ required: true, message: "请输入旧密码", trigger: "blur" }],
  newPassword: [
    { required: true, message: "请输入新密码", trigger: "blur" },
    {
      validator: (_, val, cb) => {
        if (!val) return cb();
        // 8-18 位，必须包含字母和数字（可按你 login 的正则替换）
        const ok = /^(?=.*[A-Za-z])(?=.*\d)[^\s]{8,18}$/.test(val);
        ok ? cb() : cb(new Error("新密码需8-18位，且包含字母和数字"));
      },
      trigger: "blur"
    }
  ],
  confirmPassword: [
    { required: true, message: "请再次输入新密码", trigger: "blur" },
    {
      validator: (_, val, cb) => {
        if (!val) return cb();
        val === form.value.newPassword ? cb() : cb(new Error("两次密码不一致"));
      },
      trigger: "blur"
    }
  ]
};

function getRef() {
  return formRef.value;
}
function getData() {
  return {
    id: props.userId,
    old_password: form.value.oldPassword,
    new_password: form.value.newPassword
  };
}

defineExpose({ getRef, getData });
</script>

<template>
  <el-form ref="formRef" :model="form" :rules="rules" label-width="88px">
    <el-form-item label="用户名">
      <el-input :model-value="props.username" disabled />
    </el-form-item>
    <el-form-item label="旧密码" prop="oldPassword">
      <el-input v-model="form.oldPassword" type="password" show-password />
    </el-form-item>
    <el-form-item label="新密码" prop="newPassword">
      <el-input v-model="form.newPassword" type="password" show-password />
    </el-form-item>
    <el-form-item label="重复密码" prop="confirmPassword">
      <el-input v-model="form.confirmPassword" type="password" show-password />
    </el-form-item>
  </el-form>
</template>
