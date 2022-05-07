import { Goods } from "@/api/entity/Goods";
import { CheckCookie, CheckPermission, isAdmin } from "@/api/middleware/middleware";
import { mGoods } from "@/api/utils/model";
import { onFaild, onResult, toGB, toKB } from "@/api/utils/tools";
import { zID, zPage } from "@/api/utils/zod";
import { OnPage, OnResult } from "@/types";
import { Api, ApiConfig, Middleware, Post, Validate } from "@midwayjs/hooks";
import _ from "lodash";
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
    const [list, count] = await mGoods().findAndCount({
      skip: (current - 1) * pageSize,
      take: pageSize,
      order: { id: "DESC" },
    });

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
    const hasGoods = await mGoods().findOneBy({ sku });
    if (hasGoods) throw new onFaild("SKU已存在，请更换其他SKU");

    const model = new Goods();
    _.assign(model, { name, sku, traffic: toKB(traffic), price, days, status });
    const goods = await mGoods().save(model);
    return onResult(goods);
  }
);

export const GoodsDeleteGoods = Api(
  Post(Path("delete")),
  Validate(zID),
  Middleware(isAdmin),
  async ({ id }: z.infer<typeof zID>): OnResult<Goods> => {
    const goods = await mGoods().findOneBy({ id });
    const remove = await mGoods().remove(goods);
    return onResult(remove);
  }
);

export const GoodsUpdateGoods = Api(
  Post(Path("update")),
  Validate(ZodUpdateGoods),
  Middleware(isAdmin),
  async (data: z.infer<typeof ZodUpdateGoods>): OnResult<any> => {
    const { name, traffic, days, status, price, id } = data;
    const goods = await mGoods().findOneBy({ id });
    if (!goods) throw new onFaild("编辑失败，商品不存在");

    _.assign(goods, { name, traffic: toKB(traffic), days, status, price });
    const update = await mGoods().save(goods);
    return onResult(update);
  }
);
