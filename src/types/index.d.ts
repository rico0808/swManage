import type { Context } from "@midwayjs/koa";
import type { Dayjs } from "dayjs";

interface Session {
  expires: string | number | Date | Dayjs;
  id: number;
  status: number;
  role: string;
  isDealer: boolean;
  isAdmin: boolean;
}

interface Context extends Context {
  session: Session;
}

interface Res<T> {
  data: T;
  msg: string;
}
type OnResult<T> = Promise<Res<T>>;

interface ResPage<T> {
  data: {
    list: T;
    count: number;
  };
  msg: string;
}
type OnPage<T> = Promise<ResPage<T>>;
