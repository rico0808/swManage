import type { FieldRule } from "@arco-design/web-vue";

export const LoginRules: Record<string, FieldRule> = {
  phone: { required: true, message: "请输入登录手机" },
  passwd: { required: true, message: "请输入登录密码" },
};

export const ForgetRules: Record<string, FieldRule> = {
  ...LoginRules,
  code: { required: true, message: "请输入手机验证码" },
  repasswd: { required: true, message: "请重复输入登录密码" },
};
export const RegisterRules = { ...ForgetRules };
