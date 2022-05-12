import { zID, zNumber, zString } from "@/api/utils/zod";
import { z } from "zod";

const ZodBaseServer = z.object({
  type: zNumber("服务器类型"),
  name: zString("服务器名称"),
  ddns: zString("服务器DDNS"),
  port: zNumber("服务器API端口"),
  key: zString("服务器通信KEY"),
});

export const ZodCreateServer = ZodBaseServer;
export const ZodUpdateServer = zID.merge(ZodBaseServer);
