import { AuthUserLogin } from "@/api/controllers/AuthController";
import { ZodLogin } from "@/api/controllers/AuthController/schema";
import { UserGetProfile } from "@/api/controllers/UserController";
import router from "@/routers";
import { Users } from "@prisma/client";
import { useStorage } from "@vueuse/core";
import _ from "lodash";
import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { z } from "zod";

const useUserStore = defineStore("User", () => {
  const profile = ref<Omit<Users, "passwd">>();
  const role = computed(() => profile.value?.role || "user");
  const isLogin = useStorage("isLogin", false);

  // 获取用户信息
  const GetProfile = async () => {
    const res = await UserGetProfile();
    profile.value = res?.data;
    return res;
  };

  // 登录
  const Login = async (formData: z.infer<typeof ZodLogin>) => {
    const res = await AuthUserLogin(formData);
    if (!res) return;
    profile.value = res.data;
    isLogin.value = true;
    router.push({ name: "UserDashboard" });
  };

  return { profile, GetProfile, Login, role, isLogin };
});

export default useUserStore;
