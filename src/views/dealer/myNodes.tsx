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
} from "@/api/controllers/NodeController";
import { Nodes } from "@/api/entity/Nodes";
import { NodesItem } from "@/api/controllers/NodeController/types";

export default defineComponent(() => {
  const { dataList, pagination, loading, onChange, reload } =
    usePagination<Nodes>(NodeGetNodes);

  const serverLoading = ref(true);

  const formRef = ref();
  const formModal = ref(false);
  const formData = reactive({
    ddns: "",
    port: null,
    relayID: null,
    landID: null,
  });

  const el = reactive({
    relayServers: ref<Array<JSX.Element>>([]),
    landServers: ref<Array<JSX.Element>>([]),
  });

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

  const handleDelete = async (id: number) => {
    loading.value = true;
    const res = await NodeDeleteNode({ id });
    if (res) {
      await reload();
      Message.success("删除节点成功");
    }
    loading.value = false;
  };

  const handleDisable = async (id: number, status: number) => {
    loading.value = true;
    const res = await NodeDisableNode({ id, status: status ? 0 : 1 });
    if (res) {
      await reload();
      Message.success("操作节点成功");
    }
    loading.value = false;
  };

  const _LoadServerList = async () => {
    const res = await ServerGetServers({ pageSize: 999, current: 1 });
    if (!res) return;
    const relayEl = [];
    const landEl = [];
    res.data.list.forEach((item) => {
      const elOption = <Option value={item.id}>{item.name}</Option>;
      if (item.status) {
        item.type ? landEl.push(elOption) : relayEl.push(elOption);
      }
    });
    el.relayServers = relayEl;
    el.landServers = landEl;
    serverLoading.value = false;
  };

  const columns: Array<TableColumnData> = [
    { title: "ID", dataIndex: "id", ellipsis: true, width: 70 },
    { title: "DDNS", dataIndex: "ddns" },
    { title: "端口", dataIndex: "port" },
    { title: "中转->", slotName: "relay" },
    { title: "->落地", slotName: "land" },
    { title: "状态", slotName: "status", align: "center" },
    { title: "操作", slotName: "actions", width: 200, align: "center" },
  ];

  const rules: Record<string, FieldRule<any>[]> = {
    ddns: [{ required: true, message: "请输入节点DDNS" }],
    port: [{ required: true, message: "请输入节点端口" }],
    relayID: [{ required: true, message: "请选择节点中转" }],
    landID: [{ required: true, message: "请输入节点落地" }],
  };

  const render = () => {
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
                return serverTag(relay.status, relay.name);
              },
              land: ({ record }: TableSlot<NodesItem>) => {
                const { land } = record;
                return serverTag(land.status, land.name);
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
                    {el.relayServers}
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
                    {el.landServers}
                  </Select>
                </FormItem>
              </Col>
            </Row>
          </Form>
        </Modal>
      </div>
    );
  };

  return render;
});
