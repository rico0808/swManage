import { createConfiguration, hooks } from "@midwayjs/hooks";
import * as Koa from "@midwayjs/koa";
import * as orm from "@midwayjs/orm";
import { ErrorIntercept } from "./middleware/middleware";

/**
 * setup midway server
 */
export default createConfiguration({
  imports: [Koa, orm, hooks({ middleware: [ErrorIntercept] })],
  importConfigs: [
    {
      default: {
        keys: "3yLjC7vdoskACHqbEyva7Xn0xeyrMZgB",
        sms: { user: "miniaoe", api: "b1976c3f067b4d0d81564ad67f5fccd3" },
        orm: {
          type: "mysql",
          host: "127.0.0.1",
          port: 3306,
          username: "root",
          password: "root",
          database: "nsns",
          synchronize: true,
          charset: "utf8mb4",
          logging: false,
        },
        aliyun: {
          accessKeyId: "LTAI5tSDxzvQ82zjY8VnLVfy",
          accessKeySecret: "i0b9tgPaHjF9HjNwfLhsqNr551XBRX",
        },
        ddns: {
          domain: "nsns.club",
          TTL: 60,
        },
        ftqq: "SCT147328TDxRkRxoGRYAsCpG0kWdd5ky6",
      },
    },
  ],
});
