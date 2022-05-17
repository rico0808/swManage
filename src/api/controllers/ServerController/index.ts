import { Servers } from "@/api/entity/Servers";
import { CheckCookie, CheckPermission, isAdmin } from "@/api/middleware/middleware";
import { DDNSCreate, DDNSDelete } from "@/api/services/DDNSService";
import { mNodes, mServer } from "@/api/utils/model";
import { onFaild, onResult } from "@/api/utils/tools";
import { zID, zPage } from "@/api/utils/zod";
import { OnPage, OnResult } from "@/types";
import { Api, ApiConfig, Post, useConfig, Validate } from "@midwayjs/hooks";
import _ from "lodash";
import { z } from "zod";
import { ZodCreateServer } from "./schema";

export const config: ApiConfig = {
  middleware: [CheckCookie, CheckPermission, isAdmin],
};

const Path = (code: string) => `/api/servers/${code}`;

// 服务器列表
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

// 创建服务器
export const ServerCreateServer = Api(
  Post(Path("create")),
  Validate(ZodCreateServer),
  async (data: z.infer<typeof ZodCreateServer>): OnResult<Servers> => {
    const { domain } = useConfig("ddns");
    const { type, name, port, key, ip } = data;
    const ddns = `${data.ddns}.server.${domain}`;
    const hasServer = await mServer().findOneBy({ ddns, type });
    if (hasServer) throw new onFaild("该DDNS服务器已存在");

    const dnsRecord = await DDNSCreate({
      RR: `${data.ddns}.server`,
      value: ip,
      type: "A",
    });
    if (!dnsRecord) throw new onFaild("添加DNS记录失败，请重试");
    const { recordId } = dnsRecord;

    const model = new Servers();
    _.assign(model, { type, name, ddns, port, key, recordId, ip });
    const server = await mServer().save(model);
    if (!server) throw new onFaild("添加服务器失败，请重试", 500);
    return onResult(server);
  }
);

// 删除服务器
export const ServerDeleteServer = Api(
  Post(Path("delete")),
  Validate(zID),
  async ({ id }: z.infer<typeof zID>): OnResult<Servers> => {
    const server = await mServer().findOneBy({ id });
    if (!server) throw new onFaild("删除失败，服务器不存在");

    const isUsed = await mNodes().findOneBy([{ relayID: id }, { landID: id }]);
    if (isUsed) throw new onFaild("服务器正在被节点使用，无法删除");

    const delRecord = await DDNSDelete(server.recordId);
    if (!delRecord) throw new onFaild("删除DNS记录失败，请重试");

    const remove = await mServer().remove(server);
    if (!remove) throw new onFaild("删除服务器失败，请重试", 500);
    return onResult(remove);
  }
);
