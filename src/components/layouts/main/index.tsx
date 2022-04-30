import { defineComponent } from "vue";
import { RouterView } from "vue-router";
import { Button, Menu, MenuItem } from "@arco-design/web-vue";
import css from "./index.module.less";
import router from "@/routers";

export default defineComponent(() => {
  const render = () => {
    return (
      <div class={css.root}>
        <header class={css.header}>
          <div class={[css.container, "flex items-center"]}>
            <Menu mode="horizontal" default-selected-keys={[1]} class="-ml-11">
              <MenuItem disabled>
                <div
                  class={css.logo}
                  onClick={() => router.push({ name: "Root" })}
                >
                  🌋 火山云服
                </div>
              </MenuItem>
            </Menu>
            <Button
              type="primary"
              onClick={() => router.push({ name: "Login" })}
            >
              登 录
            </Button>
          </div>
        </header>

        <main class={[css.container, css.main]}>
          <RouterView />
        </main>

        <footer class={css.footer}>
          <div class={css.container}>footer</div>
        </footer>
      </div>
    );
  };

  return render;
});
