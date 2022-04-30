import useUserStore from "@/store/useUser";
import { DirectiveBinding } from "vue";
import _ from "lodash";

const checkPermission = (
  el: HTMLElement,
  binding: DirectiveBinding<Array<string>>
) => {
  const { value } = binding;
  const userStore = useUserStore();
  const { profile } = userStore;

  if (_.isArray(value) && value.length > 0) {
    const hasPermission = value.includes(profile?.role);
    if (!hasPermission && el.parentNode) el.parentNode.removeChild(el);
  } else {
    el.parentNode && el.parentNode.removeChild(el);
    throw new Error(`need roles! Like v-Permission={[['role']]}`);
  }
};

export default {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    checkPermission(el, binding);
  },
  updated(el: HTMLElement, binding: DirectiveBinding) {
    checkPermission(el, binding);
  },
};
