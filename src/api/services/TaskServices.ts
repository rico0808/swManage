import type { Servers } from "../entity/Servers";
import { mServer } from "../utils/model";
import { sendFtqqMsg } from "../utils/tools";

export const ServiceTaskServerIsOnLine = async (server: Servers) => {
  let change = false;
  if (server.catch !== 0) {
    change = true;
    server.catch = 0;
  }
  if (server.status === 0) {
    change = true;
    server.status = 1;
  }
  change && (await mServer().save(server));
};

// 节点离线
export const ServiceTaskServerIsOffLine = async (server: Servers) => {
  if (server.catch >= 3) {
    server.status = server.catch = 0;
    sendFtqqMsg(
      `${server.name} 节点掉线`,
      `${server.name} - ${server.ddns} 节点已掉线。`
    );
    // TODO:服务掉线处理判断服务器类型寻找正在使用的几点自动替换为其他服务器
  } else {
    server.catch += 1;
  }
  await mServer().save(server);
};
