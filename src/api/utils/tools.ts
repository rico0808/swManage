import type { Res } from "@/types";
import dayjs from "dayjs";
import axios from "axios";
import { useConfig } from "@midwayjs/hooks";

export const onResult = <T>(data: T, msg = "奥力给！"): Res<T> => {
  return { data, msg };
};

export class onFaild extends Error {
  status: number;
  data: null;
  constructor(msg: string, status = 400) {
    super();
    this.status = status;
    this.message = msg;
    this.data = null;
  }
}

// 生成随机数
export const RandomCode = () => {
  return Math.floor(Math.random() * (999999 - 111111 + 1)) + 111111;
};

// 生成随机字母
export const RandomLetter = (length: number) => {
  const result = [];
  for (let i = 0; i < length; i++) {
    const ranNum = Math.ceil(Math.random() * 25);
    result.push(String.fromCharCode(65 + ranNum));
  }
  return result.join("");
};

export const toGB = (val: number) => {
  return Number((val / 1024 / 1024).toFixed(2));
};

export const toKB = (val: number) => {
  return ~~Number(val * 1024 * 1024);
};

export const GenExpire = (count: number, type = "m") => {
  return dayjs().subtract(count, type).toDate();
};

export const To = <T, U = onFaild>(
  promise: Promise<T>
): Promise<[U, undefined] | [null, T]> => {
  return promise
    .then<[null, T]>((res: T) => {
      return [null, res];
    })
    .catch<[U, undefined]>((err) => {
      return [err, undefined];
    });
};

export const sendFtqqMsg = async (title: string, desp: string) => {
  const config = useConfig("ftqq");
  const [err, res] = await To(
    axios({
      url: `https://sctapi.ftqq.com/${config}.send`,
      method: "GET",
      params: { title, desp },
      timeout: 4 * 1000,
    })
  );
  if (err) return null;
  return res.data;
};
