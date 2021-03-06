import { Nodes } from "@/api/entity/Nodes";
import { Servers } from "@/api/entity/Servers";
import { CheckCookie, CheckPermission, isAdmin } from "@/api/middleware/middleware";
import { DDNSCreate, DDNSDelete, DDNSSetStatus } from "@/api/services/DDNSService";
import { GostChains, GostServices } from "@/api/services/GostServices";
import { ServiceNodeSwitch } from "@/api/services/NodeServices";
import { mNodes, mServer } from "@/api/utils/model";
import { onFaild, onResult, To } from "@/api/utils/tools";
import { zID, zID_Status, zPage } from "@/api/utils/zod";
import { OnPage, OnResult } from "@/types";
import { Api, ApiConfig, Post, useConfig, Validate } from "@midwayjs/hooks";
import _ from "lodash";
import { FindOptionsWhere } from "typeorm";
import { z } from "zod";
import { ZodCreateNode, ZodSwtichServer } from "./schema";
import type { NodesItem } from "./types";

export const config: ApiConfig = {
  middleware: [CheckCookie, CheckPermission, isAdmin],
};

const Path = (code: string) => `/api/nodes/${code}`;

// 节点列表
export const NodeGetNodes = Api(
  Post(Path("list")),
  Validate(zPage),
  async ({ pageSize, current }: z.infer<typeof zPage>): OnPage<Array<Nodes>> => {
    const [list, count] = await mNodes().findAndCount({
      order: { id: "DESC" },
      take: pageSize,
      skip: (current - 1) * pageSize,
    });

    for (let i = 0; i < list.length; i++) {
      const node = list[i];
      const _find = (where: FindOptionsWhere<Servers>) => {
        return mServer().findOne({
          where,
          select: ["id", "name", "status"],
        });
      };
      const relay = await _find({ type: 0, id: node.relayID });
      const land = await _find({ type: 1, id: node.landID });
      node["relay"] = relay;
      node["land"] = land;
      delete node.relayID;
      delete node.landID;
    }

    return onResult({ list, count });
  }
);

// 创建节点
export const NodeCreateNode = Api(
  Post(Path("create")),
  Validate(ZodCreateNode),
  async (data: z.infer<typeof ZodCreateNode>): OnResult<Nodes> => {
    const config = useConfig("ddns");
    const { ddns, relayID, landID, port } = data;
    const hasNode = await mNodes().findOneBy({ ddns });
    if (hasNode) throw new onFaild("改DDNS地址已存在");

    const relay = await mServer().findOneBy({ id: data.relayID, type: 0 });
    if (!relay) throw new onFaild("转发节点不存在");

    const land = await mServer().findOneBy({ id: data.landID, type: 1 });
    if (!land) throw new onFaild("落地节点不存在");

    const isPort = await mNodes().findOneBy({ relayID: data.relayID, port: port });
    if (isPort) throw new onFaild("该转发连接端口已被使用，请更换端口");

    // 落地机开启服务
    const [landErr] = await To(
      GostServices({
        server: `${land.ddns}:${land.port}`,
        key: land.key,
        ddns: data.ddns,
        listen: port,
      }).createLand()
    );
    if (landErr) throw new onFaild(landErr.message, landErr.status);

    // 中转机开启转发链
    const relayParams = {
      server: `${relay.ddns}:${relay.port}`,
      key: relay.key,
      ddns: data.ddns,
      listen: port,
    };
    const [chainErr] = await To(GostChains(relayParams).create(land.ddns));
    if (chainErr) throw new onFaild(chainErr.message, chainErr.status);

    // 中转机开启服务
    const [relayErr] = await To(GostServices(relayParams).createRelay());
    if (relayErr) throw new onFaild(relayErr.message, relayErr.status);

    const dnsRecord = await DDNSCreate({
      RR: data.ddns,
      value: relay.ddns,
      type: "CNAME",
    });
    if (!dnsRecord) throw new onFaild("添加DNS记录失败，请重试");

    const model = new Nodes();
    _.assign(
      model,
      { relayID, landID, port, recordId: dnsRecord.recordId },
      { ddns: `${data.ddns}.${config.domain}` }
    );
    const node = await mNodes().save(model);
    if (!model) throw new onFaild("添加节点失败，请重试", 500);
    return onResult(node);
  }
);

// 删除节点
export const NodeDeleteNode = Api(
  Post(Path("delete")),
  Validate(zID),
  async ({ id }: z.infer<typeof zID>): OnResult<Nodes> => {
    const node = await mNodes().findOneBy({ id });
    if (!node) throw new onFaild("删除失败，节点不存在");

    const delRecord = await DDNSDelete(node.recordId);
    if (!delRecord) throw new onFaild("删除DNS记录失败，请重试");

    const relay = await mServer().findOneBy({ id: node.relayID, type: 0 });
    const land = await mServer().findOneBy({ id: node.landID, type: 1 });

    // 落地机删除服务
    const [landErr] = await To(
      GostServices({
        server: `${land.ddns}:${land.port}`,
        key: land.key,
        ddns: node.ddns.split(".")[0],
        listen: node.port,
      }).remove()
    );
    if (landErr) throw new onFaild(landErr.message, landErr.status);

    // 中转机删除转发链
    const relayParams = {
      server: `${relay.ddns}:${relay.port}`,
      key: relay.key,
      ddns: node.ddns.split(".")[0],
      listen: node.port,
    };
    const [chainErr] = await To(GostChains(relayParams).remove());
    if (chainErr) throw new onFaild(chainErr.message, chainErr.status);

    // 中转机删除服务
    const [relayErr] = await To(GostServices(relayParams).remove());
    if (relayErr) throw new onFaild(relayErr.message, relayErr.status);

    const remove = await mNodes().remove(node);
    if (!remove) throw new onFaild("删除节点失败，请重试", 500);
    return onResult(remove);
  }
);

// 禁用节点
export const NodeDisableNode = Api(
  Post(Path("disable")),
  Validate(zID_Status),
  async ({ id, status }: z.infer<typeof zID_Status>): OnResult<Nodes> => {
    const node = await mNodes().findOneBy({ id });
    if (!node) throw new onFaild("操作失败，节点不存在");

    const setRecord = await DDNSSetStatus(node.recordId, status ? "Enable" : "Disable");
    if (!setRecord) throw new onFaild("禁用DNS记录失败，请重试");

    node.status = status;
    const update = await mNodes().save(node);
    if (!update) throw new onFaild("操作失败，请重试", 500);
    return onResult(update);
  }
);

// 节点切换服务器
export const NodeSwitchNodeServer = Api(
  Post(Path("switch")),
  Validate(ZodSwtichServer),
  async ({ id, serverId, type }: z.infer<typeof ZodSwtichServer>): OnResult<Nodes> => {
    const [err, res] = await To(ServiceNodeSwitch({ nodeId: id, serverId, type }));
    if (err) throw new onFaild(err.message, err.status);
    return onResult(res);
  }
);
