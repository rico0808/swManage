import { Api, Post, useContext, Validate } from "@midwayjs/hooks";
import type { ApiConfig } from "@midwayjs/hooks";
import { CheckCookie, CheckPermission } from "@/api/middleware/middleware";
import { zID, zID_Status, zPage } from "@/api/utils/zod";
import { z } from "zod";
import { prisma } from "@/api/prisma";
import { onFaild, onResult } from "@/api/utils/tools";
import type { Context, OnPage, OnResult } from "@/types";
import type { Clients } from "@prisma/client";
import { ZodAddGoodsUser, ZodCreateUser } from "./schema";
import dayjs from "dayjs";
import { dealerSpend } from "@/api/services/DealerService";
import { toGB } from "@/api/utils/tools";
import { openGoodsService } from "@/api/services/GoodsService";

export const config: ApiConfig = {
  middleware: [CheckCookie, CheckPermission],
};

const Path = (code: string) => `/api/clients/${code}`;

export const ClientGetClients = Api(
  Post(Path("list")),
  Validate(zPage),
  async ({ pageSize, current }: z.infer<typeof zPage>): OnPage<Array<Clients>> => {
    const { session } = useContext<Context>();
    const { isAdmin, isDealer, userId: dealerId } = session;

    let where;
    if (isDealer) where = { dealerId };
    if (isAdmin) where = {};

    const [count, list] = await prisma.$transaction([
      prisma.clients.count({ where }),
      prisma.clients.findMany({
        where,
        orderBy: { id: "desc" },
        take: pageSize,
        skip: (current - 1) * pageSize,
      }),
    ]);

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
  async (data: z.infer<typeof ZodCreateUser>) => {
    const { session } = useContext<Context>();
    const { userId } = session;
    const { tb, source } = data;
    const hasClient = await prisma.clients.findFirst({
      where: { Users: { id: userId }, tb, source },
    });
    if (hasClient) throw new onFaild("该客户已存在");

    // 消费
    const { goods } = await dealerSpend({ goodsId: data.goods });

    // 用户赋值
    const { account, passwd, status } = data;
    const traffic = goods.traffic;
    const expireAt = dayjs().add(goods.days, "d").toDate();
    const client = await prisma.clients.create({
      data: { userId, source, tb, account, passwd, status, traffic, expireAt },
    });
    if (!client) throw new onFaild("添加客户失败，请重试");
    return client;
  }
);

export const ClientDeleteClient = Api(
  Post(Path("delete")),
  Validate(zID),
  async ({ id }: z.infer<typeof zID>): OnResult<boolean> => {
    const { session } = useContext<Context>();
    const { count } = await prisma.clients.deleteMany({
      where: { id, userId: session.userId },
    });
    if (count <= 0) throw new onFaild("删除失败，用户不存在");
    return onResult(true);
  }
);

export const ClientDisableClient = Api(
  Post(Path("disable")),
  Validate(zID_Status),
  async ({ id, status }: z.infer<typeof zID_Status>): OnResult<boolean> => {
    const { session } = useContext<Context>();
    const { count } = await prisma.clients.updateMany({
      where: { id, userId: session.userId },
      data: { status },
    });
    if (count <= 0) throw new onFaild("禁用客户失败，请重试");
    return onResult(true);
  }
);

export const ClientAddGoodsClient = Api(
  Post(Path("add_goods")),
  Validate(ZodAddGoodsUser),
  async (data: z.infer<typeof ZodAddGoodsUser>): OnResult<Clients> => {
    try {
      const client = await openGoodsService({
        clientId: data.id,
        goodsId: data.goods,
      });
      return onResult(client);
    } catch (error) {
      throw new onFaild(error.message);
    }
  }
);
