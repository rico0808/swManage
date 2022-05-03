interface Session {
  expires: string | number | Date | Dayjs;
  id: number;
  status: number;
  role: number;
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
