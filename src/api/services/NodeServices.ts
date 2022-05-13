import { mNodes, mServer } from "../utils/model";
import { onFaild, To } from "../utils/tools";
import { DDNSUpdate } from "./DDNSService";
import { GostChains, GostServices } from "./GostServices";

export const ServiceNodeSwitch = async ({
  nodeId,
  serverId,
  type,
}: {
  nodeId: number;
  serverId: number;
  type: number;
}) => {
  const node = await mNodes().findOneBy({ id: nodeId });
  if (!node) throw new onFaild("切换失败，节点不存在");

  const newServer = await mServer().findOneBy({ id: serverId, type, status: 1 });
  if (!newServer) throw new onFaild("切换失败，服务器不存在或离线");

  const isRelay = type === 0;
  const isLand = type === 1;

  // 切换转发节点
  if (isRelay) {
    const before = await mServer().findOneBy({ id: node.relayID, status: 1 });
    const land = await mServer().findOneBy({ id: node.landID });
    if (before) {
      await To(
        GostServices({
          server: `${before.ddns}:${before.port}`,
          key: before.key,
          ddns: node.ddns.split(".")[0],
          listen: node.port,
        }).remove()
      );
      await To(
        GostChains({
          server: `${before.ddns}:${before.port}`,
          key: before.key,
          ddns: node.ddns.split(".")[0],
          listen: node.port,
        }).remove()
      );
    }
    // 中转机开启转发链
    const relayParams = {
      server: `${newServer.ddns}:${newServer.port}`,
      key: newServer.key,
      ddns: node.ddns.split(".")[0],
      listen: node.port,
    };
    const [chainErr] = await To(GostChains(relayParams).create(land.ddns));
    if (chainErr) throw new onFaild(chainErr.message, chainErr.status);

    // 中转机开启服务
    const [relayErr] = await To(GostServices(relayParams).createRelay());
    if (relayErr) throw new onFaild(relayErr.message, relayErr.status);

    const updateRecord = await DDNSUpdate({
      recordId: node.recordId,
      RR: relayParams.ddns,
      value: newServer.ddns,
      type: "CNAME",
    });
    if (!updateRecord) throw new onFaild("更新DNS记录失败，请重试");

    node.relayID = newServer.id;
    const update = await mNodes().save(node);
    if (!update) throw new onFaild("切换服务器失败，请重试", 500);
    return update;
  }

  // 切换落地节点
  if (isLand) {
    const before = await mServer().findOneBy({ id: node.landID, status: 1 });
    if (before) {
      await To(
        GostServices({
          server: `${before.ddns}:${before.port}`,
          key: before.key,
          ddns: node.ddns.split(".")[0],
          listen: node.port,
        }).remove()
      );
    }
    const relay = await mServer().findOneBy({ id: node.relayID, status: 1 });
    if (!relay) throw new onFaild("转发服务器不存在或离线");
    // 创建新落地服务
    const [landErr] = await To(
      GostServices({
        server: `${newServer.ddns}:${newServer.port}`,
        key: newServer.key,
        ddns: node.ddns.split(".")[0],
        listen: node.port,
      }).createLand()
    );
    if (landErr) throw new onFaild(landErr.message, landErr.status);

    // 更新中转机转发链
    const relayParams = {
      server: `${relay.ddns}:${relay.port}`,
      key: relay.key,
      ddns: node.ddns.split(".")[0],
      listen: node.port,
    };
    const [chainErr] = await To(GostChains(relayParams).update(newServer.ddns));
    if (chainErr) throw new onFaild(chainErr.message, chainErr.status);

    node.landID = newServer.id;
    const update = await mNodes().save(node);
    if (!update) throw new onFaild("切换服务器失败，请重试", 500);
    return update;
  }
};
