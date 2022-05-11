import { Users } from "@/api/entity/Users";
import { CheckCookie, CheckPermission, isAdmin } from "@/api/middleware/middleware";
import { mClient, mUser } from "@/api/utils/model";
import { onFaild, onResult } from "@/api/utils/tools";
import { zID, zID_Status, zPage } from "@/api/utils/zod";
import { OnPage, OnResult } from "@/types";
import { Api, ApiConfig, Post, Validate } from "@midwayjs/hooks";
import _ from "lodash";
import { z } from "zod";

export const config: ApiConfig = {
  middleware: [CheckCookie, CheckPermission, isAdmin],
};

const Path = (code: string) => `/api/users/${code}`;

export const UserGetUsers = Api(
  Post(Path("list")),
  Validate(zPage),
  async ({ pageSize, current }: z.infer<typeof zPage>): OnPage<Users[]> => {
    const [list, count] = await mUser().findAndCount({
      order: { id: "DESC" },
      take: pageSize,
      skip: (current - 1) * pageSize,
    });

    const userList = [];
    for (let i = 0; i < list.length; i++) {
      const clients = await mClient().countBy({ userId: list[i].id });
      userList.push(_.assign(list[i], { clients }));
    }
    return onResult({ list: userList, count });
  }
);

export const UserDeleteUser = Api(
  Post(Path("delete")),
  Validate(zID),
  async ({ id }: z.infer<typeof zID>): OnResult<Users> => {
    const user = await mUser().findOneBy({ id });
    if (user.role === "admin") throw new onFaild("无法删除管理员账号");
    const remove = await mUser().remove(user);
    if (!remove) throw new onFaild("删除账号失败，请重试", 500);
    return onResult(remove);
  }
);

export const UserDisableUser = Api(
  Post(Path("disable")),
  Validate(zID_Status),
  async ({ id, status }: z.infer<typeof zID_Status>): OnResult<Users> => {
    const user = await mUser().findOneBy({ id });
    if (!user) throw new onFaild("用户不存在，禁用失败");
    if (user.role === "admin") throw new onFaild("无法禁用管理员账号");
    user.status = status;
    const update = await mUser().save(user);
    if (!update) throw new onFaild("禁用账号失败，请重试", 500);
    return onResult(update);
  }
);
