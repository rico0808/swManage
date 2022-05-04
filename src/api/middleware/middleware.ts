import { useContext, useLogger } from "@midwayjs/hooks";
import { Context } from "@midwayjs/koa";
import dayjs from "dayjs";
import { isNumber } from "lodash";
import { onFaild, onResult } from "@/api/utils/tools";
import type { Session } from "@/types";

// 统一错误处理
export const ErrorIntercept = async (next: Function) => {
  const ctx = useContext<Context>();
  const logger = useLogger();
  try {
    await next();
  } catch (error) {
    if (!error.status || !isNumber(error.status)) {
      ctx.status = 500;
      ctx.body = onResult(null, "远端服务器错误");
      logger.warn(error);
      return;
    }

    ctx.status = error.status;
    switch (ctx.status) {
      case 422:
        ctx.body = {
          list: error.cause.issues.map((item) => {
            return { path: item.path[1], msg: item.message };
          }),
        };
        break;

      case 401:
        ctx.body = onResult(null, "boy next door");
        break;

      default:
        ctx.body = onResult(null, error.message);
        break;
    }
  }
};

// cookie 检测
export const CheckCookie = async (next: Function) => {
  const ctx = useContext<Context>();
  const token = ctx.cookies.get("token", { encrypt: true });
  if (!token) throw new onFaild("boy ♂ next ♂ door", 401);
  const payload: Session = JSON.parse(token);

  // 判断cookie过期时间
  const time = dayjs().subtract(3, "h");
  if (dayjs(time).isBefore(dayjs(payload.expires))) {
    payload.expires = dayjs().add(24, "h").toDate();
    ctx.cookies.set("token", JSON.stringify(payload), {
      encrypt: true,
      expires: payload.expires,
    });
  }

  ctx.session = payload;
  await next();
};
