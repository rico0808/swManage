import { computed, defineComponent } from "vue";
import { RouterView, useRoute, useRouter } from "vue-router";
import { Button, Doption, Dropdown, Menu, MenuItem } from "@arco-design/web-vue";
import css from "./index.module.less";
import useUserStore from "@/store/useUser";
import { storeToRefs } from "pinia";
import _ from "lodash";
import useMenus from "@/hooks/useMenus";

export default defineComponent(() => {
  const router = useRouter();
  const route = useRoute();
  const user = useUserStore();
  const { isLogin, profile } = storeToRefs(user);
  const { navMenus, dropdowns } = useMenus();

  const activeRoute = computed(() => [route.name]);

  const UserProfile = () => {
    if (isLogin.value) {
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
            <Button>{profile.value.phone}</Button>
          </Dropdown>
        </div>
      );
    } else {
      return (
        <Button type="primary" onClick={() => router.push({ name: "Login" })}>
          登 录
        </Button>
      );
    }
  };

  const render = () => {
    return (
      <div class={css.root}>
        <header class={css.header}>
          <div class={[css.container, "flex items-center"]}>
            <Menu mode="horizontal" selected-keys={activeRoute.value} class="-ml-11">
              <MenuItem disabled>
                <div class={css.logo} onClick={() => router.push({ name: "Root" })}>
                  🌋 火山云服
                </div>
              </MenuItem>
              {navMenus.value.map(({ meta, name }) => (
                <MenuItem onClick={() => router.push({ name })} key={name.toString()}>
                  {meta.label}
                </MenuItem>
              ))}
            </Menu>
            <UserProfile />
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
