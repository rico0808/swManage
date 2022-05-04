import useUserStore from "@/store/useUser";
import _ from "lodash";
import { storeToRefs } from "pinia";
import { computed } from "vue";
import { useRouter } from "vue-router";

export default function useMenus() {
  const router = useRouter();
  const user = useUserStore();
  const { profile } = storeToRefs(user);

  const ownRouters = computed(() => {
    return router.getRoutes().filter(({ meta }) => {
      return meta.roles && _.isArray(meta.roles) && meta.roles.includes(profile.value?.role);
    });
  });

  const navMenus = computed(() => {
    return ownRouters.value.filter(({ meta }) => meta.showMenu);
  });

  const dropdowns = computed(() => {
    return ownRouters.value.filter(({ meta }) => !meta.showMenu);
  });

  return { navMenus, dropdowns };
}
