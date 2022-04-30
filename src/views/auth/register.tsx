import router from "@/routers";
import { Button, Checkbox, Form, Link } from "@arco-design/web-vue";
import { defineComponent, reactive } from "vue";
import { useRoute } from "vue-router";
import { FormCode, FormPhone, FormPasswd, FormRePasswd } from "./component";
import { RegisterRules } from "./rules";

export default defineComponent(() => {
  const route = useRoute();

  const formData = reactive({
    phone: "",
    code: "",
    passwd: "",
    repasswd: "",
    invite: route.query?.invite || "",
  });

  // 提交表单
  const handleSubmit = ({ values, errors }) => {
    if (errors) return;
    console.log(values);
  };

  const render = () => {
    return (
      <div>
        <Form
          model={formData}
          layout="vertical"
          size="large"
          rules={RegisterRules}
          onSubmit={handleSubmit}
        >
          <FormPhone vModel={formData.phone} />
          <FormCode vModel={formData.code} onSend={() => {}} />
          <FormPasswd vModel={formData.passwd} />
          <FormRePasswd vModel={formData.repasswd} />
          <div class="-ml-1 mb-4">
            <Checkbox>
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

  return render;
});
