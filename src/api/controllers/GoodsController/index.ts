import { CheckCookie, CheckPermission, isAdmin } from "@/api/middleware/middleware";
import { prisma } from "@/api/prisma";
import { onFaild, onResult, toGB, toKB } from "@/api/utils/tools";
import { zID, zPage } from "@/api/utils/zod";
import { OnPage, OnResult } from "@/types";
import { Api, ApiConfig, Middleware, Post, Validate } from "@midwayjs/hooks";
import { Goods } from "@prisma/client";
import { z } from "zod";
import { ZodCreateGoods, ZodUpdateGoods } from "./schema";

export const config: ApiConfig = {
  middleware: [CheckCookie, CheckPermission],
};

const Path = (code: string) => `/api/goods/${code}`;

export const GoodsGetGoods = Api(
  Post(Path("list")),
  Validate(zPage),
  async ({ pageSize, current }: z.infer<typeof zPage>): OnPage<Array<Goods>> => {
    const [count, list] = await prisma.$transaction([
      prisma.goods.count(),
      prisma.goods.findMany({
        skip: (current - 1) * pageSize,
        take: pageSize,
        orderBy: { id: "desc" },
      }),
    ]);

    const mapList = list.map((item) => {
      item.traffic = toGB(item.traffic);
      return item;
    });

    return onResult({ count, list: mapList });
  }
);

export const GoodsCreateGoods = Api(
  Post(Path("create")),
  Validate(ZodCreateGoods),
  Middleware(isAdmin),
  async (data: z.infer<typeof ZodCreateGoods>): OnResult<Goods> => {
    const { name, sku, traffic, days, status, price } = data;
    const hasGoods = await prisma.goods.findUnique({ where: { sku } });
    if (hasGoods) throw new onFaild("SKU已存在，请更换其他SKU");
    const goods = await prisma.goods.create({
      data: { name, sku, traffic: toKB(traffic), price, days, status },
    });
    return onResult(goods);
  }
);

export const GoodsDeleteGoods = Api(
  Post(Path("delete")),
  Validate(zID),
  Middleware(isAdmin),
  async ({ id }: z.infer<typeof zID>): OnResult<Goods> => {
    const hasGoods = await prisma.goods.findUnique({ where: { id } });
    if (!hasGoods) throw new onFaild("删除失败，商品不存在");
    const goods = await prisma.goods.delete({ where: { id } });
    return onResult(goods);
  }
);

export const GoodsUpdateGoods = Api(
  Post(Path("update")),
  Validate(ZodUpdateGoods),
  Middleware(isAdmin),
  async (data: z.infer<typeof ZodUpdateGoods>): OnResult<Goods> => {
    const { name, traffic, days, status, price, id } = data;
    const hasGoods = await prisma.goods.findUnique({ where: { id } });
    if (!hasGoods) throw new onFaild("编辑失败，商品不存在");
    const goods = await prisma.goods.update({
      where: { id },
      data: { name, traffic: toKB(traffic), days, status, price },
    });
    return onResult(goods);
  }
);
