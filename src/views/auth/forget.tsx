import { AuthSendCode, AuthUserForget } from "@/api/controllers/AuthController";
import { Password, Phone, PhoneCode } from "@/components/form";
import router from "@/routers";
import { Button, Form, FormItem, Link, Message } from "@arco-design/web-vue";
import { defineComponent, reactive } from "vue";
import { ForgetRules } from "./rules";

export default defineComponent(() => {
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
    if (res) {
      Message.success("重置密码成功，请登录");
      router.push({ name: "Login" });
    }
  };

  const render = () => {
    return (
      <div>
        <Form
          model={formData}
          layout="vertical"
          size="large"
          rules={ForgetRules}
          onSubmit={handleSubmit}
        >
          <FormItem label="登录手机" field="phone" hideAsterisk>
            <Phone v-model={formData.phone} />
          </FormItem>
          <FormItem label="验证码" field="code" hideAsterisk>
            <PhoneCode
              v-model={formData.code}
              onSend={async () => {
                if (formData.phone) {
                  const res = await AuthSendCode({ phone: formData.phone, type: 2 });
                  res && Message.success("发送验证码成功");
                } else {
                  Message.warning("请输入登录手机号码");
                }
              }}
            />
          </FormItem>
          <FormItem label="登录密码" field="passwd" hideAsterisk>
            <Password v-model={formData.passwd} />
          </FormItem>
          <FormItem label="重复密码" field="repasswd" hideAsterisk>
            <Password v-model={formData.repasswd} />
          </FormItem>
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

  return render;
});
