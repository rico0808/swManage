import { zID, zNumber, zString } from "@/api/utils/zod";
import { z } from "zod";

const ZodBaseServer = z.object({
  type: zNumber("服务器类型"),
  name: zString("服务器名称"),
  ddns: zString("服务器DDNS"),
  ip: zString("服务器IP地址"),
  port: zNumber("Gost API端口"),
  key: zString("Gost PathPrefix"),
});

export const ZodCreateServer = ZodBaseServer;
export const ZodUpdateServer = zID.merge(ZodBaseServer);
