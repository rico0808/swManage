import { zID, zNumber, zString } from "@/api/utils/zod";
import { z } from "zod";

const ZodBaseServer = z.object({
  type: zNumber("服务器类型"),
  name: zString("服务器名称"),
  ip: zString("服务器IP"),
  port: zNumber("服务器API端口"),
});

export const ZodCreateServer = ZodBaseServer;
export const ZodUpdateServer = zID.merge(ZodBaseServer);
