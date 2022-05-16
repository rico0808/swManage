import usePagination from "@/hooks/usePagination";
import type { TableSlot } from "@/types";
import {
  Button,
  Col,
  Form,
  FormItem,
  Input,
  InputNumber,
  Link,
  Message,
  Modal,
  Option,
  Popconfirm,
  Radio,
  RadioGroup,
  Row,
  Select,
  Table,
  Tag,
} from "@arco-design/web-vue";
import type { TableColumnData, FieldRule } from "@arco-design/web-vue";
import _ from "lodash";
import { defineComponent, reactive, ref } from "vue";
import { ServerGetServers } from "@/api/controllers/ServerController";
import { Servers } from "@/api/entity/Servers";
import {
  NodeCreateNode,
  NodeDeleteNode,
  NodeDisableNode,
  NodeGetNodes,
  NodeSwitchNodeServer,
} from "@/api/controllers/NodeController";
import { Nodes } from "@/api/entity/Nodes";
import { NodesItem } from "@/api/controllers/NodeController/types";
import { IconSwap } from "@arco-design/web-vue/es/icon";

// 表格列
const columns: Array<TableColumnData> = [
  { title: "ID", dataIndex: "id", ellipsis: true, width: 70 },
  { title: "DDNS", dataIndex: "ddns" },
  { title: "端口", dataIndex: "port" },
  { title: "中转->", slotName: "relay" },
  { title: "->落地", slotName: "land" },
  { title: "状态", slotName: "status", align: "center" },
  { title: "操作", slotName: "actions", width: 200, align: "center" },
];

// 表单规则
const rules: Record<string, FieldRule<any>[]> = {
  ddns: [{ required: true, message: "请输入节点DDNS" }],
  port: [{ required: true, message: "请输入节点端口" }],
  relayID: [{ required: true, message: "请选择节点中转" }],
  landID: [{ required: true, message: "请输入节点落地" }],
};

export default defineComponent({
  setup() {
    const { dataList, pagination, loading, onChange, reload } =
      usePagination<Nodes>(NodeGetNodes);

    const serverLoading = ref(true);

    const switchModel = ref(false);
    const formRef = ref();
    const formModal = ref(false);
    const formData = reactive({
      ddns: "",
      port: null,
      relayID: null,
      landID: null,
    });

    const state = reactive({
      relayServers: ref<Array<Servers>>([]),
      landServers: ref<Array<Servers>>([]),
      switchServerList: ref<Array<Servers>>([]),
      switchData: {
        id: 0,
        serverId: 0,
        type: 0,
      },
    });

    // 创建节点
    const handleCreate = (done: Function) => {
      formRef.value.validate(async (errors) => {
        if (errors) return done(false);
        loading.value = true;
        const res = await NodeCreateNode(formData);
        if (res) {
          await reload();
          Message.success("添加节点成功");
          done();
        } else {
          done(false);
        }
        loading.value = false;
      });
    };

    // 删除节点
    const handleDelete = async (id: number) => {
      loading.value = true;
      const res = await NodeDeleteNode({ id });
      if (res) {
        await reload();
        Message.success("删除节点成功");
      }
      loading.value = false;
    };

    // 禁用节点
    const handleDisable = async (id: number, status: number) => {
      loading.value = true;
      const res = await NodeDisableNode({ id, status: status ? 0 : 1 });
      if (res) {
        await reload();
        Message.success("操作节点成功");
      }
      loading.value = false;
    };

    // 加载服务器列表
    const _LoadServerList = async () => {
      const res = await ServerGetServers({ pageSize: 999, current: 1 });
      if (!res) return;
      state.relayServers = [];
      state.landServers = [];
      res.data.list.forEach((item) => {
        if (item.status) {
          if (item.type === 0) state.relayServers.push(item);
          if (item.type === 1) state.landServers.push(item);
        }
      });
      serverLoading.value = false;
    };

    // 切换服务器
    const handleOpenSwitchModal = async (node: NodesItem, type: number) => {
      await _LoadServerList();
      state.switchServerList = type ? state.landServers : state.relayServers;
      state.switchData.id = node.id;
      state.switchData = {
        id: node.id,
        serverId: type ? node.land.id : node.relay.id,
        type,
      };
      switchModel.value = true;
    };

    // 切换服务器
    const handleSwitchServer = (done: Function) => {
      done();
      Modal.warning({
        title: "切换服务器",
        content: "确认切换服务器吗？切换服务器存在5-10分钟全国DNS生效问题。",
        onOk: async () => {
          const res = await NodeSwitchNodeServer(state.switchData);
          if (res) {
            Message.success("节点切换服务器成功");
            reload();
            done();
          }
        },
        hideCancel: false,
        onCancel: () => (switchModel.value = true),
      });
    };

    // 渲染
    return () => {
      const serverTag = (status: number, text: string) => {
        const _status = status ? "normal" : "danger";
        return <Link status={_status}>{text}</Link>;
      };

      return (
        <div>
          <Button
            type="primary"
            onClick={() => {
              _LoadServerList();
              formModal.value = true;
            }}
          >
            添加节点
          </Button>
          <div class="table__card">
            <Table
              columns={columns}
              data={dataList.value}
              loading={loading.value}
              pagination={pagination}
              onPageSizeChange={onChange.pageSize}
              onPageChange={onChange.current}
              v-slots={{
                relay: ({ record }: TableSlot<NodesItem>) => {
                  const { relay } = record;
                  return (
                    <div>
                      {serverTag(relay.status, relay.name)}{" "}
                      <span onClick={() => handleOpenSwitchModal(record, 0)}>
                        <IconSwap class="cursor-pointer" />
                      </span>
                    </div>
                  );
                },
                land: ({ record }: TableSlot<NodesItem>) => {
                  const { land } = record;
                  return (
                    <div>
                      {serverTag(land.status, land.name)}
                      <span onClick={() => handleOpenSwitchModal(record, 1)}>
                        <IconSwap class="cursor-pointer" />
                      </span>
                    </div>
                  );
                },
                status: ({ record }: TableSlot<Servers>) => {
                  if (record.status === 0) return <Tag color="red">禁用</Tag>;
                  if (record.status === 1) return <Tag color="green">启用</Tag>;
                },
                actions: ({ record }: TableSlot<Servers>) => (
                  <div>
                    <Popconfirm
                      type="warning"
                      content={`确认要${record.status ? "禁用" : "启用"}该节点吗？`}
                      onOk={() => handleDisable(record.id, record.status)}
                    >
                      {record.status ? (
                        <Link status="warning">禁用</Link>
                      ) : (
                        <Link status="success">启用</Link>
                      )}
                    </Popconfirm>

                    <Popconfirm
                      type="warning"
                      content="确认要删除该节点吗？"
                      onOk={() => handleDelete(record.id)}
                    >
                      <Link status="danger">删除</Link>
                    </Popconfirm>
                  </div>
                ),
              }}
            />
          </div>

          <Modal
            v-model:visible={formModal.value}
            width={450}
            title="添加节点"
            unmountOnClose
            onBeforeOk={handleCreate}
            onBeforeClose={() => formRef.value.resetFields()}
          >
            <Form model={formData} layout="vertical" ref={formRef} rules={rules}>
              <Row gutter={16}>
                <Col span={12}>
                  <FormItem label="DDNS" field="ddns" hideAsterisk>
                    <Input v-model={formData.ddns} placeholder="xx.example.com" />
                  </FormItem>
                </Col>
                <Col span={12}>
                  <FormItem label="连接端口" field="port" hideAsterisk>
                    <InputNumber v-model={formData.port} placeholder="58000" hideButton />
                  </FormItem>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <FormItem label="中转服务器" field="relayID" hideAsterisk>
                    <Select
                      v-model={formData.relayID}
                      placeholder="请选择"
                      loading={serverLoading.value}
                    >
                      {state.relayServers.map((item) => (
                        <Option value={item.id}>{item.name}</Option>
                      ))}
                    </Select>
                  </FormItem>
                </Col>
                <Col span={12}>
                  <FormItem label="落地服务器" field="landID" hideAsterisk>
                    <Select
                      v-model={formData.landID}
                      placeholder="请选择"
                      loading={serverLoading.value}
                    >
                      {state.landServers.map((item) => (
                        <Option value={item.id}>{item.name}</Option>
                      ))}
                    </Select>
                  </FormItem>
                </Col>
              </Row>
            </Form>
          </Modal>

          <Modal
            v-model:visible={switchModel.value}
            width={400}
            title="切换服务器"
            unmountOnClose
            onBeforeOk={handleSwitchServer}
          >
            <RadioGroup v-model={state.switchData.serverId} direction="vertical">
              {state.switchServerList.map((item) => (
                <Radio value={item.id}>
                  {item.name}【{item.ddns}】
                </Radio>
              ))}
            </RadioGroup>
          </Modal>
        </div>
      );
    };
  },
});
