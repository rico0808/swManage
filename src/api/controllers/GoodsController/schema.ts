import { zID, zNumber, zString } from "@/api/utils/zod";
import { z } from "zod";

const ZodBaseGoods = z.object({
  name: zString("商品名称"),
  traffic: zNumber("流量大小"),
  days: zNumber("有效天数"),
  price: zNumber("商品价格"),
  status: zNumber("商品状态"),
});

export const ZodCreateGoods = z.object({ sku: zString("商品SKU") }).merge(ZodBaseGoods);

export const ZodUpdateGoods = zID.merge(ZodBaseGoods);
