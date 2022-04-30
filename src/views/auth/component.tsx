import { Phone, PhoneCode, Password } from "@/components/form";
import { FormItem } from "@arco-design/web-vue";

type Props = { vModel: any };
export const FormPhone = (props: Props) => {
  return (
    <FormItem label="登录手机" field="phone" hideAsterisk>
      <Phone vModel={props.vModel} />
    </FormItem>
  );
};

export const FormPasswd = (props: Props) => {
  return (
    <FormItem label="登录密码" field="passwd" hideAsterisk>
      <Password vModel={props.vModel} />
    </FormItem>
  );
};

export const FormRePasswd = (props: Props) => {
  return (
    <FormItem label="重复密码" field="repasswd" hideAsterisk>
      <Password vModel={props.vModel} />
    </FormItem>
  );
};

interface CodeProps extends Props {
  onSend: () => void;
}
export const FormCode = (props: CodeProps) => {
  return (
    <FormItem label="验证码" field="code" hideAsterisk>
      <PhoneCode vModel={props.vModel} onSend={props.onSend} />
    </FormItem>
  );
};
