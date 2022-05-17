import {
  Button,
  FormItem,
  Input,
  InputNumber,
  Option,
  Select,
} from "@arco-design/web-vue";
import { defineComponent, PropType } from "vue";

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
          placeholder={props.placeholder}
          maxLength={11}
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
          placeholder={props.placeholder}
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

export const FormInput = defineComponent({
  props: {
    modelValue: String,
    label: String,
    field: String,
    placeholder: {
      type: String,
      default: "请输入",
    },
  },
  emits: ["update:modelValue"],
  setup(props, { emit }) {
    return () => (
      <FormItem label={props.label} field={props.field} hideAsterisk>
        <Input
          type="text"
          modelValue={props.modelValue}
          onUpdate:modelValue={(value) => emit("update:modelValue", value)}
          placeholder={props.placeholder}
        />
      </FormItem>
    );
  },
});

export const FormInputNumber = defineComponent({
  props: {
    modelValue: Number,
    label: String,
    field: String,
    placeholder: {
      type: String,
      default: "请输入",
    },
  },
  emits: ["update:modelValue"],
  setup(props, { emit }) {
    return () => (
      <FormItem label={props.label} field={props.field} hideAsterisk>
        <InputNumber
          modelValue={props.modelValue}
          onUpdate:modelValue={(value) => emit("update:modelValue", value)}
          placeholder={props.placeholder}
          hideButton
        />
      </FormItem>
    );
  },
});

export const FormSelect = defineComponent({
  props: {
    modelValue: String || Number,
    label: String,
    field: String,
    dicts: Array as PropType<Array<{ value: string | number; label: string }>>,
    placeholder: {
      type: String,
      default: "请选择",
    },
  },
  emits: ["update:modelValue"],
  setup(props, { emit }) {
    return () => (
      <FormItem label={props.label} field={props.field} hideAsterisk>
        <Select
          modelValue={props.modelValue}
          onUpdate:modelValue={(value) => emit("update:modelValue", value)}
          placeholder={props.placeholder}
        >
          {props.dicts.map((item) => (
            <Option value={item.value}>{item.label}</Option>
          ))}
        </Select>
      </FormItem>
    );
  },
});
