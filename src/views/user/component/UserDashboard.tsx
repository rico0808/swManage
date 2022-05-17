import { GetJionDealer, UserJionDealer } from "@/api/controllers/DashboardController";
import TraitCard from "@/components/common/TraitCard";
import { FormInput } from "@/components/form";
import {
  Alert,
  Button,
  Col,
  FieldRule,
  Form,
  Message,
  Modal,
  Row,
} from "@arco-design/web-vue";
import { defineComponent, onMounted, reactive, ref } from "vue";

const userTraits = [
  { title: "丰富产品", text: "123" },
  { title: "丰富产品", text: "123" },
  { title: "丰富产品", text: "123" },
];

const rules: Record<string, FieldRule> = {
  url: { required: true, message: "请输入店铺地址" },
  business: { required: true, message: "请输入店铺主营业务" },
};

export default defineComponent({
  setup() {
    const formRef = ref();
    const formModal = ref(false);
    const formData = reactive({
      url: "",
      business: "",
    });

    const state = reactive({
      status: null,
      reason: "",
    });

    const onLoadJoinDealerStatus = async () => {
      const res = await GetJionDealer();
      if (res?.data) {
        state.status = res.data.status;
        state.reason = res.data.reason;
      } else {
        state.status = null;
      }
    };

    // 显示modal
    const handleShowModal = () => (formModal.value = true);

    // 加入分销
    const handleJonDealer = (done: Function) => {
      formRef.value.validate(async (errors) => {
        if (errors) return done(false);
        const res = await UserJionDealer(formData);
        if (res?.data) {
          Message.success("申请加入分销成功，我们将尽快为您审核");
          onLoadJoinDealerStatus();
          done(true);
        }
      });
    };

    onMounted(async () => onLoadJoinDealerStatus());

    return () => (
      <div>
        <Modal
          v-model:visible={formModal.value}
          width={400}
          unmountOnClose
          title="分销加入申请"
          onBeforeOk={handleJonDealer}
          onBeforeClose={() => formRef.value.resetFields()}
        >
          <Form ref={formRef} model={formData} layout="vertical" rules={rules}>
            <FormInput v-model={formData.url} label="店铺地址" field="url" />
            <FormInput v-model={formData.business} label="主营业务" field="business" />
          </Form>
        </Modal>

        <TraitCard class="mb-3 flex justify-center">
          {() => {
            if (!state.status) {
              return (
                <Button
                  size="large"
                  type="primary"
                  status="normal"
                  onClick={handleShowModal}
                >
                  加入分销
                </Button>
              );
            }
            if (state.status === 1) {
              return (
                <Button size="large" type="primary" status="warning">
                  申请审核中
                </Button>
              );
            }
            if (state.status === 2) {
              return (
                <div class="text-center">
                  <Alert class="mb-3" type="error">
                    {state.reason}
                  </Alert>
                  <Button
                    size="large"
                    type="primary"
                    status="danger"
                    onClick={handleShowModal}
                  >
                    审核失败，重新申请
                  </Button>
                </div>
              );
            }
            if (state.status === 3) {
              return (
                <div class="text-center">
                  <Alert class="mb-3" type="success">
                    {state.reason || "审核通过，重新登录将以新的身份进入"}
                  </Alert>
                  <Button size="large" type="primary" status="success">
                    审核通过
                  </Button>
                </div>
              );
            }
          }}
        </TraitCard>
        <Row gutter={16}>
          {userTraits.map(({ title, text }) => (
            <Col span={24 / userTraits.length}>
              <TraitCard title={title} text={text} />
            </Col>
          ))}
        </Row>
      </div>
    );
  },
});
