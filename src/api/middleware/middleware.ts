import { useContext, useLogger } from "@midwayjs/hooks";
import dayjs from "dayjs";
import _, { isNumber } from "lodash";
import { onFaild, onResult } from "@/api/utils/tools";
import type { Context, Session } from "@/types";

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

export const CheckPermission = async (next: Function) => {
  const { session } = useContext<Context>();
  const roles = ["admin", "dealer"];
  if (roles.includes(session.role)) {
    session.isAdmin = session.role === "admin";
    session.isDealer = session.role === "dealer";
    await next();
  } else {
    throw new onFaild("别点了，权限不足", 403);
  }
};

export const isDealer = async (next: Function) => {
  const { session } = useContext<Context>();
  if (_.isUndefined(session.isDealer)) await CheckCookie(next);
  if (session.isDealer) {
    await next();
  } else {
    throw new onFaild("您不是代理，无法操作", 403);
  }
};

export const isAdmin = async (next: Function) => {
  const { session } = useContext<Context>();
  if (_.isUndefined(session.isAdmin)) await CheckCookie(next);
  if (session.isAdmin) {
    await next();
  } else {
    throw new onFaild("只有尊贵的管理员才可以操作", 403);
  }
};
