import { Nodes } from "../entity/Nodes";
import type { Servers } from "../entity/Servers";
import { mNodes, mServer } from "../utils/model";
import { sendFtqqMsg } from "../utils/tools";
import { DDNSUpdate } from "./DDNSService";

const _replaceBackupServer = async (server: Servers) => {
  const isRelay = server.type === 0;
  const isLand = server.type === 1;

  // 使用服务器节点
  let nodes: Array<Nodes>;
  if (isRelay) nodes = await mNodes().findBy({ relayID: server.id });
  if (isLand) nodes = await mNodes().findBy({ landID: server.id });

  //  备用服务器
  let backup: Servers;
  if (isRelay) backup = await mServer().findOneBy({ type: 0, status: 1 });
  if (isLand) backup = await mServer().findOneBy({ type: 1, status: 1 });
  if (!backup) return null;

  const replace: Array<Nodes> = [];
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    const updateDns = await DDNSUpdate({
      recordId: node.recordId,
      type: "CNAME",
      RR: node.ddns.split(".")[0],
      value: backup.ddns,
    });
    if (updateDns) {
      if (isRelay) node.relayID = backup.id;
      if (isLand) node.landID = backup.id;
      const res = await mNodes().save(node);
      replace.push(res);
    }
  }
  return replace;
};

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
    const replaceNodes = await _replaceBackupServer(server);
    const nodes = replaceNodes.map((item) => item.ddns);
    sendFtqqMsg(
      `${server.name} 服务器掉线`,
      `${server.name} - ${server.ddns} 服务器已掉线。影响节点 ${nodes.join("，")}`
    );
  } else {
    server.catch += 1;
  }
  await mServer().save(server);
};
