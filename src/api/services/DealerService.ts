import { Context } from "@/types";
import { useContext } from "@midwayjs/hooks";
import { prisma } from "@/api/prisma";
import { onFaild } from "@/api/utils/tools";
import { Goods, Users } from "@prisma/client";

export const dealerSpend = async ({
  goodsId,
}: {
  goodsId: number;
}): Promise<{ user: Users; goods: Goods }> => {
  const { session } = useContext<Context>();
  const user = await prisma.users.findUnique({ where: { id: session.userId } });
  const goods = await prisma.goods.findUnique({ where: { id: goodsId } });

  if (session.isDealer) {
    if (!goods || !goods.status) throw new onFaild("商品不存在或已下架");
    if (user.blance < goods.price) throw new onFaild("操作失败，账户余额不足");

    // 消费
    const res = await prisma.users.update({
      where: { id: user.id },
      data: { blance: { decrement: goods.price } },
    });
    if (!res) throw new onFaild("消费失败，请重试");

    // 添加记录
    await prisma.spendLog.create({
      data: {
        userId: user.id,
        type: 1,
        amount: goods.price,
        remark: `消费 ${goods.name}`,
      },
    });
  }

  return { user, goods };
};
