import { createConfiguration, hooks } from "@midwayjs/hooks";
import * as Koa from "@midwayjs/koa";
import { CheckCookie, ErrorIntercept } from "./middleware/middleware";

/**
 * setup midway server
 */
export default createConfiguration({
  imports: [Koa, hooks({ middleware: [ErrorIntercept, CheckCookie] })],
  importConfigs: [
    {
      default: {
        keys: "3yLjC7vdoskACHqbEyva7Xn0xeyrMZgB",
        sms: { user: "miniaoe", api: "b1976c3f067b4d0d81564ad67f5fccd3" },
      },
    },
  ],
});
