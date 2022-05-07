import { Api, Post, useContext, Validate } from "@midwayjs/hooks";
import { ServiceSmsSendCode, ServiceSmsCheckCode } from "@/api/services/SmsService";
import { onFaild, onResult, RandomCode, RandomLetter, To } from "@/api/utils/tools";
import { z } from "zod";
import { ZodForget, ZodLogin, ZodRegister, ZodSendCode } from "./schema";
import dayjs from "dayjs";
import _ from "lodash";
import { Context } from "@midwayjs/koa";
import type { OnResult } from "@/types";
import { Users } from "@/api/entity/Users";
import { mSmsCode, mUser } from "@/api/utils/model";

const Path = (code: string) => `/api/auth/${code}`;
// 登录
export const AuthUserLogin = Api(
  Post(Path("login")),
  Validate(ZodLogin),
  async ({
    phone,
    passwd,
  }: z.infer<typeof ZodLogin>): OnResult<Omit<Users, "passwd">> => {
    // 信息认证
    const user = await mUser().findOneBy({ phone });
    if (!user) throw new onFaild("该手机号码未注册");
    if (passwd !== user.passwd) throw new onFaild("登录密码错误");

    // cookie 设置
    const ctx = useContext<Context>();
    const expires = dayjs().add(24, "h").toDate();
    const cookie = JSON.stringify({
      userId: user.id,
      status: user.status,
      role: user.role,
      expires,
    });
    ctx.cookies.set("token", cookie, { encrypt: true, expires });

    return onResult(_.omit(user, ["passwd"]));
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
  }: z.infer<typeof ZodRegister>): OnResult<Omit<Users, "passwd">> => {
    if (passwd !== repasswd) throw new onFaild("两次密码输入不一致");

    // 注册检测
    const hasUser = await mUser().findOneBy({ phone });
    if (hasUser) throw new onFaild("该手机号码已注册");

    // 手机验证码
    const [err, smsCode] = await To(ServiceSmsCheckCode({ phone, type: 1, code }));
    if (err) throw new onFaild(err.message, err.status);

    // 注册信息
    const model = new Users();
    _.assign(model, { phone, passwd, invite: RandomLetter(6) });
    const user = await mUser().save(model);
    if (!user) throw new onFaild("注册失败，请尝试重新注册");

    // 注册成功，删除验证码
    await mSmsCode().remove(smsCode);
    return onResult(_.omit(user, ["passwd"]));
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
    const user = await mUser().findOne({ where: { phone } });
    if (type === 1 && user) throw new onFaild("该手机号码已注册");
    if (type === 2 && !user) throw new onFaild("该手机号码未注册");

    // 发送短信
    const code = RandomCode().toString();
    const [err] = await To(ServiceSmsSendCode({ phone, code, type }));
    if (err) throw new onFaild(err.message, err.status);
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
    const user = await mUser().findOne({ where: { phone } });
    if (!user) throw new onFaild("该手机号码未注册");

    // 手机验证码
    const [err, smsCode] = await To(ServiceSmsCheckCode({ phone, type: 2, code }));
    if (err) throw new onFaild(err.message, err.status);

    // 密码更新
    user.passwd = passwd;
    const update = await mUser().save(user);
    if (!update) throw new onFaild("重置密码失败，请重新尝试");
    await mSmsCode().remove(smsCode);
    return onResult(_.omit(user, ["passwd"]));
  }
);
