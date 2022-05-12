import Alidns20150109, * as $Alidns20150109 from "@alicloud/alidns20150109";
import OpenApi, * as $OpenApi from "@alicloud/openapi-client";
import { useConfig } from "@midwayjs/hooks";
import { To } from "../utils/tools";

const _createClient = () => {
  const { accessKeyId, accessKeySecret } = useConfig("aliyun");
  const config = new $OpenApi.Config({
    accessKeyId,
    accessKeySecret,
  });
  config.endpoint = `alidns.cn-hangzhou.aliyuncs.com`;
  return new Alidns20150109(config);
};

type DDNSResponse = Promise<{ requestId: string; recordId: string }>;

// 创建DDNS
type CreateRecord = { RR: string; value: string; type: "A" | "CNAME" };
export const DDNSCreate = async ({ RR, value, type }: CreateRecord): DDNSResponse => {
  const { domain: domainName, TTL } = useConfig("ddns");
  const client = _createClient();
  const record = new $Alidns20150109.AddDomainRecordRequest({
    domainName,
    RR,
    type,
    value,
    TTL,
  });
  const [err, res] = await To(client.addDomainRecord(record));
  if (err || !res?.body?.recordId) return null;
  return { requestId: res.body.requestId, recordId: res.body.recordId };
};

// 删除DDNS
export const DDNSDelete = async (recordId: string): DDNSResponse => {
  const client = _createClient();
  const record = new $Alidns20150109.DeleteDomainRecordRequest({ recordId });
  const [err, res] = await To(client.deleteDomainRecord(record));
  if (err || !res.body?.recordId) return null;
  return { requestId: res.body.requestId, recordId: res.body.recordId };
};

// 设置DDNS禁用启用
export const DDNSSetStatus = async (
  recordId: string,
  status: "Enable" | "Disable"
): DDNSResponse => {
  const client = _createClient();
  const record = new $Alidns20150109.SetDomainRecordStatusRequest({ recordId, status });
  const [err, res] = await To(client.setDomainRecordStatus(record));
  if (err || !res.body?.recordId) return null;
  return { requestId: res.body.requestId, recordId: res.body.recordId };
};
