import { z } from "zod";

export const zPhone = (label = "手机号码") => {
  return z
    .string({ required_error: `请输入${label}` })
    .nonempty(`请输入${label}`)
    .regex(/^1[3456789]\d{9}$/, `${label}格式错误`);
};

export const zPasswd = (label = "密码") => {
  return z
    .string({ required_error: `请输入${label}` })
    .nonempty(`请输入${label}`);
};

export const zSmsCode = (label = "验证码") => {
  return z
    .string({ required_error: `请输入${label}` })
    .nonempty(`请输入${label}`);
};
