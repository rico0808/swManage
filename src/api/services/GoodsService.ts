import { Context } from "@/types";
import { useContext } from "@midwayjs/hooks";
import dayjs from "dayjs";
import _ from "lodash";
import { Clients } from "../entity/Clients";
import { Goods } from "../entity/Goods";
import { SpendLog } from "../entity/SpendLog";
import { Users } from "../entity/Users";
import { mClient, mGoods, mUser } from "../utils/model";
import { onFaild, To } from "../utils/tools";

interface OpenGoods {
  clientId: number;
  goodsId: number;
  remark?: string;
}
export const ServiceGoodsOpen = async (data: OpenGoods): Promise<[Clients, Goods]> => {
  const { session } = useContext<Context>();
  const { clientId, goodsId } = data;

  const client = await mClient().findOneBy({ id: clientId, userId: session.userId });
  if (!client) throw new onFaild("客户不存在");

  const goods = await mGoods().findOneBy({ id: goodsId, status: 1 });
  if (!goods) throw new onFaild("商品不存在或已下架");

  const user = await mUser().findOneBy({ id: session.userId });
  if (user.blance < goods.price) throw new onFaild("账户余额不足，请充值");

  const transaction = mGoods().manager.transaction(async (entity) => {
    // 用户赋值
    client.traffic = client.traffic ? client.traffic + goods.traffic : goods.traffic;
    const isExpire = dayjs().isBefore(client.expireAt) ? dayjs() : dayjs(client.expireAt);
    client.expireAt = isExpire.add(goods.days, "d").toDate();

    // 扣除余额
    user.blance -= goods.price;
    await entity.save(Users, user);

    // 消费记录
    const model = new SpendLog();
    _.assign(model, {
      userId: user.id,
      type: 0,
      amount: goods.price,
      remark:
        data.remark || `客户[${client.account}]，商品[${goods.name} | ${goods.sku}]`,
    });
    await entity.save(SpendLog, model);

    return await entity.save(Clients, client);
  });

  const [err, res] = await To(transaction);
  if (err) throw new onFaild(err.message, err.status);
  return [res, goods];
};
