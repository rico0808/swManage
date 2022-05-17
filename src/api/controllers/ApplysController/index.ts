import { Applys } from "@/api/entity/Apply";
import { Users } from "@/api/entity/Users";
import { CheckCookie, CheckPermission, isAdmin } from "@/api/middleware/middleware";
import { mApply, mClient, mUser } from "@/api/utils/model";
import { onFaild, onResult } from "@/api/utils/tools";
import { zID, zID_Status, zPage, zString } from "@/api/utils/zod";
import { OnPage, OnResult } from "@/types";
import { Api, ApiConfig, Post, Validate } from "@midwayjs/hooks";
import _ from "lodash";
import { z } from "zod";

export const config: ApiConfig = {
  middleware: [CheckCookie, CheckPermission, isAdmin],
};

const Path = (code: string) => `/api/apply/${code}`;

// 申请列表
export const ApplyGetApplys = Api(
  Post(Path("list")),
  Validate(zPage),
  async ({ pageSize, current }: z.infer<typeof zPage>): OnPage<Array<Applys>> => {
    const [list, count] = await mApply().findAndCount({
      order: { id: "DESC" },
      take: pageSize,
      skip: (current - 1) * pageSize,
    });

    for (let i = 0; i < list.length; i++) {
      const apply = list[i];
      const user = await mUser().findOneBy({ id: apply.userId });
      apply["phone"] = user.phone;
    }
    return onResult({ list, count });
  }
);

// 通过或者拒绝
const params = zID_Status.merge(z.object({ reason: zString("理由") }));
export const ApplyHandleApplys = Api(
  Post(Path("delete")),
  Validate(params),
  async ({ id, status, reason }: z.infer<typeof params>): OnResult<Applys> => {
    const apply = await mApply().findOneBy({ id, status: 1 });
    if (!apply) throw new onFaild("该申请已被处理或不存在");

    if (status === 2) {
      const user = await mUser().findOneBy({ id: apply.userId });
      user.role = "dealer";
      await mUser().save(user);
    }

    apply.status = status;
    apply.reason = reason;
    const update = await mApply().save(apply);
    if (!update) throw new onFaild("操作失败，请重试", 500);
    return onResult(update);
  }
);
