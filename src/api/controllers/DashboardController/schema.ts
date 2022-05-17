import { zString } from "@/api/utils/zod";
import { z } from "zod";

export const ZodJoinDealer = z.object({
  url: zString(),
  business: zString(),
});
