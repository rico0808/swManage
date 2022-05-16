import { Button, FormItem, Input } from "@arco-design/web-vue";
import { defineComponent } from "vue";

export const Phone = defineComponent({
  props: {
    modelValue: String,
    placeholder: {
      type: String,
      default: "请输入手机号码",
    },
  },
  emits: ["update:modelValue"],
  setup(props, { emit }) {
    return () => (
      <FormItem label="手机号码" field="phone" hideAsterisk>
        <Input
          type="text"
          modelValue={props.modelValue}
          onUpdate:modelValue={(value) => emit("update:modelValue", value)}
          placeholder={props.placeholder || "请输入手机号码"}
          maxLength={32}
        />
      </FormItem>
    );
  },
});

export const Password = defineComponent({
  props: {
    label: { type: String, default: "登录密码" },
    field: { type: String, default: "passwd" },
    modelValue: String,
    placeholder: {
      type: String,
      default: "请输入密码",
    },
  },
  emits: ["update:modelValue"],
  setup(props, { emit }) {
    return () => (
      <FormItem label={props.label} field={props.field} hideAsterisk>
        <Input
          type="password"
          modelValue={props.modelValue}
          onUpdate:modelValue={(value) => emit("update:modelValue", value)}
          placeholder={props.placeholder || "请输入密码"}
          maxLength={18}
        />
      </FormItem>
    );
  },
});

export const PhoneCode = defineComponent({
  props: {
    modelValue: String,
    placeholder: {
      type: String,
      default: "请输入验证码",
    },
  },
  emits: ["send", "update:modelValue"],
  setup(props, { emit }) {
    return () => (
      <FormItem label="验证码" field="code" hideAsterisk>
        <Input
          modelValue={props.modelValue}
          onUpdate:modelValue={(value) => emit("update:modelValue", value)}
          placeholder={props.placeholder}
          maxLength={6}
        />
        <Button type="primary" onClick={() => emit("send")}>
          发送验证码
        </Button>
      </FormItem>
    );
  },
});
