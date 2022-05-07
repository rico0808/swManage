import { Context } from "@/types";
import { useContext } from "@midwayjs/hooks";
import { Clients } from "@prisma/client";
import dayjs from "dayjs";
import { prisma } from "../prisma";

interface OpenGoods {
  clientId: number;
  goodsId: number;
}
export const openGoodsService = async ({
  clientId,
  goodsId,
}: OpenGoods): Promise<Clients> => {
  const { session } = useContext<Context>();
  return await prisma.$transaction(async (trans) => {
    const goods = await trans.goods.findFirst({ where: { status: 1, id: goodsId } });
    if (!goods) throw new Error("商品不存在或已下架");

    const client = await trans.clients.findFirst({
      where: {
        id: clientId,
        Users: { id: session.userId },
      },
    });

    const log = await prisma.spendLog.create({
      data: {
        Users: { connect: { id: session.userId } },
        amount: goods.price,
        type: 0,
        remark: `客户 ${client.account} 购买 ${goods.name}`,
      },
    });

    return await prisma.clients.update({
      where: { id: clientId },
      data: {
        traffic: client.traffic + goods.traffic,
        expireAt: dayjs(client.expireAt).add(goods.days, "d").toDate(),
        Users: { update: { blance: { decrement: goods.price } } },
      },
    });
  });
};
