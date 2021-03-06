import { computed, defineComponent } from "vue";
import { RouterView, useRoute, useRouter } from "vue-router";
import { Button, Doption, Dropdown, Menu, MenuItem } from "@arco-design/web-vue";
import css from "./index.module.less";
import useUserStore from "@/store/useUser";
import { storeToRefs } from "pinia";
import _ from "lodash";
import useMenus from "@/hooks/useMenus";
import { isLogin } from "@/utils/tools";

export default defineComponent({
  setup() {
    const router = useRouter();
    const route = useRoute();
    const user = useUserStore();
    const { profile } = storeToRefs(user);
    const { navMenus, dropdowns } = useMenus();

    const activeRoute = computed(() => [route.name]);

    const UserProfile = () => {
      if (isLogin()) {
        return (
          <div>
            <Dropdown
              v-slots={{
                content: () =>
                  dropdowns.value.map(({ meta, name }) => {
                    return <Doption value={name.toString()}>{meta.label}</Doption>;
                  }),
              }}
              onSelect={(name) => router.push({ name })}
            >
              <Button>{profile.value?.phone}</Button>
            </Dropdown>
          </div>
        );
      } else {
        return (
          <Button type="primary" onClick={() => router.push({ name: "Login" })}>
            η» ε½
          </Button>
        );
      }
    };

    return () => {
      return (
        <div class={css.root}>
          <header class={css.header}>
            <div class={[css.container, "flex items-center"]}>
              <Menu mode="horizontal" selected-keys={activeRoute.value} class="-ml-11">
                <MenuItem disabled>
                  <div class={css.logo} onClick={() => router.push({ name: "Root" })}>
                    π η«ε±±δΊζ
                  </div>
                </MenuItem>
                {navMenus.value.map(({ meta, name }) => (
                  <MenuItem onClick={() => router.push({ name })} key={name.toString()}>
                    {meta.label}
                  </MenuItem>
                ))}
              </Menu>
              {UserProfile()}
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
  },
});
