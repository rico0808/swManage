import router from "@/routers";
import { Button, Form, Link } from "@arco-design/web-vue";
import { defineComponent, reactive } from "vue";
import { FormCode, FormPhone, FormPasswd, FormRePasswd } from "./component";
import { ForgetRules } from "./rules";

export default defineComponent(() => {
  const formData = reactive({
    phone: "",
    code: "",
    passwd: "",
    repasswd: "",
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
          rules={ForgetRules}
          onSubmit={handleSubmit}
        >
          <FormPhone vModel={formData.phone} />
          <FormCode vModel={formData.code} onSend={() => {}} />
          <FormPasswd vModel={formData.passwd} />
          <FormRePasswd vModel={formData.repasswd} />
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
