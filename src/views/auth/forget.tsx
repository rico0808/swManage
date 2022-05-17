import { AuthSendCode, AuthUserForget } from "@/api/controllers/AuthController";
import { Password, Phone, PhoneCode } from "@/components/form";
import router from "@/routers";
import { Button, Form, Link, Message } from "@arco-design/web-vue";
import { defineComponent, reactive } from "vue";
import { ForgetRules } from "./rules";

export default defineComponent({
  setup() {
    const formData = reactive({
      phone: "",
      code: "",
      passwd: "",
      repasswd: "",
    });

    // 提交表单
    const handleSubmit = async ({ values, errors }) => {
      if (errors) return;
      const res = await AuthUserForget(formData);
      if (res?.data) {
        Message.success("重置密码成功，请登录");
        router.push({ name: "Login" });
      }
    };

    // 发送验证码
    const handleSendMsgCode = async () => {
      if (formData.phone) {
        const res = await AuthSendCode({ phone: formData.phone, type: 2 });
        res?.data && Message.success("发送验证码成功");
      } else {
        Message.warning("请输入登录手机号码");
      }
    };

    return () => {
      return (
        <div>
          <Form
            model={formData}
            layout="vertical"
            size="large"
            rules={ForgetRules}
            onSubmit={handleSubmit}
          >
            <Phone v-model={formData.phone} />
            <PhoneCode v-model={formData.code} onSend={handleSendMsgCode} />
            <Password v-model={formData.passwd} />
            <Password v-model={formData.repasswd} label="重复密码" field="repasswd" />
            <Button type="primary" class="!h-10 mt-4" long htmlType="submit">
              重置密码
            </Button>
          </Form>
          <div class="mt-8 text-center">
            <Link onClick={() => router.push({ name: "Login" })}>返回登录</Link>
          </div>
        </div>
      );
    };
  },
});
