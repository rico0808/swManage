import axios, { AxiosError, AxiosResponse } from "axios";
import _, { remove } from "lodash";
import { GostConfig } from "../utils/gost";
import { onFaild, To } from "../utils/tools";

const request = axios.create({ timeout: 6 * 1000 });

// 发起服务
const _launch = async (
  url: string,
  method: "POST" | "GET" | "DELETE" | string,
  data = undefined
) => {
  const [err, res]: [AxiosError, AxiosResponse] = await To(
    request({
      url: `http://${url}`,
      method,
      data: data && data,
    })
  );

  if (err) {
    if (!err.response) return null;
    const data = err.response.data || {};
    if (_.has(data, "code")) {
      const code = _.get(data, "code");
      if (code == "40004") return data;
    }
    return null;
  }
  return res.data;
};

// 获取配置
export const GostGetConfig = async (server: string): Promise<object> => {
  const config = await _launch(`${server}/config`, "GET");
  if (!config) return null;
  return config;
};

interface GostParams {
  server: string;
  key: string;
  ddns: string;
  listen: number;
}

export const GostServices = ({ server, key, ddns, listen }: GostParams) => {
  const url = `${server}/${key}/config/services`;
  const Gost = new GostConfig(ddns, listen);

  const remove = async () => {
    const res = await _launch(`${url}/${ddns}-services`, "DELETE");
    if (!res) throw new onFaild("删除Gost服务失败", 500);
    return res;
  };

  const createLand = async () => {
    const isRemove = await remove();
    if (!isRemove) throw new onFaild("初始创建Gost落地服务失败", 500);
    const res = await _launch(url, "POST", Gost.Land());
    if (!res) throw new onFaild("创建Gost落地服务失败", 500);
    return res;
  };

  const updateLand = async () => {
    const res = await _launch(`${url}/${ddns}-services`, "PUT", Gost.Land());
    if (!res) throw new onFaild("更新Gost落地服务失败", 500);
    return res;
  };

  const createRelay = async () => {
    const isRemove = await remove();
    if (!isRemove) throw new onFaild("初始创建Gost转发服务失败", 500);
    const res = await _launch(url, "POST", Gost.Relay());
    if (!res) throw new onFaild("创建Gost转发服务失败", 500);
    return res;
  };

  const updateRelay = async () => {
    const res = await _launch(`${url}/${ddns}-services`, "PUT", Gost.Relay());
    if (!res) throw new onFaild("更新Gost转发服务失败", 500);
    return res;
  };

  return { createLand, updateLand, createRelay, updateRelay, remove };
};

export const GostChains = ({ server, key, ddns, listen }: GostParams) => {
  const url = `${server}/${key}/config/chains`;
  const Gost = new GostConfig(ddns, listen);
  const remove = async () => {
    const res = await _launch(`${url}/${ddns}-chains`, "DELETE");
    if (!res) throw new onFaild("删除Gost转发链失败", 500);
    return res;
  };

  const create = async (land: string) => {
    const isRemove = await remove();
    if (!isRemove) throw new onFaild("初始创建Gost转发链失败", 500);
    const res = await _launch(url, "POST", Gost.Chain(land));
    if (!res) throw new onFaild("创建Gost转发链失败", 500);
  };

  const update = async (land: string) => {
    const res = await _launch(`${url}/${ddns}-chains`, "PUT", Gost.Chain(land));
    if (!res) throw new onFaild("更新Gost转发链失败", 500);
    return res;
  };
  return { create, remove, update };
};
