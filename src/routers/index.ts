import { createRouter, createWebHashHistory } from "vue-router";
import type { RouteRecordRaw } from "vue-router";
import RouteGuard from "./routeGuard";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    component: () => import("@/components/layouts/main"),
    children: [
      {
        name: "Root",
        path: "/",
        meta: {
          label: "首页",
          isPublic: true,
        },
        component: () => import("@/views/index"),
      },
      {
        name: "Auth",
        path: "auth",
        redirect: { name: "Login" },
        component: () => import("@/components/layouts/auth"),
        children: [
          {
            path: "login",
            name: "Login",
            meta: {
              label: "用户登录",
              isAuth: true,
            },
            component: () => import("@/views/auth/login"),
          },
          {
            path: "register",
            name: "Register",
            meta: {
              label: "注册账号",
              isAuth: true,
            },
            component: () => import("@/views/auth/register"),
          },
          {
            path: "forget",
            name: "Forget",
            meta: {
              label: "重置密码",
              isAuth: true,
            },
            component: () => import("@/views/auth/forget"),
          },
        ],
      },
      {
        name: "User",
        path: "user",
        component: () => import("@/components/layouts/empty"),
        redirect: { name: "UserDashboard" },
        children: [
          {
            name: "UserDashboard",
            path: "dashboard",
            meta: {
              label: "控制台",
              isPriavte: true,
              showMenu: true,
              roles: ["user", "dealer", "admin"],
            },
            component: () => import("@/views/user/dashboard"),
          },
          {
            name: "MyProfile",
            path: "profile",
            meta: {
              label: "个人信息",
              isPriavte: true,
              roles: ["user", "dealer", "admin"],
            },
            component: () => import("@/views/user/myProfile"),
          },
        ],
      },
      {
        name: "Dealer",
        path: "dealer",
        component: () => import("@/components/layouts/empty"),
        redirect: { name: "DealerDashboard" },
        children: [
          {
            name: "_Products",
            path: "products",
            meta: {
              label: "商品列表",
              isPriavte: true,
              showMenu: true,
              roles: ["dealer", "admin"],
            },
            component: () => import("@/views/dealer/myGoods"),
          },
          {
            name: "_Clients",
            path: "clients",
            meta: {
              label: "客户列表",
              isPriavte: true,
              showMenu: true,
              roles: ["dealer", "admin"],
            },
            component: () => import("@/views/dealer/myClients"),
          },
          {
            name: "_Users",
            path: "users",
            meta: {
              label: "用户列表",
              isPriavte: true,
              showMenu: true,
              roles: ["dealer", "admin"],
            },
            component: () => import("@/views/dealer/myUsers"),
          },
          {
            name: "_Sales",
            path: "sales",
            meta: {
              label: "销售记录",
              isPriavte: true,
              showMenu: true,
              roles: ["dealer", "admin"],
            },
            component: () => import("@/views/dealer/mySales"),
          },
          {
            name: "_Income",
            path: "income",
            meta: {
              label: "收支信息",
              isPriavte: true,
              roles: ["dealer", "admin"],
            },
            component: () => import("@/views/dealer/myIncome"),
          },
          {
            name: "_Servers",
            path: "servers",
            meta: {
              label: "服务器管理",
              isPriavte: true,
              showMenu: true,
              roles: ["dealer", "admin"],
            },
            component: () => import("@/views/dealer/myServers"),
          },
          {
            name: "_Nodes",
            path: "nodes",
            meta: {
              label: "节点列表",
              isPriavte: true,
              showMenu: true,
              roles: ["dealer", "admin"],
            },
            component: () => import("@/views/dealer/myNodes"),
          },
          {
            name: "_Apply",
            path: "applys",
            meta: {
              label: "分销申请",
              isPriavte: true,
              roles: ["dealer", "admin"],
            },
            component: () => import("@/views/dealer/myApplys"),
          },
          {
            name: "_Logs",
            path: "logs",
            meta: {
              label: "登录记录",
              isPriavte: true,
              roles: ["dealer", "admin"],
            },
            component: () => import("@/views/dealer/myNodes"),
          },
        ],
      },
    ],
  },
  {
    path: "/permission",
    name: "Permission",
    meta: { label: "Permission", isPublic: true },
    component: () => import("@/views/permission"),
  },
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    meta: { label: "NotFound", isPublic: true },
    component: () => import("@/views/404"),
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

router.beforeEach(RouteGuard);

export default router;
