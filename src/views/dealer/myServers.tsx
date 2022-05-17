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
import {
  ServerCreateServer,
  ServerDeleteServer,
  ServerGetServers,
} from "@/api/controllers/ServerController";
import { Servers } from "@/api/entity/Servers";
import { FormInput, FormInputNumber, FormSelect } from "@/components/form";

const columns: Array<TableColumnData> = [
  { title: "ID", dataIndex: "id", ellipsis: true, width: 70 },
  { title: "类型", slotName: "type", align: "center", width: 100 },
  { title: "名称", dataIndex: "name" },
  { title: "DDNS", dataIndex: "ddns", width: 250 },
  { title: "IP地址", dataIndex: "ip" },
  { title: "GostPort", dataIndex: "port", align: "center" },
  { title: "PathPrefix", dataIndex: "key" },
  { title: "状态", slotName: "status", align: "center" },
  { title: "操作", slotName: "actions", align: "center" },
];

const rules: Record<string, FieldRule<any>[]> = {
  type: [{ required: true, message: "请选择服务器类型" }],
  name: [{ required: true, message: "请输入服务器名称" }],
  ddns: [{ required: true, message: "请输入服务器DDNS地址" }],
  ip: [{ required: true, message: "请输入服务器IP地址" }],
  port: [{ required: true, message: "请输入 Gost API端口" }],
  key: [{ required: true, message: "请输入 Gost PathPrefix" }],
};

export default defineComponent({
  setup() {
    const { dataList, pagination, loading, onChange, reload } =
      usePagination<Servers>(ServerGetServers);

    const formRef = ref();
    const formModal = ref(false);
    const formData = reactive({
      type: 0,
      name: "",
      ddns: "",
      ip: "",
      port: null,
      key: "",
    });

    const handleCreate = (done: Function) => {
      formRef.value.validate(async (errors) => {
        if (errors) return done(false);
        loading.value = true;
        const res = await ServerCreateServer(formData);
        if (res?.data) {
          await reload();
          Message.success("添加服务器成功");
          done();
        } else {
          done(false);
        }
        loading.value = false;
      });
    };

    const handleDelete = async (id: number) => {
      loading.value = true;
      const res = await ServerDeleteServer({ id });
      if (res?.data) {
        await reload();
        Message.success("删除服务器成功");
      }
      loading.value = false;
    };

    return () => {
      return (
        <div>
          <Button type="primary" onClick={() => (formModal.value = true)}>
            添加服务器
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
                type: ({ record }: TableSlot<Servers>) => {
                  if (record.type === 0) return <Tag color="#168cff">中转 -&gt;</Tag>;
                  if (record.type === 1) return <Tag color="#00b42a">-&gt; 落地</Tag>;
                },
                status: ({ record }: TableSlot<Servers>) => {
                  if (record.status === 0) return <Tag color="red">离线</Tag>;
                  if (record.status === 1) return <Tag color="green">在线</Tag>;
                },
                actions: ({ record }: TableSlot<Servers>) => (
                  <div>
                    <Popconfirm
                      type="warning"
                      content="确认要删除该服务器吗？"
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
            width={500}
            title="添加服务器"
            onBeforeOk={handleCreate}
            onBeforeClose={() => formRef.value.resetFields()}
          >
            <Form model={formData} layout="vertical" ref={formRef} rules={rules}>
              <Row gutter={16}>
                <Col span={12}>
                  <FormSelect
                    v-model={formData.type}
                    label="服务器类型"
                    field="type"
                    dicts={[
                      { label: "中转", value: 0 },
                      { label: "落地", value: 1 },
                    ]}
                  />
                </Col>
                <Col span={12}>
                  <FormInput
                    v-model={formData.name}
                    label="服务器名称"
                    field="name"
                    placeholder="..."
                  />
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <FormItem label="服务器DDNS" field="ddns" hideAsterisk>
                    <Input
                      v-model={formData.ddns}
                      placeholder="..."
                      v-slots={{ append: () => "server.nsns.club" }}
                    />
                  </FormItem>
                </Col>
                <Col span={12}>
                  <FormInput
                    v-model={formData.ip}
                    label="服务器IP"
                    field="ip"
                    placeholder="..."
                  />
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <FormInputNumber
                    v-model={formData.port}
                    label="Gost API端口"
                    field="port"
                    placeholder="10240"
                  />
                </Col>
                <Col span={12}>
                  <FormInput
                    v-model={formData.key}
                    label="Gost PathPrefix"
                    field="key"
                    placeholder="..."
                  />
                </Col>
              </Row>
            </Form>
          </Modal>
        </div>
      );
    };
  },
});
