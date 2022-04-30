import { Card } from "@arco-design/web-vue";
import { defineComponent } from "vue";
import { RouterView } from "vue-router";
import css from "./index.module.less";

export default defineComponent(() => {
  const cover = () => {
    return <div class={css.cover} />;
  };

  const render = () => {
    return (
      <div class={css.root}>
        <Card class={[css.card, "w-[420px]"]} bordered={false} v-slots={{ cover }}>
          <RouterView class="p-4" />
        </Card>
      </div>
    );
  };
  return render;
});
