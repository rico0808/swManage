import { zNumber, zString } from "@/api/utils/zod";
import { z } from "zod";

export const ZodCreateGoods = z.object({
  name: zString("商品名称"),
  sku: zString("商品SKU"),
  traffic: zNumber("流量大小"),
  days: zNumber("有效天数"),
  price: zNumber("商品价格"),
  status: zNumber("商品状态"),
});
