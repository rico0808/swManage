import {
  Button,
  DatePicker,
  Form,
  FormItem,
  Input,
  InputNumber,
  Modal,
  Radio,
  RadioGroup,
  Table,
} from "@arco-design/web-vue";
import { defineComponent, reactive, ref } from "vue";

export default defineComponent(() => {
  const columns = [
    { title: "ID", dataIndex: "id", ellipsis: true },
    { title: "用户名", dataIndex: "phone", ellipsis: true },
    { title: "密码", dataIndex: "passwd", ellipsis: true },
    { title: "已用流量", dataIndex: "used", ellipsis: true },
    { title: "总流量", dataIndex: "traffic", ellipsis: true },
    { title: "到期时间", dataIndex: "expireAt", ellipsis: true },
    { title: "状态", dataIndex: "status", ellipsis: true },
    { title: "操作", dataIndex: "actions", ellipsis: true },
  ];

  const showModal = ref(false);
  const isEdit = ref(false);
  const formData = reactive({
    tb: "",
    account: "",
    passwd: "",
    used: 0,
    traffic: 0,
    expireAt: "",
    status: 1,
  });
  const modal = (
    <Modal v-model:visible={showModal.value} v-slots={{ title: () => "添加客户" }} width={430}>
      <Form model={formData} layout="vertical">
        <FormItem label="淘宝ID">
          <Input v-model={formData.tb} />
        </FormItem>
        <FormItem label="用户名">
          <Input v-model={formData.account} />
        </FormItem>
        <FormItem label="密码">
          <Input v-model={formData.passwd} />
        </FormItem>
        <FormItem label="已用流量">
          <InputNumber
            v-model={formData.used}
            v-slots={{ append: () => "GB" }}
            hideButton
            max={9999}
          />
        </FormItem>
        <FormItem label="总流量">
          <InputNumber
            v-model={formData.traffic}
            v-slots={{ append: () => "GB" }}
            hideButton
            max={9999}
          />
        </FormItem>
        <FormItem label="过期时间">
          <DatePicker v-model={formData.expireAt} class="w-full" />
        </FormItem>
        <FormItem label="状态">
          <RadioGroup v-model={formData.status}>
            <Radio value={1}>启用</Radio>
            <Radio value={0}>禁用</Radio>
          </RadioGroup>
        </FormItem>
      </Form>
    </Modal>
  );

  const render = () => {
    return (
      <div>
        {modal}
        <div v-Permission={[["admin"]]} class="mb-3">
          <Button type="primary">添加客户</Button>
        </div>
        <Table columns={columns} />
      </div>
    );
  };

  return render;
});
