import { Api, Post, useContext, Validate } from "@midwayjs/hooks";
import type { ApiConfig } from "@midwayjs/hooks";
import { CheckCookie, CheckPermission } from "@/api/middleware/middleware";
import { zID, zID_Status, zPage } from "@/api/utils/zod";
import { z } from "zod";
import { onFaild, onResult, To } from "@/api/utils/tools";
import type { Context, OnPage, OnResult } from "@/types";
import { ZodCoverGoods, ZodCreateUser } from "./schema";
import { toGB } from "@/api/utils/tools";
import { Clients } from "@/api/entity/Clients";
import { mClient, mSales } from "@/api/utils/model";
import _ from "lodash";
import dayjs from "dayjs";
import { Like } from "typeorm";
import { ServiceGoodsOpen } from "@/api/services/GoodsService";
import { Sales } from "@/api/entity/Sales";

export const config: ApiConfig = {
  middleware: [CheckCookie, CheckPermission],
};

const Path = (code: string) => `/api/clients/${code}`;

// 客户列表
export const ClientGetClients = Api(
  Post(Path("list")),
  Validate(zPage),
  async ({
    pageSize,
    current,
    keyword,
  }: z.infer<typeof zPage>): OnPage<Array<Clients>> => {
    const { session } = useContext<Context>();
    const userId = session.isAdmin ? null : session.userId;
    const [list, count] = await mClient().findAndCount({
      where: [
        { userId, tb: Like(`%${keyword}%`) },
        { userId, account: Like(`%${keyword}%`) },
      ],
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

// 创建客户
export const ClientCreateClient = Api(
  Post(Path("create")),
  Validate(ZodCreateUser),
  async (data: z.infer<typeof ZodCreateUser>): OnResult<Clients> => {
    const { session } = useContext<Context>();
    const { userId } = session;
    const { tb, source, account, passwd } = data;

    const hasClient = await mClient().findOneBy({ userId, tb, source });
    if (hasClient) throw new onFaild("该客户已存在");

    const model = new Clients();
    _.assign(model, {
      userId,
      tb,
      source,
      account,
      passwd,
      expireAt: dayjs().toDate(),
    });
    const client = await mClient().save(model);
    return onResult(client);
  }
);

// 删除客户
export const ClientDeleteClient = Api(
  Post(Path("delete")),
  Validate(zID),
  async ({ id }: z.infer<typeof zID>): OnResult<Clients> => {
    const { session } = useContext<Context>();
    const client = await mClient().findOneBy({ id, userId: session.userId });
    const remove = await mClient().remove(client);
    if (!remove) throw new onFaild("删除客户失败，请重试", 500);
    return onResult(remove);
  }
);

// 禁用客户
export const ClientDisableClient = Api(
  Post(Path("disable")),
  Validate(zID_Status),
  async ({ id, status }: z.infer<typeof zID_Status>): OnResult<Clients> => {
    const { session } = useContext<Context>();
    const client = await mClient().findOneBy({ id, userId: session.userId });
    if (!client) throw new onFaild("客户不存在，禁用失败");
    client.status = status;
    const update = await mClient().save(client);
    if (!update) throw new onFaild("禁用客户失败，请重试", 500);
    return onResult(update);
  }
);

// 客户商品补单
export const ClientCoverGoods = Api(
  Post(Path("cover")),
  Validate(ZodCoverGoods),
  async (data: z.infer<typeof ZodCoverGoods>) => {
    const { session } = useContext<Context>();
    const { clientId, goodsId, source, orderNo, mask } = data;

    const sale = await mSales().findOneBy({ orderNo, source });
    if (sale) throw new onFaild("该来源订单号已存在，无法手动补单");

    const [err, [client, goods]] = await To(ServiceGoodsOpen({ clientId, goodsId }));
    if (err) throw new onFaild(err.message, err.status);

    const model = new Sales();
    _.assign(model, {
      userId: session.userId,
      clientId: client.id,
      source,
      orderNo,
      amount: goods.price,
      detail: JSON.stringify({}),
      remark: `手动补单 ${mask || ""}`,
      status: 1,
    });
    const sales = await mSales().save(model);
    if (!sales) throw new onFaild("消费记录写入失败，但补单已成功");
    return sales;
  }
);
