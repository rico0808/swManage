import { Applys } from "@/api/entity/Apply";
import { CheckCookie } from "@/api/middleware/middleware";
import { mApply } from "@/api/utils/model";
import { onFaild, onResult } from "@/api/utils/tools";
import { Context, OnResult } from "@/types";
import { Api, ApiConfig, Post, useContext, Validate } from "@midwayjs/hooks";
import _ from "lodash";
import { z } from "zod";
import { ZodJoinDealer } from "./schema";

export const config: ApiConfig = {
  middleware: [CheckCookie],
};

const Path = (code: string) => `/api/dashboard/${code}`;

// 获取分销状态
export const GetJionDealer = Api(
  Post(Path("join_status")),
  async (): OnResult<Applys> => {
    const { session } = useContext<Context>();
    const apply = await mApply().findOne({
      where: { userId: session.userId },
      order: { id: "DESC" },
    });
    return onResult(apply);
  }
);

// 加入分销
export const UserJionDealer = Api(
  Post(Path("join_dealer")),
  Validate(ZodJoinDealer),
  async ({ url, business }: z.infer<typeof ZodJoinDealer>): OnResult<Applys> => {
    const { session } = useContext<Context>();
    const { isAdmin, isDealer } = session;
    if (isAdmin) throw new onFaild("管理员无法加入分销");
    if (isDealer) throw new onFaild("您已经是分销商身份，无法再次加入");

    const model = new Applys();
    _.assign(model, { userId: session.userId, url, business, status: 1 });
    const apply = await mApply().save(model);
    if (!apply) throw new onFaild("加入分销失败，请重试", 500);
    return onResult(apply);
  }
);
