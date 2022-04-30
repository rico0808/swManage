import usePermission from "@/hooks/usePermission";
import useUserStore from "@/store/useUser";
import _ from "lodash";
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
    if (Permission.PermissionNext(to)) await next();
    else await next({ name: "Permission", query: { to: from.fullPath } });
  }

  // 访问公共页面不作任何拦截
  if (to.meta.isPublic) {
    await next();
    return;
  }

  // 获取登录状态
  const isLogin = false;

  // 访问认证页面
  if (to.meta.isAuth) {
    // 判断登录状态 已登录跳转用户中心 未登录不做处理
    if (isLogin) await next({ name: "UserDashboard" });
    else await next();
    return;
  }

  // 访问私有页面
  if (to.meta.isPriavte) {
    // 判断登录状态 未登录跳转登录页
    if (!isLogin) {
      await next({ name: "Login" });
      return;
    }

    // 判断是否具有页面权限
    const { GetProfile, profile } = useUserStore();
    if (_.has(profile, "role")) await crossRoads();
    else {
      try {
        await GetProfile();
        crossRoads();
      } catch (error) {
        await next({ name: "Login" });
      }
    }
  }
};

export default RouteGuard;
