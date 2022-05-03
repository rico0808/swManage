import { useConfig, useContext } from "@midwayjs/hooks";
import axios from "axios";
import { prisma } from "@/api/prisma";
import { Context } from "@midwayjs/koa";
import dayjs from "dayjs";

// 发送短信
type SendSMS = { phone: string; content: string };
const sendSms = async ({ phone, content }: SendSMS): Promise<boolean> => {
  const config = useConfig("sms");
  const res = await axios.get(
    `http://api.smsbao.com/sms?u=${config.user}&p=${
      config.api
    }&m=${phone}&c=${encodeURI(content)}`,
    { timeout: 8 * 1000 }
  );
  await prisma.smsSendLog.create({ data: { phone, content } });
  return res.data == "0";
};

// 发送验证码
type SendCode = { phone: string; type: number; code: string };
export const sendCode = async ({
  phone,
  type,
  code,
}: SendCode): Promise<{ msg: string; status: boolean }> => {
  // 校验是否已经获取
  const isMinSend = await prisma.smsCode.findFirst({
    where: { phone, createAt: { gt: dayjs().subtract(1, "m").toDate() } },
  });
  if (isMinSend) return { msg: "获取验证码频繁，请1分钟后再试", status: false };

  // 校验同一IP是否频繁获取
  const { ip } = useContext<Context>();
  const ipSendLog = await prisma.smsCode.findMany({
    where: { ip, createAt: { gt: dayjs().subtract(24, "h").toDate() } },
  });
  if (ipSendLog.length >= 10) {
    return { msg: "获取验证过于频繁，请24小时后再试", status: false };
  }

  const content = `【火山云服】您的验证码为${code}，验证码将在5分钟后失效。`;
  const res = await sendSms({ phone, content });
  await prisma.smsCode.create({ data: { phone, code, ip, type } });
  return res && { msg: "发送验证码成功", status: true };
};
