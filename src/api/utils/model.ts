import { useEntityModel } from "@midwayjs/orm";
import { Clients } from "../entity/Clients";
import { Goods } from "../entity/Goods";
import { SmsCode } from "../entity/SmcCode";
import { SmsLog } from "../entity/SmsLog";
import { SpendLog } from "../entity/SpendLog";
import { Users } from "../entity/Users";

export const mUser = () => useEntityModel(Users);
export const mClient = () => useEntityModel(Clients);
export const mGoods = () => useEntityModel(Goods);
export const mSpend = () => useEntityModel(SpendLog);
export const mSmsCode = () => useEntityModel(SmsCode);
export const mSmsLog = () => useEntityModel(SmsLog);
