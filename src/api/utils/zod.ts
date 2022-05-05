import { z } from "zod";

export const zPhone = (label = "手机号码") => {
  return z
    .string({ required_error: `请输入${label}` })
    .nonempty(`请输入${label}`)
    .regex(/^1[3456789]\d{9}$/, `${label}格式错误`);
};

export const zNumber = (label = "数字") => {
  return z.number({ required_error: `请输入${label}` });
};

export const zString = (label = "文本") => {
  return z.string({ required_error: `请输入${label}` }).nonempty(`请输入${label}`);
};

export const zPage = z.object({
  pageSize: zNumber("分页大小"),
  current: zNumber("分页"),
});

export const zID = z.object({
  id: zNumber("主键ID"),
});
