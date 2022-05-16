import { Card } from "@arco-design/web-vue";
import { defineComponent } from "vue";
import { RouterView } from "vue-router";
import css from "./index.module.less";

export default defineComponent({
  setup() {
    return () => {
      return (
        <div class={css.root}>
          <Card
            class={[css.card, "w-[420px]"]}
            bordered={false}
            v-slots={{ cover: () => <div class={css.cover} /> }}
          >
            <RouterView class="p-4" />
          </Card>
        </div>
      );
    };
  },
});
