import { zID, zNumber, zString } from "@/api/utils/zod";
import { z } from "zod";

const ZodBaseGoods = z.object({
  source: zString("客户来源渠道"),
  tb: zString("客户来源账号"),
  account: zString("客户用户名"),
  passwd: zString("客户密码"),
  goods: zNumber("客户可用商品"),
  status: zNumber("客户状态"),
});

export const ZodCreateUser = ZodBaseGoods;

export const ZodUpdateUser = zID.merge(ZodBaseGoods);

export const ZodAddGoodsUser = z.object({
  id: zNumber("主键ID"),
  goods: zNumber("商品"),
});
