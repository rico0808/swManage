import { AuthSendCode, AuthUserRegister } from "@/api/controllers/AuthController";
import { Password, Phone, PhoneCode } from "@/components/form";
import { Button, Checkbox, Form, Link, Message } from "@arco-design/web-vue";
import { defineComponent, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { RegisterRules } from "./rules";

export default defineComponent({
  setup() {
    const route = useRoute();
    const router = useRouter();

    const formData = reactive({
      phone: "",
      code: "",
      passwd: "",
      repasswd: "",
      invite: (route.query?.invite as string) || "",
    });

    const checked = ref(false);

    // 提交表单
    const handleSubmit = async ({ values, errors }) => {
      if (errors) return;
      if (checked.value) {
        const res = await AuthUserRegister(formData);
        if (res?.data) {
          Message.success("注册成功，请登录");
          router.push({ name: "Login" });
        }
      } else {
        Message.warning("请先阅读并同意用户协议");
      }
    };

    // 发送验证码
    const handleSendMsgCode = async () => {
      if (formData.phone) {
        const res = await AuthSendCode({ phone: formData.phone, type: 1 });
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
            rules={RegisterRules}
            onSubmit={handleSubmit}
          >
            <Phone v-model={formData.phone} />
            <PhoneCode v-model={formData.code} onSend={handleSendMsgCode} />
            <Password v-model={formData.passwd} />
            <Password v-model={formData.repasswd} label="重复密码" field="repasswd" />
            <div class="-ml-1 mb-4">
              <Checkbox v-model={checked.value}>
                阅读并同意
                <Link onClick={(e: Event) => e.preventDefault()}>用户协议</Link>
              </Checkbox>
            </div>
            <Button type="primary" class={"!h-10"} long htmlType="submit">
              注册账号
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
