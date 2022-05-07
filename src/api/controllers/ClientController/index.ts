import { Api, Post, useContext, Validate } from "@midwayjs/hooks";
import type { ApiConfig } from "@midwayjs/hooks";
import { CheckCookie, CheckPermission } from "@/api/middleware/middleware";
import { zID, zID_Status, zPage } from "@/api/utils/zod";
import { z } from "zod";
import { onFaild, onResult, To } from "@/api/utils/tools";
import type { Context, OnPage, OnResult } from "@/types";
import { ZodAddGoodsUser, ZodCreateUser } from "./schema";
import { toGB } from "@/api/utils/tools";
import { Clients } from "@/api/entity/Clients";
import { mClient } from "@/api/utils/model";
import _ from "lodash";
import dayjs from "dayjs";
import { ServiceGoodsOpen } from "@/api/services/GoodsService";
export const config: ApiConfig = {
  middleware: [CheckCookie, CheckPermission],
};

const Path = (code: string) => `/api/clients/${code}`;

export const ClientGetClients = Api(
  Post(Path("list")),
  Validate(zPage),
  async ({ pageSize, current }: z.infer<typeof zPage>): OnPage<Array<Clients>> => {
    const { session } = useContext<Context>();
    const { isDealer, userId } = session;

    const [list, count] = await mClient().findAndCount({
      where: { userId: isDealer ? userId : null },
      order: { id: "DESC" },
      take: pageSize,
      skip: (current - 1) * pageSize,
    });

    const mapList = list.map((item) => {
      item.used = toGB(item.used);
      item.traffic = toGB(item.traffic);
      return item;
    });

    return onResult({ list: mapList, count });
  }
);

export const ClientCreateClient = Api(
  Post(Path("create")),
  Validate(ZodCreateUser),
  async (data: z.infer<typeof ZodCreateUser>): OnResult<Clients> => {
    const { session } = useContext<Context>();
    const { tb, source, account, passwd, status, goods: goodsId } = data;

    const hasClient = await mClient().findOneBy({
      userId: session.userId,
      tb,
      source,
    });
    if (hasClient) throw new onFaild("该客户已存在");

    const transaction = mClient().manager.transaction(async () => {
      const model = new Clients();
      _.assign(model, {
        userId: session.userId,
        tb,
        source,
        account,
        passwd,
        status,
        expireAt: dayjs().toDate(),
      });

      const [err, client] = await To(ServiceGoodsOpen({ goodsId, client: model }));
      if (err) throw new onFaild(err.message, err.status);
      return client;
    });

    const [err, client] = await To(transaction);
    if (err) throw new onFaild(err.message, err.status);

    return onResult(client);
  }
);

export const ClientDeleteClient = Api(
  Post(Path("delete")),
  Validate(zID),
  async ({ id }: z.infer<typeof zID>): OnResult<Clients> => {
    const { session } = useContext<Context>();
    const client = await mClient().findOneBy({ id, userId: session.userId });
    const remove = await mClient().remove(client);
    return onResult(remove);
  }
);

export const ClientDisableClient = Api(
  Post(Path("disable")),
  Validate(zID_Status),
  async ({ id, status }: z.infer<typeof zID_Status>): OnResult<Clients> => {
    const { session } = useContext<Context>();
    const client = await mClient().findOneBy({ id, userId: session.userId });
    if (!client) throw new onFaild("用户不存在，禁用失败");
    client.status = status;
    const update = await mClient().save(client);
    return onResult(update);
  }
);

export const ClientAddGoodsClient = Api(
  Post(Path("add_goods")),
  Validate(ZodAddGoodsUser),
  async (data: z.infer<typeof ZodAddGoodsUser>): OnResult<Clients> => {
    const { session } = useContext<Context>();
    const client = await mClient().findOneBy({ id: data.id, userId: session.userId });
    if (!client) throw new onFaild("添加商品失败，用户不存在");
    const [err, res] = await To(ServiceGoodsOpen({ client, goodsId: data.goods }));
    if (err) throw new onFaild(err.message, err.status);
    return onResult(res);
  }
);
