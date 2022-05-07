import usePermission from "@/hooks/usePermission";
import useUserStore from "@/store/useUser";
import { isLogin } from "@/utils/tools";
import _ from "lodash";
import { storeToRefs } from "pinia";
import type {
  NavigationGuardNext,
  NavigationGuardWithThis,
  RouteLocationNormalized,
} from "vue-router";

interface Guard {
  to: RouteLocationNormalized;
  from: RouteLocationNormalized;
  next: NavigationGuardNext;
}
const RouteGuard: NavigationGuardWithThis<Guard> = async (to, from, next) => {
  // 公共方法
  async function crossRoads() {
    const Permission = usePermission();
    if (Permission.PermissionNext(to)) next();
    else next({ name: "Permission", query: { to: from.fullPath } });
  }

  // 登录状态
  const user = useUserStore();
  const { profile } = storeToRefs(user);

  if (isLogin() && !profile.value) await user.GetProfile();

  // 访问公共页面不作任何拦截
  if (to.meta.isPublic) {
    next();
    return;
  }

  // 访问认证页
  if (to.meta.isAuth) {
    if (isLogin()) next({ name: "UserDashboard" });
    else next();
    return;
  }

  // 访问私有页面
  if (to.meta.isPriavte) {
    // 判断登录状态 未登录跳转登录页
    if (!isLogin()) {
      next({ name: "Login" });
      return;
    }

    // 判断是否具有页面权限
    await crossRoads();
  }
};

export default RouteGuard;
