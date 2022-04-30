import { Button, Input } from "@arco-design/web-vue";

type Props = { vModel: any; placeholder?: string };
export const Phone = (props: Props) => {
  return (
    <Input
      type="text"
      v-model={props.vModel}
      placeholder={props.placeholder || "请输入手机号码"}
      maxLength={32}
    />
  );
};

export const Password = (props: Props) => {
  return (
    <Input
      type="password"
      v-model={props.vModel}
      placeholder={props.placeholder || "请输入密码"}
      maxLength={18}
    />
  );
};

interface CodeProps extends Props {
  onSend: () => void;
}
export const PhoneCode = (props: CodeProps) => {
  return (
    <div class="flex w-full">
      <Input
        v-model={props.vModel}
        placeholder={props.placeholder || "请输入验证码"}
        maxLength={6}
      />
      <Button type="primary" onClick={props.onSend}>
        发送验证码
      </Button>
    </div>
  );
};
