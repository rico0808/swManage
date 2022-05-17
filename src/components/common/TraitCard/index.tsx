import { defineComponent } from "vue";
import css from "./style.module.less";

export default defineComponent({
  props: ["title", "text"],
  setup({ title, text }, { slots }) {
    return () => {
      if (slots.default) {
        return <div class={css.card}>{slots.default()}</div>;
      } else {
        return (
          <div class={css.card}>
            <div class={css.title}>{title}</div>
            <div>{text}</div>
          </div>
        );
      }
    };
  },
});
