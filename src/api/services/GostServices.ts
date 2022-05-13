import axios, { AxiosError, AxiosResponse } from "axios";
import _ from "lodash";
import { onFaild, To } from "../utils/tools";

interface GostChina {
  name: string;
  hops: [
    {
      name: string;
      nodes: [
        {
          name: string;
          addr: string;
          connector: {
            type: string;
          };
          dialer: {
            type: string;
          };
        }
      ];
    }
  ];
}

interface GostService {
  name: string;
  addr: string;
  handler: {
    type: string;
    chain: string;
  };
  listener: {
    type: string;
  };
}

interface GetConfigResponse {
  services: Array<GostService>;
  chains: Array<GostChina>;
  api: {
    addr: string;
  };
}

const kcpConfig = {
  key: "ErNT8yXzPfWLsFuO",
  crypt: "aes",
  mode: "fast",
  mtu: 1400,
  sndwnd: 1024,
  rcvwnd: 1024,
  datashard: 10,
  parityshard: 3,
  dscp: 46,
  nocomp: true,
  acknodelay: false,
  nodelay: 0,
  interval: 50,
  resend: 0,
  nc: 0,
  sockbuf: 16777217,
  smuxbuf: 16777217,
  streambuf: 16777217,
  smuxver: 2,
  keepalive: 10,
  snmplog: "",
  snmpperiod: 60,
  signal: false,
  tcp: false,
};

const request = axios.create({ timeout: 8 * 1000 });

// 获取配置
type GetConfig = { ddns: string; key: string };
export const GostGetConfig = async ({
  ddns,
  key,
}: GetConfig): Promise<GetConfigResponse> => {
  const [err, res] = await To(
    request({ url: `http://${ddns}/${key}/config`, method: "GET" })
  );
  if (err) return null;
  return res.data;
};

// 发起服务
const _launch = async (url: string, method: "POST" | "GET" | "DELETE", data = {}) => {
  const [err, res]: [AxiosError, AxiosResponse] = await To(
    request({
      url: `http://${url}`,
      method,
      data: method === "POST" ? data : undefined,
    })
  );
  if (err) {
    const data = err.response.data || {};
    if (_.has(data, "code")) {
      const code = _.get(data, "code");
      if (code == "40004") return data;
    }
    return null;
  }
  return res.data;
};

// 创建转发
interface GostRelay {
  ddns: string;
  port?: number;
  relay: string;
  land: string;
}
export const CreateGostRelay = async (params: GostRelay) => {
  const { ddns, port, relay, land } = params;
  // 落地创建HTTP服务
  const landGost = await _launch(`${land}/config/services`, "POST", {
    name: `${ddns}-land`,
    addr: `:${port}`,
    handler: { type: "forward" },
    listener: {
      type: "kcp",
      metadata: { config: kcpConfig },
    },
    forwarder: { targets: ["127.0.0.1:52333"] },
  });
  if (!landGost) throw new onFaild("创建落地服务失败", 500);

  // 创建中转转发链
  const relayChain = await _launch(`${relay}/config/chains`, "POST", {
    name: `${ddns}-chain`,
    hops: [
      {
        name: "hop-0",
        nodes: [
          {
            name: "node-0",
            addr: `${land.split(":")[0]}:${port}`,
            connector: { type: "forward" },
            dialer: { type: "kcp", metadata: { config: kcpConfig } },
          },
        ],
      },
    ],
  });
  if (!relayChain) throw new onFaild("创建转发链失败", 500);

  // 创建转发服务
  const relayGost = await _launch(`${relay}/config/services`, "POST", {
    name: `${ddns}-relay`,
    addr: `:${port}`,
    handler: { type: "tcp", chain: `${ddns}-chain` },
    listener: { type: "tcp" },
  });
  if (!relayGost) throw new onFaild("创建转发服务失败", 500);
  return true;
};

export const DeleteGostRelay = async (params: GostRelay) => {
  const { relay, land } = params;
  const ddns = params.ddns.split(".")[0];
  // 删除落地HTTP服务
  const landGost = await _launch(`${land}/config/services/${ddns}-land`, "DELETE");
  if (!landGost) throw new onFaild("删除落地服务失败", 500);

  // 删除中转转发链
  const relayChain = await _launch(`${relay}/config/chains/${ddns}-chain`, "DELETE");
  if (!relayChain) throw new onFaild("删除转发链失败", 500);

  // 删除转发服务
  const relayGost = await _launch(`${relay}/config/services/${ddns}-relay`, "DELETE");
  if (!relayGost) throw new onFaild("删除转发服务失败", 500);

  return true;
};
