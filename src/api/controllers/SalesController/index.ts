import { Sales } from "@/api/entity/Sales";
import { CheckCookie, CheckPermission } from "@/api/middleware/middleware";
import { mClient, mSales } from "@/api/utils/model";
import { onResult } from "@/api/utils/tools";
import { zPage } from "@/api/utils/zod";
import { Context, OnPage } from "@/types";
import { Api, ApiConfig, Post, useContext, Validate } from "@midwayjs/hooks";
import _ from "lodash";
import { z } from "zod";

export const config: ApiConfig = {
  middleware: [CheckCookie, CheckPermission],
};

const Path = (code: string) => `/api/sales/${code}`;

export const SaleGetSales = Api(
  Post(Path("list")),
  Validate(zPage),
  async ({ pageSize, current }: z.infer<typeof zPage>): OnPage<Sales[]> => {
    const { session } = useContext<Context>();
    const { userId, isAdmin } = session;
    const [list, count] = await mSales().findAndCount({
      where: { userId: isAdmin ? null : userId },
      order: { id: "DESC" },
      take: pageSize,
      skip: (current - 1) * pageSize,
    });

    for (let i = 0; i < list.length; i++) {
      const sale = list[i];
      const client = await mClient().findOneBy({ id: sale.clientId });
      sale["client"] = client?.account || "删除或注销";
    }

    return onResult({ list, count });
  }
);
