import { zID, zNumber, zString } from "@/api/utils/zod";
import { z } from "zod";

const ZodBaseGoods = z.object({
  source: zString("客户来源渠道"),
  tb: zString("客户来源账号"),
  account: zString("客户用户名"),
  passwd: zString("客户密码"),
});

export const ZodCreateUser = ZodBaseGoods;

export const ZodCoverGoods = z.object({
  source: zString("客户来源渠道"),
  clientId: zNumber("客户"),
  goodsId: zNumber("商品"),
  orderNo: zString("来源订单号"),
  mask: z.string().nullish(),
});
