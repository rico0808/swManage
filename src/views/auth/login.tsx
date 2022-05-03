import router from "@/routers";
import { Button, Checkbox, Divider, Form, Link } from "@arco-design/web-vue";
import { defineComponent, reactive } from "vue";
import { FormPhone, FormPasswd } from "./component";
import { LoginRules } from "./rules";

export default defineComponent(() => {
  const formData = reactive({
    phone: "",
    passwd: "",
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
          rules={LoginRules}
          onSubmit={handleSubmit}
        >
          <FormPhone vModel={formData.phone} />
          <FormPasswd vModel={formData.passwd} />
          <div class="flex items-center justify-between -ml-1 mb-4">
            <Checkbox>记住我</Checkbox>
            <Link onClick={() => router.push({ name: "Forget" })}>
              找回密码
            </Link>
          </div>
          <Button type="primary" class={"!h-10"} long htmlType="submit">
            登 录
          </Button>
        </Form>
        <div class="pt-4 pb-3">
          <Divider>或</Divider>
        </div>
        <Button
          type="secondary"
          class={"!h-10"}
          long
          onClick={() => router.push({ name: "Register" })}
        >
          注册账号
        </Button>
      </div>
    );
  };

  return render;
});