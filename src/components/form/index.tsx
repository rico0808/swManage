import { Button, Input } from "@arco-design/web-vue";
import { defineComponent, Prop, PropType } from "vue";

type Props = { "v-model": any; placeholder?: string };
export const Phone = defineComponent({
  setup(props: Props) {
    return () => (
      <Input
        type="text"
        {...props}
        placeholder={props.placeholder || "请输入手机号码"}
        maxLength={32}
      />
    );
  },
});

export const Password = defineComponent({
  setup(props: Props) {
    return () => (
      <Input
        type="password"
        {...props}
        placeholder={props.placeholder || "请输入密码"}
        maxLength={18}
      />
    );
  },
});

export const PhoneCode = defineComponent({
  // props: ["modelValue", "placeholder"],
  props: {
    modelValue: String,
    placeholder: {
      type: String,
      default: "请输入验证码",
    },
  },
  emits: ["send"],
  setup(props, { emit }) {
    return () => (
      <div class="flex w-full">
        <Input {...props} placeholder={props.placeholder} maxLength={6} />
        <Button type="primary" onClick={() => emit("send")}>
          发送验证码
        </Button>
      </div>
    );
  },
});
