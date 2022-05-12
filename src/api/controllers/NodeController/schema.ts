import { zID, zNumber, zString } from "@/api/utils/zod";
import { z } from "zod";

const ZodBaseNodes = z.object({
  ddns: zString("节点DDNS地址"),
  relayID: zNumber("转发服务器"),
  landID: zNumber("落地服务器"),
  port: zNumber("连接端口"),
});

export const ZodCreateNode = ZodBaseNodes;
export const ZodUpdateNode = zID.merge(ZodBaseNodes);
