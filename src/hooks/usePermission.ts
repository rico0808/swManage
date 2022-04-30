import useUserStore from "@/store/useUser";
import _ from "lodash";
import { RouteLocationNormalized, RouteRecordRaw } from "vue-router";

export default function usePermission() {
  const { profile } = useUserStore();
  return {
    PermissionNext(route: RouteLocationNormalized | RouteRecordRaw) {
      // 判断当前用户是否有该路由的权限
      const { meta = null } = route;
      if (meta?.roles && _.isArray(meta?.roles)) {
        return !meta?.isPriavte || meta?.roles?.includes(profile?.role);
      } else {
        return false;
      }
    },
  };
}
