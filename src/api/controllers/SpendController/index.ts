import { SpendLog } from "@/api/entity/SpendLog";
import { CheckCookie, CheckPermission } from "@/api/middleware/middleware";
import { mSpend } from "@/api/utils/model";
import { onResult } from "@/api/utils/tools";
import { zPage } from "@/api/utils/zod";
import { Context, OnPage } from "@/types";
import { Api, ApiConfig, Post, useContext, Validate } from "@midwayjs/hooks";
import _ from "lodash";
import { z } from "zod";

export const config: ApiConfig = {
  middleware: [CheckCookie, CheckPermission],
};

const Path = (code: string) => `/api/spend/${code}`;

// 收支记录
export const SpendGetSpend = Api(
  Post(Path("list")),
  Validate(zPage),
  async ({ pageSize, current }: z.infer<typeof zPage>): OnPage<SpendLog[]> => {
    const { session } = useContext<Context>();
    const { userId } = session;
    const [list, count] = await mSpend().findAndCount({
      where: { userId },
      order: { id: "DESC" },
      take: pageSize,
      skip: (current - 1) * pageSize,
    });

    return onResult({ list, count });
  }
);
