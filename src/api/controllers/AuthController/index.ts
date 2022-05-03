import { Api, Post, Validate } from "@midwayjs/hooks";
import { sendCode } from "@/api/services/SmsService";
import { onFaild, onResult, RandomCode, RandomLetter } from "@/api/utils/tools";
import { z } from "zod";
import { ZodForget, ZodLogin, ZodRegister, ZodSendCode } from "./schema";
import { prisma } from "@/api/prisma";
import dayjs from "dayjs";
import { SHA256 } from "crypto-js";
import _ from "lodash";
import { Users } from "@prisma/client";

const Path = (code: string) => `/api/auth/${code}`;
// 登录
export const AuthUserLogin = Api(
  Post(Path("login")),
  Validate(ZodLogin),
  async ({ phone, passwd }: z.infer<typeof ZodLogin>): OnResult<Omit<Users, "passwd" | "slat">> => {
    const user = await prisma.users.findUnique({ where: { phone } });
    if (!user) throw new onFaild("该手机号码未注册");
    const slatPasswd = SHA256(`${user.slat}${passwd}${user.slat}`).toString();
    if (slatPasswd !== user.passwd) throw new onFaild("登录密码错误");
    return onResult(_.omit(user, ["passwd", "slat"]));
  }
);

// 注册
export const AuthUserRegister = Api(
  Post(Path("register")),
  Validate(ZodRegister),
  async ({
    phone,
    code,
    passwd,
    repasswd,
  }: z.infer<typeof ZodRegister>): OnResult<Omit<Users, "passwd" | "slat">> => {
    if (passwd !== repasswd) throw new onFaild("两次密码输入不一致");

    // 注册检测
    const hasUser = await prisma.users.findUnique({ where: { phone } });
    if (hasUser) throw new onFaild("该手机号码已注册");

    // 手机验证码
    const createAt = { gt: dayjs().subtract(5, "m").toDate() };
    const smsCode = await prisma.smsCode.findFirst({
      where: { phone, type: 1, createAt },
    });
    if (!smsCode) throw new onFaild("验证码已过期请重新获取");
    if (smsCode.code !== code) throw new onFaild("验证码错误，请重新输入");

    // 注册信息
    const slat = RandomLetter(6);
    const user = await prisma.users.create({
      data: {
        phone,
        passwd: SHA256(`${slat}${passwd}${slat}`).toString(),
        slat,
        invite: RandomLetter(6),
      },
    });
    if (!user) throw new onFaild("注册失败，请尝试重新注册");

    // 注册成功，删除验证码
    await prisma.smsCode.delete({ where: { id: smsCode.id } });
    return onResult(_.omit(user, ["passwd", "slat"]));
  }
);

// 发送验证码
export const AuthSendCode = Api(
  Post(Path("send_code")),
  Validate(ZodSendCode),
  async ({ phone, type }: z.infer<typeof ZodSendCode>): OnResult<boolean> => {
    // 发送类型限制
    if (type !== 1 && type !== 2) throw new onFaild("未受支持的发送类型");

    // 条件判断
    const user = await prisma.users.findUnique({ where: { phone } });
    if (type === 1 && user) throw new onFaild("该手机号码已注册");
    if (type === 2 && !user) throw new onFaild("该手机号码未注册");

    // 发送短信
    const code = RandomCode().toString();
    const { msg, status } = await sendCode({ phone, code, type });
    if (!status) throw new onFaild(msg);
    return onResult(true);
  }
);

// 注册
export const AuthUserForget = Api(
  Post(Path("forget")),
  Validate(ZodForget),
  async ({
    phone,
    code,
    passwd,
    repasswd,
  }: z.infer<typeof ZodForget>): OnResult<Omit<Users, "passwd" | "slat">> => {
    if (passwd !== repasswd) throw new onFaild("两次密码输入不一致");

    // 账号检测
    const hasUser = await prisma.users.findUnique({ where: { phone } });
    if (!hasUser) throw new onFaild("该手机号码未注册");

    // 手机验证码
    const createAt = { gt: dayjs().subtract(5, "m").toDate() };
    const smsCode = await prisma.smsCode.findFirst({
      where: { phone, type: 2, createAt },
    });
    if (!smsCode) throw new onFaild("验证码已过期请重新获取");
    if (smsCode.code !== code) throw new onFaild("验证码错误，请重新输入");

    // 密码更新
    const slat = RandomLetter(6);
    const user = await prisma.users.update({
      where: { phone },
      data: {
        passwd: SHA256(`${slat}${passwd}${slat}`).toString(),
        slat,
      },
    });
    if (!user) throw new onFaild("重置密码失败，请重新尝试");
    await prisma.smsCode.delete({ where: { id: smsCode.id } });
    return onResult(_.omit(user, ["passwd", "slat"]));
  }
);
