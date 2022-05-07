import { useConfig, useContext } from "@midwayjs/hooks";
import axios from "axios";
import { Context } from "@midwayjs/koa";
import { mSmsCode, mSmsLog } from "../utils/model";
import { MoreThan } from "typeorm";
import { SmsLog } from "../entity/SmsLog";
import _ from "lodash";
import { SmsCode } from "../entity/SmcCode";
import { GenExpire, onFaild } from "../utils/tools";

// 发送短信
type SendSMS = { phone: string; content: string };
const _SendSMS = async ({ phone, content }: SendSMS): Promise<boolean> => {
  const config = useConfig("sms");
  const res = await axios.get(
    `http://api.smsbao.com/sms?u=${config.user}&p=${config.api}&m=${phone}&c=${encodeURI(
      content
    )}`,
    { timeout: 8 * 1000 }
  );

  const model = new SmsLog();
  _.assign(model, { phone, content });
  await mSmsLog().save(model);

  return res.data == "0";
};

// 发送验证码
type SendCode = { phone: string; type: number; code: string };
export const ServiceSmsSendCode = async (data: SendCode): Promise<SmsCode> => {
  const { phone, type, code } = data;

  // 校验是否已经获取
  const isMinSend = await mSmsCode().findOne({
    where: { phone, createAt: MoreThan(GenExpire(1, "m")) },
  });
  if (isMinSend) throw new onFaild("获取验证码频繁，请1分钟后再试");

  // 校验同一IP是否频繁获取
  const { ip } = useContext<Context>();
  const IPCount = await mSmsCode().find({
    where: { ip, createAt: MoreThan(GenExpire(24, "h")) },
  });
  if (IPCount.length >= 10) throw new onFaild("获取验证过于频繁，请24小时后再试");
  const content = `【火山云服】您的验证码为${code}，验证码将在5分钟后失效。`;
  const res = await _SendSMS({ phone, content });
  if (!res) throw new onFaild("发送验证码失败", 500);

  const model = new SmsCode();
  _.assign(model, { phone, code, ip, type });
  return await mSmsCode().save(model);
};

// 验证码验证
export const ServiceSmsCheckCode = async (data: SendCode): Promise<SmsCode> => {
  const { phone, type, code } = data;

  const hasCode = await mSmsCode().findOne({
    where: { phone, type, createAt: MoreThan(GenExpire(5, "m")) },
    order: { id: "DESC" },
  });

  if (!hasCode) throw new onFaild("验证码已过期请重新获取");
  if (hasCode.code !== code) throw new onFaild("验证码错误，请重新输入");

  return hasCode;
};
