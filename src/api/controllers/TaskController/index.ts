import { GostGetConfig } from "@/api/services/GostServices";
import {
  ServiceTaskServerIsOffLine,
  ServiceTaskServerIsOnLine,
} from "@/api/services/TaskServices";
import { mServer } from "@/api/utils/model";
import { onResult, To } from "@/api/utils/tools";
import { OnResult } from "@/types";
import { Api, Get } from "@midwayjs/hooks";

const Path = (code: string) => `/api/tasks/${code}`;

// 检测 Gost 在线情况
export const TaskCheckServerStatus = Api(
  Get(Path("status")),
  async (): OnResult<string> => {
    const servers = await mServer().find();
    for (let i = 0; i < servers.length; i++) {
      const server = servers[i];
      const online = await GostGetConfig(`${server.ddns}:${server.port}/${server.key}`);
      if (online) {
        await ServiceTaskServerIsOnLine(server);
      } else {
        await ServiceTaskServerIsOffLine(server);
      }
    }
    return onResult("节点检测定时任务完成");
  }
);
