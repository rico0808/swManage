import {
  ClientCoverGoods,
  ClientCreateClient,
  ClientDeleteClient,
  ClientDisableClient,
  ClientGetClients,
} from "@/api/controllers/ClientController";
import { GoodsGetGoods } from "@/api/controllers/GoodsController";
import usePagination from "@/hooks/usePagination";
import type { TableSlot } from "@/types";
import {
  Button,
  Form,
  FormItem,
  Input,
  Modal,
  Select,
  Table,
  Option,
  Message,
  Tag,
  Link,
  Popconfirm,
  Textarea,
} from "@arco-design/web-vue";
import dayjs from "dayjs";
import _ from "lodash";
import { defineComponent, reactive, ref } from "vue";
import type { TableColumnData, FieldRule } from "@arco-design/web-vue";
import { Clients } from "@/api/entity/Clients";
import { Goods } from "@/api/entity/Goods";
import { FormInput, FormSelect } from "@/components/form";

const columns: Array<TableColumnData> = [
  { title: "ID", dataIndex: "id", ellipsis: true, width: 50 },
  { title: "来源", slotName: "source", align: "center" },
  { title: "来源账号", dataIndex: "tb", ellipsis: true },
  { title: "用户名", dataIndex: "account", ellipsis: true },
  { title: "密码", dataIndex: "passwd", ellipsis: true },
  { title: "已用流量", slotName: "used", align: "center" },
  { title: "总流量", slotName: "traffic", align: "center" },
  { title: "到期时间", slotName: "expireAt", ellipsis: true, align: "center" },
  { title: "状态", slotName: "status", align: "center" },
  { title: "操作", slotName: "actions", width: 180, align: "center" },
];

const formRules: Record<string, FieldRule> = {
  source: { required: true, message: "请选择客户来源" },
  tb: { required: true, message: "请输入客户淘宝或拼多多用户名" },
  account: { required: true, message: "请输入客户用户名" },
  passwd: { required: true, message: "请输入客户密码" },
};

const coverRules: Record<string, FieldRule> = {
  orderNo: { required: true, message: "请选择来源订单号" },
  goodsId: { required: true, message: "请选择补单商品" },
  clientId: { required: true, message: "请输入补单用户" },
};

export default defineComponent({
  setup() {
    const { pagination, dataList, loading, onChange, reload, keyword } =
      usePagination(ClientGetClients);

    const loads = reactive({
      goods: false,
      clients: false,
    });

    const formRef = ref();
    const formModal = ref(false);
    const formData = reactive({
      source: "",
      tb: "",
      account: "",
      passwd: "",
    });

    const coverRef = ref();
    const coverModal = ref(false);
    const coverData = reactive({
      source: "tb",
      orderNo: "",
      clientId: null,
      goodsId: null,
      mask: "",
    });

    const state = reactive({
      goods: ref<Array<Goods>>([]),
      coverClients: ref<Array<Clients>>([]),
    });

    // 加载商品列表
    const _LoadGoodsList = async () => {
      loads.goods = true;
      const res = await GoodsGetGoods({ pageSize: 999, current: 1 });
      if (res?.data) state.goods = res.data.list;
      loads.goods = false;
    };

    // 添加客户
    const handleCreateClient = (done: Function) => {
      formRef.value.validate(async (errors) => {
        if (errors) return done(false);
        const res = await ClientCreateClient(formData);
        if (res?.data) {
          await reload();
          Message.success("添加客户成功");
          done();
        } else {
          done(false);
        }
      });
    };

    // 禁用客户
    const handleDisableClient = async (id: number, status: number) => {
      const res = await ClientDisableClient({ id, status: status ? 0 : 1 });
      if (res?.data) {
        reload();
        Message.success(`${status ? "禁用" : "启用"}客户成功`);
      }
    };

    // 删除客户
    const handleDeleteClient = async (id: number) => {
      const res = await ClientDeleteClient({ id });
      if (res?.data) {
        reload();
        Message.success("删除客户成功");
      }
    };

    // 补单搜索客户
    const onSearchUser = async (keyword: string) => {
      loads.clients = true;
      const res = await ClientGetClients({ pageSize: 20, current: 1, keyword });
      if (res?.data) state.coverClients = res.data.list;
      loads.clients = false;
    };

    // 商品补单
    const handleCoverGoods = (done: Function) => {
      coverRef.value.validate(async (errors) => {
        if (errors) return done(false);
        const res = await ClientCoverGoods(coverData);
        if (res?.data) {
          await reload();
          Message.success("商品补单成功");
          done();
        } else {
          done(false);
        }
      });
    };

    return () => {
      return (
        <div>
          <Modal
            v-model:visible={formModal.value}
            width={400}
            unmountOnClose
            title="添加客户"
            onBeforeOk={handleCreateClient}
            onBeforeClose={() => formRef.value.resetFields()}
          >
            <Form model={formData} layout="vertical" ref={formRef} rules={formRules}>
              <FormSelect
                v-model={formData.source}
                label="客户来源"
                field="source"
                dicts={[
                  { value: "tb", label: "淘宝" },
                  { value: "pdd", label: "拼多多" },
                ]}
                placeholder="淘宝"
              />
              <FormInput
                v-model={formData.tb}
                label="来源账号"
                field="tb"
                placeholder="用户淘宝或PDD账号"
              />
              <FormInput
                v-model={formData.account}
                label="用户名"
                field="account"
                placeholder="account"
              />
              <FormInput
                v-model={formData.passwd}
                label="密码"
                field="passwd"
                placeholder="password"
              />
            </Form>
          </Modal>

          <Modal
            v-model:visible={coverModal.value}
            width={400}
            unmountOnClose
            title="商品补单"
            onOpen={_LoadGoodsList}
            onBeforeOk={handleCoverGoods}
            onBeforeClose={() => coverRef.value.resetFields()}
          >
            <Form model={coverData} layout="vertical" ref={coverRef} rules={coverRules}>
              <FormSelect
                v-model={coverData.source}
                label="订单来源"
                field="source"
                dicts={[
                  { value: "tb", label: "淘宝" },
                  { value: "pdd", label: "拼多多" },
                ]}
                placeholder="淘宝"
              />
              <FormInput
                v-model={coverData.orderNo}
                label="订单编号"
                field="orderNo"
                placeholder="请输入来源订单编号"
              />
              <FormItem label="补单客户" field="clientId" hideAsterisk>
                <Select
                  v-model={coverData.clientId}
                  placeholder="请输入搜索补单客户"
                  allowSearch
                  loading={loads.clients}
                  onSearch={onSearchUser}
                >
                  {state.coverClients.map((item) => (
                    <Option value={item.id}>
                      来源账号【{item.tb}】 用户名【{item.account}】
                    </Option>
                  ))}
                </Select>
              </FormItem>
              <FormItem label="补单商品" field="goodsId" hideAsterisk>
                <Select
                  v-model={coverData.goodsId}
                  placeholder="请选择商品"
                  loading={loads.goods}
                >
                  {state.goods.map((item) => (
                    <Option value={item.id}>
                      {item.name} | {item.price} ¥ | {item.sku}
                    </Option>
                  ))}
                </Select>
              </FormItem>
              <FormItem label="备注信息" field="mask" hideAsterisk>
                <Textarea v-model={coverData.mask} placeholder="...备注信息" />
              </FormItem>
            </Form>
          </Modal>

          <div class="table_filter">
            <div>
              <Button
                type="primary"
                class="mr-3"
                onClick={() => (formModal.value = true)}
              >
                添加客户
              </Button>
              <Button
                type="primary"
                status="warning"
                onClick={() => (coverModal.value = true)}
              >
                商品补单
              </Button>
            </div>
            <div>
              <Input v-model={keyword.value} placeholder="请输入来源账号或用户名" />
            </div>
          </div>
          <div class="table__card">
            <Table
              columns={columns}
              data={dataList.value}
              loading={loading.value}
              pagination={pagination}
              onPageSizeChange={onChange.pageSize}
              onPageChange={onChange.current}
              v-slots={{
                source: ({ record }: TableSlot<Clients>) => {
                  if (record.source === "tb") return <Tag color="#ffb400">淘宝</Tag>;
                  if (record.source === "pdd") return <Tag color="#f53f3f">拼多多</Tag>;
                },
                used: ({ record }: TableSlot<Clients>) => `${record.used} GB`,
                traffic: ({ record }: TableSlot<Clients>) => `${record.traffic} GB`,
                expireAt: ({ record }: TableSlot<Clients>) => {
                  return dayjs(record.expireAt).format("MM/DD HH:mm");
                },
                status: ({ record }: TableSlot<Clients>) => {
                  if (record.status) return <Tag color="green">启用</Tag>;
                  return <Tag color="red">禁用</Tag>;
                },
                actions: ({ record }: TableSlot<Clients>) => (
                  <div>
                    <Popconfirm
                      type="warning"
                      content={`确认要${record.status ? "禁用" : "启用"}该客户吗？`}
                      onOk={() => handleDisableClient(record.id, record.status)}
                    >
                      {record.status ? (
                        <Link status="warning">禁用</Link>
                      ) : (
                        <Link status="success">启用</Link>
                      )}
                    </Popconfirm>

                    <Popconfirm
                      type="error"
                      content="确认要删除该客户吗？"
                      onOk={() => handleDeleteClient(record.id)}
                    >
                      <Link status="danger">删除</Link>
                    </Popconfirm>
                  </div>
                ),
              }}
            />
          </div>
        </div>
      );
    };
  },
});
