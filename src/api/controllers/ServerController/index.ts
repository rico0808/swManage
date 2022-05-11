import { Servers } from "@/api/entity/Servers";
import { Users } from "@/api/entity/Users";
import { CheckCookie, CheckPermission, isAdmin } from "@/api/middleware/middleware";
import { mClient, mServer, mUser } from "@/api/utils/model";
import { onFaild, onResult } from "@/api/utils/tools";
import { zID, zID_Status, zPage } from "@/api/utils/zod";
import { OnPage, OnResult } from "@/types";
import { Api, ApiConfig, Post, Validate } from "@midwayjs/hooks";
import _ from "lodash";
import { z } from "zod";
import { ZodCreateServer, ZodUpdateServer } from "./schema";

export const config: ApiConfig = {
  middleware: [CheckCookie, CheckPermission, isAdmin],
};

const Path = (code: string) => `/api/servers/${code}`;

export const ServerGetServers = Api(
  Post(Path("list")),
  Validate(zPage),
  async ({ pageSize, current }: z.infer<typeof zPage>): OnPage<Servers[]> => {
    const [list, count] = await mServer().findAndCount({
      order: { id: "DESC" },
      take: pageSize,
      skip: (current - 1) * pageSize,
    });

    return onResult({ list, count });
  }
);

export const ServerCreateServer = Api(
  Post(Path("create")),
  Validate(ZodCreateServer),
  async (data: z.infer<typeof ZodCreateServer>): OnResult<Servers> => {
    const { type, name, ip, port } = data;
    const hasServer = await mServer().findOneBy({ ip });
    if (hasServer) throw new onFaild("该IP服务器已存在");

    const model = new Servers();
    _.assign(model, { type, name, ip, port });
    const server = await mServer().save(model);
    if (!server) throw new onFaild("添加服务器失败，请重试", 500);
    return onResult(server);
  }
);

export const ServerUpdateServer = Api(
  Post(Path("update")),
  Validate(ZodUpdateServer),
  async (data: z.infer<typeof ZodUpdateServer>): OnResult<Servers> => {
    const { id, type, name, ip, port } = data;
    const server = await mServer().findOneBy({ id });
    if (!server) throw new onFaild("添加服务器失败，请重试");

    _.assign(server, { type, name, ip, port });

    const update = await mServer().save(server);
    if (!update) throw new onFaild("编辑服务器失败，请重试", 500);
    return onResult(update);
  }
);

export const ServerDeleteServer = Api(
  Post(Path("delete")),
  Validate(zID),
  async ({ id }: z.infer<typeof zID>): OnResult<Servers> => {
    const server = await mServer().findOneBy({ id });
    if (!server) throw new onFaild("删除失败，服务器不存在");

    const remove = await mServer().remove(server);
    if (!remove) throw new onFaild("删除服务器失败，请重试", 500);
    return onResult(remove);
  }
);
