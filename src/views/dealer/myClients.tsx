import {
  ClientAddGoodsClient,
  ClientCreateClient,
  ClientDeleteClient,
  ClientDisableClient,
  ClientGetClients,
} from "@/api/controllers/ClientController";
import { GoodsGetGoods } from "@/api/controllers/GoodsController";
import usePagination from "@/hooks/usePagination";
import useUserStore from "@/store/useUser";
import type { TableSlot } from "@/types";
import {
  Button,
  Form,
  FormItem,
  Input,
  Modal,
  Radio,
  RadioGroup,
  Select,
  Table,
  Option,
  Row,
  Col,
  Message,
  Tag,
  Link,
  Popconfirm,
} from "@arco-design/web-vue";
import dayjs from "dayjs";
import _ from "lodash";
import { defineComponent, reactive, ref } from "vue";
import type { TableColumnData, FieldRule } from "@arco-design/web-vue";
import { Clients } from "@/api/entity/Clients";

export default defineComponent(() => {
  const { pagination, dataList, loading, onChange, reload } =
    usePagination(ClientGetClients);
  const { profile } = useUserStore();

  const loadGoods = ref(false);

  const el = reactive({
    Goods: ref<Array<JSX.Element>>(),
  });

  const formRef = ref();
  const formModal = ref(false);
  const formData = reactive({
    source: "",
    tb: "",
    account: "",
    passwd: "",
    goods: null,
    status: 1,
  });

  // 加载商品列表
  const _LoadGoodsList = async () => {
    loadGoods.value = true;
    const res = await GoodsGetGoods({ pageSize: 999, current: 1 });
    if (res) {
      const { list } = res.data;
      el.Goods = list.map((item) => (
        <Option value={item.id}>
          {item.price} ¥ / {item.name}
        </Option>
      ));
    } else {
      el.Goods = null;
    }
    loadGoods.value = false;
  };

  const handleCreateClient = (done: Function) => {
    formRef.value.validate(async (errors) => {
      if (errors) return done(false);
      const res = await ClientCreateClient(formData);
      if (res) {
        await reload();
        Message.success("添加客户成功");
        done();
      } else {
        done(false);
      }
    });
  };

  const handleDisableClient = async (id: number, status: number) => {
    const res = await ClientDisableClient({ id, status: status ? 0 : 1 });
    if (res) {
      reload();
      Message.success(`${status ? "禁用" : "启用"}客户成功`);
    }
  };

  const handleDeleteClient = async (id: number) => {
    const res = await ClientDeleteClient({ id });
    if (res) {
      reload();
      Message.success("删除客户成功");
    }
  };

  const handleAddGoodsClient = async (id: number) => {
    const res = await ClientAddGoodsClient({ id, goods: formData.goods });
    if (res) {
      reload();
      Message.success("客户添加商品成功");
    }
  };

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

  const rules: Record<string, FieldRule> = {
    source: { required: true, message: "请选择客户来源" },
    tb: { required: true, message: "请输入客户淘宝或拼多多用户名" },
    account: { required: true, message: "请输入客户用户名" },
    passwd: { required: true, message: "请输入客户密码" },
    goods: { required: true, message: "请选择用户可用商品" },
    status: { required: true, message: "请选择用户状态" },
  };

  const render = () => {
    return (
      <div>
        <Modal
          v-model:visible={formModal.value}
          width={430}
          unmountOnClose
          title="添加客户"
          onBeforeOk={handleCreateClient}
          onBeforeClose={() => formRef.value.resetFields()}
        >
          <Form model={formData} layout="vertical" ref={formRef} rules={rules}>
            <Row gutter={16}>
              <Col span={12}>
                <FormItem label="客户来源" field="source" hideAsterisk>
                  <Select v-model={formData.source} placeholder="淘宝">
                    <Option value="tb">淘宝</Option>
                    <Option value="pdd">拼多多</Option>
                  </Select>
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem label="来源账号" field="tb" hideAsterisk>
                  <Input v-model={formData.tb} placeholder="用户淘宝或PDD账号" />
                </FormItem>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <FormItem label="用户名" field="account" hideAsterisk>
                  <Input v-model={formData.account} placeholder="account" />
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem label="密码" field="passwd" hideAsterisk>
                  <Input v-model={formData.passwd} placeholder="password" />
                </FormItem>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <FormItem label="可用商品" field="goods" hideAsterisk>
                  <Select
                    v-model={formData.goods}
                    loading={loadGoods.value}
                    placeholder="请选择可用商品"
                  >
                    {el.Goods}
                  </Select>
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem label="状态" field="status" hideAsterisk>
                  <RadioGroup v-model={formData.status}>
                    <Radio value={1}>启用</Radio>
                    <Radio value={0}>禁用</Radio>
                  </RadioGroup>
                </FormItem>
              </Col>
            </Row>
            <FormItem v-Permission={[["dealer"]]} label="可用余额">
              {profile.blance} ¥
            </FormItem>
          </Form>
        </Modal>

        <div>
          <Button
            type="primary"
            onClick={() => {
              formModal.value = true;
              _LoadGoodsList();
            }}
          >
            添加客户
          </Button>
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
                    position="left"
                    onBeforeCancel={() => (formData.goods = null)}
                    onOk={() => handleAddGoodsClient(record.id)}
                    v-slots={{
                      icon: () => "",
                      content: () => {
                        return (
                          <div class="-ml-1 w-[250px]">
                            <div class="mb-2">可用余额：{profile.blance} ¥</div>
                            <Select
                              v-model={formData.goods}
                              placeholder="请选择添加的商品"
                            >
                              {el.Goods}
                            </Select>
                          </div>
                        );
                      },
                    }}
                  >
                    <Link onClick={() => _LoadGoodsList()}>添加商品</Link>
                  </Popconfirm>
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

  return render;
});
