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

export class GostConfig {
  ddns: string;
  port: number;
  constructor(ddns: string, port: number) {
    this.ddns = ddns;
    this.port = port;
  }

  Land() {
    return {
      name: `${this.ddns}-services`,
      addr: `:${this.port}`,
      handler: { type: "forward" },
      listener: {
        type: "kcp",
        metadata: { config: kcpConfig },
      },
      forwarder: { targets: ["127.0.0.1:52333"] },
    };
  }

  Relay() {
    return {
      name: `${this.ddns}-services`,
      addr: `:${this.port}`,
      handler: { type: "tcp", chain: `${this.ddns}-chains` },
      listener: { type: "tcp" },
    };
  }

  Chain(land: string) {
    return {
      name: `${this.ddns}-chains`,
      hops: [
        {
          name: "hop-0",
          nodes: [
            {
              name: "node-0",
              addr: `${land}:${this.port}`,
              connector: { type: "forward" },
              dialer: { type: "kcp", metadata: { config: kcpConfig } },
            },
          ],
        },
      ],
    };
  }
}
