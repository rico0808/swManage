import { zString, zPhone } from "@/api/utils/zod";
import { z } from "zod";

export const ZodSendCode = z.object({
  phone: zPhone("登录手机号码"),
  type: z.number({ required_error: "错误的验证方式" }),
});

export const ZodRegister = z.object({
  phone: zPhone("登录手机号码"),
  passwd: zString("登录密码"),
  repasswd: zString("确认密码"),
  code: zString("手机验证码"),
  invite: z.string().nullish(),
});

export const ZodForget = z.object({
  phone: zPhone("登录手机号码"),
  passwd: zString("登录密码"),
  repasswd: zString("确认密码"),
  code: zString("手机验证码"),
});

export const ZodLogin = z.object({
  phone: zPhone("登录手机号码"),
  passwd: zString("登录密码"),
});
