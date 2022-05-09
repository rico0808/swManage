import type { Context, OnResult } from "@/types";
import { onFaild, onResult } from "@/api/utils/tools";
import { Api, ApiConfig, Get, useContext } from "@midwayjs/hooks";
import _ from "lodash";
import { CheckCookie } from "@/api/middleware/middleware";
import { Users } from "@/api/entity/Users";
import { mUser } from "@/api/utils/model";

export const config: ApiConfig = {
  middleware: [CheckCookie],
};
const Path = (code: string) => `/api/profile/${code}`;

// 用户信息
export const UserGetProfile = Api(
  Get(Path("my")),
  async (): OnResult<Omit<Users, "passwd">> => {
    const { session } = useContext<Context>();
    const user = await mUser().findOneBy({ id: session.userId });
    if (!user) throw new onFaild("登录信息已过期", 401);
    return onResult(_.omit(user, ["passwd"]));
  }
);
